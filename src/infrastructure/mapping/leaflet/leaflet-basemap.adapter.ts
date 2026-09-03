import type { Map as LeafletMap } from "leaflet";
import { applyEnglishMapLibreLabels } from "../maplibre/maplibre-english-labels.adapter.js";
import { hideMapLibreFerryLines } from "../maplibre/maplibre-ferry-layers.adapter.js";
import { LEAFLET_MAX_ZOOM } from "./leaflet-map.factory.js";

type LeafletBasemapInput = {
  leaflet: typeof import("leaflet");
  map: LeafletMap;
  signal: AbortSignal;
};

export async function attachLeafletBasemap({ leaflet, map, signal }: LeafletBasemapInput) {
  let fallbackTimer: number | null = null;
  let vectorBasemap: ReturnType<(typeof import("@maplibre/maplibre-gl-leaflet"))["maplibreGL"]> | null = null;
  let rasterBasemap: import("leaflet").TileLayer | null = null;

  const cleanup = () => {
    if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
    vectorBasemap?.remove();
    vectorBasemap = null;
    rasterBasemap?.remove();
    rasterBasemap = null;
  };
  signal.addEventListener("abort", cleanup, { once: true });

  const addRasterFallback = () => {
    if (signal.aborted || rasterBasemap) return;
    rasterBasemap = leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: LEAFLET_MAX_ZOOM,
    }).addTo(map);
  };

  try {
    const [{ maplibreGL }, { setWorkerUrl }, { default: workerUrl }] = await Promise.all([
      import("@maplibre/maplibre-gl-leaflet"),
      import("maplibre-gl"),
      import("maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"),
    ]);
    if (signal.aborted) return cleanup;

    // MapLibre cannot locate its worker after Vite bundles the application.
    setWorkerUrl(workerUrl);
    vectorBasemap = maplibreGL({
      style: "https://tiles.openfreemap.org/styles/bright",
      attributionControl: false,
    }).addTo(map);
    const vectorMap = vectorBasemap.getMaplibreMap();
    let vectorMapLoaded = false;
    const useRasterFallback = () => {
      if (vectorMapLoaded || signal.aborted) return;
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
      vectorBasemap?.remove();
      vectorBasemap = null;
      addRasterFallback();
    };
    vectorMap.once("load", () => {
      vectorMapLoaded = true;
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    });
    vectorMap.once("error", useRasterFallback);
    fallbackTimer = window.setTimeout(useRasterFallback, 10_000);

    const customizeVectorStyle = () => {
      applyEnglishMapLibreLabels(vectorMap);
      hideMapLibreFerryLines(vectorMap);
    };
    if (vectorMap.isStyleLoaded()) customizeVectorStyle();
    else vectorMap.once("style.load", customizeVectorStyle);
    map.attributionControl.addAttribution(
      '&copy; <a href="https://openfreemap.org/">OpenFreeMap</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    );
  } catch (error) {
    if (!signal.aborted) {
      console.error("Could not initialize the English vector basemap; using OpenStreetMap raster tiles.", error);
      addRasterFallback();
    }
  }

  return cleanup;
}
