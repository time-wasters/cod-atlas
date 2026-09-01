import assert from "node:assert/strict";
import test from "node:test";
import { parseWikiLink } from "../src/infrastructure/external/call-of-duty-wiki/wiki-link.parser.mjs";

test("parseWikiLink preserves raw evidence and resolves its first link", () => {
  assert.deepEqual(parseWikiLink("[[Paris|Paris, France]]", "https://wiki.example.test"), {
    raw: "[[Paris|Paris, France]]",
    label: "Paris, France",
    url: "https://wiki.example.test/wiki/Paris",
  });
});
