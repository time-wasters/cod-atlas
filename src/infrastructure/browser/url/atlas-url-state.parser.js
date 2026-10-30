import { parseAtlasUrlMode } from "./atlas-url-mode.codec.js";
import { APP_DEFAULTS_CONFIG } from "../../../shared/config/app-defaults.config.js";

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
  const gameSelection = url.searchParams.get("games") ?? url.searchParams.get("game");
  const gameIds = [...new Set((gameSelection ?? "").split(",")
    .filter(Boolean)
    .filter((value) => value !== "all" && value !== "none"))];
  const series = commaSeparatedValues(url.searchParams, "series");
  const subseries = commaSeparatedValues(url.searchParams, "subseries");
  const developers = commaSeparatedValues(url.searchParams, "developer");
  const useDefaultTemplate = !gameSelection && series.length + subseries.length + developers.length === 0;
  return {
    query: url.searchParams.get("q") ?? "",
    gameIds: gameSelection === "all" ? "all" : gameSelection === "none" ? [] : gameIds.length ? gameIds : null,
    country: url.searchParams.get("country") || "all",
    series,
    subseries: useDefaultTemplate ? [...APP_DEFAULTS_CONFIG.gameTemplate.subseries] : subseries,
    developers,
    continents: commaSeparatedValues(url.searchParams, "continent"),
    precisions,
    confidences: commaSeparatedValues(url.searchParams, "confidence"),
    methods: commaSeparatedValues(url.searchParams, "method"),
    ...mode,
    sidebarListMode: browse === "campaigns" || browse === "updates" ? browse : "locations",
    campaignKey: browse === "campaigns" ? url.searchParams.get("campaign") || null : null,
    levelId: url.searchParams.get("level") || null,
    locationId: url.searchParams.get("location") || null,
  };
}
