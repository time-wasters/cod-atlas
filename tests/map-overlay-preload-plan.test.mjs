import assert from "node:assert/strict";
import test from "node:test";
import { mapOverlayPreloadPlan } from "../src/presentation/map/models/map-overlay-preload-plan.js";

const entries = Array.from({ length: 4 }, (_, index) => ({ id: `entry-${index}`, levelId: `level-${index}` }));
const campaign = { levels: entries.map((entry) => ({ entry })) };
const overlays = Object.fromEntries(entries.map((entry, index) => [entry.levelId, { image: `images/${index}.png` }]));

test("campaign preloading includes the selected, first, previous, and next overlays", () => {
  const plan = mapOverlayPreloadPlan({ selectedEntry: entries[2], campaign, overlays });
  assert.deepEqual(new Set(plan.images), new Set(["images/0.png", "images/1.png", "images/2.png", "images/3.png"]));
  assert.equal(plan.nextImage, "images/3.png");
});

test("a newly selected campaign prepares its first stop before playback starts", () => {
  const plan = mapOverlayPreloadPlan({ selectedEntry: { id: "outside", levelId: "outside" }, campaign, overlays });
  assert.deepEqual(plan.images, ["images/0.png"]);
  assert.equal(plan.nextImage, "images/0.png");
});

test("the final campaign stop has no next overlay to wait for", () => {
  assert.equal(mapOverlayPreloadPlan({ selectedEntry: entries[3], campaign, overlays }).nextImage, null);
});

test("manual selection preloads its image without requiring a campaign", () => {
  assert.deepEqual(mapOverlayPreloadPlan({ selectedEntry: entries[1], campaign: null, overlays }), {
    images: ["images/1.png"], nextImage: null,
  });
});

test("missing overlays need no image request or playback wait", () => {
  assert.deepEqual(mapOverlayPreloadPlan({ selectedEntry: entries[0], campaign, overlays: {} }), {
    images: [], nextImage: null,
  });
});

test("overlays that share an image are only preloaded once", () => {
  const shared = Object.fromEntries(entries.map((entry) => [entry.levelId, { image: "images/shared.png" }]));
  assert.deepEqual(mapOverlayPreloadPlan({ selectedEntry: entries[1], campaign, overlays: shared }), {
    images: ["images/shared.png"], nextImage: "images/shared.png",
  });
});
