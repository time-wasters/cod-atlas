import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import countries from "world-countries";
import YAML from "yaml";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const levelsRoot = path.join(contentRoot, "levels");
const outputPath = path.join(root, "app/data/atlas.generated.json");
const mapOverlaysOutputPath = path.join(root, "app/data/map-overlays.generated.json");
const levelBannersRoot = path.join(root, "public/images/levels");
const checkOnly = process.argv.includes("--check");
const validModes = new Set(["singleplayer", "multiplayer"]);
const validPrecisions = new Set(["exact", "approximate", "city", "region", "country", "off-world"]);
const validConfidences = new Set(["high", "medium", "fallback"]);
const validMethods = new Set([
  "verified-landmark",
  "real-world-inspiration",
  "manual-approximate",
  "wiki-location",
  "article-context",
  "title",
  "title-mention",
  "region-fallback",
  "country-fallback",
]);
const countryAliases = new Map([
  ["Czech Republic (Czechia)", "Czechia"],
  ["Myanmar (Burma)", "Myanmar"],
  ["Turkey", "Türkiye"],
]);
const flagCodesByCountryName = new Map(countries.flatMap((country) => [
  [country.name.common, country.cca2],
  [country.name.official, country.cca2],
]));

function flagCodeForGroup(name) {
  const countryName = countryAliases.get(name) ?? name;
  return flagCodesByCountryName.get(countryName) ?? null;
}

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

function validateLocationUrl(value, field, filename, supportedHost) {
  if (value == null) return;
  requireValue(typeof value === "string", `${filename}: ${field} must be a URL string`);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${filename}: ${field} must be a valid URL`);
  }
  requireValue(url.protocol === "https:", `${filename}: ${field} must use HTTPS`);
  requireValue(supportedHost(url.hostname), `${filename}: ${field} uses an unsupported host ${url.hostname}`);
}

function validateLocationUrls(urls, filename) {
  if (urls == null) return;
  requireValue(Array.isArray(urls), `${filename}: location urls must be an array`);
  requireValue(urls.length > 0, `${filename}: location urls must not be empty`);
  const providers = new Map([
    ["googleMaps", (hostname) => hostname === "maps.app.goo.gl" || hostname === "maps.google.com" || hostname === "www.google.com"],
    ["wikipedia", (hostname) => hostname === "wikipedia.org" || hostname.endsWith(".wikipedia.org")],
  ]);
  const seenProviders = new Set();
  for (const item of urls) {
    requireValue(item && typeof item === "object" && !Array.isArray(item), `${filename}: each location URL must be an object`);
    const fields = Object.keys(item);
    requireValue(fields.length === 1, `${filename}: each location URL must contain exactly one provider`);
    const provider = fields[0];
    requireValue(providers.has(provider), `${filename}: unsupported location URL provider ${provider}`);
    requireValue(!seenProviders.has(provider), `${filename}: duplicate location URL provider ${provider}`);
    seenProviders.add(provider);
    validateLocationUrl(item[provider], `urls.${provider}`, filename, providers.get(provider));
  }
}

function validateHttpsUrl(value, field, filename) {
  requireValue(typeof value === "string" && value, `${filename}: ${field} is required`);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${filename}: ${field} must be a valid URL`);
  }
  requireValue(url.protocol === "https:", `${filename}: ${field} must use HTTPS`);
}

function validateWikiImage(image, field, filename) {
  if (!image?.sourceUrl) return;
  validateHttpsUrl(image.sourceUrl, `${field}.sourceUrl`, filename);
  validateHttpsUrl(image.thumbnailUrl, `${field}.thumbnailUrl`, filename);
  validateHttpsUrl(image.detailPageUrl, `${field}.detailPageUrl`, filename);
  requireValue(image.author?.name, `${filename}: ${field}.author.name is required`);
  requireValue(["author", "uploader"].includes(image.author?.role), `${filename}: ${field}.author.role is invalid`);
  validateHttpsUrl(image.author.userUrl, `${field}.author.userUrl`, filename);
  if (image.rights?.status === "non-free") {
    requireValue(image.rights.notice, `${filename}: ${field}.rights.notice is required for non-free media`);
    validateHttpsUrl(image.rights.noticeUrl, `${field}.rights.noticeUrl`, filename);
  } else {
    requireValue(image.rights?.status === "licensed", `${filename}: ${field}.rights.status must be licensed or non-free`);
    requireValue(image.license?.name, `${filename}: ${field}.license.name is required for licensed media`);
    validateHttpsUrl(image.license.url, `${field}.license.url`, filename);
  }
}

