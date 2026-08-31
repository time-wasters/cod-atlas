import type { ReactNode, RefObject } from "react";

export function AtlasMapStage({
  briefing,
  details,
  mapNode,
  mediaDialog,
  solarSystem,
}: {
  briefing: ReactNode;
  details: ReactNode;
  mapNode: RefObject<HTMLDivElement | null>;
  mediaDialog: ReactNode;
  solarSystem: ReactNode;
}) {
  return (
    <section className="map-stage" aria-label="Interactive world map">
      <div ref={mapNode} className="map-canvas" />
      <div className="map-grid" aria-hidden="true" />
      <div className="map-label" aria-hidden="true">TACTICAL GEOGRAPHY // GLOBAL</div>
      {solarSystem}
      {briefing}
      {details}
      {mediaDialog}
    </section>
  );
}
