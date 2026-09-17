import type { Feature, MultiPolygon, Polygon } from "geojson";

export type CountryBoundaryFeature = Feature<Polygon | MultiPolygon, {
  isoA2: string;
  name: string;
}>;

const boundaryPromises = new Map<string, Promise<CountryBoundaryFeature | null>>();

function boundaryDataUrl(isoA2: string) {
  return new URL(`data/country-boundaries/${isoA2.toLowerCase()}.geojson`, document.baseURI);
}

async function requestCountryBoundary(isoA2: string) {
  const response = await fetch(boundaryDataUrl(isoA2));
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Country boundary data request failed: HTTP ${response.status}`);
  }
  const feature = await response.json() as Feature<Polygon | MultiPolygon, {
    isoA2: string;
    name: string;
  }>;
  if (feature.type !== "Feature"
    || (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon")
    || feature.properties?.isoA2 !== isoA2) {
    throw new Error(`Country boundary data for ${isoA2} is not a matching polygon feature.`);
  }
  return feature as CountryBoundaryFeature;
}

export function loadCountryBoundary(isoA2: string) {
  const code = isoA2.toUpperCase();
  let promise = boundaryPromises.get(code);
  if (!promise) {
    promise = requestCountryBoundary(code).catch((error) => {
      boundaryPromises.delete(code);
      throw error;
    });
    boundaryPromises.set(code, promise);
  }
  return promise;
}
