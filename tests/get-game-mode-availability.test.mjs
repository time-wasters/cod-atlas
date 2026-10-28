import assert from "node:assert/strict";
import test from "node:test";

import { getGameModeAvailability } from "../src/application/atlas/use-cases/get-game-mode-availability.ts";

const games = [
  { id: "campaign-game", code: "CAMPAIGN" },
  { id: "mixed-game", code: "MIXED" },
];
const groups = [{
  entries: [
    { gameIds: ["campaign-game"], modes: ["singleplayer"] },
    { gameIds: ["mixed-game"], modes: ["multiplayer", "zombies", "other"] },
  ],
}];

test("reports only modes represented by the selected game", () => {
  assert.deepEqual(getGameModeAvailability({ gameCodes: new Set(["CAMPAIGN"]), games, groups }), {
    singleplayer: true,
    multiplayer: false,
    zombies: false,
    other: false,
  });
  assert.deepEqual(getGameModeAvailability({ gameCodes: new Set(["MIXED"]), games, groups }), {
    singleplayer: false,
    multiplayer: true,
    zombies: true,
    other: true,
  });
});

test("leaves every mode available when no individual game is selected", () => {
  assert.deepEqual(getGameModeAvailability({ gameCodes: null, games, groups }), {
    singleplayer: true,
    multiplayer: true,
    zombies: true,
    other: true,
  });
});

test("no games selected leaves no modes available", () => {
  assert.deepEqual(getGameModeAvailability({ gameCodes: new Set(), games, groups }), {
    singleplayer: false, multiplayer: false, zombies: false, other: false,
  });
});

test("combines only the modes represented by selected games", () => {
  assert.deepEqual(getGameModeAvailability({
    gameCodes: new Set(["CAMPAIGN", "MULTIPLAYER"]),
    games: [...games, { id: "multiplayer-game", code: "MULTIPLAYER" }],
    groups: [...groups, { entries: [{ gameIds: ["multiplayer-game"], modes: ["multiplayer"] }] }],
  }), {
    singleplayer: true,
    multiplayer: true,
    zombies: false,
    other: false,
  });
});
