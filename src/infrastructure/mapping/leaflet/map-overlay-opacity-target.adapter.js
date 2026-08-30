import { calculateMapOverlayOpacity } from "../../../presentation/map/policies/map-overlay-opacity.policy.js";

export function calculateLeafletMapOverlayOpacityTarget({
  baseOpacity,
  corners,
  currentZoom,
  enabled,
  leaflet,
  map,
  maximumZoom,
  padding,
  visible,
}) {
  if (!visible) return 0;
  if (!enabled) return baseOpacity;

  const bounds = leaflet.latLngBounds([
    corners.topLeft,
    corners.topRight,
    corners.bottomLeft,
    corners.bottomRight,
  ]);
  const totalPadding = leaflet.point(
    padding.paddingTopLeft[0] + padding.paddingBottomRight[0],
    padding.paddingTopLeft[1] + padding.paddingBottomRight[1],
  );
  const fitZoom = map.getBoundsZoom(bounds, false, totalPadding);
  return calculateMapOverlayOpacity({
    baseOpacity,
    currentZoom: currentZoom ?? map.getZoom(),
    fitZoom,
    enabled,
    maximumZoom,
  });
}
