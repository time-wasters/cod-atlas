const atlasUrlParameters = [
  "q",
  "game",
  "country",
  "precision",
  "mode",
  "level",
  "location",
];

/**
 * @typedef {object} AtlasUrlState
 * @property {string} query
 * @property {string} gameId
 * @property {string} country
 * @property {string} precision
 * @property {boolean} showSingleplayer
 * @property {boolean} showMultiplayer
 * @property {string | null} levelId
 * @property {string | null} locationId
 */

/** @param {string | URL} input */
export function parseAtlasUrl(input) {
  const url = input instanceof URL ? input : new URL(input);
  const mode = url.searchParams.get("mode");

  return {
    query: url.searchParams.get("q") ?? "",
    gameId: url.searchParams.get("game") || "all",
    country: url.searchParams.get("country") || "all",
    precision: url.searchParams.get("precision") || "all",
    showSingleplayer: mode !== "multiplayer" && mode !== "none",
    showMultiplayer: mode === "multiplayer" || mode === "both",
    levelId: url.searchParams.get("level") || null,
    locationId: url.searchParams.get("location") || null,
  };
}

/**
 * @param {string | URL} input
 * @param {AtlasUrlState} state
 */
export function atlasUrlWithState(input, state) {
  const url = input instanceof URL ? new URL(input.href) : new URL(input);
  atlasUrlParameters.forEach((parameter) => url.searchParams.delete(parameter));

  if (state.query) url.searchParams.set("q", state.query);
  if (state.gameId !== "all") url.searchParams.set("game", state.gameId);
  if (state.country !== "all") url.searchParams.set("country", state.country);
  if (state.precision !== "all") url.searchParams.set("precision", state.precision);

  if (state.showSingleplayer && state.showMultiplayer) url.searchParams.set("mode", "both");
  else if (!state.showSingleplayer && state.showMultiplayer) url.searchParams.set("mode", "multiplayer");
  else if (!state.showSingleplayer && !state.showMultiplayer) url.searchParams.set("mode", "none");

  if (state.levelId) {
    url.searchParams.set("level", state.levelId);
    if (state.locationId) url.searchParams.set("location", state.locationId);
  }

  return url;
}
