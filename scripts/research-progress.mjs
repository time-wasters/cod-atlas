import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

export const researchProgressStart = "<!-- research-progress:start -->";
export const researchProgressEnd = "<!-- research-progress:end -->";

export const requiredResearchHeadings = [
  "## The Mission in the Game",
  "## The Real Place & Differences",
  "## The Real Mission & Differences",
  "## Marker Position Explanation",
  "## Sources",
];

const aiReferencePattern = /\bAI(?:-generated|[- ]assisted| assistance)\b/i;
const aiDisclosurePattern = /^>\s+\*\*AI-generated (?:research|historical) note[.:]\*\*/im;

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

export async function loadResearchData({ levelsRoot, gamesRoot }) {
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
    if (data.mode !== "singleplayer" && data.mode !== "multiplayer") {
      throw new Error(`${filename}: mode must be singleplayer or multiplayer`);
    }
    levels.push({
      gameId,
      mode: data.mode,
      researched: isResearchComplete(body),
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
  const summaries = [
    ["All currently catalogued levels", coverage(levels)],
    ["Campaign levels", coverage(singleplayer)],
    ["Multiplayer maps", coverage(multiplayer)],
  ];

  const lines = [
    researchProgressStart,
    "| Scope | Researched | Remaining |",
    "| --- | ---: | ---: |",
    ...summaries.map(([label, result]) => (
      `| ${label} | ${coverageCell(result)} | ${remainingCell(result)} |`
    )),
    "",
    "| Game | Campaign | Multiplayer | Overall |",
    "| --- | ---: | ---: | ---: |",
  ];

  const gameRows = [...games.values()]
    .filter((game) => levels.some((level) => level.gameId === game.id))
    .sort((a, b) => a.released.localeCompare(b.released) || a.label.localeCompare(b.label));

  for (const game of gameRows) {
    const gameLevels = levels.filter((level) => level.gameId === game.id);
    const campaignCoverage = coverage(gameLevels.filter((level) => level.mode === "singleplayer"));
    const multiplayerCoverage = coverage(gameLevels.filter((level) => level.mode === "multiplayer"));
    lines.push([
      `| ${escapeTableCell(game.label)}`,
      coverageCell(campaignCoverage),
      coverageCell(multiplayerCoverage),
      `${coverageCell(coverage(gameLevels))} |`,
    ].join(" | "));
  }

  lines.push(researchProgressEnd);
  return lines.join("\n");
}

export function replaceResearchProgress(readme, generated) {
  const start = readme.indexOf(researchProgressStart);
  const end = readme.indexOf(researchProgressEnd);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("README.md must contain one ordered research-progress marker pair");
  }
  if (readme.indexOf(researchProgressStart, start + researchProgressStart.length) !== -1
    || readme.indexOf(researchProgressEnd, end + researchProgressEnd.length) !== -1) {
    throw new Error("README.md must contain exactly one research-progress marker pair");
  }
  return `${readme.slice(0, start)}${generated}${readme.slice(end + researchProgressEnd.length)}`;
}

export async function updateResearchProgress({
  root = process.cwd(),
  checkOnly = false,
} = {}) {
  const readmePath = path.join(root, "README.md");
  const data = await loadResearchData({
    levelsRoot: path.join(root, "content/levels"),
    gamesRoot: path.join(root, "content/games"),
  });
  const current = await readFile(readmePath, "utf8");
  const expected = replaceResearchProgress(current, renderResearchProgress(data));

  if (checkOnly && current !== expected) {
    throw new Error("README.md research progress is stale; run npm run research:progress");
  }
  if (!checkOnly && current !== expected) await writeFile(readmePath, expected);

  const result = coverage(data.levels);
  console.log(`Research coverage: ${result.researched}/${result.total} canonical levels (${percentage(result.researched, result.total)}%).`);
  return result;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--check");
  if (unknownArguments.length > 0) throw new Error(`Unknown argument: ${unknownArguments[0]}`);
  await updateResearchProgress({ checkOnly: process.argv.includes("--check") });
}
