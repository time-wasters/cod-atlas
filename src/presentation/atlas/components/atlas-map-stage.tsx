import type { ReactNode, RefObject } from "react";

export function AtlasMapStage({
  briefing,
  details,
  mapNode,
  mediaDialog,
  playbackActive,
  solarSystem,
}: {
  briefing: ReactNode;
  details: ReactNode;
  mapNode: RefObject<HTMLDivElement | null>;
  mediaDialog: ReactNode;
  playbackActive: boolean;
  solarSystem: ReactNode;
}) {
  return (
    <section className={`map-stage${playbackActive ? " is-campaign-playback-active" : ""}`} aria-label="Interactive world map">
      <div ref={mapNode} className="map-canvas" />
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
