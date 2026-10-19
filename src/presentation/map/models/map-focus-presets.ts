// Camera settings shared by campaign follow, marker selection, and mission focus.
// Higher zoom values move closer; longer durations slow the animation.
// Infinity leaves the maximum zoom to the map and location-precision limits.
export const MARKER_FOCUS_PRESET = {
  minimumZoom: 6,
  maximumZoom: Infinity,
  minimumTravelSeconds: .55,
  maximumTravelSeconds: 8,
};

// Playback chooses a fresh scale for each stop instead of inheriting the last view.
export const CAMPAIGN_FOCUS_PRESET = {
  maximumZoom: 18,
  minimumTravelSeconds: .55,
  maximumTravelSeconds: 8,
  secondsPerZoomLevel: .25,
  zoomByPrecision: {
    country: 5,
    region: 6,
    city: 8,
    approximate: 12,
    exact: 17,
  },
  // Human location review and high confidence support a closer landmark view.
  // Approximate points retain more surrounding context than exact points.
  verifiedLandmarkZoomByPrecision: {
    approximate: 16,
    exact: 18,
  },
};

// Game and historical overlays choose their zoom from their bounds, up to maximumZoom.
export const OVERLAY_FIT_PRESET = {
  maximumZoom: Infinity,
  minimumTravelSeconds: .55,
  maximumTravelSeconds: 8,
};
