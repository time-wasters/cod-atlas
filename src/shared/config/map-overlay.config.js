// Overlay fade durations in milliseconds, separate from camera zoom settings.
export const MAP_OVERLAY_CONFIG = {
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
