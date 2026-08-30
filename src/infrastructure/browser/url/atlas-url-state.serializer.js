import { serializeAtlasUrlMode } from "./atlas-url-mode.codec.js";
import { atlasUrlParameters } from "./atlas-url-parameters.constants.js";

function setCommaSeparatedValues(searchParams, name, values) {
  if (values.length) searchParams.set(name, [...values].sort().join(","));
}

/**
 * @param {string | URL} input
 * @param {import("./atlas-url-state.dto.js").AtlasUrlState} state
 */
export function serializeAtlasUrlState(input, state) {
  const url = input instanceof URL ? new URL(input.href) : new URL(input);
  atlasUrlParameters.forEach((parameter) => url.searchParams.delete(parameter));

  if (state.query) url.searchParams.set("q", state.query);
  if (state.gameId !== "all") url.searchParams.set("game", state.gameId);
  if (state.country !== "all") url.searchParams.set("country", state.country);
  setCommaSeparatedValues(url.searchParams, "series", state.series);
  setCommaSeparatedValues(url.searchParams, "subseries", state.subseries);
  setCommaSeparatedValues(url.searchParams, "continent", state.continents);
  setCommaSeparatedValues(url.searchParams, "precision", state.precisions);
  setCommaSeparatedValues(url.searchParams, "confidence", state.confidences);
  setCommaSeparatedValues(url.searchParams, "method", state.methods);

  const mode = serializeAtlasUrlMode(state);
  if (mode) url.searchParams.set("mode", mode);
  if (state.sidebarListMode === "campaigns") url.searchParams.set("browse", "campaigns");
  if (state.levelId) {
    url.searchParams.set("level", state.levelId);
    if (state.locationId) url.searchParams.set("location", state.locationId);
  }

  return url;
}
