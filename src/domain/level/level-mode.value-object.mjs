export const levelModes = Object.freeze([
  "singleplayer",
  "multiplayer",
  "zombies",
]);

const validLevelModes = new Set(levelModes);

export function isLevelMode(value) {
  return validLevelModes.has(value);
}
