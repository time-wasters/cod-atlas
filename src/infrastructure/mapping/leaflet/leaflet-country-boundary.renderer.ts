import type { Map as LeafletMap } from "leaflet";
import type { CountryBoundaryFeature } from "../country-boundaries/country-boundary.client.js";

export const COUNTRY_BOUNDARY_STYLE = {
  bubblingMouseEvents: false,
  className: "country-boundary-outline",
  color: "#17130d",
  fill: false,
  fillOpacity: 0,
  interactive: false,
  opacity: .96,
  pane: "countryBoundary",
  weight: 2.25,
} as const;

export function renderLeafletCountryBoundary({
  boundary,
  leaflet,
  map,
}: {
  boundary: CountryBoundaryFeature;
  leaflet: typeof import("leaflet");
  map: LeafletMap;
}) {
  return leaflet.geoJSON(boundary, { style: COUNTRY_BOUNDARY_STYLE }).addTo(map);
}
