import assert from "node:assert/strict";
import test from "node:test";
import { parseAtlasUrlMode, serializeAtlasUrlMode } from "../src/infrastructure/browser/url/atlas-url-mode.codec.js";

const multiplayerDefaults = {
  showSingleplayer: false, showMultiplayer: true, showZombies: false, showOther: false,
};

test("custom mode defaults round-trip through URLs without a mode parameter", () => {
  assert.equal(serializeAtlasUrlMode(multiplayerDefaults, multiplayerDefaults), null);
  assert.deepEqual(parseAtlasUrlMode(null, multiplayerDefaults), multiplayerDefaults);
});

test("singleplayer stays explicit when it is no longer the configured default", () => {
  const singleplayer = { ...multiplayerDefaults, showSingleplayer: true, showMultiplayer: false };
  const mode = serializeAtlasUrlMode(singleplayer, multiplayerDefaults);
  assert.equal(mode, "singleplayer");
  assert.deepEqual(parseAtlasUrlMode(mode, multiplayerDefaults), singleplayer);
});

test("explicit legacy mode aliases retain their meaning under custom defaults", () => {
  assert.deepEqual(parseAtlasUrlMode("both", multiplayerDefaults), {
    ...multiplayerDefaults, showSingleplayer: true,
  });
  const all = { showSingleplayer: true, showMultiplayer: true, showZombies: true, showOther: true };
  assert.deepEqual(parseAtlasUrlMode("all", multiplayerDefaults), all);
  assert.equal(serializeAtlasUrlMode(all, all), null);
  assert.deepEqual(parseAtlasUrlMode(null, all), all);
});
