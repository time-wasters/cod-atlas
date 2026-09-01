"use client";

import { useCallback, useEffect, useRef } from "react";
import type { HistoryOverlayDto } from "../../../infrastructure/atlas-data/dto/history-overlay.dto.js";
import { renderLeafletHistoryOverlay } from "../../../infrastructure/mapping/leaflet/leaflet-history-overlay.renderer.js";
import { animateLeafletOverlayOpacity } from "../../../infrastructure/mapping/leaflet/leaflet-overlay-opacity-transition.animator.js";
import type { LeafletMapRuntime } from "./use-leaflet-map.js";
import { leafletViewportPadding } from "./use-map-viewport.js";

export function useHistoryOverlayLayer({
  getDetailsElement,
  overlay,
  ready,
  runtime,
}: {
  getDetailsElement: () => HTMLElement | null;
  overlay: HistoryOverlayDto | null;
  ready: boolean;
  runtime: LeafletMapRuntime;
}) {
  const imageOverlay = useRef<import("leaflet").ImageOverlay.Rotated | null>(null);
  const imageOverlayKey = useRef<string | null>(null);
  const imageOverlayOpacity = useRef(0);
  const imageOverlayAnimation = useRef<number | null>(null);

  const focusHistoryOverlay = useCallback((historyOverlay: HistoryOverlayDto, coordinates?: [number, number] | null) => {
    const currentMap = runtime.getMap();
    const mapElement = runtime.getContainer();
    if (!currentMap || !runtime.getLeaflet() || !mapElement) return;
    const boundsCoordinates = [
      historyOverlay.corners.topLeft,
      historyOverlay.corners.topRight,
      historyOverlay.corners.bottomLeft,
      historyOverlay.corners.bottomRight,
      ...(coordinates ? [coordinates] : []),
    ];
    const movement = {
      ...leafletViewportPadding(mapElement, getDetailsElement()),
      animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      duration: .55,
    };
    currentMap.stop();
    if (movement.animate) currentMap.flyToBounds(boundsCoordinates, movement);
    else currentMap.fitBounds(boundsCoordinates, movement);
  }, [getDetailsElement, runtime]);

  useEffect(() => {
    const currentMap = runtime.getMap();
    const leaflet = runtime.getLeaflet();
    if (!ready || !currentMap || !leaflet) return;
    if (!overlay) {
      const existing = imageOverlay.current;
      if (!existing) return;
      animateLeafletOverlayOpacity({
        animationRef: imageOverlayAnimation,
        onComplete: () => {
          if (imageOverlay.current !== existing) return;
          existing.remove();
          imageOverlay.current = null;
          imageOverlayKey.current = null;
          imageOverlayOpacity.current = 0;
        },
        opacityRef: imageOverlayOpacity,
        overlay: existing,
        target: 0,
      });
      return;
    }

    const overlayKey = `${overlay.levelId}:${overlay.id}`;
    if (imageOverlay.current && imageOverlayKey.current === overlayKey) {
      animateLeafletOverlayOpacity({
        animationRef: imageOverlayAnimation,
        onComplete: undefined,
        opacityRef: imageOverlayOpacity,
        overlay: imageOverlay.current,
        target: overlay.opacity,
      });
      return;
    }
    if (imageOverlayAnimation.current !== null) cancelAnimationFrame(imageOverlayAnimation.current);
    imageOverlay.current?.remove();
    const renderedOverlay = renderLeafletHistoryOverlay({ leaflet, map: currentMap, overlay });
    imageOverlay.current = renderedOverlay;
    imageOverlayKey.current = overlayKey;
    imageOverlayOpacity.current = 0;
    imageOverlayAnimation.current = null;
    animateLeafletOverlayOpacity({
      animationRef: imageOverlayAnimation,
      onComplete: undefined,
      opacityRef: imageOverlayOpacity,
      overlay: renderedOverlay,
      target: overlay.opacity,
    });
  }, [overlay, ready, runtime]);

  useEffect(() => () => {
    if (imageOverlayAnimation.current !== null) cancelAnimationFrame(imageOverlayAnimation.current);
    imageOverlay.current?.remove();
  }, []);

  return { focusHistoryOverlay };
}
