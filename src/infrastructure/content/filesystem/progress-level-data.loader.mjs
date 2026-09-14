import { readFile } from "node:fs/promises";
import { isLevelLocationPrecision } from "../../../domain/level/level-location-precision.value-object.mjs";
import { isLevelMode } from "../../../domain/level/level-mode.value-object.mjs";
import { isLevelModeSub } from "../../../domain/level/level-mode-sub.value-object.mjs";
import { resolveLevelLocationInheritance } from "../../../domain/level/resolve-level-location-inheritance.mjs";
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
      throw new Error(`${filename}: mode must be singleplayer, multiplayer, zombies or other`);
    }
    if (document.data.mode === "other" && !isLevelModeSub(document.data.modeSub)) {
      throw new Error(`${filename}: other levels require modeSub special-ops or challenge`);
    }
    if (document.data.mode !== "other" && document.data.modeSub != null) {
      throw new Error(`${filename}: modeSub is only valid for other levels`);
    }
    if (typeof document.data.id !== "string" || !document.data.id.trim()) {
      throw new Error(`${filename}: level id is required`);
    }
    levels.push({
      id: document.data.id,
      filename,
      gameId,
      mode: document.data.mode,
      modeSub: document.data.modeSub ?? null,
      metadata: document.data.metadata,
      researched: isResearchComplete(document.body),
      verified: normalizeLevelVerification(document.data.verified, `${filename}: verified`),
      ...(Object.hasOwn(document.data, "locations") ? { locations: document.data.locations } : {}),
    });
  }

  resolveLevelLocationInheritance(levels, { labelFor: (level) => level.filename });

  return levels.map((level) => {
    for (const location of level.locations) {
      if (!isLevelLocationPrecision(location?.precision)) {
        throw new Error(`${level.filename}: location precision is invalid`);
      }
    }
    return {
      gameId: level.gameId,
      mode: level.mode,
      modeSub: level.modeSub,
      researched: level.researched,
      verified: level.verified,
      locations: level.locations.map((location) => ({ precision: location.precision })),
    };
  });
}