async function validateMapOverlay(overlay, levelId, filename) {
  requireValue(overlay && typeof overlay === "object" && !Array.isArray(overlay), `${filename}: mapOverlay must be an object`);
  requireValue(/^\/images\/maps\/[a-z0-9/_-]+\.png$/.test(overlay.image ?? ""), `${filename}: mapOverlay.image must be a local PNG under /images/maps/`);
  requireValue(Number.isFinite(overlay.opacity) && overlay.opacity > 0 && overlay.opacity <= 1, `${filename}: mapOverlay.opacity must be greater than 0 and at most 1`);
  for (const corner of ["topLeft", "topRight", "bottomLeft", "bottomRight"]) {
    const coordinates = overlay.corners?.[corner];
    requireValue(Array.isArray(coordinates) && coordinates.length === 2, `${filename}: mapOverlay.corners.${corner} must be [latitude, longitude]`);
    requireValue(Number.isFinite(coordinates[0]) && coordinates[0] >= -90 && coordinates[0] <= 90, `${filename}: mapOverlay.corners.${corner} latitude is invalid`);
    requireValue(Number.isFinite(coordinates[1]) && coordinates[1] >= -180 && coordinates[1] <= 180, `${filename}: mapOverlay.corners.${corner} longitude is invalid`);
  }
  const attribution = overlay.attribution;
  requireValue(attribution?.title && attribution.source && attribution.sourceUrl, `${filename}: mapOverlay attribution title, source and sourceUrl are required`);
  requireValue(attribution.extractedBy && attribution.extractedByUrl, `${filename}: mapOverlay extraction credit and URL are required`);
  requireValue(attribution.copyrightHolder, `${filename}: mapOverlay copyright holder is required`);
  requireValue(attribution.rights === "non-free", `${filename}: mapOverlay attribution rights must be non-free`);
  requireValue(attribution.rightsNotice && attribution.rightsNoticeUrl, `${filename}: mapOverlay non-free rights notice and URL are required`);
  for (const field of ["sourceUrl", "extractedByUrl", "rightsNoticeUrl"]) validateHttpsUrl(attribution[field], `mapOverlay.attribution.${field}`, filename);
  const imageFilename = path.join(root, "public", ...overlay.image.slice(1).split("/"));
  const image = await readFile(imageFilename);
  requireValue(image.length >= 8 && image[0] === 0x89 && image.toString("ascii", 1, 4) === "PNG", `${filename}: ${overlay.image} is not a PNG image`);
  return {
    levelId,
    image: overlay.image,
    opacity: overlay.opacity,
    corners: overlay.corners,
    attribution,
  };
}

