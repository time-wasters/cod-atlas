const FADE_START_ZOOM_DELTA = 0.5;
const OPACITY_PER_EXTRA_ZOOM = 0.74;
const MINIMUM_OPACITY_FACTOR = 0.18;

/**
 * Reduces an overlay's configured opacity as the map moves beyond the zoom at
 * which the complete overlay naturally fits in the available viewport.
 */
export function mapOverlayOpacityAtZoom(baseOpacity, currentZoom, fitZoom, enabled) {
  if (!enabled || !Number.isFinite(currentZoom) || !Number.isFinite(fitZoom)) return baseOpacity;
  const extraZoom = Math.max(0, currentZoom - fitZoom - FADE_START_ZOOM_DELTA);
  const opacityFactor = Math.max(
    MINIMUM_OPACITY_FACTOR,
    OPACITY_PER_EXTRA_ZOOM ** extraZoom,
  );
  return baseOpacity * opacityFactor;
}
