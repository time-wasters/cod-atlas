import assert from "node:assert/strict";
import test from "node:test";
import { parseWikiValue } from "../src/infrastructure/external/call-of-duty-wiki/wiki-value.parser.mjs";

test("parseWikiValue preserves raw date evidence and a display value", () => {
  assert.deepEqual(parseWikiValue("[[2011]]-10-6"), { raw: "[[2011]]-10-6", label: "2011-10-6" });
  assert.deepEqual(parseWikiValue(null), { raw: null, label: null });
});
