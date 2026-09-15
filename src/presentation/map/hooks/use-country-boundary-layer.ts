"use client";

import { useEffect } from "react";
import { loadCountryBoundary } from "../../../infrastructure/mapping/country-boundaries/country-boundary.client.js";
import { renderLeafletCountryBoundary } from "../../../infrastructure/mapping/leaflet/leaflet-country-boundary.renderer.js";
import type { LeafletMapRuntime } from "./use-leaflet-map.js";

export function useCountryBoundaryLayer({
  countryCode,
  ready,
  runtime,
}: {
  countryCode: string | null;
  ready: boolean;
  runtime: LeafletMapRuntime;
}) {
  useEffect(() => {
    const map = runtime.getMap();
    const leaflet = runtime.getLeaflet();
    if (!ready || !map || !leaflet || !countryCode) return;

    let cancelled = false;
    let layer: import("leaflet").GeoJSON | null = null;
    void loadCountryBoundary(countryCode).then((boundary) => {
      if (cancelled || !boundary || runtime.getMap() !== map) return;
      layer = renderLeafletCountryBoundary({ boundary, leaflet, map });
    }).catch((error) => {
      if (!cancelled) console.error(`Could not display the ${countryCode} country boundary.`, error);
    });

    return () => {
      cancelled = true;
      layer?.remove();
    };
  }, [countryCode, ready, runtime]);
}
