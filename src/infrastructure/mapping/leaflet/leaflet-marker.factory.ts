import type { Marker as LeafletMarker, MarkerClusterGroup } from "leaflet";
import type { AtlasEntryDto } from "../../atlas-data/dto/atlas-entry.dto.js";
import { MAP_MARKERS_CONFIG } from "../../../shared/config/map-markers.config.js";

export function createAtlasMarkerIcon(
  leaflet: typeof import("leaflet"),
  entry: AtlasEntryDto,
  active: boolean,
  filterDimmed = false,
) {
  const cityLevel = !["country", "off-world"].includes(entry.precision);
  const size = active ? MAP_MARKERS_CONFIG.icon.activeSize : MAP_MARKERS_CONFIG.icon.normalSize;
  return leaflet.divIcon({
    className: "atlas-marker-wrap",
    html: `<span class="atlas-marker ${cityLevel ? "is-city" : "is-country"}${active ? " is-active" : ""}${filterDimmed ? " is-filter-dimmed" : ""}" style="--atlas-marker-size:${size}px"><b></b></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
    alt: `${entry.title} — ${label}`,
    keyboard: true,
  });
  // Div icons do not apply the image alt option; keep their accessible name
  // without adding a second, native browser tooltip.
  marker.on("add", () => marker.getElement()?.setAttribute("aria-label", `${entry.title} — ${label}`));
  marker.on("click", onSelect);
  marker.bindTooltip(`${entry.title} · ${label}`, {
    direction: "top",
    offset: [0, MAP_MARKERS_CONFIG.icon.tooltipOffsetY],
  });
  return marker;
}

export function createAtlasMarkerClusterLayer({
  focusedLevelIds,
  entryForMarker,
  leaflet,
}: {
  focusedLevelIds: () => ReadonlySet<string> | null;
  entryForMarker: (marker: LeafletMarker) => AtlasEntryDto | undefined;
  leaflet: typeof import("leaflet");
}): MarkerClusterGroup {
  return leaflet.markerClusterGroup({
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: true,
    spiderfyDistanceMultiplier: MAP_MARKERS_CONFIG.clustering.spiderfyDistanceMultiplier,
    maxClusterRadius: MAP_MARKERS_CONFIG.clustering.radiusPixels,
    animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    spiderLegPolylineOptions: MAP_MARKERS_CONFIG.clustering.spiderLeg,
    iconCreateFunction(cluster) {
      const count = cluster.getChildCount();
      const config = MAP_MARKERS_CONFIG.clustering;
      const size = count < config.smallCountLimit ? config.smallSize
        : count < config.mediumCountLimit ? config.mediumSize : config.largeSize;
      const scale = count < config.smallCountLimit ? "is-small"
        : count < config.mediumCountLimit ? "is-medium" : "is-large";
      const currentFocusedLevelIds = focusedLevelIds();
      const containsFocusedLevel = !currentFocusedLevelIds || cluster.getAllChildMarkers().some((marker) => {
        const entry = entryForMarker(marker);
        return entry ? currentFocusedLevelIds.has(entry.levelId) : false;
      });
      return leaflet.divIcon({
        className: "atlas-cluster-wrap",
        html: `<span class="atlas-cluster ${scale}${containsFocusedLevel ? "" : " is-filter-dimmed"}">${count}</span>`,
        iconSize: [size, size],
      });
    },
  });
}
