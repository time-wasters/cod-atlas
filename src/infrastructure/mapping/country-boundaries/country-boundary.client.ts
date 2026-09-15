import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";

export type CountryBoundaryFeature = Feature<Polygon | MultiPolygon, {
  isoA2: string;
  name: string;
}>;

let boundaryIndexPromise: Promise<Map<string, CountryBoundaryFeature>> | null = null;

function boundaryDataUrl() {
  return new URL("data/country-boundaries.geojson", document.baseURI);
}

async function loadBoundaryIndex() {
  const response = await fetch(boundaryDataUrl());
  if (!response.ok) {
    throw new Error(`Country boundary data request failed: HTTP ${response.status}`);
  }
  const collection = await response.json() as FeatureCollection<Polygon | MultiPolygon, {
    isoA2: string;
    name: string;
  }>;
  if (collection.type !== "FeatureCollection" || !Array.isArray(collection.features)) {
    throw new Error("Country boundary data is not a GeoJSON FeatureCollection.");
  }
  const index = new Map<string, CountryBoundaryFeature>();
  for (const feature of collection.features) {
    const code = feature.properties?.isoA2;
    if (typeof code !== "string") continue;
    if (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon") continue;
    index.set(code, feature as CountryBoundaryFeature);
  }
  return index;
}

function boundaryIndex() {
  if (!boundaryIndexPromise) {
    boundaryIndexPromise = loadBoundaryIndex().catch((error) => {
      boundaryIndexPromise = null;
      throw error;
    });
  }
  return boundaryIndexPromise;
}

export async function loadCountryBoundary(isoA2: string) {
  return (await boundaryIndex()).get(isoA2.toUpperCase()) ?? null;
}
