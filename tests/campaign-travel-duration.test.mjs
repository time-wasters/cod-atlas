import assert from "node:assert/strict";
import test from "node:test";
import { campaignTravelDuration } from "../src/presentation/map/models/campaign-travel-duration.js";
import { CAMPAIGN_FOCUS_PRESET } from "../src/presentation/map/models/map-focus-presets.ts";
import { mapTravelDuration } from "../src/presentation/map/models/map-travel-duration.js";

test("nearby pans and small zoom adjustments stay responsive", () => {
  assert.equal(campaignTravelDuration(5_000, 17, 17, CAMPAIGN_FOCUS_PRESET), .55);
  const smallZoom = campaignTravelDuration(5_000, 17, 18, CAMPAIGN_FOCUS_PRESET);
  assert.ok(smallZoom > .55 && smallZoom <= 1.2);
});

test("country-to-landmark zooms take three to four seconds even without geographic travel", () => {
  const duration = campaignTravelDuration(0, 5, 18, CAMPAIGN_FOCUS_PRESET);
  assert.ok(duration >= 3 && duration <= 4);
  assert.equal(campaignTravelDuration(0, 18, 5, CAMPAIGN_FOCUS_PRESET), duration);
  assert.ok(campaignTravelDuration(0, 5.5, 18, CAMPAIGN_FOCUS_PRESET) < duration);
});

test("zoom timing never shortens the time allowed for a long journey", () => {
  for (const distance of [250_000, 1_000_000, 5_000_000]) {
    const duration = campaignTravelDuration(distance, 5, 18, CAMPAIGN_FOCUS_PRESET);
    assert.ok(duration >= mapTravelDuration(distance));
  }
  assert.equal(campaignTravelDuration(20_000_000, 5, 18, CAMPAIGN_FOCUS_PRESET), 8);
});

test("zoom speed is configurable while the duration ceiling remains enforced", () => {
  const regular = campaignTravelDuration(0, 8, 12, CAMPAIGN_FOCUS_PRESET);
  const slower = { ...CAMPAIGN_FOCUS_PRESET, secondsPerZoomLevel: .5 };
  assert.ok(campaignTravelDuration(0, 8, 12, slower) > regular);
  assert.equal(campaignTravelDuration(0, 5, 18, { ...slower, maximumTravelSeconds: 3 }), 3);
});
