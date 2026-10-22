import assert from "node:assert/strict";
import test from "node:test";
import { createLeafletCampaignFlight } from "../src/infrastructure/mapping/leaflet/leaflet-campaign-flight.controller.js";

function flightFixture({ stages = [11, 18], animate = true, onFinalApproach, schedule, finalApproachLeadMs = 500 } = {}) {
  const arrivals = new Set();
  const moves = [];
  const bounds = { curatedPoint: [12, 34] };
  let padding = { paddingTopLeft: [32, 32], paddingBottomRight: [780, 32] };
  let complete = 0;
  let cancelled = 0;
  let stopped = 0;
  let renderSignal;
  let renderReady;
  const viewReady = new Promise((resolve) => { renderReady = resolve; });
  const map = {
    once(event, callback) { assert.equal(event, "moveend"); arrivals.add(callback); },
    off(event, callback) { assert.equal(event, "moveend"); arrivals.delete(callback); },
    flyToBounds(bounds, options) { moves.push({ method: "fly", bounds, options }); },
    fitBounds(bounds, options) { moves.push({ method: "fit", bounds, options }); },
    stop() { stopped += 1; },
    panInside() { assert.fail("Playback must center the marker rather than merely keep it visible"); },
  };
  const flight = createLeafletCampaignFlight({
    map, bounds, stages, animate,
    onFinalApproach, schedule, finalApproachLeadMs,
    getPadding: () => padding,
    durationFor: (zoom) => zoom / 10,
    waitForOverview: (signal) => { renderSignal = signal; return viewReady; },
    onComplete: () => { complete += 1; },
    onCancel: () => { cancelled += 1; },
  });
  return {
    flight, moves, bounds, arrivals,
    arrive() {
      const callbacks = [...arrivals];
      arrivals.clear();
      for (const callback of callbacks) callback();
    },
    renderReady,
    setPadding(value) { padding = value; },
    get complete() { return complete; },
    get cancelled() { return cancelled; },
    get stopped() { return stopped; },
    get renderSignal() { return renderSignal; },
  };
}

test("the landmark approach waits for the overview and only the final arrival completes the visit", async () => {
  const fixture = flightFixture();
  fixture.flight.start();
  assert.equal(fixture.moves[0].options.maxZoom, 11);
  fixture.arrive();
  assert.equal(fixture.complete, 0);
  assert.equal(fixture.moves.length, 1);
  fixture.setPadding({ paddingTopLeft: [32, 32], paddingBottomRight: [820, 32] });
  fixture.renderReady();
  await Promise.resolve();
  assert.equal(fixture.moves[1].options.maxZoom, 18);
  assert.equal(fixture.moves[1].bounds, fixture.bounds);
  assert.deepEqual(fixture.moves[1].options.paddingBottomRight, [820, 32]);
  assert.equal(fixture.moves[1].options.duration, 1.8);
  assert.equal(fixture.complete, 0);
  fixture.arrive();
  assert.equal(fixture.complete, 1);
  assert.equal(fixture.arrivals.size, 0);
  fixture.flight.cancel();
  assert.equal(fixture.cancelled, 0);
});

function createScheduleClock() {
  let now = 0;
  const tasks = new Set();
  return {
    schedule(callback, delayMs) {
      const task = { callback, due: now + delayMs };
      tasks.add(task);
      return () => tasks.delete(task);
    },
    advance(milliseconds) {
      now += milliseconds;
      for (const task of [...tasks]) {
        if (task.due > now) continue;
        tasks.delete(task);
        task.callback();
      }
    },
    get pending() { return tasks.size; },
  };
}

test("the overlay reveal waits until 500 ms before final arrival, including overview waits", async () => {
  const clock = createScheduleClock();
  let reveals = 0;
  const fixture = flightFixture({ schedule: clock.schedule, onFinalApproach: () => { reveals += 1; } });
  fixture.flight.start();
  clock.advance(10_000);
  assert.equal(reveals, 0);
  assert.equal(clock.pending, 0);
  fixture.arrive();
  clock.advance(10_000);
  assert.equal(reveals, 0);
  fixture.renderReady();
  await Promise.resolve();
  clock.advance(1299);
  assert.equal(reveals, 0);
  clock.advance(1);
  assert.equal(reveals, 1);
  assert.equal(fixture.complete, 0);
  fixture.arrive();
  assert.equal(fixture.complete, 1);
  assert.equal(reveals, 1);
});

