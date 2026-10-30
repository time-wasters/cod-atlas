"use client";

import { useEffect, useState } from "react";
import { loadCountryBoundary, type CountryBoundaryFeature } from "../../../infrastructure/mapping/country-boundaries/country-boundary.client.js";
import { renderLeafletCountryBoundary } from "../../../infrastructure/mapping/leaflet/leaflet-country-boundary.renderer.js";
import type { LeafletMapRuntime } from "./use-leaflet-map.js";

export function useCountryBoundaryLayer({
  countryCode,
  visible,
  ready,
  runtime,
}: {
  countryCode: string | null;
  visible: boolean;
  ready: boolean;
  runtime: LeafletMapRuntime;
}) {
  const [boundary, setBoundary] = useState<CountryBoundaryFeature | null>(null);

  useEffect(() => {
    const map = runtime.getMap();
    const leaflet = runtime.getLeaflet();
    if (!ready || !map || !leaflet || !countryCode) return;

    let cancelled = false;
    void loadCountryBoundary(countryCode).then((boundary) => {
      if (cancelled || runtime.getMap() !== map) return;
      setBoundary(boundary);
    }).catch((error) => {
      if (!cancelled) console.error(`Could not display the ${countryCode} country boundary.`, error);
    });

    return () => {
      cancelled = true;
    };
  }, [countryCode, ready, runtime]);

  useEffect(() => {
    const map = runtime.getMap();
    const leaflet = runtime.getLeaflet();
    if (!ready || !map || !leaflet || !visible || !boundary
      || boundary.properties.isoA2 !== countryCode) return;

    // Mount near arrival, using the current viewport, so the CSS fade cannot
    // finish offscreen or start on geometry clipped at the departure location.
    const renderer = leaflet.svg({ pane: "countryBoundary" }).addTo(map);
    const layer = renderLeafletCountryBoundary({ boundary, leaflet, map, renderer });
    // Leaflet normally updates renderer bounds at moveend. Keep the country
    // clipped to the moving viewport throughout the fade's final approach.
    const updateViewport = renderer.getEvents?.().viewreset;
    if (updateViewport) map.on("move", updateViewport, renderer);
    return () => {
      if (updateViewport) map.off("move", updateViewport, renderer);
      layer.remove();
      renderer.remove();
    };
  }, [boundary, countryCode, ready, runtime, visible]);
}
