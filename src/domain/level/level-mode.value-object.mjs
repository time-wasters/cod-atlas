export const levelModes = Object.freeze([
  "singleplayer",
  "multiplayer",
  "zombies",
  "other",
]);

const validLevelModes = new Set(levelModes);

export function isLevelMode(value) {
  return validLevelModes.has(value);
}
