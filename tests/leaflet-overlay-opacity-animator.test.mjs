import assert from "node:assert/strict";
import test from "node:test";
import { retargetLeafletOverlayOpacity } from "../src/infrastructure/mapping/leaflet/leaflet-overlay-opacity-retargeting.animator.js";

function createAnimationClock() {
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
        return false;
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
  for (let frame = 0; frame < 8; frame += 1) animationClock.step();
  const lowestOpacity = opacityRef.current;
  retargetLeafletOverlayOpacity({ ...options, target: 0.65 });

  for (let frame = 0; frame < 200 && animationClock.pendingFrames(); frame += 1) {
    animationClock.step();
  }

  assert.ok(lowestOpacity < 0.72);
  assert.ok(appliedOpacities.some((opacity) => opacity > lowestOpacity));
  assert.equal(opacityRef.current, 0.65);
  assert.equal(appliedOpacities.at(-1), 0.65);
});
