const atlasUrlParameters = [
  "q",
  "game",
  "country",
  "category",
  "continent",
  "precision",
  "confidence",
  "method",
  "mode",
  "level",
  "location",
];

/**
 * @typedef {object} AtlasUrlState
 * @property {string} query
 * @property {string} gameId
 * @property {string} country
 * @property {string[]} categories
 * @property {string[]} continents
 * @property {string[]} precisions
 * @property {string[]} confidences
 * @property {string[]} methods
 * @property {boolean} showSingleplayer
 * @property {boolean} showMultiplayer
 * @property {string | null} levelId
 * @property {string | null} locationId
 */

/** @param {string | URL} input */
export function parseAtlasUrl(input) {
  const url = input instanceof URL ? input : new URL(input);
  const mode = url.searchParams.get("mode");
  const values = (name) => (url.searchParams.get(name) ?? "").split(",").filter(Boolean);
  const precision = url.searchParams.get("precision");
  const precisions = precision === "localized"
    ? ["exact", "approximate", "city", "region"]
    : precision === "country"
      ? ["country"]
      : values("precision");

  return {
    query: url.searchParams.get("q") ?? "",
    gameId: url.searchParams.get("game") || "all",
    country: url.searchParams.get("country") || "all",
    categories: values("category"),
    continents: values("continent"),
    precisions,
    confidences: values("confidence"),
    methods: values("method"),
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
  const setValues = (name, values) => {
    if (values.length) url.searchParams.set(name, [...values].sort().join(","));
  };
  setValues("category", state.categories);
  setValues("continent", state.continents);
  setValues("precision", state.precisions);
  setValues("confidence", state.confidences);
  setValues("method", state.methods);

  if (state.showSingleplayer && state.showMultiplayer) url.searchParams.set("mode", "both");
  else if (!state.showSingleplayer && state.showMultiplayer) url.searchParams.set("mode", "multiplayer");
  else if (!state.showSingleplayer && !state.showMultiplayer) url.searchParams.set("mode", "none");

  if (state.levelId) {
    url.searchParams.set("level", state.levelId);
    if (state.locationId) url.searchParams.set("location", state.locationId);
  }

  return url;
}
