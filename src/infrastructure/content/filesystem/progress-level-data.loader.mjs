import { readFile } from "node:fs/promises";
import { isLevelLocationPrecision } from "../../../domain/level/level-location-precision.value-object.mjs";
import { isLevelMode } from "../../../domain/level/level-mode.value-object.mjs";
import { normalizeLevelVerification } from "../../../domain/level/level-verification.value-object.mjs";
import { isResearchComplete } from "../../../domain/level/research-completion.policy.mjs";
import { parseMarkdownDocument } from "../markdown/markdown-document.parser.mjs";
import { collectContentFiles } from "./content-file.collector.mjs";

export async function loadProgressLevelData(levelsRoot, games) {
  const allLevelFiles = await collectContentFiles(levelsRoot, ".md");
  const levelFiles = allLevelFiles.filter((filename) => !filename.endsWith(".ref.md"));
  const levels = [];

  for (const filename of levelFiles) {
    const document = parseMarkdownDocument(await readFile(filename, "utf8"), filename);
    const gameId = Array.isArray(document.data?.games) && document.data.games.length === 1
      ? document.data.games[0]
      : null;
    if (!gameId || !games.has(gameId)) {
      throw new Error(`${filename}: exactly one known owner game is required`);
    }
    if (!isLevelMode(document.data.mode)) {
      throw new Error(`${filename}: mode must be singleplayer, multiplayer or zombies`);
    }
    if (!Array.isArray(document.data.locations)) {
      throw new Error(`${filename}: locations must be an array`);
    }
    for (const location of document.data.locations) {
      if (!isLevelLocationPrecision(location?.precision)) {
        throw new Error(`${filename}: location precision is invalid`);
      }
    }
    levels.push({
      gameId,
      mode: document.data.mode,
      researched: isResearchComplete(document.body),
      verified: normalizeLevelVerification(document.data.verified, `${filename}: verified`),
      locations: document.data.locations.map((location) => ({ precision: location.precision })),
    });
  }

  return levels;
}
