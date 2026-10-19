"use client";

import { useCallback, useEffect, useRef } from "react";
import type { CampaignOption } from "../../../application/campaigns/use-cases/build-campaign-options.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { MapOverlayDto } from "../../../infrastructure/atlas-data/dto/map-overlay.dto.js";
import type { LeafletMapRuntime } from "./use-leaflet-map.js";
import { mapTravelDuration } from "../models/map-travel-duration.js";
import { MARKER_FOCUS_PRESET, OVERLAY_FIT_PRESET } from "../models/map-focus-presets.js";
import { markerFocusZoomLimit, revealLeafletMarker } from "../../../infrastructure/mapping/leaflet/leaflet-marker-reveal.adapter.js";

type AtlasSelection = { group: AtlasGroupDto; entry: AtlasEntryDto };
type SidebarSelectionTarget = {
  bounds: [number, number][];
  maxZoom?: number;
  fitOnlyWhenOutside?: boolean;
};

export function leafletViewportPadding(mapElement: HTMLElement, detailsElement: HTMLElement | null) {
  const mapRect = mapElement.getBoundingClientRect();
  const shortestEdge = Math.min(mapRect.width, mapRect.height);
  const edgePadding = Math.round(Math.min(56, Math.max(32, shortestEdge * .055)));
  let topPadding = edgePadding;
  let rightPadding = edgePadding;
  let bottomPadding = edgePadding;

  const briefingElement = mapElement.parentElement?.querySelector<HTMLElement>("#selected-level-briefing");
  for (const element of [detailsElement, briefingElement]) {
    if (!element) continue;
    const detailsRect = element.getBoundingClientRect();
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
      const detailsAtTop = detailsRect.width >= mapRect.width * .68
        && Math.abs(mapRect.top - detailsRect.top) <= edgePadding;
      if (detailsAtBottom) bottomPadding = Math.max(bottomPadding, mapRect.bottom - detailsRect.top + edgePadding);
      else if (detailsAtTop) topPadding = Math.max(topPadding, detailsRect.bottom - mapRect.top + edgePadding);
      else rightPadding = Math.max(rightPadding, mapRect.right - detailsRect.left + edgePadding);
    }
  }

  topPadding = Math.min(topPadding, Math.max(edgePadding, mapRect.height - edgePadding - 64));
  return {
    paddingTopLeft: [edgePadding, topPadding] as [number, number],
    paddingBottomRight: [
      Math.min(rightPadding, Math.max(edgePadding, mapRect.width - edgePadding - 64)),
      Math.min(bottomPadding, Math.max(edgePadding, mapRect.height - topPadding - 64)),
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
  const markerFlightArrival = useRef<(() => void) | null>(null);
  const markerRevealCleanup = useRef<(() => void) | null>(null);
  const cancelMarkerFlightArrival = useCallback(() => {
    if (markerFlightArrival.current) runtime.getMap()?.off("moveend", markerFlightArrival.current);
    markerFlightArrival.current = null;
    markerRevealCleanup.current?.();
    markerRevealCleanup.current = null;
  }, [runtime]);
  useEffect(() => {
    const map = runtime.getMap();
    if (!ready || !map) return;
    const container = map.getContainer();
    map.on("dragstart", cancelMarkerFlightArrival);
    container.addEventListener("wheel", cancelMarkerFlightArrival, { passive: true });
    return () => {
      map.off("dragstart", cancelMarkerFlightArrival);
      container.removeEventListener("wheel", cancelMarkerFlightArrival);
      cancelMarkerFlightArrival();
    };
  }, [cancelMarkerFlightArrival, ready, runtime]);

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
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = mapTravelDuration(
      currentMap.getCenter().distanceTo(overlayAndMarkerBounds.getCenter()),
      OVERLAY_FIT_PRESET.minimumTravelSeconds,
      OVERLAY_FIT_PRESET.maximumTravelSeconds,
    );
    if (alwaysFit || !visibleBounds.contains(overlayAndMarkerBounds)
      || currentMap.getZoom() > OVERLAY_FIT_PRESET.maximumZoom) {
      cancelMarkerFlightArrival();
      currentMap.stop();
      const movement = {
        ...padding,
        maxZoom: alwaysFit
          ? OVERLAY_FIT_PRESET.maximumZoom
          : Math.min(currentMap.getZoom(), OVERLAY_FIT_PRESET.maximumZoom),
        animate,
        duration,
      };
      if (movement.animate) currentMap.flyToBounds(overlayAndMarkerBounds, movement);
      else currentMap.fitBounds(overlayAndMarkerBounds, movement);
    } else {
      currentMap.panInside(entry.coordinates, { ...padding, animate, duration });
    }
    return true;
  }, [cancelMarkerFlightArrival, getDetailsElement, mapOverlays, runtime]);

  const focusEntryOnMap = useCallback((entry: AtlasEntryDto, center = false) => {
    if (!center && focusEntryOverlay(entry, true)) return;
    const currentMap = runtime.getMap();
    const layer = runtime.getMarkerLayer();
    const leaflet = runtime.getLeaflet();
    const mapElement = runtime.getContainer();
    const entryMarker = runtime.getMarker(entry.id)?.marker;
    if (!currentMap || !layer || !leaflet || !mapElement || !entryMarker) return;

    cancelMarkerFlightArrival();
    currentMap.stop();
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const precisionZoom = markerFocusZoomLimit(entry.precision);
    // Spiderfying temporarily changes marker coordinates; camera destinations
    // must continue to use the curated point when stepping between missions.
    const destination = leaflet.latLng(entry.coordinates ?? entryMarker.getLatLng());
    const distance = currentMap.getCenter().distanceTo(destination);
    const reveal = () => {
      if (runtime.getMap() !== currentMap || runtime.getMarker(entry.id)?.marker !== entryMarker) return;
      // Do not pan to a displaced spiderfied marker after arrival.
      markerRevealCleanup.current = revealLeafletMarker(layer, entryMarker);
    };
    const targetZoom = Math.min(
      precisionZoom ?? currentMap.getMaxZoom(),
      MARKER_FOCUS_PRESET.maximumZoom,
      Math.max(MARKER_FOCUS_PRESET.minimumZoom, currentMap.getZoom()),
    );
    const duration = mapTravelDuration(
      distance, MARKER_FOCUS_PRESET.minimumTravelSeconds, MARKER_FOCUS_PRESET.maximumTravelSeconds,
    );
    if (animate && (distance > 50_000 || currentMap.getZoom() !== targetZoom)) {
      const movement = { animate, duration, maxZoom: targetZoom };
      const arrive = () => {
        markerFlightArrival.current = null;
        reveal();
      };
      markerFlightArrival.current = arrive;
      currentMap.once("moveend", arrive);
      if (center) currentMap.flyTo(destination, targetZoom, movement);
      else currentMap.flyToBounds(leaflet.latLngBounds([destination]), {
        ...leafletViewportPadding(mapElement, getDetailsElement()), ...movement,
      });
    } else {
      const movement = { animate, duration };
      const arrive = () => { markerFlightArrival.current = null; reveal(); };
      markerFlightArrival.current = arrive;
      currentMap.once("moveend", arrive);
      let moved = false;
      const markMoving = () => { moved = true; };
      currentMap.once("movestart", markMoving);
      if (currentMap.getZoom() !== targetZoom) {
        currentMap.fitBounds(leaflet.latLngBounds([destination]), {
          ...leafletViewportPadding(mapElement, getDetailsElement()), maxZoom: targetZoom, ...movement,
        });
      } else if (center) currentMap.panTo(destination, movement);
      else currentMap.panInside(destination, {
        ...leafletViewportPadding(mapElement, getDetailsElement()), ...movement,
      });
      currentMap.off("movestart", markMoving);
      // panInside is a no-op when the point is already visible.
      if (!moved && markerFlightArrival.current === arrive) {
        cancelMarkerFlightArrival();
        reveal();
      }
    }
  }, [cancelMarkerFlightArrival, focusEntryOverlay, getDetailsElement, runtime]);

  const focusSelectedMarker = useCallback(() => {
    focusEntryOnMap(selected.entry);
  }, [focusEntryOnMap, selected.entry]);

  const centerSelectedMarker = useCallback(() => {
    focusEntryOnMap(selected.entry, true);
  }, [focusEntryOnMap, selected.entry]);

  useEffect(() => {
    const currentMap = runtime.getMap();
    const leaflet = runtime.getLeaflet();
    const mapElement = runtime.getContainer();
    if (!ready || !currentMap || !leaflet || !mapElement) return;
    const selectedIsVisible = filteredGroups.some((group) =>
      group.entries.some((entry) => entry.id === selected.entry.id));
    const awaitingCampaignRouteFit = selectedCampaign !== null
      && runtime.getCampaignMarkerRevealEntryId() === selected.entry.id;
    if (awaitingCampaignRouteFit) return;
    const sidebarTarget = sidebarSelectionTarget.current;
    if (sidebarTarget) {
      sidebarSelectionTarget.current = null;
      const padding = leafletViewportPadding(mapElement, getDetailsElement());
      if (sidebarTarget.fitOnlyWhenOutside) {
        const size = currentMap.getSize();
        const visibleBounds = leaflet.latLngBounds([
          currentMap.containerPointToLatLng(padding.paddingTopLeft),
          currentMap.containerPointToLatLng([
            size.x - padding.paddingBottomRight[0],
            size.y - padding.paddingBottomRight[1],
          ]),
        ]);
        if (visibleBounds.contains(leaflet.latLngBounds(sidebarTarget.bounds))) return;
      }
      const movement = {
        ...padding,
        maxZoom: Math.min(
          sidebarTarget.fitOnlyWhenOutside ? currentMap.getZoom() : sidebarTarget.maxZoom ?? Infinity,
          MARKER_FOCUS_PRESET.maximumZoom,
        ),
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        duration: mapTravelDuration(
          currentMap.getCenter().distanceTo(leaflet.latLngBounds(sidebarTarget.bounds).getCenter()),
          MARKER_FOCUS_PRESET.minimumTravelSeconds,
          MARKER_FOCUS_PRESET.maximumTravelSeconds,
        ),
      };
      cancelMarkerFlightArrival();
      currentMap.stop();
      if (movement.animate) currentMap.flyToBounds(sidebarTarget.bounds, movement);
      else currentMap.fitBounds(sidebarTarget.bounds, movement);
      return;
    }
    if (!selected.entry.coordinates || !selectedIsVisible) {
      if (markerFlightArrival.current) { cancelMarkerFlightArrival(); currentMap.stop(); }
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
      {
        ...leafletViewportPadding(mapElement, getDetailsElement()),
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        duration: mapTravelDuration(
          currentMap.getCenter().distanceTo(selected.entry.coordinates),
          MARKER_FOCUS_PRESET.minimumTravelSeconds,
          MARKER_FOCUS_PRESET.maximumTravelSeconds,
        ),
      },
    );
  }, [cancelMarkerFlightArrival, filteredGroups, focusEntryOnMap, focusEntryOverlay, getDetailsElement, ready, runtime, selected, selectedCampaign]);

  useEffect(() => {
    const currentMap = runtime.getMap();
    const mapElement = runtime.getContainer();
    if (!ready || !currentMap || !mapElement) return;
    const animation = {
      ...leafletViewportPadding(mapElement, getDetailsElement()),
      animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      duration: .45,
    };
    cancelMarkerFlightArrival();
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
  }, [cancelMarkerFlightArrival, getDetailsElement, mapFitCoordinates, ready, runtime]);

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
    centerSelectedMarker,
    focusSelectedMarker,
    queueRelatedLevelFocus,
    queueSidebarSelection,
  };
}
