import assert from "node:assert/strict";
import test from "node:test";
import { mapOverlayOpacityAtZoom } from "../app/map-overlay-opacity.js";

test("map overlays retain their configured opacity at their natural fit zoom", () => {
  assert.equal(mapOverlayOpacityAtZoom(0.72, 7, 7, true), 0.72);
  assert.equal(mapOverlayOpacityAtZoom(0.72, 7.5, 7, true), 0.72);
});

test("map overlays progressively fade when zooming beyond their natural scale", () => {
  const firstZoom = mapOverlayOpacityAtZoom(0.72, 9, 7, true);
  const closerZoom = mapOverlayOpacityAtZoom(0.72, 11, 7, true);
  assert.ok(firstZoom < 0.72);
  assert.ok(closerZoom < firstZoom);
  assert.ok(mapOverlayOpacityAtZoom(0.72, 18, 7, true) >= 0.72 * 0.18);
});

test("disabling adaptive opacity preserves the configured opacity", () => {
  assert.equal(mapOverlayOpacityAtZoom(0.72, 18, 7, false), 0.72);
});
