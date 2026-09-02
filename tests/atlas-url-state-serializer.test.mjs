import assert from "node:assert/strict";
import test from "node:test";
import { parseAtlasUrlState } from "../src/infrastructure/browser/url/atlas-url-state.parser.js";
import { serializeAtlasUrlState } from "../src/infrastructure/browser/url/atlas-url-state.serializer.js";

const defaultState = {
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
  showSpecialOps: false,
  showZombies: false,
  sidebarListMode: "locations",
  levelId: null,
  locationId: null,
};

test("atlas URL serializer round-trips shareable filters and selection", () => {
  const source = new URL("https://example.com/atlas/?utm_source=test#map");
  const state = {
    query: "Safehouse",
    gameId: "cod4",
    country: "Azerbaijan",
    series: ["modern-warfare"],
    subseries: ["main"],
    continents: ["Asia"],
    precisions: ["approximate", "exact"],
    confidences: ["high"],
    methods: ["verified-landmark"],
    showSingleplayer: true,
    showMultiplayer: true,
    showSpecialOps: true,
    showZombies: true,
    sidebarListMode: "campaigns",
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
    "https://example.com/?game=old&level=old",
    defaultState,
  );
  assert.equal(defaultUrl.search, "");

  for (const [mode, showSingleplayer, showMultiplayer, showSpecialOps, showZombies] of [
    ["all", true, true, true, true],
    ["both", true, true, false, false],
    ["multiplayer", false, true, false, false],
    ["special-ops", false, false, true, false],
    ["multiplayer,special-ops", false, true, true, false],
    ["zombies", false, false, false, true],
    ["singleplayer,special-ops", true, false, true, false],
    ["singleplayer,zombies", true, false, false, true],
    ["none", false, false, false, false],
  ]) {
    const url = serializeAtlasUrlState(defaultUrl, {
      ...defaultState,
      showSingleplayer,
      showMultiplayer,
      showSpecialOps,
      showZombies,
    });
    assert.equal(url.searchParams.get("mode"), mode);
  }
});

test("atlas URL serializer preserves content-update browsing", () => {
  const url = serializeAtlasUrlState("https://example.com/", {
    ...defaultState,
    gameId: "waw",
    sidebarListMode: "updates",
  });

  assert.equal(url.searchParams.get("browse"), "updates");
  assert.equal(parseAtlasUrlState(url).sidebarListMode, "updates");
});
