import { readFile } from "node:fs/promises";
import YAML from "yaml";
import { collectContentFiles } from "./content-file.collector.mjs";

export async function loadProgressGameData(gamesRoot) {
  const games = new Map();
  const gameFiles = await collectContentFiles(gamesRoot, ".yaml");

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

  return games;
}
