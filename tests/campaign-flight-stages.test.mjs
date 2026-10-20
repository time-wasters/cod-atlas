import assert from "node:assert/strict";
import test from "node:test";
import { campaignFlightStages } from "../src/presentation/map/models/campaign-flight-stages.js";
import { CAMPAIGN_FOCUS_PRESET } from "../src/shared/config/map-camera.config.js";

test("large zoom-ins approach precise locations through a city overview", () => {
  assert.deepEqual(campaignFlightStages(0, 5, 18, CAMPAIGN_FOCUS_PRESET), [11, 18]);
  assert.deepEqual(campaignFlightStages(10_000, 12, 16, CAMPAIGN_FOCUS_PRESET), [11, 16]);
});

test("distant landmarks get context even when the previous landmark used the same zoom", () => {
  assert.deepEqual(campaignFlightStages(500_000, 18, 18, CAMPAIGN_FOCUS_PRESET), [11, 18]);
});

test("nearby precise stops stay direct and coarse stops never acquire false detail", () => {
  assert.deepEqual(campaignFlightStages(1_000, 17, 18, CAMPAIGN_FOCUS_PRESET), [18]);
  for (const zoom of [5, 6, 8, 12]) {
    assert.deepEqual(campaignFlightStages(5_000_000, 18, zoom, CAMPAIGN_FOCUS_PRESET), [zoom]);
  }
});

test("reduced-motion visits skip the intermediate camera change", () => {
  assert.deepEqual(campaignFlightStages(5_000_000, 5, 18, CAMPAIGN_FOCUS_PRESET, false), [18]);
});
