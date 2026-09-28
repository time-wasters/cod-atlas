import assert from "node:assert/strict";
import test from "node:test";
import { buildContentUpdateOptions } from "../src/application/content-updates/use-cases/build-content-update-options.ts";

function contentUpdateEntry(id, mode, modeSub) {
  return {
    id,
    levelId: id,
    title: id,
    primary: true,
    gameIds: ["fixture"],
    contentUpdate: { id: "1", label: "Fixture update" },
    coordinates: [10, 20],
    modes: [mode],
    ...(modeSub ? { modeSub } : {}),
  };
}

test("content updates include every level mode and subtype", () => {
  const entries = [
    contentUpdateEntry("campaign", "singleplayer"),
    contentUpdateEntry("multiplayer", "multiplayer"),
    contentUpdateEntry("zombies", "zombies"),
    contentUpdateEntry("special-ops", "other", "special-ops"),
    contentUpdateEntry("survival", "other", "survival"),
    contentUpdateEntry("challenge", "other", "challenge"),
  ];
  const contentUpdates = buildContentUpdateOptions({
    gameCode: "FIX",
    games: [{ id: "fixture", code: "FIX" }],
    groups: [{ entries }],
  });

  assert.equal(contentUpdates.length, 1);
  assert.deepEqual(
    contentUpdates[0].levels.map(({ entry }) => entry.levelId),
    ["campaign", "challenge", "multiplayer", "special-ops", "survival", "zombies"],
  );
});
