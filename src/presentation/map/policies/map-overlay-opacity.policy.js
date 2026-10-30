import { MAP_OVERLAY_CONFIG } from "../../../shared/config/map-overlay.config.js";
import { MAP_CAMERA_CONFIG } from "../../../shared/config/map-camera.config.js";

export function calculateMapOverlayOpacity({
  baseOpacity,
  currentZoom,
  fitZoom,
  enabled,
  maximumZoom = MAP_CAMERA_CONFIG.maximumZoom,
}) {
  if (!enabled || !Number.isFinite(currentZoom) || !Number.isFinite(fitZoom)) {
    return baseOpacity;
  }
  if (currentZoom >= maximumZoom) return 0;

  const { fadeStartZoomDelta, fullFadeZoomDelta, curvePower } = MAP_OVERLAY_CONFIG.adaptiveOpacity;
  const fadeProgress = Math.min(1, Math.max(
    0,
    (currentZoom - fitZoom - fadeStartZoomDelta)
      / (fullFadeZoomDelta - fadeStartZoomDelta),
  ));
  return baseOpacity * ((1 - fadeProgress) ** curvePower);
}

