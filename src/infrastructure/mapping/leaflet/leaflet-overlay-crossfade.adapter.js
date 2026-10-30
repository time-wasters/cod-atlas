/**
 * Similar overlay footprints can share the current camera view. Check the
 * complete destination bounds as well, since its marker may be outside the image.
 * @param {{
 *   previous?: import("../../atlas-data/dto/map-overlay.dto.js").MapOverlayDto | null,
 *   overlay?: import("../../atlas-data/dto/map-overlay.dto.js").MapOverlayDto,
 *   bounds: import("leaflet").LatLngBounds,
 *   targetZoom: number,
 *   tolerancePixels: number,
 *   padding: { paddingTopLeft: [number, number], paddingBottomRight: [number, number] },
 *   map: import("leaflet").Map,
 *   leaflet: typeof import("leaflet"),
 * }} options
 */
export function canCrossfadeLeafletOverlays({ previous, overlay, bounds, targetZoom, tolerancePixels, padding, map, leaflet }) {
  if (!previous || !overlay || Math.abs(map.getZoom() - targetZoom) > .01) return false;
  for (const [before, after] of [
    [previous.corners.topLeft, overlay.corners.topLeft],
    [previous.corners.topRight, overlay.corners.topRight],
    [previous.corners.bottomLeft, overlay.corners.bottomLeft],
    [previous.corners.bottomRight, overlay.corners.bottomRight],
  ]) {
    if (map.project(before).distanceTo(map.project(after)) > tolerancePixels) return false;
  }
  const size = map.getSize();
  const visibleBounds = leaflet.latLngBounds([
    map.containerPointToLatLng(padding.paddingTopLeft),
    map.containerPointToLatLng([
      size.x - padding.paddingBottomRight[0],
      size.y - padding.paddingBottomRight[1],
    ]),
  ]);
  return visibleBounds.contains(bounds);
}
