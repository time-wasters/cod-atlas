// Overlay fade durations in milliseconds, separate from camera zoom settings.
export const MAP_OVERLAY_CONFIG = {
  default: {
    fadeOutMs: 100,
    fadeInMs: 100,
  },
  campaign: {
    fadeOutMs: 500,
    fadeInMs: 1000,
    // Keep the destination overlay hidden until this close to final arrival.
    fadeInBeforeArrivalMs: 1000,
  },
};
