import type { Map as LeafletMap } from "leaflet";
import { MAP_CAMERA_CONFIG } from "../../../shared/config/map-camera.config.js";

export const LEAFLET_MAX_ZOOM = MAP_CAMERA_CONFIG.maximumZoom;

export async function loadLeafletRuntime() {
  const leafletModule = await import("leaflet");
  await import("leaflet.markercluster");
  await import("leaflet-imageoverlay-rotated");

  // Leaflet is CommonJS. Its ESM namespace is immutable, while its plugins
  // augment the shared default export at runtime.
  return leafletModule.default as unknown as typeof import("leaflet");
}

export function createLeafletMap(
  leaflet: typeof import("leaflet"),
  container: HTMLElement,
): LeafletMap {
  const map = leaflet.map(container, {
    center: MAP_CAMERA_CONFIG.initialView.center,
    zoom: MAP_CAMERA_CONFIG.initialView.zoom,
    minZoom: MAP_CAMERA_CONFIG.minimumZoom,
    maxZoom: LEAFLET_MAX_ZOOM,
    zoomControl: false,
    worldCopyJump: true,
  });

  leaflet.control.zoom({ position: "bottomright" }).addTo(map);
  const countryBoundaryPane = map.createPane("countryBoundary");
  countryBoundaryPane.style.zIndex = "410";
  countryBoundaryPane.style.pointerEvents = "none";
  const campaignPane = map.createPane("campaignRoute");
  campaignPane.style.zIndex = "425";
  return map;
}
