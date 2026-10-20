"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import {
  createAtlasMarker,
  createAtlasMarkerIcon,
} from "../../../infrastructure/mapping/leaflet/leaflet-marker.factory.js";
import type { LeafletMapRuntime } from "./use-leaflet-map.js";
import { MAP_MARKERS_CONFIG } from "../../../shared/config/map-markers.config.js";

type AtlasSelection = { group: AtlasGroupDto; entry: AtlasEntryDto };

export function useLeafletMarkers({
  filteredGroups,
  locationLabel,
  onSelect,
  ready,
  runtime,
  selected,
  focusedLevelIds,
}: {
  filteredGroups: AtlasGroupDto[];
  locationLabel: (entry: AtlasEntryDto) => string;
  onSelect: (group: AtlasGroupDto, entry: AtlasEntryDto) => void;
  ready: boolean;
  runtime: LeafletMapRuntime;
  selected: AtlasSelection;
  focusedLevelIds: ReadonlySet<string> | null;
}) {
  const [pulseRequest, setPulseRequest] = useState(0);
  const pulseSelection = useRef<{ entryId: string; request: number; played: boolean } | null>(null);
  const replaySelectedMarkerPulse = useCallback(() => {
    setPulseRequest((request) => request + 1);
  }, []);

  useEffect(() => {
    const layer = runtime.getMarkerLayer();
    const leaflet = runtime.getLeaflet();
    if (!ready || !runtime.getMap() || !layer || !leaflet) return;

    layer.clearLayers();
    runtime.clearMarkers();
    runtime.resetMarkerEntries();
    filteredGroups.forEach((group) => {
      group.entries.forEach((entry) => {
        if (!entry.coordinates) return;
        const marker = createAtlasMarker({
          entry,
          label: locationLabel(entry),
          leaflet,
          onSelect: () => onSelect(group, entry),
        });
        runtime.setMarkerEntry(marker, entry);
        marker.addTo(layer);
        runtime.setMarker(entry.id, { marker, entry });
      });
    });
  }, [filteredGroups, locationLabel, onSelect, ready, runtime]);

  useEffect(() => {
    const leaflet = runtime.getLeaflet();
    if (!ready || !runtime.getMap() || !leaflet) return;
    runtime.setFocusedLevelIds(focusedLevelIds ? new Set(focusedLevelIds) : null);
    runtime.forEachMarker(({ marker, entry }) => {
      const active = entry.id === selected.entry.id;
      const filterDimmed = focusedLevelIds !== null && !focusedLevelIds.has(entry.levelId);
      marker.setIcon(createAtlasMarkerIcon(leaflet, entry, active, filterDimmed));
      marker.setZIndexOffset(active ? MAP_MARKERS_CONFIG.icon.activeZIndexOffset : 0);
    });
    runtime.getMarkerLayer()?.refreshClusters();
  }, [filteredGroups, focusedLevelIds, ready, runtime, selected.entry.id]);

  useEffect(() => {
    if (pulseSelection.current?.entryId !== selected.entry.id
      || pulseSelection.current?.request !== pulseRequest) {
      pulseSelection.current = { entryId: selected.entry.id, request: pulseRequest, played: false };
    }
    const selection = pulseSelection.current;
    const map = runtime.getMap();
    const layer = runtime.getMarkerLayer();
    const marker = runtime.getMarker(selected.entry.id)?.marker;
    if (!ready || !map || !layer || !marker || !selection || selection.played
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let moving = false;
    let pulse: HTMLSpanElement | null = null;
    let settleTimer: number | undefined;
    let removalTimer: number | undefined;

    const removePulse = () => {
      pulse?.remove();
      pulse = null;
    };
    const playPulse = () => {
      if (moving || selection.played) return;
      const visibleMarker = layer.getVisibleParent(marker);
      const element = visibleMarker?.getElement();
      if (!visibleMarker || !element?.isConnected
        || !map.getBounds().contains(visibleMarker.getLatLng())) return;

      selection.played = true;
      pulse = document.createElement("span");
      pulse.className = "atlas-selection-pulse";
      pulse.style.setProperty("--selection-pulse-duration", `${MAP_MARKERS_CONFIG.pulse.durationMs}ms`);
      pulse.setAttribute("aria-hidden", "true");
      pulse.addEventListener("animationend", removePulse, { once: true });
      element.append(pulse);
      removalTimer = window.setTimeout(removePulse,
        MAP_MARKERS_CONFIG.pulse.durationMs + MAP_MARKERS_CONFIG.pulse.removalBufferMs);
    };
    const schedulePulse = () => {
      if (selection.played) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(playPulse, MAP_MARKERS_CONFIG.pulse.settleMs);
    };
    const handleMoveStart = () => {
      moving = true;
      window.clearTimeout(settleTimer);
    };
    const handleMoveEnd = () => {
      moving = false;
      schedulePulse();
    };

    map.on("movestart move", handleMoveStart);
    map.on("moveend", handleMoveEnd);
    layer.on("animationend spiderfied", schedulePulse);
    marker.on("add", schedulePulse);
    schedulePulse();

    return () => {
      map.off("movestart move", handleMoveStart);
      map.off("moveend", handleMoveEnd);
      layer.off("animationend spiderfied", schedulePulse);
      marker.off("add", schedulePulse);
      window.clearTimeout(settleTimer);
      window.clearTimeout(removalTimer);
      removePulse();
    };
  }, [filteredGroups, pulseRequest, ready, runtime, selected.entry.id]);

  return { replaySelectedMarkerPulse };
}
