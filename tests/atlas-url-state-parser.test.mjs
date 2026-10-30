import assert from "node:assert/strict";
import test from "node:test";
import { parseAtlasUrlState } from "../src/infrastructure/browser/url/atlas-url-state.parser.js";

test("atlas URL parser applies concise defaults", () => {
  assert.deepEqual(parseAtlasUrlState("https://example.com/"), {
    query: "",
    gameIds: null,
    country: "all",
    series: [],
    subseries: ["main"],
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
    campaignKey: null,
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

test("atlas URL parser supports single-game links and multiple game IDs", () => {
  assert.deepEqual(parseAtlasUrlState("https://example.com/?game=fixture-a").gameIds, ["fixture-a"]);
  assert.deepEqual(parseAtlasUrlState("https://example.com/?game=fixture-b,fixture-a,fixture-b,,all").gameIds,
    ["fixture-b", "fixture-a"]);
  assert.equal(parseAtlasUrlState("https://example.com/?game=all").gameIds, "all");
  assert.deepEqual(parseAtlasUrlState("https://example.com/?game=none").gameIds, []);
});

test("empty game parameters use Main and Campaign even with other atlas filters", () => {
  for (const query of ["", "?q=fixture&country=France", "?mode=", "?mode=campaign"]) {
    const state = parseAtlasUrlState(`https://example.com/${query}`);
    assert.deepEqual(state.subseries, ["main"]);
    assert.equal(state.gameIds, null);
    assert.equal(state.showSingleplayer, true);
    assert.equal(state.showMultiplayer || state.showZombies || state.showOther, false);
  }
});

test("games=all explicitly selects all games instead of the default Main template", () => {
  const state = parseAtlasUrlState("https://example.com/?games=all");
  assert.equal(state.gameIds, "all");
  assert.deepEqual(state.subseries, []);
  assert.equal(state.showSingleplayer, true);
  assert.equal(parseAtlasUrlState("https://example.com/?games=all&game=fixture-a").gameIds, "all");
});

test("explicit games and templates replace the default game template", () => {
  for (const query of ["game=fixture-a", "game=none", "series=fixture-series", "developer=fixture-studio"]) {
    assert.deepEqual(parseAtlasUrlState(`https://example.com/?${query}`).subseries, []);
  }
  assert.deepEqual(parseAtlasUrlState("https://example.com/?subseries=remaster").subseries, ["remaster"]);
});

test("atlas URL parser supports content-update browsing", () => {
  assert.equal(
    parseAtlasUrlState("https://example.com/?browse=updates").sidebarListMode,
    "updates",
  );
});

test("atlas URL parser restores campaign identity only while browsing campaigns", () => {
  const campaignKey = "fixture:default:singleplayer:chronological";
  assert.equal(parseAtlasUrlState(`https://example.com/?browse=campaigns&campaign=${campaignKey}`).campaignKey,
    campaignKey);
  assert.equal(parseAtlasUrlState(`https://example.com/?browse=updates&campaign=${campaignKey}`).campaignKey,
    null);
});

test("atlas URL parser supports every mode-filter encoding and legacy Other-subtype links", () => {
  for (const [mode, showSingleplayer, showMultiplayer, showZombies, showOther] of [
    ["all", true, true, true, true],
    ["both", true, true, false, false],
    ["multiplayer", false, true, false, false],
    ["special-ops", false, false, false, true],
    ["survival", false, false, false, true],
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
