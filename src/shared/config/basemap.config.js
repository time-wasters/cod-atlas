export const BASEMAP_CONFIG = {
  // MapLibre style URL for the primary vector basemap.
  vectorStyleUrl: "https://tiles.openfreemap.org/styles/bright",
  // Attribution HTML displayed for the vector basemap and its data providers.
  vectorAttribution: '&copy; <a href="https://openfreemap.org/">OpenFreeMap</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  // Leaflet tile URL template used when the vector basemap fails.
  rasterUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  // Attribution HTML displayed for the fallback raster basemap.
  rasterAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  // Milliseconds to wait for the vector basemap before switching to raster tiles.
  fallbackTimeoutMs: 10_000,
};
