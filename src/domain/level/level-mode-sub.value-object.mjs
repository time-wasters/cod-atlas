export const levelModeSubs = Object.freeze([
  "special-ops",
  "survival",
  "challenge",
]);

const validLevelModeSubs = new Set(levelModeSubs);

export function isLevelModeSub(value) {
  return validLevelModeSubs.has(value);
}
