export const levelModes = Object.freeze([
  "singleplayer",
  "multiplayer",
  "special-ops",
  "zombies",
]);

const validLevelModes = new Set(levelModes);

export function isLevelMode(value) {
  return validLevelModes.has(value);
}
