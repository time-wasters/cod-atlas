import assert from "node:assert/strict";
import test from "node:test";
import { leafletEntryFocusTarget } from "../src/infrastructure/mapping/leaflet/leaflet-entry-focus-target.adapter.js";
import { campaignFlightStages } from "../src/presentation/map/models/campaign-flight-stages.js";
import { CAMPAIGN_FOCUS_PRESET } from "../src/shared/config/map-camera.config.js";

const overlay = {
  corners: {
    topLeft: [11, 19],
    topRight: [11, 21],
    bottomLeft: [9, 19],
    bottomRight: [9, 21],
  },
};
const padding = { paddingTopLeft: [32, 40], paddingBottomRight: [400, 60] };

function focusFixture({ fitZoom = 9, maximumZoom = 17, attachedOverlay = overlay, coordinates = [10, 20] } = {}) {
  const fitCalls = [];
  const result = leafletEntryFocusTarget({
    coordinates,
    overlay: attachedOverlay,
    maximumZoom,
    padding,
    leaflet: {
      latLngBounds(points) {
        return { points: [...points], extend(point) { this.points.push(point); } };
      },
      point(x, y) { return { x, y }; },
    },
    map: {
      getBoundsZoom(bounds, inside, totalPadding) {
        fitCalls.push({ bounds, inside, totalPadding });
        return fitZoom;
      },
    },
  });
  return { ...result, fitCalls };
}

test("a large overlay stops the camera before the configured location close-up", () => {
  const target = focusFixture({ maximumZoom: 17, fitZoom: 9 });
  assert.equal(target.maximumZoom, 9);
  assert.deepEqual(target.bounds.points, [[10, 20], ...Object.values(overlay.corners)]);
  assert.deepEqual(target.fitCalls, [{
    bounds: target.bounds,
    inside: false,
    totalPadding: { x: 432, y: 100 },
  }]);
});

test("a smaller overlay does not pull a city view closer than its configured zoom", () => {
  const target = focusFixture({ maximumZoom: 12, fitZoom: 15 });
  assert.equal(target.maximumZoom, 12);
});

test("an overlay at the configured scale remains the stopping point", () => {
  assert.equal(focusFixture({ maximumZoom: 12, fitZoom: 12 }).maximumZoom, 12);
});

test("levels without an overlay keep their point target and configured zoom", () => {
  const target = focusFixture({ attachedOverlay: null, maximumZoom: 17 });
  assert.equal(target.maximumZoom, 17);
  assert.deepEqual(target.bounds.points, [[10, 20]]);
  assert.deepEqual(target.fitCalls, []);
});

test("an offset marker remains part of the fit even when outside the overlay", () => {
  const target = focusFixture({ coordinates: [15, 25] });
  assert.deepEqual(target.bounds.points, [[15, 25], ...Object.values(overlay.corners)]);
});

test("a distant landmark with a broad overlay never schedules a closer flight stage", () => {
  const target = focusFixture({ maximumZoom: 18, fitZoom: 9 });
  assert.deepEqual(campaignFlightStages(500_000, 17, target.maximumZoom, CAMPAIGN_FOCUS_PRESET), [9]);
});
