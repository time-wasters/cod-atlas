"use client";

import { useEffect } from "react";
import type { CampaignOption } from "../../../application/campaigns/use-cases/build-campaign-options.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import {
  createAtlasMarker,
  createAtlasMarkerIcon,
} from "../../../infrastructure/mapping/leaflet/leaflet-marker.factory.js";
import type { LeafletMapRuntime } from "./use-leaflet-map.js";

type AtlasSelection = { group: AtlasGroupDto; entry: AtlasEntryDto };

export function useLeafletMarkers({
  filteredGroups,
  locationLabel,
  onSelect,
  ready,
  runtime,
  selected,
  selectedCampaign,
}: {
  filteredGroups: AtlasGroupDto[];
  locationLabel: (entry: AtlasEntryDto) => string;
  onSelect: (group: AtlasGroupDto, entry: AtlasEntryDto) => void;
  ready: boolean;
  runtime: LeafletMapRuntime;
  selected: AtlasSelection;
  selectedCampaign: CampaignOption<AtlasGroupDto, AtlasEntryDto> | null;
}) {
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
    const focusedLevelIds = selectedCampaign
      ? new Set(selectedCampaign.levels.map(({ entry }) => entry.levelId))
      : null;
    runtime.setCampaignFocusLevelIds(focusedLevelIds);
    runtime.forEachMarker(({ marker, entry }) => {
      const active = entry.id === selected.entry.id;
      const campaignDimmed = focusedLevelIds !== null && !focusedLevelIds.has(entry.levelId);
      marker.setIcon(createAtlasMarkerIcon(leaflet, entry, active, campaignDimmed));
      marker.setZIndexOffset(active ? 1000 : 0);
    });
    runtime.getMarkerLayer()?.refreshClusters();
  }, [ready, runtime, selected.entry.id, selectedCampaign]);
}
