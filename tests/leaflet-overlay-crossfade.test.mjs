import assert from "node:assert/strict";
import test from "node:test";
import { canCrossfadeLeafletOverlays } from "../src/infrastructure/mapping/leaflet/leaflet-overlay-crossfade.adapter.js";

const overlay = {
  corners: {
    topLeft: [12, 34], topRight: [12, 36],
    bottomLeft: [10, 34], bottomRight: [10, 36],
  },
};

function latLngBounds(points) {
  const latitudes = points.map(([latitude]) => latitude);
  const longitudes = points.map(([, longitude]) => longitude);
  return {
    south: Math.min(...latitudes), north: Math.max(...latitudes),
    west: Math.min(...longitudes), east: Math.max(...longitudes),
    contains(other) {
      return this.south <= other.south && this.north >= other.north
        && this.west <= other.west && this.east >= other.east;
    },
  };
}

function options(overrides = {}) {
  return {
    previous: overlay, overlay,
    bounds: latLngBounds([...Object.values(overlay.corners), [11, 35]]),
    targetZoom: 5,
    tolerancePixels: 24,
    padding: { paddingTopLeft: [20, 20], paddingBottomRight: [100, 20] },
    map: {
      getZoom: () => 5,
      project([latitude, longitude]) {
        return {
          x: longitude * 10, y: latitude * 10,
          distanceTo(point) { return Math.hypot(this.x - point.x, this.y - point.y); },
        };
      },
      getSize: () => ({ x: 600, y: 400 }),
      containerPointToLatLng: ([x, y]) => [y / 10, x / 10],
      flyToBounds() { assert.fail("A stationary crossfade must not move the map"); },
    },
    leaflet: { latLngBounds },
    ...overrides,
  };
}

test("identical overlay footprints already framed on the map can crossfade", () => {
  assert.equal(canCrossfadeLeafletOverlays(options()), true);
});

test("a small footprint shift stays within the configured screen tolerance", () => {
  const shifted = { corners: Object.fromEntries(Object.entries(overlay.corners)
    .map(([name, [latitude, longitude]]) => [name, [latitude, longitude + 1]])) };
  assert.equal(canCrossfadeLeafletOverlays(options({ overlay: shifted })), true);
  assert.equal(canCrossfadeLeafletOverlays(options({ overlay: shifted, tolerancePixels: 5 })), false);
});

test("checking every corner rejects an overlay with a substantially different extent", () => {
  const enlarged = { corners: { ...overlay.corners, bottomRight: [10, 39] } };
  assert.equal(canCrossfadeLeafletOverlays(options({ overlay: enlarged })), false);
});

test("a marker away from the image center needs no flight if it remains in view", () => {
  const bounds = latLngBounds([...Object.values(overlay.corners), [30, 48]]);
  assert.equal(canCrossfadeLeafletOverlays(options({ bounds })), true);
});

test("markers covered by the sidebar still require camera movement", () => {
  const bounds = latLngBounds([...Object.values(overlay.corners), [11, 55]]);
  assert.equal(canCrossfadeLeafletOverlays(options({ bounds })), false);
});

test("a changed zoom or missing overlay uses the regular travel transition", () => {
  assert.equal(canCrossfadeLeafletOverlays(options({ targetZoom: 6 })), false);
  assert.equal(canCrossfadeLeafletOverlays(options({ previous: null })), false);
  assert.equal(canCrossfadeLeafletOverlays(options({ overlay: undefined })), false);
});
