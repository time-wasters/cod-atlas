import assert from "node:assert/strict";
import test from "node:test";

import { isLevelMode, levelModes } from "../src/domain/level/level-mode.value-object.mjs";

test("level modes include Special Ops and Other as distinct categories", () => {
  assert.deepEqual(levelModes, ["singleplayer", "multiplayer", "special-ops", "zombies", "other"]);
  assert.equal(isLevelMode("special-ops"), true);
  assert.equal(isLevelMode("other"), true);
});
