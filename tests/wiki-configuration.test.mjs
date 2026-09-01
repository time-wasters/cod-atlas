import assert from "node:assert/strict";
import test from "node:test";
import {
  formatWikiConfigurationError,
  resolveWikiConfiguration,
  WikiConfigurationError,
} from "../src/infrastructure/external/call-of-duty-wiki/wiki-configuration.mjs";

test("Wiki configuration is opt-in and accepts an explicit origin", () => {
  let error;
  try {
    resolveWikiConfiguration({});
  } catch (caught) {
    error = caught;
  }
  assert.ok(error instanceof WikiConfigurationError);
  const output = formatWikiConfigurationError(error);
  assert.match(output, /Wiki import configuration required/);
  assert.match(output, /COD_ATLAS_WIKI_ORIGIN=https:\/\/callofduty\.fandom\.com/);
  assert.doesNotMatch(output, /\n\s+at /);
  assert.throws(() => resolveWikiConfiguration({
    COD_ATLAS_WIKI_ORIGIN: "not a URL",
    COD_ATLAS_WIKI_USER_AGENT: "Atlas importer (maintainer@example.test)",
  }), WikiConfigurationError);
  assert.deepEqual(resolveWikiConfiguration({
    COD_ATLAS_WIKI_ORIGIN: "https://wiki.example.test",
    COD_ATLAS_WIKI_USER_AGENT: "Atlas importer (maintainer@example.test)",
  }), {
    origin: "https://wiki.example.test",
    apiUrl: new URL("https://wiki.example.test/api.php"),
    userAgent: "Atlas importer (maintainer@example.test)",
  });
});
