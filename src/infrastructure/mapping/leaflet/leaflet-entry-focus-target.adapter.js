/**
 * Keep an attached overlay and its marker in the unobstructed viewport without
 * zooming closer than the requested location scale.
 * @param {{
 *   coordinates: import("leaflet").LatLngExpression,
 *   overlay?: import("../../atlas-data/dto/map-overlay.dto.js").MapOverlayDto,
 *   maximumZoom: number,
 *   leaflet: typeof import("leaflet"),
 *   map: import("leaflet").Map,
 *   padding: { paddingTopLeft: [number, number], paddingBottomRight: [number, number] },
 * }} options
 */
export function leafletEntryFocusTarget({ coordinates, overlay, maximumZoom, leaflet, map, padding }) {
  const bounds = leaflet.latLngBounds([coordinates]);
  if (!overlay) return { bounds, maximumZoom };

  for (const corner of Object.values(overlay.corners)) bounds.extend(corner);
  const totalPadding = leaflet.point(
    padding.paddingTopLeft[0] + padding.paddingBottomRight[0],
    padding.paddingTopLeft[1] + padding.paddingBottomRight[1],
  );
  return {
    bounds,
    maximumZoom: Math.min(maximumZoom, map.getBoundsZoom(bounds, false, totalPadding)),
  };
}
