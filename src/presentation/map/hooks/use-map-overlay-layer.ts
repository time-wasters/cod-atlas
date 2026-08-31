"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MapOverlayDto } from "../../../infrastructure/atlas-data/dto/map-overlay.dto.js";
import { retargetLeafletOverlayOpacity } from "../../../infrastructure/mapping/leaflet/leaflet-overlay-opacity-retargeting.animator.js";
import { renderLeafletMapOverlay } from "../../../infrastructure/mapping/leaflet/leaflet-map-overlay.renderer.js";
import { calculateLeafletMapOverlayOpacityTarget } from "../../../infrastructure/mapping/leaflet/map-overlay-opacity-target.adapter.js";
import { LEAFLET_MAX_ZOOM } from "../../../infrastructure/mapping/leaflet/leaflet-map.factory.js";
import type { LeafletMapRuntime } from "./use-leaflet-map.js";
import { leafletViewportPadding } from "./use-map-viewport.js";

export function useMapOverlayLayer({
  adaptiveOpacity,
  getDetailsElement,
  enabled,
  levelId,
  overlay,
  ready,
  runtime,
  title,
}: {
  adaptiveOpacity: boolean;
  getDetailsElement: () => HTMLElement | null;
  enabled: boolean;
  levelId: string;
  overlay: MapOverlayDto | null;
  ready: boolean;
  runtime: LeafletMapRuntime;
  title: string;
}) {
  const imageOverlay = useRef<import("leaflet").ImageOverlay.Rotated | null>(null);
  const imageOverlayLevelId = useRef<string | null>(null);
  const imageOverlayOpacity = useRef(0);
  const imageOverlayAnimation = useRef<number | null>(null);
  const imageOverlayTargetOpacity = useRef(0);

  const opacityTarget = useCallback((mapOverlay: MapOverlayDto, visible: boolean, zoom?: number) => {
    const currentMap = runtime.getMap();
    const leaflet = runtime.getLeaflet();
    const mapElement = runtime.getContainer();
    if (!currentMap || !leaflet || !mapElement) return visible ? mapOverlay.opacity : 0;
    return calculateLeafletMapOverlayOpacityTarget({
      baseOpacity: mapOverlay.opacity,
      corners: mapOverlay.corners,
      currentZoom: zoom,
      enabled: adaptiveOpacity,
      leaflet,
      map: currentMap,
      maximumZoom: LEAFLET_MAX_ZOOM,
      padding: leafletViewportPadding(mapElement, getDetailsElement()),
      visible,
    });
  }, [adaptiveOpacity, getDetailsElement, runtime]);

  useEffect(() => {
    const currentMap = runtime.getMap();
    const leaflet = runtime.getLeaflet();
    if (!ready || !currentMap || !leaflet) return;
    if (!overlay) {
      if (imageOverlayAnimation.current !== null) cancelAnimationFrame(imageOverlayAnimation.current);
      imageOverlay.current?.remove();
      imageOverlay.current = null;
      imageOverlayLevelId.current = null;
      imageOverlayAnimation.current = null;
      imageOverlayOpacity.current = 0;
      imageOverlayTargetOpacity.current = 0;
      return;
    }
    if (imageOverlay.current && imageOverlayLevelId.current === levelId) {
      retargetLeafletOverlayOpacity({
        animationRef: imageOverlayAnimation,
        opacityRef: imageOverlayOpacity,
        overlay: imageOverlay.current,
        target: opacityTarget(overlay, enabled),
        targetRef: imageOverlayTargetOpacity,
      });
      return;
    }
    if (imageOverlayAnimation.current !== null) cancelAnimationFrame(imageOverlayAnimation.current);
    imageOverlay.current?.remove();
    const renderedOverlay = renderLeafletMapOverlay({ leaflet, map: currentMap, overlay, title });
    imageOverlay.current = renderedOverlay;
    imageOverlayLevelId.current = levelId;
    imageOverlayOpacity.current = 0;
    imageOverlayTargetOpacity.current = 0;
    imageOverlayAnimation.current = null;
    retargetLeafletOverlayOpacity({
      animationRef: imageOverlayAnimation,
      opacityRef: imageOverlayOpacity,
      overlay: renderedOverlay,
      target: opacityTarget(overlay, enabled),
      targetRef: imageOverlayTargetOpacity,
    });
  }, [enabled, levelId, opacityTarget, overlay, ready, runtime, title]);

  useEffect(() => {
    const currentMap = runtime.getMap();
    if (!ready || !currentMap || !overlay) return;
    const refreshOpacity = (zoom?: number) => {
      const renderedOverlay = imageOverlay.current;
      if (!renderedOverlay || imageOverlayLevelId.current !== levelId) return;
      retargetLeafletOverlayOpacity({
        animationRef: imageOverlayAnimation,
        opacityRef: imageOverlayOpacity,
        overlay: renderedOverlay,
        target: opacityTarget(overlay, enabled, zoom),
        targetRef: imageOverlayTargetOpacity,
      });
    };
    const handleZoom = () => refreshOpacity();
    const handleZoomAnimation = (event: import("leaflet").ZoomAnimEvent) => refreshOpacity(event.zoom);
    currentMap.on("zoom", handleZoom);
    currentMap.on("zoomanim", handleZoomAnimation);
    currentMap.on("resize", handleZoom);
    return () => {
      currentMap.off("zoom", handleZoom);
      currentMap.off("zoomanim", handleZoomAnimation);
      currentMap.off("resize", handleZoom);
    };
  }, [enabled, levelId, opacityTarget, overlay, ready, runtime]);

  useEffect(() => () => {
    if (imageOverlayAnimation.current !== null) cancelAnimationFrame(imageOverlayAnimation.current);
    imageOverlay.current?.remove();
  }, []);
}
