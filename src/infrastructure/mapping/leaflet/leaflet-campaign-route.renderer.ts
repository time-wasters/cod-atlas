import type { LayerGroup, Map as LeafletMap } from "leaflet";

type Coordinates = [number, number];

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
    return Math.max(2, Math.min(8, map.getZoom()));
  }
  const bounds = leaflet.latLngBounds(route.waypoints.map(({ coordinates }) => coordinates));
  return Math.max(2, Math.min(8, map.getBoundsZoom(bounds)));
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
  const height = Math.min(110, Math.max(22, distance * .22));
  const controlPoint = leaflet.point(
    (startPoint.x + endPoint.x) / 2 + normalX * height,
    (startPoint.y + endPoint.y) / 2 + normalY * height,
  );
  const sampleCount = Math.min(12, Math.max(8, Math.ceil(distance / 60)));

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
  leaflet: typeof import("leaflet");
  map: LeafletMap;
  route: CampaignRoute;
  formatStopLabel: (orders: number[]) => string;
  formatStopOrder: (order: number) => string;
  onWaypointSelect: (entryId: string) => void;
};

export function renderLeafletCampaignRoute({
  leaflet,
  map,
  route,
  formatStopLabel,
  formatStopOrder,
  onWaypointSelect,
}: RenderCampaignRouteInput): RenderedCampaignRoute {
  const routeLayer = leaflet.layerGroup().addTo(map);
  const boundsCoordinates: Coordinates[] = route.waypoints.map(({ coordinates }) => coordinates);
  const projectionZoom = campaignRouteProjectionZoom(leaflet, map, route);

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
        lineCap: "round" as const,
        lineJoin: "round" as const,
        interactive: false,
        dashArray: "7 10",
        dashOffset: "0",
      };
      leaflet.polyline(arc, {
        ...common,
        className: "campaign-route-travel",
        color: "#741c27",
        weight: 3,
        opacity: .92,
      }).addTo(routeLayer);
    }
  });

  route.waypoints.forEach((waypoint) => {
    const waypointLabel = formatStopLabel(waypoint.stops.map((stop) => stop.order));
    const stopTitles = waypoint.stops.map((stop) => `${formatStopOrder(stop.order)} · ${stop.title}`);
    const routeMarker = leaflet.marker(waypoint.coordinates, {
      pane: "campaignRoute",
      icon: leaflet.divIcon({
        className: "campaign-route-stop-wrap",
        html: `<span class="campaign-route-stop">${waypointLabel}</span>`,
        iconSize: [22, 18],
        iconAnchor: [-5, 23],
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
      offset: [8, -22],
      opacity: 1,
    });
    routeMarker.on("click", () => onWaypointSelect(waypoint.stops[0].entryId));
  });

  const mapElement = map.getContainer();
  const pauseRouteAnimation = () => mapElement.classList.add("campaign-route-map-moving");
  const resumeRouteAnimation = () => mapElement.classList.remove("campaign-route-map-moving");
  map.on("movestart", pauseRouteAnimation);
  map.on("moveend", resumeRouteAnimation);

  return {
    boundsCoordinates,
    layer: routeLayer,
    remove: () => {
      map.off("movestart", pauseRouteAnimation);
      map.off("moveend", resumeRouteAnimation);
      mapElement.classList.remove("campaign-route-map-moving");
      routeLayer.remove();
    },
  };
}
