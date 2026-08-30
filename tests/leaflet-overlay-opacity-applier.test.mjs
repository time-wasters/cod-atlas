import assert from "node:assert/strict";
import test from "node:test";
import { applyLeafletOverlayOpacity } from "../src/infrastructure/mapping/leaflet/leaflet-overlay-opacity.applier.js";

test("applying a zoom opacity target updates the Leaflet overlay immediately", () => {
  const cancelledFrames = [];
  const appliedOpacities = [];
  const animationRef = { current: 42 };
  const opacityRef = { current: 0.72 };
  const targetRef = { current: 0.72 };

  applyLeafletOverlayOpacity({
    animationRef,
    clock: {
      cancelFrame(frameId) {
        cancelledFrames.push(frameId);
      },
    },
    opacityRef,
    overlay: {
      setOpacity(opacity) {
        appliedOpacities.push(opacity);
      },
    },
    target: 0.31,
    targetRef,
  });

  assert.deepEqual(cancelledFrames, [42]);
  assert.deepEqual(appliedOpacities, [0.31]);
  assert.equal(animationRef.current, null);
  assert.equal(opacityRef.current, 0.31);
  assert.equal(targetRef.current, 0.31);
});
