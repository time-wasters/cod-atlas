import assert from "node:assert/strict";
import test from "node:test";
import { transitionCampaignPlayback } from "../src/presentation/campaigns/state/campaign-playback.state.js";

test("pause and resume retain the current mission and manual steps stay paused", () => {
  const paused = transitionCampaignPlayback({ index: 1, status: "playing" }, "pause", 4);
  assert.deepEqual(paused, { index: 1, status: "paused" });
  const next = transitionCampaignPlayback(paused, "next", 4);
  assert.deepEqual(next, { index: 2, status: "paused" });
  assert.deepEqual(transitionCampaignPlayback(next, "resume", 4), { index: 2, status: "playing" });
});

test("transport never runs past a campaign boundary or wraps at the end", () => {
  assert.deepEqual(transitionCampaignPlayback({ index: 0, status: "paused" }, "previous", 3),
    { index: 0, status: "paused" });
  assert.deepEqual(transitionCampaignPlayback({ index: 2, status: "playing" }, "next", 3),
    { index: 2, status: "playing" });
  assert.deepEqual(transitionCampaignPlayback({ index: 2, status: "playing" }, "finish", 3),
    { index: 2, status: "finished" });
  assert.deepEqual(transitionCampaignPlayback({ index: 1, status: "playing" }, "finish", 3),
    { index: 1, status: "playing" });
});

test("a completed tour can step back paused or replay from the first mission", () => {
  const completed = { index: 2, status: "finished" };
  assert.deepEqual(transitionCampaignPlayback(completed, "previous", 3), { index: 1, status: "paused" });
  assert.deepEqual(transitionCampaignPlayback(completed, "start", 3), { index: 0, status: "playing" });
});

test("empty campaigns cannot start and a one-mission tour finishes normally", () => {
  const idle = { index: 0, status: "idle" };
  assert.deepEqual(transitionCampaignPlayback(idle, "start", 0), idle);
  const started = transitionCampaignPlayback(idle, "start", 1);
  assert.deepEqual(started, { index: 0, status: "playing" });
  assert.deepEqual(transitionCampaignPlayback(started, "finish", 1), { index: 0, status: "finished" });
});
