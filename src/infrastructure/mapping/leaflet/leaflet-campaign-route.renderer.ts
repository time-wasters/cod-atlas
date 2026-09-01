import type { LayerGroup, Map as LeafletMap } from "leaflet";

type CampaignRoute = {
  segments: [number, number][][];
  waypoints: {
    coordinates: [number, number];
    stops: { entryId: string; title: string; order: number }[];
  }[];
};

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
}: RenderCampaignRouteInput): LayerGroup {
  const routeLayer = leaflet.layerGroup().addTo(map);

  route.segments.forEach((segment) => {
    const common = {
      pane: "campaignRoute",
      lineCap: "round" as const,
      lineJoin: "round" as const,
      interactive: false,
    };
    leaflet.polyline(segment, {
      ...common,
      className: "campaign-route-shadow",
      color: "#16090b",
      weight: 6,
      opacity: .26,
    }).addTo(routeLayer);
    leaflet.polyline(segment, {
      ...common,
      className: "campaign-route-fuzz",
      color: "#8b2832",
      weight: 5,
      opacity: .16,
      dashArray: "1 3",
    }).addTo(routeLayer);
    leaflet.polyline(segment, {
      ...common,
      className: "campaign-route-yarn",
      color: "#481018",
      weight: 3.8,
      opacity: .92,
    }).addTo(routeLayer);
    leaflet.polyline(segment, {
      ...common,
      className: "campaign-route-ply",
      color: "#741c27",
      weight: 2.5,
      opacity: .78,
      dashArray: "5 2.4",
    }).addTo(routeLayer);
    leaflet.polyline(segment, {
      ...common,
      className: "campaign-route-groove",
      color: "#200609",
      weight: .9,
      opacity: .7,
      dashArray: "1 6.4",
      dashOffset: "5.2",
    }).addTo(routeLayer);
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

  return routeLayer;
}
