export const APP_DEFAULTS_CONFIG = {
  gameTemplate: {
    // Start with main-series games when no game selection or template is supplied.
    subseries: ["main"],
  },
  filters: {
    // Include campaign levels when the URL has no mode selection.
    showSingleplayer: true,
    // Include multiplayer levels when the URL has no mode selection.
    showMultiplayer: false,
    // Include Zombies levels when the URL has no mode selection.
    showZombies: false,
    // Include Special Ops, Survival, and Challenges when the URL has no mode selection.
    showOther: false,
  },
  panels: {
    // Start with the level-list sidebar open.
    sidebarOpen: true,
    // Start with the selected level's details panel open.
    detailsOpen: true,
    // Start with the related-levels section expanded.
    relatedLevelsOpen: true,
    // Start with advanced filter controls expanded.
    advancedFiltersOpen: false,
    // Expand the solar-system display when off-world locations are shown.
    solarSystemExpanded: true,
  },
  settings: {
    // Animate campaign route dashes unless a saved preference overrides this default.
    campaignRouteAnimationEnabled: true,
    // Show external game icons unless a saved preference overrides this default.
    externalGameIconsEnabled: false,
    // Fade map overlays as users zoom closer unless a saved preference overrides this default.
    zoomAdaptiveMapOverlaysEnabled: true,
  },
};
