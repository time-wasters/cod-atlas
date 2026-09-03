import assert from "node:assert/strict";
import test from "node:test";

import { isLevelMode, levelModes } from "../src/domain/level/level-mode.value-object.mjs";

test("level modes include Special Ops as a distinct category", () => {
  assert.deepEqual(levelModes, ["singleplayer", "multiplayer", "special-ops", "zombies"]);
  assert.equal(isLevelMode("special-ops"), true);
});
