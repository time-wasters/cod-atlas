import assert from "node:assert/strict";
import test from "node:test";
import { buildContentUpdateOptions } from "../src/application/content-updates/use-cases/build-content-update-options.ts";

test("release groups belong to the selected game appearance", () => {
  const owner = { id: "1", label: "Original pack" };
  const remaster = { id: "6", label: "Zombies Chronicles" };
  const entry = {
    ...contentUpdateEntry("remastered", "zombies"),
    gameIds: ["fixture", "bo3", "ungrouped"],
    contentUpdate: owner,
    appearances: [
      { gameId: "fixture", contentUpdate: owner },
      { gameId: "bo3", contentUpdate: remaster },
      { gameId: "ungrouped" },
    ],
  };
  const options = (gameCode) => buildContentUpdateOptions({
    gameCode,
    games: [
      { id: "fixture", code: "FIX" },
      { id: "bo3", code: "BO3" },
      { id: "ungrouped", code: "UNG" },
    ],
    groups: [{ entries: [entry] }],
  });

  assert.equal(options("BO3")[0].key, "bo3:6");
  assert.equal(options("BO3")[0].label, remaster.label);
  assert.equal(options("FIX")[0].label, owner.label);
  assert.deepEqual(options("UNG"), []);
});

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
