import type { ReactNode, RefObject } from "react";
import { ElementTooltip } from "../../shared/components/tooltip.js";

export function AtlasMapStage({
  briefing,
  details,
  mapNode,
  mapReady,
  mediaDialog,
  playbackActive,
  solarSystem,
}: {
  briefing: ReactNode;
  details: ReactNode;
  mapNode: RefObject<HTMLDivElement | null>;
  mapReady: boolean;
  mediaDialog: ReactNode;
  playbackActive: boolean;
  solarSystem: ReactNode;
}) {
  return (
    <section className={`map-stage${playbackActive ? " is-campaign-playback-active" : ""}`} aria-label="Interactive world map">
      <div ref={mapNode} className="map-canvas" />
      <ElementTooltip container={mapNode} selector=".leaflet-control-zoom-in" ready={mapReady} content="Zoom in" />
      <ElementTooltip container={mapNode} selector=".leaflet-control-zoom-out" ready={mapReady} content="Zoom out" />
      <ElementTooltip container={mapNode} selector=".leaflet-control-attribution a[href='https://leafletjs.com']" ready={mapReady}
        content="A JavaScript library for interactive maps" />
      <div className="map-grid" aria-hidden="true" />
      <div className="map-label" aria-hidden="true">TACTICAL GEOGRAPHY // GLOBAL</div>
      {solarSystem}
      <div className="mission-stack">
        {briefing}
      </div>
      {details}
      {mediaDialog}
    </section>
  );
}
