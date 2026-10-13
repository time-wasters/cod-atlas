import assert from "node:assert/strict";
import test from "node:test";
import { markerFocusZoomLimit, revealLeafletMarker } from "../src/infrastructure/mapping/leaflet/leaflet-marker-reveal.adapter.js";

test("coincident fallback missions reveal their cluster without requesting street zoom", () => {
  const coordinates = [12, 34];
  const first = { id: "first", coordinates };
  const second = { id: "second", coordinates };
  let spiderfied = 0;
  let visible = 0;
  const cluster = { spiderfy() { spiderfied += 1; } };
  const layer = {
    getVisibleParent() { return cluster; },
    zoomToShowLayer() { assert.fail("Fallback missions must not trigger cluster zoom-to-bounds"); },
  };
  for (const marker of [first, second]) {
    revealLeafletMarker(layer, marker, "country", () => { visible += 1; });
  }
  assert.equal(spiderfied, 2);
  assert.equal(visible, 2);
});

test("already visible coarse markers need no further cluster movement", () => {
  const marker = { id: "visible" };
  let visible = false;
  const layer = {
    getVisibleParent() { return marker; },
    zoomToShowLayer() { assert.fail("An already visible coarse marker must not zoom again"); },
  };
  revealLeafletMarker(layer, marker, "region", () => { visible = true; });
  assert.equal(visible, true);
});

test("precise markers retain normal cluster reveal behavior", () => {
  const marker = { id: "precise" };
  let visible = false;
  const layer = {
    zoomToShowLayer(requestedMarker, callback) {
      assert.equal(requestedMarker, marker);
      callback();
    },
  };
  revealLeafletMarker(layer, marker, "exact", () => { visible = true; });
  assert.equal(visible, true);
});

test("coarse precision limits remain below street zoom", () => {
  for (const precision of ["country", "region", "city"]) {
    assert.ok(markerFocusZoomLimit(precision) <= 8);
  }
  assert.equal(markerFocusZoomLimit("exact"), null);
  assert.equal(markerFocusZoomLimit("approximate"), null);
});
