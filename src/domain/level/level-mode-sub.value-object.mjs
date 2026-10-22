export const levelModeSubs = Object.freeze([
  "special-ops",
  "survival",
  "challenge",
  "battle-royale",
  "dmz",
]);

const validLevelModeSubs = new Set(levelModeSubs);

export function isLevelModeSub(value) {
  return validLevelModeSubs.has(value);
}

export function isValidLevelModeSub(mode, value) {
  if (mode === "other") {
    return value === "special-ops" || value === "survival" || value === "challenge";
  }
  if (mode === "multiplayer") {
    if (value == null) return true;
    const values = Array.isArray(value) ? value : [value];
    return values.length > 0
      && new Set(values).size === values.length
      && values.every((item) => item === "battle-royale" || item === "dmz");
  }
  return (mode === "singleplayer" || mode === "zombies") && value == null;
}
