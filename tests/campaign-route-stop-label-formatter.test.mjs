import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCampaignRouteStopLabel,
  formatCampaignRouteStopOrder,
} from "../src/presentation/campaigns/formatters/campaign-route-stop-label.formatter.js";

test("campaign route stop orders use two-digit labels", () => {
  assert.equal(formatCampaignRouteStopOrder(1), "01");
  assert.equal(formatCampaignRouteStopOrder(12), "12");
});

test("campaign route labels collapse consecutive visits into a range", () => {
  assert.equal(formatCampaignRouteStopLabel([2, 1, 2]), "01–02");
});

test("campaign route labels retain non-consecutive visits to the same point", () => {
  assert.equal(formatCampaignRouteStopLabel([3, 1]), "01,03");
});
