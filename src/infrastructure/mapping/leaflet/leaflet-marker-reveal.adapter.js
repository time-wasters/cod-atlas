/** @param {string} precision */
export function markerFocusZoomLimit(precision) {
  if (precision === "country") return 5;
  if (precision === "region") return 6;
  if (precision === "city") return 8;
  return null;
}

/**
 * Country/region/city points must not be revealed by zooming to individual
 * streets. Spiderfy the existing cluster instead, including coincident stops.
 * @param {import("leaflet").MarkerClusterGroup} layer
 * @param {import("leaflet").Marker} marker
 * @param {string} precision
 * @param {() => void} onVisible
 */
export function revealLeafletMarker(layer, marker, precision, onVisible) {
  if (markerFocusZoomLimit(precision) === null) {
    layer.zoomToShowLayer(marker, onVisible);
    return;
  }
  const visibleParent = layer.getVisibleParent(marker);
  if (visibleParent && visibleParent !== marker && "spiderfy" in visibleParent) {
    visibleParent.spiderfy();
  }
  onVisible();
}
