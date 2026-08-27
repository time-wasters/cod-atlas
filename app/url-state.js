const atlasUrlParameters = [
  "q",
  "game",
  "country",
  "series",
  "subseries",
  "continent",
  "precision",
  "confidence",
  "method",
  "mode",
  "browse",
  "level",
  "location",
];

/**
 * @typedef {object} AtlasUrlState
 * @property {string} query
 * @property {string} gameId
 * @property {string} country
 * @property {string[]} series
 * @property {string[]} subseries
 * @property {string[]} continents
 * @property {string[]} precisions
 * @property {string[]} confidences
 * @property {string[]} methods
 * @property {boolean} showSingleplayer
 * @property {boolean} showMultiplayer
 * @property {boolean} showZombies
 * @property {"locations" | "campaigns"} sidebarListMode
 * @property {string | null} levelId
 * @property {string | null} locationId
 */

/** @param {string | URL} input */
export function parseAtlasUrl(input) {
  const url = input instanceof URL ? input : new URL(input);
  const mode = url.searchParams.get("mode");
  const selectedModes = new Set(mode?.split(",") ?? []);
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
    series: values("series"),
    subseries: values("subseries"),
    continents: values("continent"),
    precisions,
    confidences: values("confidence"),
    methods: values("method"),
    showSingleplayer: mode == null || mode === "both" || mode === "all" || selectedModes.has("singleplayer"),
    showMultiplayer: mode === "multiplayer" || mode === "both" || mode === "all" || selectedModes.has("multiplayer"),
    showZombies: mode === "zombies" || mode === "all" || selectedModes.has("zombies"),
    sidebarListMode: url.searchParams.get("browse") === "campaigns" ? "campaigns" : "locations",
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
  setValues("series", state.series);
  setValues("subseries", state.subseries);
  setValues("continent", state.continents);
  setValues("precision", state.precisions);
  setValues("confidence", state.confidences);
  setValues("method", state.methods);

  const selectedModes = [
    state.showSingleplayer ? "singleplayer" : null,
    state.showMultiplayer ? "multiplayer" : null,
    state.showZombies ? "zombies" : null,
  ].filter(Boolean);
  if (selectedModes.length === 3) url.searchParams.set("mode", "all");
  else if (selectedModes.length === 0) url.searchParams.set("mode", "none");
  else if (selectedModes.length === 1 && selectedModes[0] !== "singleplayer") url.searchParams.set("mode", selectedModes[0]);
  else if (selectedModes.length === 2 && !state.showZombies) url.searchParams.set("mode", "both");
  else if (!(selectedModes.length === 1 && selectedModes[0] === "singleplayer")) {
    url.searchParams.set("mode", selectedModes.join(","));
  }
  if (state.sidebarListMode === "campaigns") url.searchParams.set("browse", "campaigns");

  if (state.levelId) {
    url.searchParams.set("level", state.levelId);
    if (state.locationId) url.searchParams.set("location", state.locationId);
  }

  return url;
}
