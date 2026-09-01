import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";

function configuredLocationUrl(
  entry: AtlasEntryDto,
  provider: "wikipedia" | "callOfDutyMaps",
) {
  return entry.urls?.find((item) => item[provider])?.[provider] ?? null;
}

function googleMapsUrl(entry: AtlasEntryDto) {
  if (entry.precision === "country") {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entry.country)}`;
  }
  if (!entry.coordinates) return null;
  const [latitude, longitude] = entry.coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${latitude}%2C${longitude}`;
}

export function buildAtlasEntryLinks(entry: AtlasEntryDto) {
  return {
    callOfDutyMaps: configuredLocationUrl(entry, "callOfDutyMaps"),
    googleMaps: googleMapsUrl(entry),
    wikipedia: configuredLocationUrl(entry, "wikipedia"),
  };
}
