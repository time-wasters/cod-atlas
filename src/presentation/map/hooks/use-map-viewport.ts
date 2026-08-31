"use client";

import { useCallback, useEffect, useRef } from "react";
import type { CampaignOption } from "../../../application/campaigns/use-cases/build-campaign-options.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { MapOverlayDto } from "../../../infrastructure/atlas-data/dto/map-overlay.dto.js";
import type { LeafletMapRuntime } from "./use-leaflet-map.js";

type AtlasSelection = { group: AtlasGroupDto; entry: AtlasEntryDto };
type SidebarSelectionTarget = { bounds: [number, number][]; maxZoom: number };

export function leafletViewportPadding(mapElement: HTMLElement, detailsElement: HTMLElement | null) {
  const mapRect = mapElement.getBoundingClientRect();
  const shortestEdge = Math.min(mapRect.width, mapRect.height);
  const edgePadding = Math.round(Math.min(56, Math.max(32, shortestEdge * .055)));
  let rightPadding = edgePadding;
  let bottomPadding = edgePadding;

  if (detailsElement) {
    const detailsRect = detailsElement.getBoundingClientRect();
    const horizontalOverlap = Math.max(
      0,
      Math.min(mapRect.right, detailsRect.right) - Math.max(mapRect.left, detailsRect.left),
    );
    const verticalOverlap = Math.max(
      0,
      Math.min(mapRect.bottom, detailsRect.bottom) - Math.max(mapRect.top, detailsRect.top),
    );
    if (horizontalOverlap > 0 && verticalOverlap > 0) {
      const detailsAtBottom = detailsRect.width >= mapRect.width * .68
        && Math.abs(mapRect.bottom - detailsRect.bottom) <= edgePadding;
      if (detailsAtBottom) bottomPadding = mapRect.bottom - detailsRect.top + edgePadding;
      else rightPadding = mapRect.right - detailsRect.left + edgePadding;
    }
  }

  return {
    paddingTopLeft: [edgePadding, edgePadding] as [number, number],
    paddingBottomRight: [
      Math.min(rightPadding, Math.max(edgePadding, mapRect.width - edgePadding - 64)),
      Math.min(bottomPadding, Math.max(edgePadding, mapRect.height - edgePadding - 64)),
    ] as [number, number],
  };
}

