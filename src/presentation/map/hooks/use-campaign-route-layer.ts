"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Marker as LeafletMarker } from "leaflet";
import { buildCampaignRoute } from "../../../application/map/use-cases/build-campaign-route.js";
import type { CampaignOption } from "../../../application/campaigns/use-cases/build-campaign-options.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import { renderLeafletCampaignRoute } from "../../../infrastructure/mapping/leaflet/leaflet-campaign-route.renderer.js";
import {
  formatCampaignRouteStopLabel,
  formatCampaignRouteStopOrder,
} from "../../campaigns/formatters/campaign-route-stop-label.formatter.js";
import { leafletViewportPadding } from "./use-map-viewport.js";
import type { LeafletMapRuntime } from "./use-leaflet-map.js";

type AtlasSelection = { group: AtlasGroupDto; entry: AtlasEntryDto };

export function useCampaignRouteLayer({
  getDetailsElement,
  findSelectionByEntryId,
  onSelect,
  ready,
  runtime,
  selectedCampaign,
}: {
  getDetailsElement: () => HTMLElement | null;
  findSelectionByEntryId: (entryId: string) => AtlasSelection | undefined;
  onSelect: (group: AtlasGroupDto, entry: AtlasEntryDto) => void;
  ready: boolean;
  runtime: LeafletMapRuntime;
  selectedCampaign: CampaignOption<AtlasGroupDto, AtlasEntryDto> | null;
}) {
  const routeLayer = useRef<import("leaflet").LayerGroup | null>(null);
  const routeFitKey = useRef<string | null>(null);

  const prepareMarkerReveal = useCallback((entryId: string | null) => {
    runtime.setCampaignMarkerRevealEntryId(entryId);
  }, [runtime]);

  useEffect(() => {
    const currentMap = runtime.getMap();
    const leaflet = runtime.getLeaflet();
    if (!ready || !currentMap || !leaflet) return;
    routeLayer.current?.remove();
    routeLayer.current = null;
    if (!selectedCampaign) {
      routeFitKey.current = null;
      runtime.setCampaignMarkerRevealEntryId(null);
      return;
    }

    const route = buildCampaignRoute(selectedCampaign.routeLevels);
    const renderedLayer = renderLeafletCampaignRoute({
      leaflet,
      map: currentMap,
      route,
      formatStopLabel: formatCampaignRouteStopLabel,
      formatStopOrder: formatCampaignRouteStopOrder,
      onWaypointSelect: (entryId) => {
        const selection = findSelectionByEntryId(entryId);
        if (selection) onSelect(selection.group, selection.entry);
      },
    });
    routeLayer.current = renderedLayer;
    let markerRevealTimer: number | null = null;
    let markerRevealAttempts = 0;
    let campaignViewSettled = false;

    const revealFirstCampaignMarker = () => {
      markerRevealTimer = null;
      const entryId = runtime.getCampaignMarkerRevealEntryId();
      if (!entryId || entryId !== selectedCampaign.levels[0]?.entry.id) return;
      const clusterLayer = runtime.getMarkerLayer();
      const selectedMarker = runtime.getMarker(entryId)?.marker;
      if (!clusterLayer || !selectedMarker) {
        runtime.setCampaignMarkerRevealEntryId(null);
        return;
      }
      const retryMarkerReveal = () => {
        if (markerRevealAttempts < 6) {
          markerRevealAttempts += 1;
          markerRevealTimer = window.setTimeout(revealFirstCampaignMarker, 160);
        } else {
          runtime.setCampaignMarkerRevealEntryId(null);
        }
      };
      const visibleParent = clusterLayer.getVisibleParent(selectedMarker);
      if (visibleParent && visibleParent !== selectedMarker && "spiderfy" in visibleParent) {
        (visibleParent as LeafletMarker & { spiderfy: () => void }).spiderfy();
        if (clusterLayer.getVisibleParent(selectedMarker) === selectedMarker) {
          runtime.setCampaignMarkerRevealEntryId(null);
          return;
        }
      }
      retryMarkerReveal();
    };
    const scheduleMarkerReveal = () => {
      if (!runtime.getCampaignMarkerRevealEntryId()) return;
      if (markerRevealTimer !== null) window.clearTimeout(markerRevealTimer);
      markerRevealAttempts = 0;
      markerRevealTimer = window.setTimeout(revealFirstCampaignMarker, 180);
    };
    const handleCampaignMoveEnd = () => {
      campaignViewSettled = true;
      scheduleMarkerReveal();
    };
    const handleClusterAnimationEnd = () => {
      if (campaignViewSettled) scheduleMarkerReveal();
    };
    const activeMarkerLayer = runtime.getMarkerLayer();
    activeMarkerLayer?.on("animationend", handleClusterAnimationEnd);
    const handleMarkerSpiderfied = () => {
      const entryId = runtime.getCampaignMarkerRevealEntryId();
      const selectedMarker = entryId ? runtime.getMarker(entryId)?.marker : null;
      if (!selectedMarker || activeMarkerLayer?.getVisibleParent(selectedMarker) !== selectedMarker) return;
      runtime.setCampaignMarkerRevealEntryId(null);
      if (markerRevealTimer !== null) window.clearTimeout(markerRevealTimer);
      markerRevealTimer = null;
    };
    activeMarkerLayer?.on("spiderfied", handleMarkerSpiderfied);

    const mapElement = runtime.getContainer();
    if (route.waypoints.length > 0 && routeFitKey.current !== selectedCampaign.key && mapElement) {
      routeFitKey.current = selectedCampaign.key;
      const movement = {
        ...leafletViewportPadding(mapElement, getDetailsElement()),
        maxZoom: 8,
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        duration: .65,
      };
      currentMap.stop();
      currentMap.once("moveend", handleCampaignMoveEnd);
      if (movement.animate) currentMap.flyToBounds(route.waypoints.map((waypoint) => waypoint.coordinates), movement);
      else currentMap.fitBounds(route.waypoints.map((waypoint) => waypoint.coordinates), movement);
      if (markerRevealTimer === null) {
        markerRevealTimer = window.setTimeout(revealFirstCampaignMarker, movement.animate ? 900 : 180);
      }
    } else {
      campaignViewSettled = true;
      scheduleMarkerReveal();
    }

    return () => {
      currentMap.off("moveend", handleCampaignMoveEnd);
      activeMarkerLayer?.off("animationend", handleClusterAnimationEnd);
      activeMarkerLayer?.off("spiderfied", handleMarkerSpiderfied);
      if (markerRevealTimer !== null) window.clearTimeout(markerRevealTimer);
      renderedLayer.remove();
      if (routeLayer.current === renderedLayer) routeLayer.current = null;
    };
  }, [findSelectionByEntryId, getDetailsElement, onSelect, ready, runtime, selectedCampaign]);

  return { prepareMarkerReveal };
}
