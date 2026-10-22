import assert from "node:assert/strict";
import test from "node:test";
import { waitForMapView } from "../src/infrastructure/mapping/leaflet/wait-for-map-view.js";

test("an already-loaded overview remains visible long enough to read", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 0 });
  const controller = new AbortController();
  let completed = false;
  const wait = waitForMapView(() => true, { signal: controller.signal, minimumMs: 800, maximumMs: 3000 });
  void wait.then(() => { completed = true; });
  t.mock.timers.tick(700);
  await Promise.resolve();
  assert.equal(completed, false);
  t.mock.timers.tick(150);
  assert.equal(await wait, true);
});

test("the overview waits for tiles beyond the minimum hold", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 0 });
  const controller = new AbortController();
  let loaded = false;
  let completed = false;
  const wait = waitForMapView(() => loaded, { signal: controller.signal, minimumMs: 800, maximumMs: 3000 });
  void wait.then(() => { completed = true; });
  t.mock.timers.tick(1000);
  await Promise.resolve();
  assert.equal(completed, false);
  loaded = true;
  t.mock.timers.tick(100);
  assert.equal(await wait, true);
});

test("missing tiles cannot stall the overview indefinitely", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 0 });
  const wait = waitForMapView(() => false, {
    signal: new AbortController().signal, minimumMs: 800, maximumMs: 3000,
  });
  t.mock.timers.tick(3000);
  assert.equal(await wait, false);
});

test("cancellation clears pending overview checks", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 0 });
  const controller = new AbortController();
  let checks = 0;
  const wait = waitForMapView(() => { checks += 1; return false; }, {
    signal: controller.signal, minimumMs: 800, maximumMs: 3000,
  });
  t.mock.timers.tick(1000);
  const checksBeforeAbort = checks;
  assert.ok(checksBeforeAbort > 0);
  controller.abort();
  assert.equal(await wait, false);
  t.mock.timers.tick(5000);
  assert.equal(checks, checksBeforeAbort);
});
