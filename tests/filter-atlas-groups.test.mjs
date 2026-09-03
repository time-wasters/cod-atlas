import assert from "node:assert/strict";
import test from "node:test";

import { filterAtlasGroups } from "../src/application/atlas/use-cases/filter-atlas-groups.ts";

test("mode filtering treats Special Ops as a distinct content category", () => {
  const entries = [
    {
      id: "special-ops",
      game: "MW3",
      gameIds: ["mw3"],
      title: "Stay Sharp",
      precision: "country",
      modes: ["special-ops"],
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
    games: [{ id: "mw3", code: "MW3", series: "modern-warfare", subseries: "main" }],
    groups: [{ name: "Test country", continent: "Test continent", flagCode: null, entries }],
    criteria: {
      query: "",
      gameCode: "all",
      country: "all",
      gameSeries: new Set(),
      gameSubseries: new Set(),
      continents: new Set(),
      precisions: new Set(),
      confidences: new Set(),
      methods: new Set(),
      showSingleplayer: false,
      showMultiplayer: false,
      showSpecialOps: true,
      showZombies: false,
    },
  });

  assert.deepEqual(result.groups[0].entries.map((entry) => entry.id), ["special-ops"]);
});
