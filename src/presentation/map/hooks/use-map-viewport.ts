"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CampaignOption } from "../../../application/campaigns/use-cases/build-campaign-options.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { MapOverlayDto } from "../../../infrastructure/atlas-data/dto/map-overlay.dto.js";
import type { LeafletMapRuntime } from "./use-leaflet-map.js";
import { mapTravelDuration } from "../models/map-travel-duration.js";
import { CAMPAIGN_FOCUS_PRESET, MARKER_FOCUS_PRESET, OVERLAY_FIT_PRESET } from "../models/map-focus-presets.js";
import { campaignFocusZoom } from "../models/campaign-focus-zoom.js";
import { campaignTravelDuration } from "../models/campaign-travel-duration.js";
import { campaignFlightStages } from "../models/campaign-flight-stages.js";
import { createLeafletCampaignFlight } from "../../../infrastructure/mapping/leaflet/leaflet-campaign-flight.controller.js";
import { waitForMapView } from "../../../infrastructure/mapping/leaflet/wait-for-map-view.js";
import { markerFocusZoomLimit, revealLeafletMarker } from "../../../infrastructure/mapping/leaflet/leaflet-marker-reveal.adapter.js";
import { leafletEntryFocusTarget } from "../../../infrastructure/mapping/leaflet/leaflet-entry-focus-target.adapter.js";
import { MAP_OVERLAY_CONFIG } from "../../../shared/config/map-overlay.config.js";
import { canCrossfadeLeafletOverlays } from "../../../infrastructure/mapping/leaflet/leaflet-overlay-crossfade.adapter.js";

