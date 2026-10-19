import assert from "node:assert/strict";
import test from "node:test";
import { campaignFocusZoom } from "../src/presentation/map/models/campaign-focus-zoom.js";
import { CAMPAIGN_FOCUS_PRESET } from "../src/presentation/map/models/map-focus-presets.ts";

const locationReview = {
  locations: { byHuman: true, user: "fixture-reviewer" },
  research: { byHuman: false, user: null },
};

test("playback zoom follows location precision from country context to street detail", () => {
  const precisions = ["country", "region", "city", "approximate", "exact"];
  const zooms = precisions.map((precision) => campaignFocusZoom({ precision }, CAMPAIGN_FOCUS_PRESET));
  for (let index = 1; index < zooms.length; index += 1) {
    assert.ok(zooms[index] > zooms[index - 1]);
  }
  assert.ok(zooms[0] <= 5);
  assert.ok(zooms[2] <= 8);
  assert.ok(zooms.at(-1) >= 17);
});

test("verified landmarks get close views while approximate ones keep more context", () => {
  const landmark = { landmark: "Fixture building", confidence: "high", verified: locationReview };
  const exact = campaignFocusZoom({ ...landmark, precision: "exact" }, CAMPAIGN_FOCUS_PRESET);
  const approximate = campaignFocusZoom({ ...landmark, precision: "approximate" }, CAMPAIGN_FOCUS_PRESET);
  assert.equal(exact, 18);
  assert.equal(approximate, 16);
});

test("research review, lower confidence, and missing landmark names do not justify closer zoom", () => {
  const base = { precision: "approximate", landmark: "Fixture building", confidence: "high" };
  const regular = campaignFocusZoom(base, CAMPAIGN_FOCUS_PRESET);
  const researchOnly = {
    locations: { byHuman: false, user: null },
    research: { byHuman: true, user: "fixture-reviewer" },
  };
  assert.equal(campaignFocusZoom({ ...base, verified: researchOnly }, CAMPAIGN_FOCUS_PRESET), regular);
  assert.equal(campaignFocusZoom({ ...base, verified: locationReview, confidence: "medium" }, CAMPAIGN_FOCUS_PRESET), regular);
  assert.equal(campaignFocusZoom({ ...base, verified: locationReview, landmark: " " }, CAMPAIGN_FOCUS_PRESET), regular);
});

test("human review does not turn country, region, or city fallback points into landmarks", () => {
  for (const precision of ["country", "region", "city"]) {
    const base = { precision };
    const reviewed = { ...base, landmark: "Fixture area", confidence: "high", verified: locationReview };
    assert.equal(campaignFocusZoom(reviewed, CAMPAIGN_FOCUS_PRESET), campaignFocusZoom(base, CAMPAIGN_FOCUS_PRESET));
  }
});

test("campaign and map zoom ceilings are both respected", () => {
  const landmark = { precision: "exact", landmark: "Fixture building", confidence: "high", verified: locationReview };
  assert.equal(campaignFocusZoom(landmark, CAMPAIGN_FOCUS_PRESET, 14), 14);
  assert.equal(campaignFocusZoom(landmark, { ...CAMPAIGN_FOCUS_PRESET, maximumZoom: 15 }), 15);
});

test("off-world stops do not request an Earth camera zoom", () => {
  assert.equal(campaignFocusZoom({ precision: "off-world" }, CAMPAIGN_FOCUS_PRESET), null);
});
