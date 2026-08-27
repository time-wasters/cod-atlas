import assert from "node:assert/strict";
import test from "node:test";
import { buildCampaignRoute } from "../app/campaign-route.js";

function level(entryId, order, coordinates, title = `Mission ${order}`) {
  return {
    entryId,
    levelId: `level-${order}`,
    title,
    order,
    coordinates,
  };
}

test("campaign routes preserve order and break around unmapped levels", () => {
  const route = buildCampaignRoute([
    level("one", 1, [10, 20]),
    level("two", 2, [11, 21]),
    level(null, 3, null),
    level("four", 4, [30, 40]),
    level("five", 5, [31, 41]),
  ]);

  assert.deepEqual(route.segments, [
    [[10, 20], [11, 21]],
    [[30, 40], [31, 41]],
  ]);
  assert.deepEqual(route.waypoints.map((waypoint) => waypoint.label), ["01", "02", "04", "05"]);
});

test("campaign routes combine repeated coordinates without duplicating line points", () => {
  const route = buildCampaignRoute([
    level("one", 1, [10, 20], "Arrival"),
    level("two", 2, [10, 20], "Return"),
    level("three", 3, [12, 22], "Departure"),
  ]);

  assert.deepEqual(route.segments, [[[10, 20], [12, 22]]]);
  assert.equal(route.waypoints[0].label, "01\u201302");
  assert.deepEqual(route.waypoints[0].stops.map((stop) => stop.title), ["Arrival", "Return"]);
});

test("campaign route labels retain non-consecutive visits to the same point", () => {
  const route = buildCampaignRoute([
    level("one", 1, [10, 20]),
    level("two", 2, [11, 21]),
    level("three", 3, [10, 20]),
  ]);

  assert.equal(route.waypoints[0].label, "01,03");
});
