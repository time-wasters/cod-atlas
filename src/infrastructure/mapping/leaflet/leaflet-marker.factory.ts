import type { Marker as LeafletMarker, MarkerClusterGroup } from "leaflet";
import type { AtlasEntryDto } from "../../atlas-data/dto/atlas-entry.dto.js";

export function createAtlasMarkerIcon(
  leaflet: typeof import("leaflet"),
  entry: AtlasEntryDto,
  active: boolean,
  campaignDimmed = false,
) {
  const cityLevel = !["country", "off-world"].includes(entry.precision);
  return leaflet.divIcon({
    className: "atlas-marker-wrap",
    html: `<span class="atlas-marker ${cityLevel ? "is-city" : "is-country"}${active ? " is-active" : ""}${campaignDimmed ? " is-campaign-dimmed" : ""}"><b></b></span>`,
    iconSize: [active ? 30 : 18, active ? 30 : 18],
    iconAnchor: [active ? 15 : 9, active ? 15 : 9],
  });
}

export function createAtlasMarker({
  entry,
  label,
  leaflet,
  onSelect,
}: {
  entry: AtlasEntryDto;
  label: string;
  leaflet: typeof import("leaflet");
  onSelect: () => void;
}) {
  if (!entry.coordinates) throw new Error(`Cannot create an Atlas marker without coordinates: ${entry.id}`);
  const marker = leaflet.marker(entry.coordinates, {
    icon: createAtlasMarkerIcon(leaflet, entry, false),
    title: `${entry.title} — ${label}`,
    keyboard: true,
  });
  marker.on("click", onSelect);
  marker.bindTooltip(`${entry.title} · ${label}`, {
    direction: "top",
    offset: [0, -8],
  });
  return marker;
}

export function createAtlasMarkerClusterLayer({
  campaignLevelIds,
  entryForMarker,
  leaflet,
}: {
  campaignLevelIds: () => ReadonlySet<string> | null;
  entryForMarker: (marker: LeafletMarker) => AtlasEntryDto | undefined;
  leaflet: typeof import("leaflet");
}): MarkerClusterGroup {
  return leaflet.markerClusterGroup({
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: true,
    spiderfyDistanceMultiplier: 1.35,
    maxClusterRadius: 42,
    animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    spiderLegPolylineOptions: {
      color: "#d8bb65",
      weight: 1.5,
      opacity: .8,
    },
    iconCreateFunction(cluster) {
      const count = cluster.getChildCount();
      const size = count < 10 ? 34 : count < 100 ? 40 : 46;
      const scale = count < 10 ? "is-small" : count < 100 ? "is-medium" : "is-large";
      const focusedLevelIds = campaignLevelIds();
      const containsCampaignLevel = !focusedLevelIds || cluster.getAllChildMarkers().some((marker) => {
        const entry = entryForMarker(marker);
        return entry ? focusedLevelIds.has(entry.levelId) : false;
      });
      return leaflet.divIcon({
        className: "atlas-cluster-wrap",
        html: `<span class="atlas-cluster ${scale}${containsCampaignLevel ? "" : " is-campaign-dimmed"}">${count}</span>`,
        iconSize: [size, size],
      });
    },
  });
}
