import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import atlas from "../app/data/atlas.generated.json" with { type: "json" };
import {
  COUNTRY_BOUNDARY_STYLE,
  renderLeafletCountryBoundary,
} from "../src/infrastructure/mapping/leaflet/leaflet-country-boundary.renderer.ts";

const boundaryDirectory = new URL("../public/data/country-boundaries/", import.meta.url);
const boundaryFilenames = (await readdir(boundaryDirectory)).filter((filename) => filename.endsWith(".geojson"));
const boundaries = await Promise.all(boundaryFilenames.map(async (filename) => JSON.parse(await readFile(
  new URL(filename, boundaryDirectory),
  "utf8",
))));

test("bundled boundaries cover every ISO-coded atlas country", () => {
  const boundaryCodes = new Set(boundaries.map((feature) => feature.properties.isoA2));
  const missingCodes = atlas.groups
    .flatMap((group) => group.flagCode ? [group.flagCode] : [])
    .filter((code) => !boundaryCodes.has(code));

  assert.deepEqual(missingCodes, []);
  assert.equal(boundaryCodes.size, boundaries.length);
  assert.ok(boundaries.every((feature) => (
    feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon"
  )));
});

test("country boundary renderer creates a non-interactive unfilled Leaflet layer", () => {
  const map = {};
  const layer = {
    addTo(receivedMap) {
      assert.equal(receivedMap, map);
      return this;
    },
  };
  let receivedOptions;
  const leaflet = {
    geoJSON(_boundary, options) {
      receivedOptions = options;
      return layer;
    },
  };

  const rendered = renderLeafletCountryBoundary({
    boundary: boundaries[0],
    leaflet,
    map,
  });

  assert.equal(rendered, layer);
  assert.deepEqual(receivedOptions.style, COUNTRY_BOUNDARY_STYLE);
  assert.equal(receivedOptions.style.fill, false);
  assert.equal(receivedOptions.style.fillOpacity, 0);
  assert.equal(receivedOptions.style.interactive, false);
  assert.equal(receivedOptions.style.pane, "countryBoundary");
});
