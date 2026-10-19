// Camera settings shared by campaign follow, marker selection, and mission focus.
// Higher zoom values move closer; longer durations slow the animation.
// Infinity leaves the maximum zoom to the map and location-precision limits.
export const MARKER_FOCUS_PRESET = {
  minimumZoom: 6,
  maximumZoom: Infinity,
  minimumTravelSeconds: .55,
  maximumTravelSeconds: 8,
};

// Game and historical overlays choose their zoom from their bounds, up to maximumZoom.
export const OVERLAY_FIT_PRESET = {
  maximumZoom: Infinity,
  minimumTravelSeconds: .55,
  maximumTravelSeconds: 8,
};
