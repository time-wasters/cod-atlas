import type { Canvas, LayerGroup, Map as LeafletMap, Polyline } from "leaflet";
import { CAMPAIGN_ROUTE_CONFIG } from "../../../shared/config/campaign-route.config.js";

type Coordinates = [number, number];

type CampaignRouteCanvas = Canvas & {
  _fillStroke: (context: CanvasRenderingContext2D, layer: Polyline) => void;
};

type CampaignRoute = {
  segments: Coordinates[][];
  waypoints: {
    coordinates: [number, number];
    stops: { entryId: string; title: string; order: number }[];
  }[];
};

export type RenderedCampaignRoute = {
  boundsCoordinates: Coordinates[];
  layer: LayerGroup;
  remove: () => void;
};

function campaignRouteProjectionZoom(
  leaflet: typeof import("leaflet"),
  map: LeafletMap,
  route: CampaignRoute,
) {
  if (route.waypoints.length === 0) {
    return Math.max(CAMPAIGN_ROUTE_CONFIG.projectionZoom.minimum,
      Math.min(CAMPAIGN_ROUTE_CONFIG.projectionZoom.maximum, map.getZoom()));
  }
  const bounds = leaflet.latLngBounds(route.waypoints.map(({ coordinates }) => coordinates));
  return Math.max(CAMPAIGN_ROUTE_CONFIG.projectionZoom.minimum,
    Math.min(CAMPAIGN_ROUTE_CONFIG.projectionZoom.maximum, map.getBoundsZoom(bounds)));
}

function buildArcCoordinates({
  leaflet,
  map,
  projectionZoom,
  start,
  end,
}: {
  leaflet: typeof import("leaflet");
  map: LeafletMap;
  projectionZoom: number;
  start: Coordinates;
  end: Coordinates;
}): Coordinates[] {
  const startPoint = map.project(leaflet.latLng(start), projectionZoom);
  const endPoint = map.project(leaflet.latLng(end), projectionZoom);

  const deltaX = endPoint.x - startPoint.x;
  const deltaY = endPoint.y - startPoint.y;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance < 1) return [start, end];

  let normalX = -deltaY / distance;
  let normalY = deltaX / distance;
  // Prefer the screen-upward side; vertical routes consistently bow right.
  if (normalY > 0 || (Math.abs(normalY) < .001 && normalX < 0)) {
    normalX *= -1;
    normalY *= -1;
  }
  // A fixed minimum bend makes short connections arch far beyond their stops.
  const height = Math.min(CAMPAIGN_ROUTE_CONFIG.arc.maximumHeightPixels, distance * CAMPAIGN_ROUTE_CONFIG.arc.heightRatio);
  const controlPoint = leaflet.point(
    (startPoint.x + endPoint.x) / 2 + normalX * height,
    (startPoint.y + endPoint.y) / 2 + normalY * height,
  );
  // For a quadratic arc, the maximum chord error is height / (2 * samples²).
  // Target half a screen pixel, with a sample cap for extreme zoom levels.
  const screenScale = 2 ** (map.getZoom() - projectionZoom);
  const sampleCount = Math.min(CAMPAIGN_ROUTE_CONFIG.arc.maximumSamples, Math.max(CAMPAIGN_ROUTE_CONFIG.arc.minimumSamples,
    Math.ceil(Math.sqrt(height * screenScale) / 2) * 2));

  return Array.from({ length: sampleCount + 1 }, (_, index) => {
    if (index === 0) return start;
    if (index === sampleCount) return end;
    const progress = index / sampleCount;
    const inverse = 1 - progress;
    const point = leaflet.point(
      inverse * inverse * startPoint.x
        + 2 * inverse * progress * controlPoint.x
        + progress * progress * endPoint.x,
      inverse * inverse * startPoint.y
        + 2 * inverse * progress * controlPoint.y
        + progress * progress * endPoint.y,
    );
    const coordinate = map.unproject(point, projectionZoom);
    return [coordinate.lat, coordinate.lng];
  });
}

