import assert from "node:assert/strict";
import test from "node:test";
import { markerFocusZoomLimit, revealLeafletMarker } from "../src/infrastructure/mapping/leaflet/leaflet-marker-reveal.adapter.js";

test("coincident fallback missions reveal their cluster without requesting street zoom", () => {
  const coordinates = [12, 34];
  const first = { id: "first", coordinates };
  const second = { id: "second", coordinates };
  let spiderfied = 0;
  const cluster = { spiderfy() { spiderfied += 1; } };
  const layer = {
    once() {}, off() {},
    getVisibleParent() { return cluster; },
    zoomToShowLayer() { assert.fail("Fallback missions must not trigger cluster zoom-to-bounds"); },
  };
  for (const marker of [first, second]) {
    revealLeafletMarker(layer, marker);
  }
  assert.equal(spiderfied, 2);
});

test("already visible coarse markers need no further cluster movement", () => {
  const marker = { id: "visible" };
  const layer = {
    once() {}, off() {},
    getVisibleParent() { return marker; },
    zoomToShowLayer() { assert.fail("An already visible coarse marker must not zoom again"); },
  };
  revealLeafletMarker(layer, marker);
});

test("precise markers sharing a cluster do not start a second zoom after arrival", () => {
  const marker = { id: "precise" };
  let spiderfied = false;
  const cluster = { spiderfy() { spiderfied = true; } };
  const layer = {
    once() {}, off() {},
    getVisibleParent: () => cluster,
    zoomToShowLayer() { assert.fail("Camera arrival must not trigger another zoom"); },
  };
  revealLeafletMarker(layer, marker);
  assert.equal(spiderfied, true);
});

test("arrival waits for an unfinished cluster zoom without starting another camera move", () => {
  const marker = {};
  let animating = true;
  let visible = false;
  let retry;
  const cluster = { spiderfy() { if (!animating) visible = true; } };
  const layer = {
    once(event, callback) { assert.equal(event, "animationend"); retry = callback; },
    off(event, callback) { assert.equal(event, "animationend"); if (retry === callback) retry = null; },
    getVisibleParent: () => visible ? marker : cluster,
    zoomToShowLayer() { assert.fail("Revealing must not move the camera"); },
  };
  const cancel = revealLeafletMarker(layer, marker);
  assert.equal(visible, false);
  animating = false;
  retry();
  assert.equal(visible, true);
  cancel();
  assert.equal(retry, null);
});

test("a superseded marker reveal removes its pending animation listener", () => {
  let retry;
  const layer = {
    once(event, callback) { retry = callback; },
    off(event, callback) { if (retry === callback) retry = null; },
    getVisibleParent: () => null,
  };
  const cancel = revealLeafletMarker(layer, {});
  assert.equal(typeof retry, "function");
  cancel();
  assert.equal(retry, null);
});

test("coarse precision limits remain below street zoom", () => {
  for (const precision of ["country", "region"]) {
    assert.ok(markerFocusZoomLimit(precision) <= 8);
  }
  assert.equal(markerFocusZoomLimit("city"), 12);
  assert.equal(markerFocusZoomLimit("exact"), null);
  assert.equal(markerFocusZoomLimit("approximate"), null);
});
