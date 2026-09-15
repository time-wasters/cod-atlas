import assert from "node:assert/strict";
import test from "node:test";

import { filterAtlasGroups } from "../src/application/atlas/use-cases/filter-atlas-groups.ts";

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
      subseries: "main",
      developer: [{ id: "infinity_ward", name: "Infinity Ward (All)" }],
    }],
    groups: [{ name: "Test country", continent: "Test continent", flagCode: null, entries }],
    criteria: {
      query: "",
      gameCode: "all",
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
      subseries: "spin-off",
      developer: [{ id: "n_space", name: "n-Space" }],
    }],
    groups: [{ name: "Germany", continent: "Europe", flagCode: "DE", entries: [otherEntry] }],
    criteria: {
      query: "",
      gameCode: "all",
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
        subseries: "main",
        developer: [
          { id: "treyarch", name: "Treyarch" },
          { id: "raven", name: "Raven Software" },
        ],
      },
      {
        id: "heroes",
        code: "CODH",
        series: "modern-warfare",
        subseries: "spin-off",
        developer: [{ id: "faceroll", name: "Faceroll Games" }],
      },
    ],
    groups: [{ name: "Test", continent: "Test", flagCode: null, entries }],
    criteria: {
      query: "",
      gameCode: "all",
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
