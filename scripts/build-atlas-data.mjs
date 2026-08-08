import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import YAML from "yaml";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const levelsRoot = path.join(contentRoot, "levels");
const outputPath = path.join(root, "app/data/atlas.generated.json");
const checkOnly = process.argv.includes("--check");
const validModes = new Set(["singleplayer", "multiplayer"]);
const validPrecisions = new Set(["exact", "approximate", "city", "region", "country", "off-world"]);
const validConfidences = new Set(["high", "medium", "fallback"]);
const validMethods = new Set([
  "verified-landmark",
  "manual-approximate",
  "wiki-location",
  "article-context",
  "title",
  "title-mention",
  "region-fallback",
  "country-fallback",
]);

async function filesBelow(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesBelow(target, extension);
    return entry.name.endsWith(extension) ? [target] : [];
  }));
  return nested.flat();
}

function parseMarkdown(text, filename) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: missing YAML frontmatter`);
  return { data: YAML.parse(match[1]), body: match[2].trim() };
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

const atlas = YAML.parse(await readFile(path.join(contentRoot, "atlas.yaml"), "utf8"));
const gameFiles = (await filesBelow(path.join(contentRoot, "games"), ".yaml")).sort();
const levelFiles = (await filesBelow(levelsRoot, ".md")).sort();
const wikiFiles = (await filesBelow(path.join(contentRoot, "wiki-import/articles"), ".json")).sort();

const games = new Map();
for (const filename of gameFiles) {
  const game = YAML.parse(await readFile(filename, "utf8"));
  requireValue(game?.id, `${filename}: game id is required`);
  requireValue(!games.has(game.id), `${filename}: duplicate game id ${game.id}`);
  requireValue(game.code && game.label && game.released, `${filename}: code, label and released are required`);
  games.set(game.id, game);
}

const wikiArticles = new Map();
for (const filename of wikiFiles) {
  const article = JSON.parse(await readFile(filename, "utf8"));
  requireValue(article?.id, `${filename}: wiki article id is required`);
  requireValue(!wikiArticles.has(article.id), `${filename}: duplicate wiki article id ${article.id}`);
  requireValue(article.sourceUrl, `${filename}: sourceUrl is required`);
  wikiArticles.set(article.id, article);
}

const levels = [];
const levelIds = new Set();
let markerCount = 0;
for (const filename of levelFiles) {
  const { data: level, body } = parseMarkdown(await readFile(filename, "utf8"), filename);
  requireValue(level?.id && level.title, `${filename}: level id and title are required`);
  requireValue(!levelIds.has(level.id), `${filename}: duplicate level id ${level.id}`);
  requireValue(validModes.has(level.mode), `${filename}: invalid mode ${level.mode}`);
  requireValue(Array.isArray(level.games) && level.games.length, `${filename}: games must be a non-empty list`);
  for (const gameId of level.games) requireValue(games.has(gameId), `${filename}: unknown game ${gameId}`);
  const primaryGame = level.games[0];
  const idPrefix = `${primaryGame}-`;
  requireValue(level.id.startsWith(idPrefix), `${filename}: level id must start with primary game ${idPrefix}`);
  const expectedFilename = path.join(levelsRoot, primaryGame, `${level.id.slice(idPrefix.length)}.md`);
  requireValue(filename === expectedFilename, `${filename}: expected level path ${expectedFilename}`);
  requireValue(wikiArticles.has(level.wikiArticle), `${filename}: unknown wikiArticle ${level.wikiArticle}`);
  requireValue(Array.isArray(level.locations) && level.locations.length, `${filename}: locations must be a non-empty list`);
  const locationIds = new Set();
  for (const location of level.locations) {
    requireValue(location.id && !locationIds.has(location.id), `${filename}: duplicate or missing location id`);
    locationIds.add(location.id);
    requireValue(location.country, `${filename}: location country is required`);
    requireValue(validPrecisions.has(location.precision), `${filename}: invalid precision ${location.precision}`);
    requireValue(validConfidences.has(location.confidence), `${filename}: invalid or missing confidence ${location.confidence}`);
    requireValue(validMethods.has(location.method), `${filename}: invalid or missing method ${location.method}`);
    const hasLatitude = Number.isFinite(location.latitude);
    const hasLongitude = Number.isFinite(location.longitude);
    requireValue(hasLatitude === hasLongitude, `${filename}: latitude and longitude must be supplied together`);
    const hasCoordinates = hasLatitude && hasLongitude;
    requireValue(location.precision !== "off-world" || !hasCoordinates, `${filename}: off-world locations cannot use terrestrial coordinates`);
    if (hasCoordinates) {
      requireValue(location.latitude >= -90 && location.latitude <= 90, `${filename}: latitude out of range`);
      requireValue(location.longitude >= -180 && location.longitude <= 180, `${filename}: longitude out of range`);
    }
    markerCount += 1;
  }
  levelIds.add(level.id);
  levels.push({ ...level, notes: body });
}

const groups = new Map();
for (const level of levels) {
  const article = wikiArticles.get(level.wikiArticle);
  const gameCodes = level.games.map((id) => games.get(id).code).join(" / ");
  for (const location of level.locations) {
    const key = location.country;
    if (!groups.has(key)) {
      groups.set(key, {
        name: key,
        coordinates: null,
        kind: location.precision === "off-world" ? "off-world" : "terrestrial",
        entries: [],
      });
    }
    const group = groups.get(key);
    const coordinates = Number.isFinite(location.latitude)
      ? [location.latitude, location.longitude]
      : null;
    if (!group.coordinates && coordinates) group.coordinates = coordinates;
    group.entries.push({
      id: `${level.id}:${location.id}`,
      levelId: level.id,
      locationId: location.id,
      title: level.title,
      game: gameCodes,
      wiki: article.sourceUrl,
      wikiArticle: level.wikiArticle,
      city: location.city ?? null,
      region: location.region ?? null,
      label: location.label ?? location.city ?? location.country,
      coordinates,
      precision: location.precision,
      confidence: location.confidence ?? (location.precision === "country" ? "fallback" : "medium"),
      method: location.method ?? null,
      modes: [level.mode],
    });
  }
}

const compiledGroups = [...groups.values()]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((group) => ({
    ...group,
    entries: group.entries.sort((a, b) => a.title.localeCompare(b.title) || a.game.localeCompare(b.game)),
  }));
const entries = compiledGroups.flatMap((group) => group.entries);
const compiled = {
  source: atlas.source,
  updatedAt: atlas.updatedAt,
  games: [...games.values()].sort((a, b) => String(a.released).localeCompare(String(b.released))),
  groups: compiledGroups,
  totals: {
    groups: compiledGroups.length,
    levels: levels.length,
    entries: markerCount,
    mapped: entries.filter((entry) => entry.coordinates).length,
    cityMatched: entries.filter((entry) => !["country", "off-world"].includes(entry.precision)).length,
    countryFallback: entries.filter((entry) => entry.precision === "country").length,
  },
};
const serialized = `${JSON.stringify(compiled, null, 2)}\n`;

if (checkOnly) {
  const existing = await readFile(outputPath, "utf8");
  requireValue(existing === serialized, "app/data/atlas.generated.json is stale; run npm run data:build");
} else {
  await writeFile(outputPath, serialized);
}

console.log(`Validated ${levels.length} levels, ${markerCount} markers, ${wikiArticles.size} wiki articles and ${games.size} games.`);
