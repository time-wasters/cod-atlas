export function parseAtlasUrlMode(mode) {
  const selectedModes = new Set(mode?.split(",") ?? []);
  return {
    showSingleplayer: mode == null
      || mode === "both"
      || mode === "all"
      || selectedModes.has("singleplayer"),
    showMultiplayer: mode === "multiplayer"
      || mode === "both"
      || mode === "all"
      || selectedModes.has("multiplayer"),
    showSpecialOps: mode === "special-ops"
      || mode === "all"
      || selectedModes.has("special-ops"),
    showZombies: mode === "zombies"
      || mode === "all"
      || selectedModes.has("zombies"),
  };
}

/** @param {import("../../../application/atlas/ports/atlas-url-state.port.js").AtlasUrlState} state */
export function serializeAtlasUrlMode(state) {
  const selectedModes = [
    state.showSingleplayer ? "singleplayer" : null,
    state.showMultiplayer ? "multiplayer" : null,
    state.showSpecialOps ? "special-ops" : null,
    state.showZombies ? "zombies" : null,
  ].filter(Boolean);

  if (selectedModes.length === 4) return "all";
  if (selectedModes.length === 0) return "none";
  if (selectedModes.length === 1 && selectedModes[0] === "singleplayer") return null;
  if (selectedModes.length === 1) return selectedModes[0];
  if (selectedModes.length === 2 && state.showSingleplayer && state.showMultiplayer) return "both";
  return selectedModes.join(",");
}
