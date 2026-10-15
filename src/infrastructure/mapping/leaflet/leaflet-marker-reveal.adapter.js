/** @param {string} precision */
export function markerFocusZoomLimit(precision) {
  if (precision === "country") return 5;
  if (precision === "region") return 6;
  if (precision === "city") return 8;
  return null;
}

/**
 * The viewport has already framed the destination at its chosen zoom. Reveal
 * its existing cluster without starting a second, unbounded zoom-to-bounds.
 * This also applies to precise markers sharing a point with fallback stops.
 * @param {import("leaflet").MarkerClusterGroup} layer
 * @param {import("leaflet").Marker} marker
 */
export function revealLeafletMarker(layer, marker) {
  const reveal = () => {
    const visibleParent = layer.getVisibleParent(marker);
    if (visibleParent && visibleParent !== marker && "spiderfy" in visibleParent) {
      visibleParent.spiderfy();
    }
  };
  // moveend can precede the cluster's zoom animation ending. The plugin
  // ignores spiderfy during that animation, so retry once when it settles.
  layer.once("animationend", reveal);
  reveal();
  return () => layer.off("animationend", reveal);
}
