import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

export const researchProgressStart = "<!-- research-progress:start -->";
export const researchProgressEnd = "<!-- research-progress:end -->";
export const localizationProgressStart = "<!-- localization-progress:start -->";
export const localizationProgressEnd = "<!-- localization-progress:end -->";

export const requiredResearchHeadings = [
  "## The Mission in the Game",
  "## The Real Place & Differences",
  "## The Real Mission & Differences",
  "## Marker Position Explanation",
  "## Sources",
];

const aiReferencePattern = /\bAI(?:-generated|[- ]assisted| assistance)\b/i;
const aiDisclosurePattern = /^>\s+\*\*AI-generated (?:research|historical) note[.:]\*\*/im;
const precisionOrder = ["exact", "approximate", "city", "region", "country", "off-world"];
const localizedPrecisions = new Set(["exact", "approximate", "city", "region"]);
const validPrecisions = new Set(precisionOrder);

async function filesBelow(directory, suffix) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesBelow(target, suffix);
    return entry.name.endsWith(suffix) ? [target] : [];
  }));
  return nested.flat();
}

function parseMarkdown(text, filename) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: missing YAML frontmatter`);
  return { data: YAML.parse(match[1]), body: match[2].trim() };
}

export function isResearchComplete(body) {
  if (!body.trim()) return false;

  const lines = body.split(/\r?\n/);
  let previousIndex = -1;
  for (const heading of requiredResearchHeadings) {
    const index = lines.findIndex((line, lineIndex) => (
      lineIndex > previousIndex && line === heading
    ));
    if (index === -1) return false;
    previousIndex = index;
  }

  const preamble = lines.slice(0, lines.indexOf(requiredResearchHeadings[0])).join("\n");
  return !aiReferencePattern.test(preamble) || aiDisclosurePattern.test(preamble);
}

export async function loadProgressData({ levelsRoot, gamesRoot }) {
  const [allLevelFiles, gameFiles] = await Promise.all([
    filesBelow(levelsRoot, ".md"),
    filesBelow(gamesRoot, ".yaml"),
  ]);
  const levelFiles = allLevelFiles.filter((filename) => !filename.endsWith(".ref.md"));

  const games = new Map();
  for (const filename of gameFiles) {
    const game = YAML.parse(await readFile(filename, "utf8"));
    if (!game?.id || !game.label || !game.released) {
      throw new Error(`${filename}: game id, label and released date are required`);
    }
    games.set(game.id, {
      id: game.id,
      label: game.label,
      released: String(game.released),
    });
  }

  const levels = [];
  for (const filename of levelFiles) {
    const { data, body } = parseMarkdown(await readFile(filename, "utf8"), filename);
    const gameId = Array.isArray(data?.games) && data.games.length === 1 ? data.games[0] : null;
    if (!gameId || !games.has(gameId)) {
      throw new Error(`${filename}: exactly one known owner game is required`);
    }
    if (!new Set(["singleplayer", "multiplayer", "zombies"]).has(data.mode)) {
      throw new Error(`${filename}: mode must be singleplayer, multiplayer or zombies`);
    }
    if (!Array.isArray(data.locations)) {
      throw new Error(`${filename}: locations must be an array`);
    }
    for (const location of data.locations) {
      if (!validPrecisions.has(location?.precision)) {
        throw new Error(`${filename}: location precision is invalid`);
      }
    }
    levels.push({
      gameId,
      mode: data.mode,
      researched: isResearchComplete(body),
      locations: data.locations.map((location) => ({ precision: location.precision })),
    });
  }

  return { games, levels };
}

function coverage(levels) {
  const total = levels.length;
  const researched = levels.filter((level) => level.researched).length;
  return { researched, remaining: total - researched, total };
}

function percentage(value, total) {
  return total === 0 ? 0 : Math.round((value / total) * 100);
}

function coverageCell({ researched, total }) {
  if (total === 0) return "—";
  return `${researched} / ${total} (${percentage(researched, total)}%)`;
}

function remainingCell({ remaining, total }) {
  if (total === 0) return "—";
  return `${remaining} / ${total} (${percentage(remaining, total)}%)`;
}

function escapeTableCell(value) {
  return value.replaceAll("|", "\\|");
}

export function renderResearchProgress({ games, levels }) {
  const singleplayer = levels.filter((level) => level.mode === "singleplayer");
  const multiplayer = levels.filter((level) => level.mode === "multiplayer");
  const zombies = levels.filter((level) => level.mode === "zombies");
  const summaries = [
    ["All currently catalogued levels", coverage(levels)],
    ["Campaign levels", coverage(singleplayer)],
    ["Multiplayer maps", coverage(multiplayer)],
    ["Zombies maps", coverage(zombies)],
  ];

  const lines = [
    researchProgressStart,
    "| Scope | Researched | Remaining |",
    "| --- | ---: | ---: |",
    ...summaries.map(([label, result]) => (
      `| ${label} | ${coverageCell(result)} | ${remainingCell(result)} |`
    )),
    "",
    "| Game | Campaign | Multiplayer | Zombies | Overall |",
    "| --- | ---: | ---: | ---: | ---: |",
  ];

  const gameRows = [...games.values()]
    .filter((game) => levels.some((level) => level.gameId === game.id))
    .sort((a, b) => a.released.localeCompare(b.released) || a.label.localeCompare(b.label));

  for (const game of gameRows) {
    const gameLevels = levels.filter((level) => level.gameId === game.id);
    const campaignCoverage = coverage(gameLevels.filter((level) => level.mode === "singleplayer"));
    const multiplayerCoverage = coverage(gameLevels.filter((level) => level.mode === "multiplayer"));
    const zombiesCoverage = coverage(gameLevels.filter((level) => level.mode === "zombies"));
    lines.push([
      `| ${escapeTableCell(game.label)}`,
      coverageCell(campaignCoverage),
      coverageCell(multiplayerCoverage),
      coverageCell(zombiesCoverage),
      `${coverageCell(coverage(gameLevels))} |`,
    ].join(" | "));
  }

  lines.push(researchProgressEnd);
  return lines.join("\n");
}

function localizationCoverage(locations) {
  const localized = locations.filter((location) => localizedPrecisions.has(location.precision)).length;
  const countryFallback = locations.filter((location) => location.precision === "country").length;
  const offWorld = locations.filter((location) => location.precision === "off-world").length;
  return {
    localized,
    countryFallback,
    offWorld,
    terrestrial: localized + countryFallback,
  };
}

function localizationCell({ localized, terrestrial }) {
  if (terrestrial === 0) return "—";
  return `${localized} / ${terrestrial} (${percentage(localized, terrestrial)}%)`;
}

function fallbackCell({ countryFallback, terrestrial }) {
  if (terrestrial === 0) return "—";
  return `${countryFallback} / ${terrestrial} (${percentage(countryFallback, terrestrial)}%)`;
}

function locationsFromLevels(levels) {
  return levels.flatMap((level) => level.locations.map((location) => ({
    ...location,
    gameId: level.gameId,
    mode: level.mode,
  })));
}

export function renderLocalizationProgress({ games, levels }) {
  const locations = locationsFromLevels(levels);
  const singleplayer = locations.filter((location) => location.mode === "singleplayer");
  const multiplayer = locations.filter((location) => location.mode === "multiplayer");
  const zombies = locations.filter((location) => location.mode === "zombies");
  const summaries = [
    ["All marker locations", localizationCoverage(locations)],
    ["Campaign marker locations", localizationCoverage(singleplayer)],
    ["Multiplayer marker locations", localizationCoverage(multiplayer)],
    ["Zombies marker locations", localizationCoverage(zombies)],
  ];
  const lines = [
    localizationProgressStart,
    "| Scope | Localized | Country fallback | Off-world |",
    "| --- | ---: | ---: | ---: |",
    ...summaries.map(([label, result]) => (
      `| ${label} | ${localizationCell(result)} | ${fallbackCell(result)} | ${result.offWorld} |`
    )),
    "",
    "| Precision | Marker locations | Share of all markers |",
    "| --- | ---: | ---: |",
    ...precisionOrder.map((precision) => {
      const count = locations.filter((location) => location.precision === precision).length;
      const label = precision === "off-world"
        ? "Off-world"
        : `${precision[0].toUpperCase()}${precision.slice(1)}`;
      return `| ${label} | ${count} | ${percentage(count, locations.length)}% |`;
    }),
    "",
    "| Game | Campaign | Multiplayer | Zombies | Overall |",
    "| --- | ---: | ---: | ---: | ---: |",
  ];

  const gameRows = [...games.values()]
    .filter((game) => locations.some((location) => location.gameId === game.id))
    .sort((a, b) => a.released.localeCompare(b.released) || a.label.localeCompare(b.label));
  for (const game of gameRows) {
    const gameLocations = locations.filter((location) => location.gameId === game.id);
    lines.push([
      `| ${escapeTableCell(game.label)}`,
      localizationCell(localizationCoverage(gameLocations.filter((location) => location.mode === "singleplayer"))),
      localizationCell(localizationCoverage(gameLocations.filter((location) => location.mode === "multiplayer"))),
      localizationCell(localizationCoverage(gameLocations.filter((location) => location.mode === "zombies"))),
      `${localizationCell(localizationCoverage(gameLocations))} |`,
    ].join(" | "));
  }

  lines.push(localizationProgressEnd);
  return lines.join("\n");
}

export function replaceGeneratedBlock(document, startMarker, endMarker, generated) {
  const start = document.indexOf(startMarker);
  const end = document.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`docs/progress.md must contain one ordered ${startMarker} marker pair`);
  }
  if (document.indexOf(startMarker, start + startMarker.length) !== -1
    || document.indexOf(endMarker, end + endMarker.length) !== -1) {
    throw new Error(`docs/progress.md must contain exactly one ${startMarker} marker pair`);
  }
  return `${document.slice(0, start)}${generated}${document.slice(end + endMarker.length)}`;
}

export async function updateProgress({
  root = process.cwd(),
  checkOnly = false,
} = {}) {
  const progressPath = path.join(root, "docs/progress.md");
  const data = await loadProgressData({
    levelsRoot: path.join(root, "content/levels"),
    gamesRoot: path.join(root, "content/games"),
  });
  const current = await readFile(progressPath, "utf8");
  let expected = replaceGeneratedBlock(
    current,
    researchProgressStart,
    researchProgressEnd,
    renderResearchProgress(data),
  );
  expected = replaceGeneratedBlock(
    expected,
    localizationProgressStart,
    localizationProgressEnd,
    renderLocalizationProgress(data),
  );

  if (checkOnly && current !== expected) {
    throw new Error("docs/progress.md is stale; run npm run progress:update");
  }
  if (!checkOnly && current !== expected) await writeFile(progressPath, expected);

  const research = coverage(data.levels);
  const localization = localizationCoverage(locationsFromLevels(data.levels));
  console.log(`Research coverage: ${research.researched}/${research.total} canonical levels (${percentage(research.researched, research.total)}%).`);
  console.log(`Geographic localization: ${localization.localized}/${localization.terrestrial} terrestrial marker locations (${percentage(localization.localized, localization.terrestrial)}%).`);
  return { research, localization };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--check");
  if (unknownArguments.length > 0) throw new Error(`Unknown argument: ${unknownArguments[0]}`);
  await updateProgress({ checkOnly: process.argv.includes("--check") });
}
