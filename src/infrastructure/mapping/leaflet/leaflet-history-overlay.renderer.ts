import type { Map as LeafletMap } from "leaflet";
import type { HistoryOverlayDto } from "../../atlas-data/dto/history-overlay.dto.js";

export function renderLeafletHistoryOverlay({
  leaflet,
  map,
  overlay,
}: {
  leaflet: typeof import("leaflet");
  map: LeafletMap;
  overlay: HistoryOverlayDto;
}) {
  const imageUrl = new URL(overlay.image.replace(/^\/+/, ""), document.baseURI).href;
  return leaflet.imageOverlay.rotated(
    imageUrl,
    overlay.corners.topLeft,
    overlay.corners.topRight,
    overlay.corners.bottomLeft,
    {
      opacity: 0,
      interactive: false,
      className: "history-map-overlay",
      alt: overlay.attribution.title,
    },
  ).addTo(map);
}
