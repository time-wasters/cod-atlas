import assert from "node:assert/strict";
import test from "node:test";
import { parseWikiImportOptions } from "../src/infrastructure/cli/wiki-import/wiki-import-options.mjs";

test("arguments require explicit scope and enforce a polite delay", () => {
  assert.throws(() => parseWikiImportOptions([]), /Select records/);
  assert.throws(() => parseWikiImportOptions(["--all", "--delay-ms", "100"]), /at least 2000/);
  assert.throws(() => parseWikiImportOptions(["--game", "--dry-run"]), /--game requires a value/);
  assert.equal(parseWikiImportOptions(["--id", "codwiki-example"]).ids[0], "codwiki-example");
  assert.deepEqual(parseWikiImportOptions(["--game", "cod3", "--game", "cod4"]).gameIds, ["cod3", "cod4"]);
});
