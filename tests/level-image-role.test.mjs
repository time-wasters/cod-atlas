import assert from "node:assert/strict";
import test from "node:test";
import { classifyLevelImagePath } from "../src/domain/level/level-image-role.value-object.mjs";

test("image paths are classified by their repository role", () => {
  assert.equal(classifyLevelImagePath("cod2/campaign/map/main.png"), "main");
  assert.equal(classifyLevelImagePath("cod2/campaign/map/main.jpg"), "main");
  assert.equal(classifyLevelImagePath("cod2/campaign/map/maps/overlay.png"), "overlay");
  assert.equal(classifyLevelImagePath("cod2/campaign/map/maps/overlay.jpg"), "overlay");
  assert.equal(classifyLevelImagePath("cod2/campaign/map/maps/overlay.jpeg"), "overlay");
  assert.equal(classifyLevelImagePath("cod2/campaign/map/extra/research.png"), "other");
  assert.equal(classifyLevelImagePath("cod2/campaign/map/extra/research.jpg"), "other");
});
