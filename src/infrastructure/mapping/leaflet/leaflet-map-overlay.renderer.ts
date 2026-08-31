import type { Map as LeafletMap } from "leaflet";
import type { MapOverlayDto } from "../../atlas-data/dto/map-overlay.dto.js";

export function renderLeafletMapOverlay({
  leaflet,
  map,
  overlay,
  title,
}: {
  leaflet: typeof import("leaflet");
  map: LeafletMap;
  overlay: MapOverlayDto;
  title: string;
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
      className: "game-map-overlay",
      alt: `${title} historical game map overlay`,
    },
  ).addTo(map);
}