type RenderCampaignRouteInput = {
  animationEnabled: boolean;
  leaflet: typeof import("leaflet");
  map: LeafletMap;
  route: CampaignRoute;
  formatStopLabel: (orders: number[]) => string;
  formatStopOrder: (order: number) => string;
  onWaypointSelect: (entryId: string) => void;
};

export function renderLeafletCampaignRoute({
  animationEnabled,
  leaflet,
  map,
  route,
  formatStopLabel,
  formatStopOrder,
  onWaypointSelect,
}: RenderCampaignRouteInput): RenderedCampaignRoute {
  const routeLayer = leaflet.layerGroup().addTo(map);
  // Keep the drawing surface bounded to the viewport. Animated dashed SVG
  // paths can become expensive browser rasterization work during deep zooms.
  const routeRenderer = leaflet.canvas({ pane: "campaignRoute" }) as CampaignRouteCanvas;
  // Leaflet's canvas renderer reads dashArray but ignores dashOffset. Apply the
  // animated offset at its stroke boundary, only on this campaign renderer.
  const fillStroke = routeRenderer._fillStroke;
  routeRenderer._fillStroke = function (context, line) {
    const previousOffset = context.lineDashOffset;
    context.lineDashOffset = Number(line.options.dashOffset) || 0;
    try {
      fillStroke.call(this, context, line);
    } finally {
      context.lineDashOffset = previousOffset;
    }
  };
  routeRenderer.addTo(map);
  // The default renderer only redraws at moveend. Follow the viewport during
  // flights so connections entering the view are drawn before arrival.
  const updateRouteViewport = routeRenderer.getEvents?.().viewreset;
  if (updateRouteViewport) map.on("move", updateRouteViewport, routeRenderer);
  const boundsCoordinates: Coordinates[] = route.waypoints.map(({ coordinates }) => coordinates);
  const projectionZoom = campaignRouteProjectionZoom(leaflet, map, route);
  const connections: { start: Coordinates; end: Coordinates; line: Polyline }[] = [];

  route.segments.forEach((segment) => {
    for (let index = 1; index < segment.length; index += 1) {
      const arc = buildArcCoordinates({
        leaflet,
        map,
        projectionZoom,
        start: segment[index - 1],
        end: segment[index],
      });
      boundsCoordinates.push(...arc);
      const common = {
        pane: "campaignRoute",
        renderer: routeRenderer,
        lineCap: "round" as const,
        lineJoin: "round" as const,
        interactive: false,
        // Clip distant connections to the viewport even while the camera moves.
        // Keep global connections clipped at street zooms as well.
        noClip: false,
        dashArray: CAMPAIGN_ROUTE_CONFIG.animation.dashArray.join(" "),
        dashOffset: "0",
      };
      const line = leaflet.polyline(arc, {
        ...common,
        ...CAMPAIGN_ROUTE_CONFIG.line,
      }).addTo(routeLayer);
      connections.push({ start: segment[index - 1], end: segment[index], line });
    }
  });

  route.waypoints.forEach((waypoint) => {
    const waypointLabel = formatStopLabel(waypoint.stops.map((stop) => stop.order));
    const stopTitles = waypoint.stops.map((stop) => `${formatStopOrder(stop.order)} · ${stop.title}`);
    const routeMarker = leaflet.marker(waypoint.coordinates, {
      pane: "campaignRoute",
      icon: leaflet.divIcon({
        className: "campaign-route-stop-wrap",
        html: `<span class="campaign-route-stop" style="--campaign-stop-width:${CAMPAIGN_ROUTE_CONFIG.marker.width}px;--campaign-stop-height:${CAMPAIGN_ROUTE_CONFIG.marker.height}px;--campaign-stop-appear-duration:${CAMPAIGN_ROUTE_CONFIG.marker.appearMs}ms">${waypointLabel}</span>`,
        iconSize: [CAMPAIGN_ROUTE_CONFIG.marker.width, CAMPAIGN_ROUTE_CONFIG.marker.height],
        iconAnchor: [CAMPAIGN_ROUTE_CONFIG.marker.anchorX, CAMPAIGN_ROUTE_CONFIG.marker.anchorY],
      }),
      alt: `Campaign ${waypoint.stops.length === 1 ? "stop" : "stops"} ${stopTitles.join(", ")}`,
      keyboard: true,
      riseOnHover: true,
    }).addTo(routeLayer);

    const tooltipContent = document.createElement("div");
    tooltipContent.className = "campaign-route-tooltip-content";
    const tooltipHeading = document.createElement("strong");
    tooltipHeading.textContent = waypoint.stops.length === 1 ? "Campaign stop" : "Campaign stops";
    tooltipContent.append(tooltipHeading);
    for (const title of stopTitles) {
      const tooltipRow = document.createElement("span");
      tooltipRow.textContent = title;
      tooltipContent.append(tooltipRow);
    }
    routeMarker.bindTooltip(tooltipContent, {
      className: "campaign-route-tooltip",
      direction: "top",
      offset: [CAMPAIGN_ROUTE_CONFIG.marker.tooltipX, CAMPAIGN_ROUTE_CONFIG.marker.tooltipY],
      opacity: 1,
    });
    routeMarker.on("click", () => onWaypointSelect(waypoint.stops[0].entryId));
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animationFrame: number | null = null;
  let lastFrame: number | null = null;
  let dashOffset = 0;
  let moving = false;
  const animateDashes = (time: number) => {
    animationFrame = null;
    if (lastFrame === null) lastFrame = time;
    // Use a shared frame for all lines and let Leaflet batch their canvas redraw.
    const elapsed = time - lastFrame;
    if (elapsed >= 1000 / CAMPAIGN_ROUTE_CONFIG.animation.framesPerSecond) {
      const { cyclePixels, cycleMs } = CAMPAIGN_ROUTE_CONFIG.animation;
      dashOffset = (dashOffset - elapsed * cyclePixels / cycleMs) % cyclePixels;
      lastFrame = time;
      for (const { line } of connections) line.setStyle({ dashOffset: String(dashOffset) });
    }
    animationFrame = window.requestAnimationFrame(animateDashes);
  };
  const pauseRouteAnimation = () => {
    if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
    lastFrame = null;
  };
  const resumeRouteAnimation = () => {
    if (animationFrame !== null || moving || !animationEnabled || reducedMotion.matches
      || document.hidden || connections.length === 0) return;
    animationFrame = window.requestAnimationFrame(animateDashes);
  };
  const handleMoveStart = () => { moving = true; pauseRouteAnimation(); };
  const handleMoveEnd = () => { moving = false; resumeRouteAnimation(); };
  const handleAnimationPreference = () => { pauseRouteAnimation(); resumeRouteAnimation(); };
  const updateRouteDetail = () => {
    for (const { start, end, line } of connections) {
      line.setLatLngs(buildArcCoordinates({ leaflet, map, projectionZoom, start, end }));
    }
  };
  map.on("movestart", handleMoveStart);
  map.on("moveend", handleMoveEnd);
  map.on("zoomend", updateRouteDetail);
  document.addEventListener("visibilitychange", handleAnimationPreference);
  reducedMotion.addEventListener("change", handleAnimationPreference);
  resumeRouteAnimation();

  return {
    boundsCoordinates,
    layer: routeLayer,
    remove: () => {
      if (updateRouteViewport) map.off("move", updateRouteViewport, routeRenderer);
      pauseRouteAnimation();
      map.off("movestart", handleMoveStart);
      map.off("moveend", handleMoveEnd);
      map.off("zoomend", updateRouteDetail);
      document.removeEventListener("visibilitychange", handleAnimationPreference);
      reducedMotion.removeEventListener("change", handleAnimationPreference);
      routeLayer.remove();
      routeRenderer.remove();
    },
  };
}
