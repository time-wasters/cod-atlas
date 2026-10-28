import assert from "node:assert/strict";
import test from "node:test";

import { filterAtlasGroups } from "../src/application/atlas/use-cases/filter-atlas-groups.ts";

test("subseries filtering matches every membership of a game", () => {
  const entry = {
    id: "reboot-main-title",
    game: "MW19",
    gameIds: ["mw19"],
    title: "Modern Warfare level",
    precision: "city",
    modes: ["singleplayer"],
    appearances: [{ title: "Modern Warfare level" }],
  };
  const input = {
    games: [{
      id: "mw19",
      code: "MW19",
      series: "modern-warfare",
      subseries: ["main", "reboot"],
      developer: [{ id: "infinity_ward", name: "Infinity Ward (All)" }],
    }],
    groups: [{ name: "Test", continent: "Test", flagCode: null, entries: [entry] }],
    criteria: {
      query: "",
      gameCodes: new Set(),
      country: "all",
      gameSeries: new Set(),
      gameSubseries: new Set(["main"]),
      developers: new Set(),
      continents: new Set(),
      precisions: new Set(),
      confidences: new Set(),
      methods: new Set(),
      showSingleplayer: true,
      showMultiplayer: false,
      showZombies: false,
      showOther: false,
    },
  };

  assert.equal(filterAtlasGroups(input).groups.length, 1);
  input.criteria.gameSubseries = new Set(["reboot"]);
  assert.equal(filterAtlasGroups(input).groups.length, 1);
});

test("mode filtering exposes Special Ops through Other", () => {
  const entries = [
    {
      id: "special-ops",
      game: "MW3",
      gameIds: ["mw3"],
      title: "Stay Sharp",
      precision: "country",
      modes: ["other"],
      modeSub: "special-ops",
      appearances: [{ title: "Stay Sharp" }],
    },
    {
      id: "multiplayer",
      game: "MW3",
      gameIds: ["mw3"],
      title: "Hardhat",
      precision: "approximate",
      modes: ["multiplayer"],
      appearances: [{ title: "Hardhat" }],
    },
  ];
  const result = filterAtlasGroups({
    games: [{
      id: "mw3",
      code: "MW3",
      series: "modern-warfare",
      subseries: ["main"],
      developer: [{ id: "infinity_ward", name: "Infinity Ward (All)" }],
    }],
    groups: [{ name: "Test country", continent: "Test continent", flagCode: null, entries }],
    criteria: {
      query: "",
      gameCodes: new Set(),
      country: "all",
      gameSeries: new Set(),
      gameSubseries: new Set(),
      developers: new Set(),
      continents: new Set(),
      precisions: new Set(),
      confidences: new Set(),
      methods: new Set(),
      showSingleplayer: false,
      showMultiplayer: false,
      showZombies: false,
      showOther: true,
    },
  });

  assert.deepEqual(result.groups[0].entries.map((entry) => entry.id), ["special-ops"]);
});

test("mode filtering exposes Other entries independently", () => {
  const otherEntry = {
    id: "challenge",
    game: "WAW-DS",
    gameIds: ["waw-nds"],
    title: "Challenge #1 — Two Roads",
    precision: "city",
    modes: ["other"],
    modeSub: "challenge",
    appearances: [{ title: "Challenge #1 — Two Roads" }],
  };
  const result = filterAtlasGroups({
    games: [{
      id: "waw-nds",
      code: "WAW-DS",
      series: "world-war-ii",
      subseries: ["spin-off"],
      developer: [{ id: "n_space", name: "n-Space" }],
    }],
    groups: [{ name: "Germany", continent: "Europe", flagCode: "DE", entries: [otherEntry] }],
    criteria: {
      query: "",
      gameCodes: new Set(),
      country: "all",
      gameSeries: new Set(),
      gameSubseries: new Set(),
      developers: new Set(),
      continents: new Set(),
      precisions: new Set(),
      confidences: new Set(),
      methods: new Set(),
      showSingleplayer: false,
      showMultiplayer: false,
      showZombies: false,
      showOther: true,
    },
  });

  assert.deepEqual(result.groups[0].entries.map((entry) => entry.id), ["challenge"]);
});

