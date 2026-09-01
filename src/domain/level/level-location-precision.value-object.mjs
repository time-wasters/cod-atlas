export const levelLocationPrecisionOrder = Object.freeze([
  "exact",
  "approximate",
  "city",
  "region",
  "country",
  "off-world",
]);

const localizedLevelLocationPrecisions = new Set([
  "exact",
  "approximate",
  "city",
  "region",
]);
const validLevelLocationPrecisions = new Set(levelLocationPrecisionOrder);

export function isLevelLocationPrecision(value) {
  return validLevelLocationPrecisions.has(value);
}

export function isLocalizedLevelLocationPrecision(value) {
  return localizedLevelLocationPrecisions.has(value);
}
