export const levelModeSubs = Object.freeze([
  "special-ops",
  "challenge",
]);

const validLevelModeSubs = new Set(levelModeSubs);

export function isLevelModeSub(value) {
  return validLevelModeSubs.has(value);
}
