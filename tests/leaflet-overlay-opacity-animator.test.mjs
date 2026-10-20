import assert from "node:assert/strict";
import test from "node:test";
import { retargetLeafletOverlayOpacity } from "../src/infrastructure/mapping/leaflet/leaflet-overlay-opacity-retargeting.animator.js";
import { animateLeafletOverlayOpacity } from "../src/infrastructure/mapping/leaflet/leaflet-overlay-opacity-transition.animator.js";
import { MAP_OVERLAY_CONFIG } from "../src/shared/config/map-overlay.config.js";

function createAnimationClock({ reducedMotion = false } = {}) {
  let currentTime = 0;
  let nextFrameId = 0;
  const frames = new Map();
  return {
    clock: {
      cancelFrame(frameId) {
        frames.delete(frameId);
      },
      now() {
        return currentTime;
      },
      prefersReducedMotion() {
        return reducedMotion;
      },
      requestFrame(callback) {
        nextFrameId += 1;
        frames.set(nextFrameId, callback);
        return nextFrameId;
      },
    },
    pendingFrames() {
      return frames.size;
    },
    step(milliseconds = 16) {
      currentTime += milliseconds;
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((callback) => callback(currentTime));
    },
  };
}

test("retargeting an active opacity transition reuses its single animation loop", () => {
  const animationClock = createAnimationClock();
  const animationRef = { current: null };
  const opacityRef = { current: 0 };
  const targetRef = { current: 0 };
  const appliedOpacities = [];
  const overlay = {
    setOpacity(opacity) {
      appliedOpacities.push(opacity);
    },
  };
  const options = {
    animationRef,
    clock: animationClock.clock,
    opacityRef,
    overlay,
    targetRef,
  };

  retargetLeafletOverlayOpacity({ ...options, target: 0.72 });
  const firstFrameId = animationRef.current;
  retargetLeafletOverlayOpacity({ ...options, target: 0.2 });

  assert.equal(animationClock.pendingFrames(), 1);
  assert.equal(animationRef.current, firstFrameId);
  assert.equal(targetRef.current, 0.2);

  for (let frame = 0; frame < 200 && animationClock.pendingFrames(); frame += 1) {
    animationClock.step();
  }

  assert.equal(animationClock.pendingFrames(), 0);
  assert.equal(animationRef.current, null);
  assert.equal(opacityRef.current, 0.2);
  assert.equal(appliedOpacities.at(-1), 0.2);
});

test("default fades settle after 100 ms in either direction", () => {
  for (const [start, target] of [[0, 0.72], [0.72, 0]]) {
    const animationClock = createAnimationClock();
    const opacityRef = { current: start };
    retargetLeafletOverlayOpacity({
      animationRef: { current: null },
      clock: animationClock.clock,
      opacityRef,
      overlay: { setOpacity() {} },
      target,
      targetRef: { current: start },
    });
    animationClock.step(99);
    assert.notEqual(opacityRef.current, target);
    animationClock.step(1);
    assert.equal(opacityRef.current, target);
    assert.equal(animationClock.pendingFrames(), 0);
  }
});

test("campaign fades use the configured duration to blend the destination overlay in", () => {
  const animationClock = createAnimationClock();
  const opacityRef = { current: 0 };
  retargetLeafletOverlayOpacity({
    animationRef: { current: null },
    clock: animationClock.clock,
    ...MAP_OVERLAY_CONFIG.campaign,
    opacityRef,
    overlay: { setOpacity() {} },
    target: 0.72,
    targetRef: { current: 0 },
  });
  const duration = MAP_OVERLAY_CONFIG.campaign.fadeInMs;
  animationClock.step(duration / 2);
  assert.ok(opacityRef.current > 0 && opacityRef.current < 0.72);
  animationClock.step(duration / 2);
  assert.equal(opacityRef.current, 0.72);
  assert.equal(animationClock.pendingFrames(), 0);
});

test("stationary image changes fade out and in concurrently within 500 ms", () => {
  const animationClock = createAnimationClock();
  const outgoing = { current: 0.72 };
  const incoming = { current: 0 };
  let removed = false;
  let completed = 0;
  animateLeafletOverlayOpacity({
    animationRef: { current: null }, clock: animationClock.clock,
    opacityRef: outgoing, overlay: { setOpacity() {} },
    target: 0, durationMs: 500, onComplete: () => { removed = true; },
  });
  retargetLeafletOverlayOpacity({
    animationRef: { current: null }, clock: animationClock.clock,
    opacityRef: incoming, overlay: { setOpacity() {} }, targetRef: { current: 0 },
    target: 0.72, fadeInMs: 500, fadeOutMs: 500,
    onComplete: () => { completed += 1; },
  });
  animationClock.step(250);
  assert.ok(outgoing.current > 0 && outgoing.current < 0.72);
  assert.ok(incoming.current > 0 && incoming.current < 0.72);
  assert.equal(removed, false);
  assert.equal(completed, 0);
  animationClock.step(250);
  assert.equal(outgoing.current, 0);
  assert.equal(incoming.current, 0.72);
  assert.equal(removed, true);
  assert.equal(completed, 1);
  assert.equal(animationClock.pendingFrames(), 0);
});

test("replaced overlays remain until the configured fade-out has completed", () => {
  const animationClock = createAnimationClock();
  const opacityRef = { current: 0.72 };
  let removed = false;
  animateLeafletOverlayOpacity({
    animationRef: { current: null },
    clock: animationClock.clock,
    durationMs: MAP_OVERLAY_CONFIG.campaign.fadeOutMs,
    onComplete: () => { removed = true; },
    opacityRef,
    overlay: { setOpacity() {} },
    target: 0,
  });
  animationClock.step(499);
  assert.equal(removed, false);
  assert.ok(opacityRef.current > 0);
  animationClock.step(1);
  assert.equal(removed, true);
  assert.equal(opacityRef.current, 0);
});

test("reduced motion applies campaign opacity without an animation", () => {
  const animationClock = createAnimationClock({ reducedMotion: true });
  const opacityRef = { current: 0 };
  retargetLeafletOverlayOpacity({
    animationRef: { current: null },
    clock: animationClock.clock,
    ...MAP_OVERLAY_CONFIG.campaign,
    opacityRef,
    overlay: { setOpacity() {} },
    target: 0.72,
    targetRef: { current: 0 },
  });
  assert.equal(opacityRef.current, 0.72);
  assert.equal(animationClock.pendingFrames(), 0);
});

test("an active opacity transition smoothly reverses when zoom direction changes", () => {
  const animationClock = createAnimationClock();
  const animationRef = { current: null };
  const opacityRef = { current: 0.72 };
  const targetRef = { current: 0.72 };
  const appliedOpacities = [];
  const options = {
    animationRef,
    clock: animationClock.clock,
    opacityRef,
    overlay: {
      setOpacity(opacity) {
        appliedOpacities.push(opacity);
      },
    },
    targetRef,
  };

  retargetLeafletOverlayOpacity({ ...options, target: 0.15 });
  for (let frame = 0; frame < 3; frame += 1) animationClock.step();
  const lowestOpacity = opacityRef.current;
  assert.equal(animationClock.pendingFrames(), 1);
  retargetLeafletOverlayOpacity({ ...options, target: 0.65 });

  for (let frame = 0; frame < 200 && animationClock.pendingFrames(); frame += 1) {
    animationClock.step();
  }

  assert.ok(lowestOpacity < 0.72);
  assert.ok(appliedOpacities.some((opacity) => opacity > lowestOpacity));
  assert.equal(opacityRef.current, 0.65);
  assert.equal(appliedOpacities.at(-1), 0.65);
});
