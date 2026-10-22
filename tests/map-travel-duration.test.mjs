import assert from "node:assert/strict";
import test from "node:test";
import { mapTravelDuration } from "../src/presentation/map/models/map-travel-duration.js";

test("local adjustments keep their short duration", () => {
  assert.equal(mapTravelDuration(0), .55);
  assert.equal(mapTravelDuration(50_000), .55);
  assert.equal(mapTravelDuration(5_000, .65), .65);
});

test("regional and intercontinental journeys slow down progressively", () => {
  const regional = mapTravelDuration(250_000);
  const international = mapTravelDuration(1_000_000);
  const intercontinental = mapTravelDuration(5_000_000);
  assert.ok(regional >= 2);
  assert.ok(international > regional);
  assert.ok(intercontinental > international);
  assert.ok(intercontinental >= 7);
});

test("even global journeys finish within eight seconds", () => {
  assert.equal(mapTravelDuration(20_000_000), 8);
});