const atlas = YAML.parse(await readFile(path.join(contentRoot, "atlas.yaml"), "utf8"));
const gameFiles = (await filesBelow(path.join(contentRoot, "games"), ".yaml")).sort();
const levelFiles = (await filesBelow(levelsRoot, ".md")).sort();
const wikiFiles = (await filesBelow(path.join(contentRoot, "wiki-import/articles"), ".json")).sort();
let levelBannerFiles = [];
try {
  levelBannerFiles = [
    ...(await filesBelow(levelBannersRoot, ".jpg")),
    ...(await filesBelow(levelBannersRoot, ".png")),
  ].sort();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const levelBannerFilesByBase = new Map();
for (const filename of levelBannerFiles) {
  const relative = path.relative(levelBannersRoot, filename).replaceAll("\\", "/");
  const base = relative.replace(/\.(?:jpg|png)$/, "");
  requireValue(!levelBannerFilesByBase.has(base), `public/images/levels/${base}: use either JPG or PNG, not both`);
  levelBannerFilesByBase.set(base, filename);
}

const games = new Map();
for (const filename of gameFiles) {
  const game = YAML.parse(await readFile(filename, "utf8"));
  requireValue(game?.id, `${filename}: game id is required`);
  requireValue(!games.has(game.id), `${filename}: duplicate game id ${game.id}`);
  requireValue(game.code && game.label && game.released, `${filename}: code, label and released are required`);
  games.set(game.id, game);
}

const gameIconDirectory = path.join(root, "public/images/games");
let gameIconFiles = [];
try {
  gameIconFiles = (await readdir(gameIconDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
    .map((entry) => entry.name)
    .sort();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
for (const filename of gameIconFiles) {
  const gameId = filename.slice(0, -4);
  requireValue(games.has(gameId), `public/images/games/${filename}: filename must use a known game ID`);
  const cachedIcon = await readFile(path.join(gameIconDirectory, filename));
  requireValue(
    cachedIcon.length >= 8
      && cachedIcon[0] === 0x89
      && cachedIcon.toString("ascii", 1, 4) === "PNG",
    `public/images/games/${filename}: file is not a PNG image`,
  );
  games.get(gameId).icon = `/images/games/${filename}`;
}

const wikiArticles = new Map();
for (const filename of wikiFiles) {
  const article = JSON.parse(await readFile(filename, "utf8"));
  requireValue(article?.id, `${filename}: wiki article id is required`);
  requireValue(!wikiArticles.has(article.id), `${filename}: duplicate wiki article id ${article.id}`);
  requireValue(article.sourceUrl, `${filename}: sourceUrl is required`);
  validateWikiImage(article.images?.main, "images.main", filename);
  validateWikiImage(article.images?.map, "images.map", filename);
  wikiArticles.set(article.id, article);
}

const levels = [];
const mapOverlays = {};
const levelBanners = {};
const usedLevelBannerBases = new Set();
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
  const levelBannerBase = path.relative(levelsRoot, filename).replaceAll("\\", "/").replace(/\.md$/, "");
  const levelBannerFilename = levelBannerFilesByBase.get(levelBannerBase);
  if (levelBannerFilename) {
    const extension = path.extname(levelBannerFilename);
    const image = await readFile(levelBannerFilename);
    const validImage = extension === ".png"
      ? image.length >= 8 && image[0] === 0x89 && image.toString("ascii", 1, 4) === "PNG"
      : image.length >= 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
    requireValue(validImage, `${levelBannerFilename}: file contents do not match its extension`);
    const relativeImage = path.relative(path.join(root, "public"), levelBannerFilename).replaceAll("\\", "/");
    const publicPath = `/${relativeImage}`;
    levelBanners[level.id] = {
      origin: "local",
      sourceUrl: publicPath,
      thumbnailUrl: publicPath,
      detailPageUrl: `https://github.com/time-wasters/cod-atlas/blob/main/public/${relativeImage}`,
      author: { name: "plp-gtr", userUrl: "https://github.com/plp-gtr", role: "author" },
      license: { name: null, url: null },
      rights: {
        status: "non-free",
        notice: "Extracted from the relevant game files or captured as a screenshot by plp-gtr. The underlying copyrighted game artwork remains the property of its respective copyright holders and is used for identification and geographic comparison.",
        noticeUrl: "https://www.activision.com/legal/terms-of-use",
      },
    };
    usedLevelBannerBases.add(levelBannerBase);
  }
  requireValue(wikiArticles.has(level.wikiArticle), `${filename}: unknown wikiArticle ${level.wikiArticle}`);
  requireValue(Array.isArray(level.locations) && level.locations.length, `${filename}: locations must be a non-empty list`);
  if (level.mapOverlay) mapOverlays[level.id] = await validateMapOverlay(level.mapOverlay, level.id, filename);
  const locationIds = new Set();
  for (const location of level.locations) {
    requireValue(location.id && !locationIds.has(location.id), `${filename}: duplicate or missing location id`);
    locationIds.add(location.id);
    requireValue(location.country, `${filename}: location country is required`);
    requireValue(location.label == null, `${filename}: location label was replaced by landmark`);
    for (const field of ["region", "city", "landmark"]) {
      requireValue(
        location[field] == null || (typeof location[field] === "string" && location[field].trim()),
        `${filename}: location ${field} must be a non-empty string`,
      );
    }
    requireValue(validPrecisions.has(location.precision), `${filename}: invalid precision ${location.precision}`);
    requireValue(validConfidences.has(location.confidence), `${filename}: invalid or missing confidence ${location.confidence}`);
    requireValue(validMethods.has(location.method), `${filename}: invalid or missing method ${location.method}`);
    validateLocationUrls(location.urls, filename);
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
        flagCode: flagCodeForGroup(key),
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
      gameIds: [...level.games],
      wiki: article.sourceUrl,
      wikiArticle: level.wikiArticle,
      country: location.country,
      city: location.city ?? null,
      region: location.region ?? null,
      landmark: location.landmark ?? null,
      coordinates,
      precision: location.precision,
      confidence: location.confidence ?? (location.precision === "country" ? "fallback" : "medium"),
      method: location.method ?? null,
      ...(location.urls ? { urls: location.urls } : {}),
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
const wikiMedia = Object.fromEntries([...wikiArticles].flatMap(([id, article]) => {
  const main = article.images?.main?.sourceUrl ? article.images.main : null;
  const map = article.images?.map?.sourceUrl ? article.images.map : null;
  return main || map ? [[id, { main, map }]] : [];
}));
const compiled = {
  updatedAt: atlas.updatedAt,
  games: [...games.values()].sort((a, b) => String(a.released).localeCompare(String(b.released))),
  levelBanners,
  wikiMedia,
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
const mapOverlaysSerialized = `${JSON.stringify(mapOverlays, null, 2)}\n`;

if (checkOnly) {
  const existing = await readFile(outputPath, "utf8");
  requireValue(existing === serialized, "app/data/atlas.generated.json is stale; run npm run data:build");
  const existingMapOverlays = await readFile(mapOverlaysOutputPath, "utf8");
  requireValue(existingMapOverlays === mapOverlaysSerialized, "app/data/map-overlays.generated.json is stale; run npm run data:build");
} else {
  await writeFile(outputPath, serialized);
  await writeFile(mapOverlaysOutputPath, mapOverlaysSerialized);
}

for (const bannerBase of levelBannerFilesByBase.keys()) {
  requireValue(usedLevelBannerBases.has(bannerBase), `public/images/levels/${bannerBase}: no matching level Markdown file`);
}

console.log(`Validated ${levels.length} levels, ${markerCount} markers, ${wikiArticles.size} wiki articles and ${games.size} games.`);
