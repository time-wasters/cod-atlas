"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OverlayImagePort } from "../../../application/map/ports/overlay-image.port.js";
import type { MapOverlayDto } from "../../../infrastructure/atlas-data/dto/map-overlay.dto.js";
import { retargetLeafletOverlayOpacity } from "../../../infrastructure/mapping/leaflet/leaflet-overlay-opacity-retargeting.animator.js";
import { animateLeafletOverlayOpacity } from "../../../infrastructure/mapping/leaflet/leaflet-overlay-opacity-transition.animator.js";
import { renderLeafletMapOverlay } from "../../../infrastructure/mapping/leaflet/leaflet-map-overlay.renderer.js";
import { calculateLeafletMapOverlayOpacityTarget } from "../../../infrastructure/mapping/leaflet/map-overlay-opacity-target.adapter.js";
import { LEAFLET_MAX_ZOOM } from "../../../infrastructure/mapping/leaflet/leaflet-map.factory.js";
import type { LeafletMapRuntime } from "./use-leaflet-map.js";
import { leafletViewportPadding } from "./use-map-viewport.js";
import { MAP_OVERLAY_CONFIG } from "../../../shared/config/map-overlay.config.js";

type RetiringOverlay = {
  overlay: import("leaflet").ImageOverlay.Rotated;
  animationRef: { current: number | null };
  opacityRef: { current: number };
};

export function useMapOverlayLayer({
  adaptiveOpacity,
  campaignPlaybackActive,
  campaignOverlayVisible,
  getDetailsElement,
  enabled,
  levelId,
  overlay,
  images,
  ready,
  runtime,
  title,
}: {
  adaptiveOpacity: boolean;
  campaignPlaybackActive: boolean;
  campaignOverlayVisible: boolean;
  getDetailsElement: () => HTMLElement | null;
  enabled: boolean;
  levelId: string;
  overlay: MapOverlayDto | null;
  images: OverlayImagePort;
  ready: boolean;
  runtime: LeafletMapRuntime;
  title: string;
}) {
  const imageOverlay = useRef<import("leaflet").ImageOverlay.Rotated | null>(null);
  const imageOverlayLevelId = useRef<string | null>(null);
  const imageOverlayOpacity = useRef(0);
  const imageOverlayAnimation = useRef<number | null>(null);
  const imageOverlayTargetOpacity = useRef(0);
  const [loadedOverlay, setLoadedOverlay] = useState<import("leaflet").ImageOverlay.Rotated | null>(null);
  const retiringOverlays = useRef(new Set<RetiringOverlay>());
  const fade = campaignPlaybackActive ? MAP_OVERLAY_CONFIG.campaign : MAP_OVERLAY_CONFIG.default;

  const retireCurrentOverlay = useCallback(() => {
    if (!imageOverlay.current) return;
    if (imageOverlayAnimation.current !== null) cancelAnimationFrame(imageOverlayAnimation.current);
    const retiring: RetiringOverlay = {
      overlay: imageOverlay.current,
      animationRef: { current: null },
      opacityRef: { current: imageOverlayOpacity.current },
    };
    retiringOverlays.current.add(retiring);
    imageOverlay.current = null;
    imageOverlayLevelId.current = null;
    imageOverlayAnimation.current = null;
    imageOverlayOpacity.current = 0;
    imageOverlayTargetOpacity.current = 0;
    setLoadedOverlay(null);
    animateLeafletOverlayOpacity({
      ...retiring,
      durationMs: fade.fadeOutMs,
      target: 0,
      onComplete: () => {
        retiring.overlay.remove();
        retiringOverlays.current.delete(retiring);
      },
    });
  }, [fade.fadeOutMs]);

  const transitionOpacity = useCallback((overlay: import("leaflet").ImageOverlay.Rotated, target: number) => {
    retargetLeafletOverlayOpacity({
      animationRef: imageOverlayAnimation,
      opacityRef: imageOverlayOpacity,
      overlay,
      target,
      targetRef: imageOverlayTargetOpacity,
      fadeInMs: fade.fadeInMs,
      fadeOutMs: fade.fadeOutMs,
    });
  }, [fade.fadeInMs, fade.fadeOutMs]);

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
      visible: visible && (!campaignPlaybackActive || campaignOverlayVisible),
    });
  }, [adaptiveOpacity, campaignPlaybackActive, campaignOverlayVisible, getDetailsElement, runtime]);

  useEffect(() => {
    const currentMap = runtime.getMap();
    const leaflet = runtime.getLeaflet();
    if (!ready || !currentMap || !leaflet) return;
    if (!overlay) {
      retireCurrentOverlay();
      return;
    }
    if (imageOverlay.current && imageOverlayLevelId.current === levelId) {
      return;
    }
    retireCurrentOverlay();
    let cancelled = false;
    void images.acquire(overlay.image).then((image) => {
      if (cancelled || !image || runtime.getMap() !== currentMap) return;
      const renderedOverlay = renderLeafletMapOverlay({ leaflet, map: currentMap, overlay, title, image });
      imageOverlay.current = renderedOverlay;
      imageOverlayLevelId.current = levelId;
      imageOverlayOpacity.current = 0;
      imageOverlayTargetOpacity.current = 0;
      imageOverlayAnimation.current = null;
      setLoadedOverlay(renderedOverlay);
    }).catch(() => { /* Image failures leave the base map usable. */ });
    return () => { cancelled = true; };
  }, [images, levelId, overlay, ready, retireCurrentOverlay, runtime, title]);

  useEffect(() => {
    const renderedOverlay = imageOverlay.current;
    if (!ready || !overlay || !renderedOverlay || imageOverlayLevelId.current !== levelId) return;
    transitionOpacity(renderedOverlay, opacityTarget(overlay, enabled));
  }, [enabled, levelId, loadedOverlay, opacityTarget, overlay, ready, transitionOpacity]);

  useEffect(() => {
    const currentMap = runtime.getMap();
    if (!ready || !currentMap || !overlay) return;
    const refreshOpacity = (zoom?: number) => {
      const renderedOverlay = imageOverlay.current;
      if (!renderedOverlay || imageOverlayLevelId.current !== levelId) return;
      transitionOpacity(renderedOverlay, opacityTarget(overlay, enabled, zoom));
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
  }, [enabled, levelId, opacityTarget, overlay, ready, runtime, transitionOpacity]);

  useEffect(() => () => {
    if (imageOverlayAnimation.current !== null) cancelAnimationFrame(imageOverlayAnimation.current);
    imageOverlay.current?.remove();
    imageOverlay.current = null;
    imageOverlayLevelId.current = null;
    imageOverlayAnimation.current = null;
    imageOverlayOpacity.current = 0;
    imageOverlayTargetOpacity.current = 0;
    for (const retiring of retiringOverlays.current) {
      if (retiring.animationRef.current !== null) cancelAnimationFrame(retiring.animationRef.current);
      retiring.overlay.remove();
    }
    retiringOverlays.current.clear();
  }, []);
}