type AtlasSelection = { group: AtlasGroupDto; entry: AtlasEntryDto };
type EntryFocusContext = "manual" | "campaign-playback";
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
  campaignPlaybackActive,
  filteredGroups,
  mapFitCoordinates,
  mapOverlays,
  onCampaignTravelChange,
  ready,
  runtime,
  selected,
  selectedCampaign,
  sidebarOpen,
}: {
  getDetailsElement: () => HTMLElement | null;
  campaignPlaybackActive: boolean;
  filteredGroups: AtlasGroupDto[];
  mapFitCoordinates: [number, number][];
  mapOverlays: Record<string, MapOverlayDto>;
  onCampaignTravelChange: (pending: boolean) => void;
  ready: boolean;
  runtime: LeafletMapRuntime;
  selected: AtlasSelection;
  selectedCampaign: CampaignOption<AtlasGroupDto, AtlasEntryDto> | null;
  sidebarOpen: boolean;
}) {
  const sidebarSelectionTarget = useRef<SidebarSelectionTarget | null>(null);
  const relatedLevelFocus = useRef<{
    entryId: string; context: EntryFocusContext; previousOverlay?: MapOverlayDto;
  } | null>(null);
  const markerFlightArrival = useRef<(() => void) | null>(null);
  const markerRevealCleanup = useRef<(() => void) | null>(null);
  const campaignFlight = useRef<ReturnType<typeof createLeafletCampaignFlight> | null>(null);
  const [campaignOverlayEntryId, setCampaignOverlayEntryId] = useState<string | null>(null);
  const campaignOverlayCrossfade = useRef<string | null>(null);
  // The viewport effect classifies a visit before the overlay layer's effect
  // runs, so its outgoing image can be held without waiting for a state render.
  const shouldCrossfadeOverlay = useCallback((levelId: string) => campaignOverlayCrossfade.current === levelId, []);
  const cancelMarkerFlightArrival = useCallback(() => {
    if (markerFlightArrival.current) runtime.getMap()?.off("moveend", markerFlightArrival.current);
    markerFlightArrival.current = null;
    markerRevealCleanup.current?.();
    markerRevealCleanup.current = null;
    const flight = campaignFlight.current;
    campaignFlight.current = null;
    flight?.cancel();
  }, [runtime]);
  useEffect(() => {
    if (campaignPlaybackActive) return;
    const flight = campaignFlight.current;
    campaignFlight.current = null;
    // A new campaign or manual selection may already have started its own camera move.
    flight?.cancel({ stopMap: false });
  }, [campaignPlaybackActive]);
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
  const queueRelatedLevelFocus = useCallback((entryId: string | null, context: EntryFocusContext = "manual") => {
    cancelMarkerFlightArrival();
    campaignOverlayCrossfade.current = null;
    relatedLevelFocus.current = entryId ? {
      entryId, context, previousOverlay: mapOverlays[selected.entry.levelId],
    } : null;
  }, [cancelMarkerFlightArrival, mapOverlays, selected.entry.levelId]);

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

  const focusEntryOnMap = useCallback((entry: AtlasEntryDto, center = false, context: EntryFocusContext = "manual", previousOverlay?: MapOverlayDto) => {
    const playback = context === "campaign-playback";
    // Playback uses the location scale, limited by any attached overlay's extent.
    if (!center && !playback && focusEntryOverlay(entry, true)) return;
    const currentMap = runtime.getMap();
    const layer = runtime.getMarkerLayer();
    const leaflet = runtime.getLeaflet();
    const mapElement = runtime.getContainer();
    const entryMarker = runtime.getMarker(entry.id)?.marker;
    if (!currentMap || !layer || !leaflet || !mapElement || !entryMarker) return;
    const playbackZoom = playback ? campaignFocusZoom(entry, CAMPAIGN_FOCUS_PRESET, currentMap.getMaxZoom()) : undefined;
    if (playbackZoom === null) return;
    const preset = playback ? CAMPAIGN_FOCUS_PRESET : MARKER_FOCUS_PRESET;

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
    const entryOverlay = mapOverlays[entry.levelId];
    const { bounds: focusBounds, maximumZoom: targetZoom } = leafletEntryFocusTarget({
      coordinates: destination,
      overlay: entryOverlay,
      maximumZoom: Math.min(
        currentMap.getMaxZoom(),
        preset.maximumZoom,
        entryOverlay ? OVERLAY_FIT_PRESET.maximumZoom : Infinity,
        playbackZoom ?? precisionZoom ?? Math.max(MARKER_FOCUS_PRESET.minimumZoom, currentMap.getZoom()),
      ),
      leaflet,
      map: currentMap,
      padding: leafletViewportPadding(mapElement, getDetailsElement()),
    });
    if (playback) {
      if (canCrossfadeLeafletOverlays({
        previous: previousOverlay,
        overlay: entryOverlay,
        bounds: focusBounds,
        targetZoom,
        tolerancePixels: MAP_OVERLAY_CONFIG.campaign.sameAreaTolerancePixels,
        padding: leafletViewportPadding(mapElement, getDetailsElement()),
        map: currentMap,
        leaflet,
      })) {
        campaignOverlayCrossfade.current = entry.levelId;
        setCampaignOverlayEntryId(entry.id);
        reveal();
        onCampaignTravelChange(false);
        return;
      }
      campaignOverlayCrossfade.current = null;
      setCampaignOverlayEntryId(null);
      // Fit the same destination bounds at every stage so the final approach
      // cannot zoom through an overlay or leave an offset marker out of view.
      const flight = createLeafletCampaignFlight({
        map: currentMap,
        bounds: focusBounds,
        stages: campaignFlightStages(currentMap.getCenter().distanceTo(focusBounds.getCenter()),
          currentMap.getZoom(), targetZoom, CAMPAIGN_FOCUS_PRESET, animate),
        animate,
        getPadding: () => leafletViewportPadding(mapElement, getDetailsElement()),
        durationFor: (zoom) => campaignTravelDuration(
          currentMap.getCenter().distanceTo(focusBounds.getCenter()), currentMap.getZoom(), zoom, CAMPAIGN_FOCUS_PRESET,
        ),
        waitForOverview: (signal) => waitForMapView(() => runtime.isBasemapViewLoaded(), {
          signal,
          minimumMs: CAMPAIGN_FOCUS_PRESET.overview.minimumHoldSeconds * 1000,
          maximumMs: CAMPAIGN_FOCUS_PRESET.overview.maximumWaitSeconds * 1000,
        }),
        finalApproachLeadMs: MAP_OVERLAY_CONFIG.campaign.fadeInBeforeArrivalMs,
        onFinalApproach: () => setCampaignOverlayEntryId(entry.id),
        onComplete: () => {
          campaignFlight.current = null;
          reveal();
          onCampaignTravelChange(false);
        },
        onCancel: () => {
          campaignFlight.current = null;
          setCampaignOverlayEntryId(entry.id);
          onCampaignTravelChange(false);
        },
      });
      campaignFlight.current = flight;
      onCampaignTravelChange(true);
      flight.start();
      return;
    }
    const duration = mapTravelDuration(distance, preset.minimumTravelSeconds, preset.maximumTravelSeconds);
    if (animate && (distance > 50_000 || currentMap.getZoom() !== targetZoom)) {
      const movement = { animate, duration, maxZoom: targetZoom };
      const arrive = () => {
        markerFlightArrival.current = null;
        reveal();
      };
      markerFlightArrival.current = arrive;
      currentMap.once("moveend", arrive);
      if (center && !entryOverlay) currentMap.flyTo(destination, targetZoom, movement);
      else currentMap.flyToBounds(focusBounds, {
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
      if (entryOverlay || currentMap.getZoom() !== targetZoom) {
        currentMap.fitBounds(focusBounds, {
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
  }, [cancelMarkerFlightArrival, focusEntryOverlay, getDetailsElement, mapOverlays, onCampaignTravelChange, runtime]);

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
      if (markerFlightArrival.current || campaignFlight.current) { cancelMarkerFlightArrival(); currentMap.stop(); }
      return;
    }
    const relatedFocus = relatedLevelFocus.current;
    relatedLevelFocus.current = null;
    if (relatedFocus?.entryId === selected.entry.id) {
      focusEntryOnMap(selected.entry, false, relatedFocus.context, relatedFocus.previousOverlay);
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
    shouldCrossfadeOverlay,
    campaignOverlayVisible: !campaignPlaybackActive || campaignOverlayEntryId === selected.entry.id,
    centerSelectedMarker,
    focusSelectedMarker,
    queueRelatedLevelFocus,
    queueSidebarSelection,
  };
}
