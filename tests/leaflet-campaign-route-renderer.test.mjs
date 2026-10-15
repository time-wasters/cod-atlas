import assert from "node:assert/strict";
import test from "node:test";
import { renderLeafletCampaignRoute } from "../src/infrastructure/mapping/leaflet/leaflet-campaign-route.renderer.ts";

function renderRoute(t, { animationEnabled = true, reduced = false } = {}) {
  const frames = new Map();
  let frameId = 0;
  const preference = Object.assign(new EventTarget(), { matches: reduced });
  const document = Object.assign(new EventTarget(), { hidden: false });
  const window = {
    matchMedia: () => preference,
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); },
  };
  for (const [key, value] of Object.entries({ window, document })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, key, original);
      else delete globalThis[key];
    });
  }

  const listeners = new Map();
  let zoom = 5;
  const map = {
    getZoom: () => zoom,
    project: ([lat, lng], atZoom) => ({ x: lng * 2 ** atZoom, y: lat * 2 ** atZoom }),
    unproject: ({ x, y }, atZoom) => ({ lat: y / 2 ** atZoom, lng: x / 2 ** atZoom }),
    on(event, callback) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(callback);
    },
    off(event, callback) { listeners.get(event)?.delete(callback); },
  };
  let viewportUpdates = 0;
  let canvasRemoved = false;
  let layerRemoved = false;
  const canvas = {
    addTo: () => canvas,
    getEvents: () => ({ viewreset: () => { viewportUpdates += 1; } }),
    remove() { canvasRemoved = true; },
  };
  const layer = {
    addTo: () => layer,
    remove() { layerRemoved = true; },
  };
  const lines = [];
  const leaflet = {
    layerGroup: () => layer,
    canvas(options) { assert.equal(options.pane, "campaignRoute"); return canvas; },
    svg() { assert.fail("Campaign lines must use a bounded canvas surface"); },
    latLng: (coordinates) => coordinates,
    point: (x, y) => ({ x, y }),
    polyline(coordinates, options) {
      const line = {
        coordinates, options, styles: [],
        addTo: () => line,
        setLatLngs(value) { line.coordinates = value; },
        setStyle(value) { line.styles.push(value); },
      };
      lines.push(line);
      return line;
    },
  };
  const rendered = renderLeafletCampaignRoute({
    animationEnabled, leaflet, map,
    route: { segments: [[[10, -100], [-20, 120]]], waypoints: [] },
    formatStopLabel: String, formatStopOrder: String, onWaypointSelect() {},
  });
  const fire = (event) => { for (const callback of listeners.get(event) ?? []) callback(); };
  const frame = (time) => {
    const callbacks = [...frames.values()];
    frames.clear();
    for (const callback of callbacks) callback(time);
  };
  return { rendered, lines, frames, preference, document, fire, frame, listeners,
    setZoom(value) { zoom = value; },
    get viewportUpdates() { return viewportUpdates; },
    get removed() { return canvasRemoved && layerRemoved; },
  };
}

test("route lines remain clipped and resample within a fixed budget at deep zoom", (t) => {
  const route = renderRoute(t);
  assert.equal(route.lines[0].options.renderer !== undefined, true);
  assert.equal(route.lines[0].options.noClip, false);
  route.fire("move");
  assert.equal(route.viewportUpdates, 1);
  route.setZoom(18);
  route.fire("zoomend");
  const coordinates = route.lines[0].coordinates;
  assert.ok(coordinates.length <= 513);
  assert.deepEqual(coordinates[0], [10, -100]);
  assert.deepEqual(coordinates.at(-1), [-20, 120]);
  route.rendered.remove();
});

test("dash flow pauses during camera movement and releases all animation work on removal", (t) => {
  const route = renderRoute(t);
  route.frame(0);
  route.frame(40);
  assert.equal(route.lines[0].styles.length, 1);
  route.fire("movestart");
  assert.equal(route.frames.size, 0);
  route.frame(80);
  assert.equal(route.lines[0].styles.length, 1);
  route.fire("moveend");
  assert.equal(route.frames.size, 1);
  route.rendered.remove();
  assert.equal(route.frames.size, 0);
  assert.equal(route.removed, true);
  assert.ok([...route.listeners.values()].every((callbacks) => callbacks.size === 0));
  route.preference.dispatchEvent(new Event("change"));
  route.document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(route.frames.size, 0);
});

test("hidden tabs and reduced motion suspend route animation", (t) => {
  const route = renderRoute(t);
  route.document.hidden = true;
  route.document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(route.frames.size, 0);
  route.document.hidden = false;
  route.document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(route.frames.size, 1);
  route.preference.matches = true;
  route.preference.dispatchEvent(new Event("change"));
  assert.equal(route.frames.size, 0);
  route.rendered.remove();
});

for (const options of [{ animationEnabled: false }, { reduced: true }]) {
  test(`static routes schedule no dash animation: ${JSON.stringify(options)}`, (t) => {
    const route = renderRoute(t, options);
    route.fire("movestart");
    route.fire("moveend");
    assert.equal(route.frames.size, 0);
    route.rendered.remove();
  });
}
