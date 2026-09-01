import type { Map as LeafletMap } from "leaflet";

export const LEAFLET_MAX_ZOOM = 18;

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
    center: [27, 8],
    zoom: 2,
    minZoom: 2,
    maxZoom: LEAFLET_MAX_ZOOM,
    zoomControl: false,
    worldCopyJump: true,
  });

  leaflet.control.zoom({ position: "bottomright" }).addTo(map);
  const campaignPane = map.createPane("campaignRoute");
  campaignPane.style.zIndex = "425";
  return map;
}