export function useMapViewport({
  getDetailsElement,
  filteredGroups,
  mapFitCoordinates,
  mapOverlays,
  ready,
  runtime,
  selected,
  selectedCampaign,
  sidebarOpen,
}: {
  getDetailsElement: () => HTMLElement | null;
  filteredGroups: AtlasGroupDto[];
  mapFitCoordinates: [number, number][];
  mapOverlays: Record<string, MapOverlayDto>;
  ready: boolean;
  runtime: LeafletMapRuntime;
  selected: AtlasSelection;
  selectedCampaign: CampaignOption<AtlasGroupDto, AtlasEntryDto> | null;
  sidebarOpen: boolean;
}) {
  const sidebarSelectionTarget = useRef<SidebarSelectionTarget | null>(null);
  const relatedLevelFocusEntryId = useRef<string | null>(null);

  const queueSidebarSelection = useCallback((target: SidebarSelectionTarget | null) => {
    sidebarSelectionTarget.current = target;
  }, []);
  const queueRelatedLevelFocus = useCallback((entryId: string | null) => {
    relatedLevelFocusEntryId.current = entryId;
  }, []);

  const focusEntryOverlay = useCallback((entry: AtlasEntryDto, alwaysFit = false) => {
    const currentMap = runtime.getMap();
    const leaflet = runtime.getLeaflet();
    const mapElement = runtime.getContainer();
    const entryOverlay = mapOverlays[entry.levelId];
    if (!currentMap || !leaflet || !mapElement || !entry.coordinates || !entryOverlay) return false;

    const padding = leafletViewportPadding(mapElement, getDetailsElement());
    const size = currentMap.getSize();
    const visibleBounds = leaflet.latLngBounds([
      currentMap.containerPointToLatLng(padding.paddingTopLeft),
      currentMap.containerPointToLatLng([
        size.x - padding.paddingBottomRight[0],
        size.y - padding.paddingBottomRight[1],
      ]),
    ]);
    const overlayAndMarkerBounds = leaflet.latLngBounds([
      entryOverlay.corners.topLeft,
      entryOverlay.corners.topRight,
      entryOverlay.corners.bottomLeft,
      entryOverlay.corners.bottomRight,
      entry.coordinates,
    ]);
    if (alwaysFit || !visibleBounds.contains(overlayAndMarkerBounds)) {
      currentMap.stop();
      const movement = {
        ...padding,
        ...(alwaysFit ? {} : { maxZoom: currentMap.getZoom() }),
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        duration: .55,
      };
      if (movement.animate) currentMap.flyToBounds(overlayAndMarkerBounds, movement);
      else currentMap.fitBounds(overlayAndMarkerBounds, movement);
    } else {
      currentMap.panInside(entry.coordinates, padding);
    }
    return true;
  }, [getDetailsElement, mapOverlays, runtime]);

  const focusEntryOnMap = useCallback((entry: AtlasEntryDto) => {
    if (focusEntryOverlay(entry, true)) return;
    const currentMap = runtime.getMap();
    const layer = runtime.getMarkerLayer();
    const entryMarker = runtime.getMarker(entry.id)?.marker;
    if (!currentMap || !layer || !entryMarker) return;

    currentMap.stop();
    layer.zoomToShowLayer(entryMarker, () => {
      const mapElement = runtime.getContainer();
      if (runtime.getMap() !== currentMap || !mapElement) return;
      currentMap.panInside(
        entryMarker.getLatLng(),
        leafletViewportPadding(mapElement, getDetailsElement()),
      );
    });
  }, [focusEntryOverlay, getDetailsElement, runtime]);

  const focusSelectedMarker = useCallback(() => {
    focusEntryOnMap(selected.entry);
  }, [focusEntryOnMap, selected.entry]);

  useEffect(() => {
    const currentMap = runtime.getMap();
    const mapElement = runtime.getContainer();
    if (!ready || !currentMap || !runtime.getLeaflet() || !mapElement) return;
    const selectedIsVisible = filteredGroups.some((group) =>
      group.entries.some((entry) => entry.id === selected.entry.id));
    if (!selected.entry.coordinates || !selectedIsVisible) return;

    const awaitingCampaignRouteFit = selectedCampaign !== null
      && runtime.getCampaignMarkerRevealEntryId() === selected.entry.id;
    if (awaitingCampaignRouteFit) return;
    const sidebarTarget = sidebarSelectionTarget.current;
    if (sidebarTarget) {
      sidebarSelectionTarget.current = null;
      const movement = {
        ...leafletViewportPadding(mapElement, getDetailsElement()),
        maxZoom: sidebarTarget.maxZoom,
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        duration: .55,
      };
      currentMap.stop();
      if (movement.animate) currentMap.flyToBounds(sidebarTarget.bounds, movement);
      else currentMap.fitBounds(sidebarTarget.bounds, movement);
      return;
    }
    const relatedFocusEntryId = relatedLevelFocusEntryId.current;
    relatedLevelFocusEntryId.current = null;
    if (relatedFocusEntryId === selected.entry.id) {
      focusEntryOnMap(selected.entry);
      return;
    }
    const overlaySelectionLevelId = runtime.consumeMarkerOverlaySelectionLevelId();
    if (overlaySelectionLevelId === selected.entry.levelId && focusEntryOverlay(selected.entry)) return;
    currentMap.panInside(
      selected.entry.coordinates,
      leafletViewportPadding(mapElement, getDetailsElement()),
    );
  }, [filteredGroups, focusEntryOnMap, focusEntryOverlay, getDetailsElement, ready, runtime, selected, selectedCampaign]);

  useEffect(() => {
    const currentMap = runtime.getMap();
    const mapElement = runtime.getContainer();
    if (!ready || !currentMap || !mapElement) return;
    const animation = {
      ...leafletViewportPadding(mapElement, getDetailsElement()),
      animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      duration: .45,
    };
    currentMap.stop();
    if (mapFitCoordinates.length) {
      currentMap.fitBounds(mapFitCoordinates, {
        ...animation,
        maxZoom: mapFitCoordinates.length === 1 ? 6 : 7,
      });
    } else {
      currentMap.setView([27, 8], 2, {
        animate: animation.animate,
        duration: animation.duration,
      });
    }
  }, [getDetailsElement, mapFitCoordinates, ready, runtime]);

  useEffect(() => {
    if (!ready || !runtime.getMap()) return;
    const refreshMapSize = () => runtime.getMap()?.invalidateSize({ pan: false });
    const animationFrame = requestAnimationFrame(refreshMapSize);
    const transitionEnd = window.setTimeout(refreshMapSize, 340);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(transitionEnd);
    };
  }, [ready, runtime, sidebarOpen]);

  return {
    focusSelectedMarker,
    queueRelatedLevelFocus,
    queueSidebarSelection,
  };
}
