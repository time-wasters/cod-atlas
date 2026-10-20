import { LOCATION_ZOOM_CONFIG, VERIFIED_LANDMARK_ZOOM_CONFIG } from "../../../shared/config/location-zoom.config.js";

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
  overview: {
    zoom: 11,
    minimumZoomChange: 4,
    minimumTravelMeters: 50_000,
    minimumHoldSeconds: .8,
    maximumWaitSeconds: 3,
  },
  zoomByPrecision: LOCATION_ZOOM_CONFIG,
  // Human location review and high confidence support a closer landmark view.
  // Approximate points retain more surrounding context than exact points.
  verifiedLandmarkZoomByPrecision: VERIFIED_LANDMARK_ZOOM_CONFIG,
};

// Game and historical overlays choose their zoom from their bounds, up to maximumZoom.
export const OVERLAY_FIT_PRESET = {
  maximumZoom: Infinity,
  minimumTravelSeconds: .55,
  maximumTravelSeconds: 8,
};
