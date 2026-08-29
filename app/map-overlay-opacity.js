const FADE_START_ZOOM_DELTA = 0.5;
const FULL_FADE_ZOOM_DELTA = 6;
const FADE_CURVE_POWER = 1.6;

/**
 * Reduces an overlay's configured opacity as the map moves beyond the zoom at
 * which the complete overlay naturally fits in the available viewport.
 */
export function mapOverlayOpacityAtZoom(baseOpacity, currentZoom, fitZoom, enabled, maximumZoom = 18) {
  if (!enabled || !Number.isFinite(currentZoom) || !Number.isFinite(fitZoom)) return baseOpacity;
  if (currentZoom >= maximumZoom) return 0;
  const fadeProgress = Math.min(1, Math.max(
    0,
    (currentZoom - fitZoom - FADE_START_ZOOM_DELTA)
      / (FULL_FADE_ZOOM_DELTA - FADE_START_ZOOM_DELTA),
  ));
  const opacityFactor = (1 - fadeProgress) ** FADE_CURVE_POWER;
  return baseOpacity * opacityFactor;
}