test("cancelling a final approach clears its pending overlay reveal", () => {
  const clock = createScheduleClock();
  let reveals = 0;
  const fixture = flightFixture({ stages: [18], schedule: clock.schedule, onFinalApproach: () => { reveals += 1; } });
  fixture.flight.start();
  assert.equal(clock.pending, 1);
  fixture.flight.cancel();
  assert.equal(clock.pending, 0);
  clock.advance(2000);
  assert.equal(reveals, 0);
});

test("early arrival reveals once and cancels the late reveal timer", () => {
  const clock = createScheduleClock();
  let reveals = 0;
  const fixture = flightFixture({ stages: [18], schedule: clock.schedule, onFinalApproach: () => { reveals += 1; } });
  fixture.flight.start();
  fixture.arrive();
  assert.equal(reveals, 1);
  assert.equal(clock.pending, 0);
  clock.advance(2000);
  assert.equal(reveals, 1);
});

test("short flights start revealing with the final stage", () => {
  const clock = createScheduleClock();
  let reveals = 0;
  const fixture = flightFixture({ stages: [3], schedule: clock.schedule, onFinalApproach: () => { reveals += 1; } });
  fixture.flight.start();
  clock.advance(0);
  assert.equal(reveals, 1);
  assert.equal(fixture.complete, 0);
});

test("reduced-motion flights reveal on arrival without scheduling a timer", () => {
  const clock = createScheduleClock();
  let reveals = 0;
  const fixture = flightFixture({ stages: [18], animate: false, schedule: clock.schedule, onFinalApproach: () => { reveals += 1; } });
  fixture.flight.start();
  assert.equal(clock.pending, 0);
  assert.equal(reveals, 0);
  fixture.arrive();
  assert.equal(reveals, 1);
});

test("cancelling during the overview wait prevents a stale landmark zoom", async () => {
  const fixture = flightFixture();
  fixture.flight.start();
  fixture.arrive();
  fixture.flight.cancel();
  assert.equal(fixture.renderSignal.aborted, true);
  fixture.renderReady();
  await Promise.resolve();
  assert.equal(fixture.moves.length, 1);
  assert.equal(fixture.complete, 0);
  assert.equal(fixture.cancelled, 1);
  assert.equal(fixture.stopped, 1);
});

test("cancelling a moving flight removes its pending arrival and is idempotent", () => {
  const fixture = flightFixture();
  fixture.flight.start();
  fixture.flight.cancel();
  fixture.flight.cancel();
  fixture.arrive();
  assert.equal(fixture.arrivals.size, 0);
  assert.equal(fixture.complete, 0);
  assert.equal(fixture.cancelled, 1);
});

test("navigation can cancel an old flight without stopping the replacement camera move", () => {
  const fixture = flightFixture();
  fixture.flight.start();
  fixture.flight.cancel({ stopMap: false });
  assert.equal(fixture.stopped, 0);
  assert.equal(fixture.arrivals.size, 0);
});

test("a direct reduced-motion visit fits the padded destination and completes on arrival", () => {
  const fixture = flightFixture({ stages: [18], animate: false });
  fixture.flight.start();
  fixture.flight.start();
  assert.equal(fixture.moves.length, 1);
  assert.equal(fixture.moves[0].method, "fit");
  assert.equal(fixture.moves[0].options.animate, false);
  assert.equal(fixture.moves[0].options.maxZoom, 18);
  assert.deepEqual(fixture.moves[0].options.paddingBottomRight, [780, 32]);
  fixture.arrive();
  assert.equal(fixture.complete, 1);
  assert.equal(fixture.renderSignal, undefined);
});
