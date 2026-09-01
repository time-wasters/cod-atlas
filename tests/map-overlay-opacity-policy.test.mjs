import assert from "node:assert/strict";
import test from "node:test";
import { calculateMapOverlayOpacity } from "../src/presentation/map/policies/map-overlay-opacity.policy.js";

function calculateOpacity(currentZoom, fitZoom, enabled, maximumZoom) {
  return calculateMapOverlayOpacity({
    baseOpacity: 0.72,
    currentZoom,
    enabled,
    fitZoom,
    maximumZoom,
  });
}

test("map overlays retain their configured opacity at their natural fit zoom", () => {
  assert.equal(calculateOpacity(7, 7, true), 0.72);
  assert.equal(calculateOpacity(7.5, 7, true), 0.72);
});

test("map overlays progressively fade when zooming beyond their natural scale", () => {
  const firstZoom = calculateOpacity(9, 7, true);
  const closerZoom = calculateOpacity(11, 7, true);
  assert.ok(firstZoom < 0.72);
  assert.ok(closerZoom < firstZoom);
  assert.equal(calculateOpacity(13, 7, true), 0);
});

test("map overlays disappear at maximum zoom even when geographically small", () => {
  assert.ok(calculateOpacity(17, 15, true, 18) > 0);
  assert.equal(calculateOpacity(18, 15, true, 18), 0);
});

test("disabling adaptive opacity preserves the configured opacity", () => {
  assert.equal(calculateOpacity(18, 7, false), 0.72);
});
