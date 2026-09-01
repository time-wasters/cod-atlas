import assert from "node:assert/strict";
import test from "node:test";
import { resolveGameIconProviderConfiguration } from "../src/infrastructure/external/game-icons/game-icon-provider.configuration.mjs";

test("external icon configuration is opt-in and validates templates", () => {
  assert.deepEqual(resolveGameIconProviderConfiguration({}), {
    steamTemplate: null,
    steamGridDbTemplate: null,
  });
  assert.throws(() => resolveGameIconProviderConfiguration({
    STEAM_ICON_URL: "http://example.test/%app%/%icon%.jpg",
  }), /HTTPS/);
  assert.throws(() => resolveGameIconProviderConfiguration({
    STEAM_ICON_URL: "https://example.test/%app%/%icon%.jpg",
  }), /%extension%/);
  assert.throws(() => resolveGameIconProviderConfiguration({
    STEAMGRIDDB_ICON_URL: "https://example.test/icon.png",
  }), /%file%/);
});
