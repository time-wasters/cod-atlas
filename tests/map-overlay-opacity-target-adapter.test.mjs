import assert from "node:assert/strict";
import test from "node:test";
import { calculateLeafletMapOverlayOpacityTarget } from "../src/infrastructure/mapping/leaflet/map-overlay-opacity-target.adapter.js";

const corners = {
  bottomLeft: [48, 10],
  bottomRight: [48, 11],
  topLeft: [49, 10],
  topRight: [49, 11],
};
const padding = {
  paddingBottomRight: [30, 40],
  paddingTopLeft: [10, 20],
};

function createLeafletContext() {
  const calls = [];
  const bounds = { kind: "bounds" };
  const leaflet = {
    latLngBounds(coordinates) {
      calls.push(["latLngBounds", coordinates]);
      return bounds;
    },
    point(x, y) {
      calls.push(["point", x, y]);
      return { x, y };
    },
  };
  const map = {
    getBoundsZoom(receivedBounds, inside, totalPadding) {
      calls.push(["getBoundsZoom", receivedBounds, inside, totalPadding]);
      return 7;
    },
    getZoom() {
      calls.push(["getZoom"]);
      return 9;
    },
  };
  return { bounds, calls, leaflet, map };
}

test("the Leaflet adapter derives fit zoom using the visible viewport padding", () => {
  const context = createLeafletContext();
  const opacity = calculateLeafletMapOverlayOpacityTarget({
    baseOpacity: 0.72,
    corners,
    enabled: true,
    leaflet: context.leaflet,
    map: context.map,
    maximumZoom: 18,
    padding,
    visible: true,
  });

  assert.ok(opacity < 0.72);
  assert.deepEqual(context.calls, [
    ["latLngBounds", [corners.topLeft, corners.topRight, corners.bottomLeft, corners.bottomRight]],
    ["point", 40, 60],
    ["getBoundsZoom", context.bounds, false, { x: 40, y: 60 }],
    ["getZoom"],
  ]);
});

test("hidden and fixed-opacity overlays bypass Leaflet fit calculations", () => {
  const hiddenContext = createLeafletContext();
  assert.equal(calculateLeafletMapOverlayOpacityTarget({
    baseOpacity: 0.72,
    corners,
    enabled: true,
    leaflet: hiddenContext.leaflet,
    map: hiddenContext.map,
    maximumZoom: 18,
    padding,
    visible: false,
  }), 0);
  assert.deepEqual(hiddenContext.calls, []);

  const fixedContext = createLeafletContext();
  assert.equal(calculateLeafletMapOverlayOpacityTarget({
    baseOpacity: 0.72,
    corners,
    enabled: false,
    leaflet: fixedContext.leaflet,
    map: fixedContext.map,
    maximumZoom: 18,
    padding,
    visible: true,
  }), 0.72);
  assert.deepEqual(fixedContext.calls, []);
});

