import assert from "node:assert/strict";
import test from "node:test";
import { parseAtlasUrlState } from "../src/infrastructure/browser/url/atlas-url-state.parser.js";

test("atlas URL parser applies concise defaults", () => {
  assert.deepEqual(parseAtlasUrlState("https://example.com/"), {
    query: "",
    gameId: "all",
    country: "all",
    series: [],
    subseries: [],
    continents: [],
    precisions: [],
    confidences: [],
    methods: [],
    showSingleplayer: true,
    showMultiplayer: false,
    showZombies: false,
    sidebarListMode: "locations",
    levelId: null,
    locationId: null,
  });
  assert.equal(
    parseAtlasUrlState("https://example.com/?browse=unknown").sidebarListMode,
    "locations",
  );
});

test("atlas URL parser preserves legacy precision links", () => {
  assert.deepEqual(
    parseAtlasUrlState("https://example.com/?precision=localized").precisions,
    ["exact", "approximate", "city", "region"],
  );
  assert.deepEqual(
    parseAtlasUrlState("https://example.com/?precision=country").precisions,
    ["country"],
  );
});

test("atlas URL parser supports content-update browsing", () => {
  assert.equal(
    parseAtlasUrlState("https://example.com/?browse=updates").sidebarListMode,
    "updates",
  );
});

test("atlas URL parser supports every mode-filter encoding", () => {
  for (const [mode, showSingleplayer, showMultiplayer, showZombies] of [
    ["all", true, true, true],
    ["both", true, true, false],
    ["multiplayer", false, true, false],
    ["zombies", false, false, true],
    ["singleplayer,zombies", true, false, true],
    ["none", false, false, false],
  ]) {
    const state = parseAtlasUrlState(`https://example.com/?mode=${mode}`);
    assert.equal(state.showSingleplayer, showSingleplayer);
    assert.equal(state.showMultiplayer, showMultiplayer);
    assert.equal(state.showZombies, showZombies);
  }
});
