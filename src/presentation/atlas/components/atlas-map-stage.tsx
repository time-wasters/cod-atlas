import type { ReactNode, RefObject } from "react";

export function AtlasMapStage({
  briefing,
  details,
  mapNode,
  mediaDialog,
  playback,
  playbackActive,
  solarSystem,
}: {
  briefing: ReactNode;
  details: ReactNode;
  mapNode: RefObject<HTMLDivElement | null>;
  mediaDialog: ReactNode;
  playback: ReactNode;
  playbackActive: boolean;
  solarSystem: ReactNode;
}) {
  return (
    <section className={`map-stage${playback ? " has-campaign-player" : ""}${playbackActive ? " is-campaign-playback-active" : ""}`} aria-label="Interactive world map">
      <div ref={mapNode} className="map-canvas" />
      <div className="map-grid" aria-hidden="true" />
      <div className="map-label" aria-hidden="true">TACTICAL GEOGRAPHY // GLOBAL</div>
      {solarSystem}
      <div className="mission-stack">
        <div className="mission-stack-playback">
          <div>{playback}</div>
        </div>
        {briefing}
      </div>
      {details}
      {mediaDialog}
    </section>
  );
}
