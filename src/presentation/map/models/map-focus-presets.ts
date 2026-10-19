// Camera settings shared by campaign follow and manual mission focus.
// Higher zoom values move closer; longer durations slow the animation.
// Infinity leaves the maximum zoom to the map and location-precision limits.
export const MARKER_FOCUS_PRESET = {
  minimumZoom: 6,
  maximumZoom: Infinity,
  minimumTravelSeconds: .55,
  maximumTravelSeconds: 8,
};

// Overlay fit chooses its zoom from the overlay bounds, up to maximumZoom.
export const OVERLAY_FIT_PRESET = {
  maximumZoom: Infinity,
  minimumTravelSeconds: .55,
  maximumTravelSeconds: 8,
};
