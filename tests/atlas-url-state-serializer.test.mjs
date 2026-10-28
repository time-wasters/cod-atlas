import assert from "node:assert/strict";
import test from "node:test";
import { parseAtlasUrlState } from "../src/infrastructure/browser/url/atlas-url-state.parser.js";
import { serializeAtlasUrlState } from "../src/infrastructure/browser/url/atlas-url-state.serializer.js";

const defaultState = {
  query: "",
  gameIds: null,
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
  campaignKey: null,
  levelId: null,
  locationId: null,
};

test("atlas URL serializer round-trips shareable filters and selection", () => {
  const source = new URL("https://example.com/atlas/?utm_source=test#map");
  const state = {
    query: "Safehouse",
    gameIds: ["cod4"],
    country: "Azerbaijan",
    series: ["modern-warfare"],
    subseries: ["main"],
    developers: ["infinity_ward", "raven"],
    continents: ["Asia"],
    precisions: ["approximate", "exact"],
    confidences: ["high"],
    methods: ["verified-landmark"],
    showSingleplayer: true,
    showMultiplayer: true,
    showZombies: true,
    showOther: true,
    sidebarListMode: "campaigns",
    campaignKey: "cod4:default:singleplayer:chronological",
    levelId: "cod4-safehouse",
    locationId: "main",
  };
  const sharedUrl = serializeAtlasUrlState(source, state);

  assert.equal(sharedUrl.searchParams.get("utm_source"), "test");
  assert.equal(sharedUrl.hash, "#map");
  assert.deepEqual(parseAtlasUrlState(sharedUrl), state);
});

test("atlas URL serializer omits defaults and encodes every mode-filter state", () => {
  const defaultUrl = serializeAtlasUrlState(
    "https://example.com/?game=old&level=old&campaign=old",
    defaultState,
  );
  assert.equal(defaultUrl.search, "");

  for (const [mode, showSingleplayer, showMultiplayer, showZombies, showOther] of [
    ["all", true, true, true, true],
    ["both", true, true, false, false],
    ["multiplayer", false, true, false, false],
    ["zombies", false, false, true, false],
    ["other", false, false, false, true],
    ["singleplayer,zombies", true, false, true, false],
    ["singleplayer,other", true, false, false, true],
    ["multiplayer,other", false, true, false, true],
    ["none", false, false, false, false],
  ]) {
    const url = serializeAtlasUrlState(defaultUrl, {
      ...defaultState,
      showSingleplayer,
      showMultiplayer,
      showZombies,
      showOther,
    });
    assert.equal(url.searchParams.get("mode"), mode);
  }
});

test("atlas URL serializer preserves content-update browsing", () => {
  const url = serializeAtlasUrlState("https://example.com/", {
    ...defaultState,
    gameIds: ["waw"],
    sidebarListMode: "updates",
  });

  assert.equal(url.searchParams.get("browse"), "updates");
  assert.equal(parseAtlasUrlState(url).sidebarListMode, "updates");
});

test("atlas URL serializer clears campaign identity when leaving campaign browsing", () => {
  const url = serializeAtlasUrlState("https://example.com/?browse=campaigns&campaign=old", {
    ...defaultState,
    sidebarListMode: "updates",
    campaignKey: "fixture:default:singleplayer:chronological",
  });
  assert.equal(url.searchParams.has("campaign"), false);
});

test("atlas URL serializer round-trips a stable multiple-game selection", () => {
  const url = serializeAtlasUrlState("https://example.com/?game=old", {
    ...defaultState,
    gameIds: ["fixture-b", "fixture-a", "fixture-b"],
  });
  assert.equal(url.searchParams.get("game"), "fixture-a,fixture-b");
  assert.deepEqual(parseAtlasUrlState(url).gameIds, ["fixture-a", "fixture-b"]);
  assert.equal(serializeAtlasUrlState(url, defaultState).searchParams.has("game"), false);
});

test("an empty game selection stays empty when sharing and restoring the URL", () => {
  const state = { ...defaultState, gameIds: [], series: ["fixture-series"] };
  const url = serializeAtlasUrlState("https://example.com/?game=fixture-a", state);
  assert.equal(url.searchParams.get("game"), "none");
  assert.deepEqual(parseAtlasUrlState(url), state);
});
