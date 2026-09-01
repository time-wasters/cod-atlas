"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker, MarkerClusterGroup } from "leaflet";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import { attachLeafletBasemap } from "../../../infrastructure/mapping/leaflet/leaflet-basemap.adapter.js";
import {
  createLeafletMap,
  loadLeafletRuntime,
} from "../../../infrastructure/mapping/leaflet/leaflet-map.factory.js";
import { createAtlasMarkerClusterLayer } from "../../../infrastructure/mapping/leaflet/leaflet-marker.factory.js";

export type LeafletMarkerRecord = { marker: LeafletMarker; entry: AtlasEntryDto };

export class LeafletMapRuntime {
  #container: HTMLDivElement | null = null;
  #map: LeafletMap | null = null;
  #markerLayer: MarkerClusterGroup | null = null;
  #markers = new Map<string, LeafletMarkerRecord>();
  #markerEntries = new WeakMap<LeafletMarker, AtlasEntryDto>();
  #campaignFocusLevelIds: Set<string> | null = null;
  #campaignMarkerRevealEntryId: string | null = null;
  #markerOverlaySelectionLevelId: string | null = null;
  #leaflet: typeof import("leaflet") | null = null;

  getContainer() { return this.#container; }
  setContainer(container: HTMLDivElement | null) { this.#container = container; }
  getMap() { return this.#map; }
  setMap(map: LeafletMap | null) { this.#map = map; }
  getMarkerLayer() { return this.#markerLayer; }
  setMarkerLayer(layer: MarkerClusterGroup | null) { this.#markerLayer = layer; }
  getLeaflet() { return this.#leaflet; }
  setLeaflet(leaflet: typeof import("leaflet") | null) { this.#leaflet = leaflet; }
  clearMarkers() { this.#markers.clear(); }
  setMarker(entryId: string, record: LeafletMarkerRecord) { this.#markers.set(entryId, record); }
  getMarker(entryId: string) { return this.#markers.get(entryId); }
  forEachMarker(callback: (record: LeafletMarkerRecord) => void) { this.#markers.forEach(callback); }
  resetMarkerEntries() { this.#markerEntries = new WeakMap(); }
  setMarkerEntry(marker: LeafletMarker, entry: AtlasEntryDto) { this.#markerEntries.set(marker, entry); }
  getMarkerEntry(marker: LeafletMarker) { return this.#markerEntries.get(marker); }
  getCampaignFocusLevelIds() { return this.#campaignFocusLevelIds; }
  setCampaignFocusLevelIds(levelIds: Set<string> | null) { this.#campaignFocusLevelIds = levelIds; }
  getCampaignMarkerRevealEntryId() { return this.#campaignMarkerRevealEntryId; }
  setCampaignMarkerRevealEntryId(entryId: string | null) { this.#campaignMarkerRevealEntryId = entryId; }
  setMarkerOverlaySelectionLevelId(levelId: string | null) { this.#markerOverlaySelectionLevelId = levelId; }
  consumeMarkerOverlaySelectionLevelId() {
    const levelId = this.#markerOverlaySelectionLevelId;
    this.#markerOverlaySelectionLevelId = null;
    return levelId;
  }
}

export function useLeafletMap() {
  const [ready, setReady] = useState(false);
  const mapNode = useRef<HTMLDivElement>(null);
  const [runtime] = useState(() => new LeafletMapRuntime());

  useEffect(() => {
    if (!mapNode.current || runtime.getMap()) return;
    runtime.setContainer(mapNode.current);
    const abortController = new AbortController();
    let cancelled = false;
    let cleanupBasemap: (() => void) | undefined;

    void loadLeafletRuntime().then(async (leafletRuntime) => {
      if (cancelled || !mapNode.current || runtime.getMap()) return;
      const instance = createLeafletMap(leafletRuntime, mapNode.current);
      runtime.setMap(instance);
      cleanupBasemap = await attachLeafletBasemap({
        leaflet: leafletRuntime,
        map: instance,
        signal: abortController.signal,
      });
      if (cancelled || runtime.getMap() !== instance) return;

      runtime.setMarkerLayer(createAtlasMarkerClusterLayer({
        leaflet: leafletRuntime,
        campaignLevelIds: () => runtime.getCampaignFocusLevelIds(),
        entryForMarker: (marker) => runtime.getMarkerEntry(marker),
      }).addTo(instance));
      runtime.setLeaflet(leafletRuntime);
      setReady(true);
    }).catch((error) => {
      if (!cancelled) console.error("Could not initialize the Leaflet map.", error);
    });

    return () => {
      cancelled = true;
      abortController.abort();
      cleanupBasemap?.();
      runtime.getMap()?.remove();
      runtime.setMap(null);
      runtime.setMarkerLayer(null);
      runtime.clearMarkers();
      runtime.resetMarkerEntries();
      runtime.setCampaignFocusLevelIds(null);
      runtime.setCampaignMarkerRevealEntryId(null);
      runtime.setMarkerOverlaySelectionLevelId(null);
      runtime.setLeaflet(null);
      runtime.setContainer(null);
      setReady(false);
    };
  }, [runtime]);

  const prepareMarkerSelection = useCallback((levelId: string | null) => {
    runtime.setMarkerOverlaySelectionLevelId(levelId);
  }, [runtime]);

  return { ready, runtime, mapNode, prepareMarkerSelection };
}