test("developer filtering matches any developer credited to an entry's games", () => {
  const entries = [
    {
      id: "treyarch-level",
      game: "BO6",
      gameIds: ["bo6"],
      title: "Treyarch level",
      precision: "city",
      modes: ["singleplayer"],
      appearances: [{ title: "Treyarch level" }],
    },
    {
      id: "other-level",
      game: "CODH",
      gameIds: ["heroes"],
      title: "Other level",
      precision: "city",
      modes: ["singleplayer"],
      appearances: [{ title: "Other level" }],
    },
  ];
  const result = filterAtlasGroups({
    games: [
      {
        id: "bo6",
        code: "BO6",
        series: "black-ops",
        subseries: ["main"],
        developer: [
          { id: "treyarch", name: "Treyarch" },
          { id: "raven", name: "Raven Software" },
        ],
      },
      {
        id: "heroes",
        code: "CODH",
        series: "modern-warfare",
        subseries: ["spin-off"],
        developer: [{ id: "faceroll", name: "Faceroll Games" }],
      },
    ],
    groups: [{ name: "Test", continent: "Test", flagCode: null, entries }],
    criteria: {
      query: "",
      gameCodes: new Set(),
      country: "all",
      gameSeries: new Set(),
      gameSubseries: new Set(),
      developers: new Set(["raven"]),
      continents: new Set(),
      precisions: new Set(),
      confidences: new Set(),
      methods: new Set(),
      showSingleplayer: true,
      showMultiplayer: false,
      showZombies: false,
      showOther: false,
    },
  });

  assert.deepEqual(result.groups[0].entries.map((entry) => entry.id), ["treyarch-level"]);
});

function gameSelectionFixture() {
  const games = [
    { id: "original", code: "ORIGINAL", series: "series-a", subseries: ["main"], developer: [{ id: "studio-a", name: "Studio A" }] },
    { id: "remake", code: "REMAKE", series: "series-b", subseries: ["remaster"], developer: [{ id: "studio-b", name: "Studio B" }] },
    { id: "unselected", code: "UNSELECTED", series: "series-c", subseries: ["main"], developer: [] },
  ];
  const entry = (id, gameIds) => ({
    id, gameIds, game: gameIds.map((id) => games.find((game) => game.id === id).code).join(" / "),
    title: id, precision: "city", modes: ["singleplayer"], appearances: [{ title: id }],
  });
  return {
    games,
    groups: [
      { name: "Shared country", continent: "Continent A", flagCode: null, entries: [entry("shared", ["original", "remake"])] },
      { name: "Original country", continent: "Continent A", flagCode: null, entries: [entry("original-only", ["original"])] },
      { name: "Remake country", continent: "Continent B", flagCode: null, entries: [entry("remake-only", ["remake"])] },
      { name: "Other country", continent: "Continent B", flagCode: null, entries: [entry("other", ["unselected"])] },
    ],
    criteria: {
      query: "", gameCodes: new Set(["ORIGINAL", "REMAKE"]), country: "all",
      gameSeries: new Set(), gameSubseries: new Set(), developers: new Set(),
      continents: new Set(), precisions: new Set(), confidences: new Set(), methods: new Set(),
      showSingleplayer: true, showMultiplayer: false, showZombies: false, showOther: false,
    },
  };
}

test("multiple game selection matches any selected game and includes shared entries once", () => {
  const result = filterAtlasGroups(gameSelectionFixture());
  assert.deepEqual(result.groups.flatMap((group) => group.entries.map((entry) => entry.id)),
    ["shared", "original-only", "remake-only"]);
  assert.equal(result.countries.find((country) => country.name === "Other country").available, false);
});

test("clearing selected games removes the game restriction", () => {
  const input = gameSelectionFixture();
  input.criteria.gameCodes.clear();
  assert.deepEqual(filterAtlasGroups(input).groups.flatMap((group) => group.entries.map((entry) => entry.id)),
    ["shared", "original-only", "remake-only", "other"]);
});

test("single game and developer constraints must match the same appearance", () => {
  const input = gameSelectionFixture();
  input.criteria.gameCodes = new Set(["ORIGINAL"]);
  input.criteria.developers = new Set(["studio-b"]);
  assert.deepEqual(filterAtlasGroups(input).groups, []);
  input.criteria.gameCodes.add("REMAKE");
  assert.deepEqual(filterAtlasGroups(input).groups.flatMap((group) => group.entries.map((entry) => entry.id)),
    ["shared", "remake-only"]);
});

test("series and sub-series cannot match different games of a shared entry", () => {
  const input = gameSelectionFixture();
  input.criteria.gameCodes.clear();
  input.criteria.gameSeries = new Set(["series-a"]);
  input.criteria.gameSubseries = new Set(["remaster"]);
  assert.deepEqual(filterAtlasGroups(input).groups, []);
});

test("multiple selected games still combine with geographic and location filters", () => {
  const input = gameSelectionFixture();
  input.criteria.continents = new Set(["Continent A"]);
  input.criteria.country = "Original country";
  input.criteria.precisions = new Set(["city"]);
  assert.deepEqual(filterAtlasGroups(input).groups.map((group) => group.name), ["Original country"]);
  input.criteria.precisions = new Set(["exact"]);
  assert.deepEqual(filterAtlasGroups(input).groups, []);
});
