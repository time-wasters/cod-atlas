import type { Map as LeafletMap } from "leaflet";
import type { CountryBoundaryFeature } from "../country-boundaries/country-boundary.client.js";

export const COUNTRY_BOUNDARY_STYLE = {
  bubblingMouseEvents: false,
  color: "#b84b43",
  fill: false,
  fillOpacity: 0,
  interactive: false,
  opacity: .82,
  pane: "countryBoundary",
  weight: 2.5,
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
  return leaflet.geoJSON(boundary, {
    style: COUNTRY_BOUNDARY_STYLE,
  }).addTo(map);
}
