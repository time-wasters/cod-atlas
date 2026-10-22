import assert from "node:assert/strict";
import test from "node:test";

import { isLevelMode, levelModes } from "../src/domain/level/level-mode.value-object.mjs";
import { isLevelModeSub, isValidLevelModeSub, levelModeSubs } from "../src/domain/level/level-mode-sub.value-object.mjs";

test("level modes combine Special Ops, Survival and Challenges under Other", () => {
  assert.deepEqual(levelModes, ["singleplayer", "multiplayer", "zombies", "other"]);
  assert.equal(isLevelMode("special-ops"), false);
  assert.equal(isLevelMode("other"), true);
  assert.deepEqual(levelModeSubs, ["special-ops", "survival", "challenge", "battle-royale", "dmz"]);
  assert.equal(isLevelModeSub("special-ops"), true);
  assert.equal(isLevelModeSub("survival"), true);
  assert.equal(isLevelModeSub("challenge"), true);
});

test("subtypes are restricted to their parent modes while standard multiplayer stays valid", () => {
  for (const mode of ["singleplayer", "multiplayer", "zombies"]) {
    assert.equal(isValidLevelModeSub(mode, undefined), true);
    assert.equal(isValidLevelModeSub(mode, null), true);
  }
  for (const modeSub of ["special-ops", "survival", "challenge"]) {
    assert.equal(isValidLevelModeSub("other", modeSub), true);
    assert.equal(isValidLevelModeSub("multiplayer", modeSub), false);
  }
  for (const modeSub of ["battle-royale", "dmz"]) {
    assert.equal(isValidLevelModeSub("multiplayer", modeSub), true);
    assert.equal(isValidLevelModeSub("other", modeSub), false);
  }
  for (const mode of ["singleplayer", "zombies"]) {
    for (const modeSub of levelModeSubs) {
      assert.equal(isValidLevelModeSub(mode, modeSub), false, `${mode}/${modeSub}`);
    }
  }
  assert.equal(isValidLevelModeSub("other", undefined), false);
  assert.equal(isValidLevelModeSub("other", null), false);
  assert.equal(isValidLevelModeSub("multiplayer", "unknown"), false);
  assert.equal(isValidLevelModeSub("unknown", undefined), false);
});

test("multiplayer supports multiple memberships and rejects empty, duplicate or foreign subtypes", () => {
  assert.equal(isValidLevelModeSub("multiplayer", ["battle-royale", "dmz"]), true);
  assert.equal(isValidLevelModeSub("multiplayer", ["dmz"]), true);
  for (const modeSub of [[], ["dmz", "dmz"], ["battle-royale", "challenge"], ["unknown"], [null]]) {
    assert.equal(isValidLevelModeSub("multiplayer", modeSub), false, JSON.stringify(modeSub));
  }
  assert.equal(isValidLevelModeSub("other", ["challenge"]), false);
  assert.equal(isValidLevelModeSub("zombies", ["battle-royale", "dmz"]), false);
});
