import type { Map as LeafletMap, SVG } from "leaflet";
import type { CountryBoundaryFeature } from "../country-boundaries/country-boundary.client.js";
import { COUNTRY_BOUNDARY_CONFIG } from "../../../shared/config/country-boundary.config.js";

export const COUNTRY_BOUNDARY_STYLE = {
  bubblingMouseEvents: false,
  className: "country-boundary-outline",
  color: COUNTRY_BOUNDARY_CONFIG.color,
  fill: false,
  fillOpacity: 0,
  interactive: false,
  lineCap: "round",
  lineJoin: "round",
  opacity: COUNTRY_BOUNDARY_CONFIG.opacity,
  pane: "countryBoundary",
  smoothFactor: COUNTRY_BOUNDARY_CONFIG.smoothFactor,
  weight: COUNTRY_BOUNDARY_CONFIG.weight,
} as const;

export function renderLeafletCountryBoundary({
  boundary,
  leaflet,
  map,
  renderer,
}: {
  boundary: CountryBoundaryFeature;
  leaflet: typeof import("leaflet");
  map: LeafletMap;
  renderer?: SVG;
}) {
  return leaflet.geoJSON(boundary, {
    style: renderer ? { ...COUNTRY_BOUNDARY_STYLE, renderer } : COUNTRY_BOUNDARY_STYLE,
  }).addTo(map);
}
