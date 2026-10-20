// Overlay fades, decoded-image preloading, and zoom-adaptive opacity.
export const MAP_OVERLAY_CONFIG = {
  cache: { maximumEntries: 8 },
  adaptiveOpacity: { fadeStartZoomDelta: .5, fullFadeZoomDelta: 6, curvePower: 1.6 },
  history: { fadeMs: 320 },
  default: {
    fadeOutMs: 100,
    fadeInMs: 100,
  },
  campaign: {
    // Similar footprints already in view crossfade without a camera flight.
    sameAreaCrossfadeMs: 500,
    sameAreaTolerancePixels: 24,
    fadeOutMs: 500,
    fadeInMs: 1000,
    // Keep the destination overlay hidden until this close to final arrival.
    fadeInBeforeArrivalMs: 1000,
  },
};
