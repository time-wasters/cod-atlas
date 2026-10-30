import { APP_DEFAULTS_CONFIG } from "../../../shared/config/app-defaults.config.js";

export function parseAtlasUrlMode(mode, defaults = APP_DEFAULTS_CONFIG.filters) {
  if (!mode) return { ...defaults };
  const selectedModes = new Set(mode?.split(",") ?? []);
  return {
    showSingleplayer: mode === "both"
      || mode === "all"
      || selectedModes.has("campaign")
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
export function serializeAtlasUrlMode(state, defaults = APP_DEFAULTS_CONFIG.filters) {
  if (Object.entries(defaults).every(([key, value]) => state[key] === value)) return null;
  const selectedModes = [
    state.showSingleplayer ? "singleplayer" : null,
    state.showMultiplayer ? "multiplayer" : null,
    state.showZombies ? "zombies" : null,
    state.showOther ? "other" : null,
  ].filter(Boolean);

  if (selectedModes.length === 4) return "all";
  if (selectedModes.length === 0) return "none";
  if (selectedModes.length === 1) return selectedModes[0];
  if (selectedModes.length === 2 && state.showSingleplayer && state.showMultiplayer) return "both";
  return selectedModes.join(",");
}
