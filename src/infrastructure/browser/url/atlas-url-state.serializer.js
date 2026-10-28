import { serializeAtlasUrlMode } from "./atlas-url-mode.codec.js";
import { atlasUrlParameters } from "./atlas-url-parameters.constants.js";
import { APP_DEFAULTS_CONFIG } from "../../../shared/config/app-defaults.config.js";

function setCommaSeparatedValues(searchParams, name, values) {
  if (values.length) searchParams.set(name, [...values].sort().join(","));
}

/**
 * @param {string | URL} input
 * @param {import("../../../application/atlas/ports/atlas-url-state.port.js").AtlasUrlState} state
 */
export function serializeAtlasUrlState(input, state) {
  const url = input instanceof URL ? new URL(input.href) : new URL(input);
  atlasUrlParameters.forEach((parameter) => url.searchParams.delete(parameter));

  if (state.query) url.searchParams.set("q", state.query);
  const hasTemplate = state.series.length + state.subseries.length + state.developers.length > 0;
  const usesDefaultTemplate = state.gameIds === null && state.series.length === 0 && state.developers.length === 0
    && state.subseries.length === APP_DEFAULTS_CONFIG.gameTemplate.subseries.length
    && APP_DEFAULTS_CONFIG.gameTemplate.subseries.every((value) => state.subseries.includes(value));
  if (state.gameIds === "all" || (state.gameIds === null && !hasTemplate)) {
    url.searchParams.set("games", "all");
  } else if (state.gameIds !== null) {
    if (state.gameIds.length === 0) url.searchParams.set("game", "none");
    else setCommaSeparatedValues(url.searchParams, "game", [...new Set(state.gameIds)]);
  }
  if (state.country !== "all") url.searchParams.set("country", state.country);
  setCommaSeparatedValues(url.searchParams, "series", state.series);
  if (!usesDefaultTemplate) setCommaSeparatedValues(url.searchParams, "subseries", state.subseries);
  setCommaSeparatedValues(url.searchParams, "developer", state.developers);
  setCommaSeparatedValues(url.searchParams, "continent", state.continents);
  setCommaSeparatedValues(url.searchParams, "precision", state.precisions);
  setCommaSeparatedValues(url.searchParams, "confidence", state.confidences);
  setCommaSeparatedValues(url.searchParams, "method", state.methods);

  const mode = serializeAtlasUrlMode(state);
  if (mode) url.searchParams.set("mode", mode);
  if (state.sidebarListMode !== "locations") url.searchParams.set("browse", state.sidebarListMode);
  if (state.sidebarListMode === "campaigns" && state.campaignKey) {
    url.searchParams.set("campaign", state.campaignKey);
  }
  if (state.levelId) {
    url.searchParams.set("level", state.levelId);
    if (state.locationId) url.searchParams.set("location", state.locationId);
  }

  return url;
}
