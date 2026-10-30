import type { Map as LeafletMap } from "leaflet";
import { applyEnglishMapLibreLabels } from "../maplibre/maplibre-english-labels.adapter.js";
import { hideMapLibreFerryLines } from "../maplibre/maplibre-ferry-layers.adapter.js";
import { LEAFLET_MAX_ZOOM } from "./leaflet-map.factory.js";
import { BASEMAP_CONFIG } from "../../../shared/config/basemap.config.js";

type LeafletBasemapInput = {
  leaflet: typeof import("leaflet");
  map: LeafletMap;
  signal: AbortSignal;
};

export async function attachLeafletBasemap({ leaflet, map, signal }: LeafletBasemapInput) {
  let fallbackTimer: number | null = null;
  let vectorBasemap: ReturnType<(typeof import("@maplibre/maplibre-gl-leaflet"))["maplibreGL"]> | null = null;
  let rasterBasemap: import("leaflet").TileLayer | null = null;

  // The wrapper resets the canvas transform on zoomend before MapLibre's
  // queued frame renders. Draw the new view before Chromium paints that reset.
  const redrawVectorBasemap = () => vectorBasemap?.getMaplibreMap().redraw();

  const cleanup = () => {
    if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
    map.off("zoomend", redrawVectorBasemap);
    vectorBasemap?.remove();
    vectorBasemap = null;
    rasterBasemap?.remove();
    rasterBasemap = null;
  };
  signal.addEventListener("abort", cleanup, { once: true });
  const basemap = {
    remove: cleanup,
    isViewLoaded: () => {
      const vectorMap = vectorBasemap?.getMaplibreMap();
      if (vectorMap) return vectorMap.loaded() && vectorMap.areTilesLoaded();
      return rasterBasemap !== null && !rasterBasemap.isLoading();
    },
  };

  const addRasterFallback = () => {
    if (signal.aborted || rasterBasemap) return;
    rasterBasemap = leaflet.tileLayer(BASEMAP_CONFIG.rasterUrl, {
      attribution: BASEMAP_CONFIG.rasterAttribution,
      maxZoom: LEAFLET_MAX_ZOOM,
    }).addTo(map);
  };

  try {
    const [{ maplibreGL }, { setWorkerUrl }, { default: workerUrl }] = await Promise.all([
      import("@maplibre/maplibre-gl-leaflet"),
      import("maplibre-gl"),
      import("maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"),
    ]);
    if (signal.aborted) return basemap;

    // MapLibre cannot locate its worker after Vite bundles the application.
    setWorkerUrl(workerUrl);
    vectorBasemap = maplibreGL({
      style: BASEMAP_CONFIG.vectorStyleUrl,
      attributionControl: false,
    }).addTo(map);
    // Register after addTo so the wrapper's zoomend handler runs first.
    map.on("zoomend", redrawVectorBasemap);
    const vectorMap = vectorBasemap.getMaplibreMap();
    let vectorMapLoaded = false;
    const useRasterFallback = () => {
      if (vectorMapLoaded || signal.aborted) return;
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
      map.off("zoomend", redrawVectorBasemap);
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
    fallbackTimer = window.setTimeout(useRasterFallback, BASEMAP_CONFIG.fallbackTimeoutMs);

    const customizeVectorStyle = () => {
      applyEnglishMapLibreLabels(vectorMap);
      hideMapLibreFerryLines(vectorMap);
    };
    if (vectorMap.isStyleLoaded()) customizeVectorStyle();
    else vectorMap.once("style.load", customizeVectorStyle);
    map.attributionControl.addAttribution(
      BASEMAP_CONFIG.vectorAttribution,
    );
  } catch (error) {
    if (!signal.aborted) {
      console.error("Could not initialize the English vector basemap; using the configured raster fallback.", error);
      map.off("zoomend", redrawVectorBasemap);
      vectorBasemap?.remove();
      vectorBasemap = null;
      addRasterFallback();
    }
  }

  return basemap;
}
