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
    developers: [],
    continents: [],
    precisions: [],
    confidences: [],
    methods: [],
    showSingleplayer: true,
    showMultiplayer: false,
    showZombies: false,
    showOther: false,
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

test("atlas URL parser supports every mode-filter encoding and legacy Special Ops links", () => {
  for (const [mode, showSingleplayer, showMultiplayer, showZombies, showOther] of [
    ["all", true, true, true, true],
    ["both", true, true, false, false],
    ["multiplayer", false, true, false, false],
    ["special-ops", false, false, false, true],
    ["multiplayer,special-ops", false, true, false, true],
    ["zombies", false, false, true, false],
    ["other", false, false, false, true],
    ["singleplayer,special-ops", true, false, false, true],
    ["singleplayer,zombies", true, false, true, false],
    ["singleplayer,other", true, false, false, true],
    ["none", false, false, false, false],
  ]) {
    const state = parseAtlasUrlState(`https://example.com/?mode=${mode}`);
    assert.equal(state.showSingleplayer, showSingleplayer);
    assert.equal(state.showMultiplayer, showMultiplayer);
    assert.equal(state.showZombies, showZombies);
    assert.equal(state.showOther, showOther);
  }
});
