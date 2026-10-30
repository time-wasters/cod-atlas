// Overlay fades, decoded-image preloading, and zoom-adaptive opacity.
export const MAP_OVERLAY_CONFIG = {
  cache: {
    // Maximum number of upcoming decoded overlay images retained in the preload cache.
    maximumEntries: 8,
  },
  adaptiveOpacity: {
    // Zoom levels beyond the overlay's fit zoom before fading starts.
    fadeStartZoomDelta: .5,
    // Zoom levels beyond the overlay's fit zoom at which it becomes fully transparent.
    fullFadeZoomDelta: 6,
    // Opacity curve exponent; larger values fade the overlay faster after fading starts.
    curvePower: 1.6,
  },
  history: {
    // Duration in milliseconds of the historical map overlay's opacity transition.
    fadeMs: 320,
  },
  default: {
    // Duration in milliseconds of outgoing game overlay fades during manual browsing.
    fadeOutMs: 100,
    // Duration in milliseconds of incoming game overlay fades during manual browsing.
    fadeInMs: 100,
  },
  campaign: {
    // Duration in milliseconds of the crossfade between similar overlay footprints already in view.
    sameAreaCrossfadeMs: 500,
    // Maximum on-screen corner displacement in pixels for overlays to count as the same area.
    sameAreaTolerancePixels: 24,
    // Duration in milliseconds of outgoing game overlay fades during campaign travel.
    fadeOutMs: 500,
    // Duration in milliseconds of incoming game overlay fades during campaign travel.
    fadeInMs: 1000,
    // Milliseconds before final camera arrival to start fading in the destination overlay.
    fadeInBeforeArrivalMs: 1000,
  },
};
