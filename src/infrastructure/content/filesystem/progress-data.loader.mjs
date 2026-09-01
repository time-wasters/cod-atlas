import { loadProgressGameData } from "./progress-game-data.loader.mjs";
import { loadProgressLevelData } from "./progress-level-data.loader.mjs";

export async function loadProgressData({ levelsRoot, gamesRoot }) {
  const games = await loadProgressGameData(gamesRoot);
  const levels = await loadProgressLevelData(levelsRoot, games);
  return { games, levels };
}
