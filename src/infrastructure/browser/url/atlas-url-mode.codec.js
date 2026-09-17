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
    showZombies: mode === "zombies"
      || mode === "all"
      || selectedModes.has("zombies"),
    showOther: mode === "other"
      || mode === "special-ops"
      || mode === "survival"
      || mode === "all"
      || selectedModes.has("other")
      || selectedModes.has("special-ops")
      || selectedModes.has("survival"),
  };
}

/** @param {import("../../../application/atlas/ports/atlas-url-state.port.js").AtlasUrlState} state */
export function serializeAtlasUrlMode(state) {
  const selectedModes = [
    state.showSingleplayer ? "singleplayer" : null,
    state.showMultiplayer ? "multiplayer" : null,
    state.showZombies ? "zombies" : null,
    state.showOther ? "other" : null,
  ].filter(Boolean);

  if (selectedModes.length === 4) return "all";
  if (selectedModes.length === 0) return "none";
  if (selectedModes.length === 1 && selectedModes[0] === "singleplayer") return null;
  if (selectedModes.length === 1) return selectedModes[0];
  if (selectedModes.length === 2 && state.showSingleplayer && state.showMultiplayer) return "both";
  return selectedModes.join(",");
}
