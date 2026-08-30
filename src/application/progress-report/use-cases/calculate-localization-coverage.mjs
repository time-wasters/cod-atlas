import { isLocalizedLevelLocationPrecision } from "../../../domain/level/level-location-precision.value-object.mjs";

export function calculateLocalizationCoverage(locations) {
  const localized = locations
    .filter((location) => isLocalizedLevelLocationPrecision(location.precision))
    .length;
  const countryFallback = locations
    .filter((location) => location.precision === "country")
    .length;
  const offWorld = locations
    .filter((location) => location.precision === "off-world")
    .length;
  return {
    localized,
    countryFallback,
    offWorld,
    terrestrial: localized + countryFallback,
  };
}
