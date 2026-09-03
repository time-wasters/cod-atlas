import { parseAtlasUrlMode } from "./atlas-url-mode.codec.js";

const legacyLocalizedPrecisions = Object.freeze([
  "exact",
  "approximate",
  "city",
  "region",
]);

function commaSeparatedValues(searchParams, name) {
  return (searchParams.get(name) ?? "").split(",").filter(Boolean);
}

/**
 * @param {string | URL} input
 * @returns {import("../../../application/atlas/ports/atlas-url-state.port.js").AtlasUrlState}
 */
export function parseAtlasUrlState(input) {
  const url = input instanceof URL ? input : new URL(input);
  const mode = parseAtlasUrlMode(url.searchParams.get("mode"));
  const precision = url.searchParams.get("precision");
  const precisions = precision === "localized"
    ? [...legacyLocalizedPrecisions]
    : precision === "country"
      ? ["country"]
      : commaSeparatedValues(url.searchParams, "precision");

  const browse = url.searchParams.get("browse");
  return {
    query: url.searchParams.get("q") ?? "",
    gameId: url.searchParams.get("game") || "all",
    country: url.searchParams.get("country") || "all",
    series: commaSeparatedValues(url.searchParams, "series"),
    subseries: commaSeparatedValues(url.searchParams, "subseries"),
    continents: commaSeparatedValues(url.searchParams, "continent"),
    precisions,
    confidences: commaSeparatedValues(url.searchParams, "confidence"),
    methods: commaSeparatedValues(url.searchParams, "method"),
    ...mode,
    sidebarListMode: browse === "campaigns" || browse === "updates" ? browse : "locations",
    levelId: url.searchParams.get("level") || null,
    locationId: url.searchParams.get("location") || null,
  };
}
