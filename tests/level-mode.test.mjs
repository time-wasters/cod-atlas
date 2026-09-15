import assert from "node:assert/strict";
import test from "node:test";

import { isLevelMode, levelModes } from "../src/domain/level/level-mode.value-object.mjs";
import { isLevelModeSub, levelModeSubs } from "../src/domain/level/level-mode-sub.value-object.mjs";

test("level modes combine Special Ops, Survival and Challenges under Other", () => {
  assert.deepEqual(levelModes, ["singleplayer", "multiplayer", "zombies", "other"]);
  assert.equal(isLevelMode("special-ops"), false);
  assert.equal(isLevelMode("other"), true);
  assert.deepEqual(levelModeSubs, ["special-ops", "survival", "challenge"]);
  assert.equal(isLevelModeSub("special-ops"), true);
  assert.equal(isLevelModeSub("survival"), true);
  assert.equal(isLevelModeSub("challenge"), true);
});
