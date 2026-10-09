import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseMarkdownDocument } from "../src/infrastructure/content/markdown/markdown-document.parser.mjs";

test("WWII includes Neptune as multiplayer and the practice range as a challenge with two added markers", async () => {
  const records = await Promise.all([
    "multiplayer/operation-neptune.md",
    "challenge/firing-range.md",
  ].map(async (filename) => {
    const contents = await readFile(new URL(`../content/levels/wwii/${filename}`, import.meta.url), "utf8");
    return parseMarkdownDocument(contents, filename);
  }));

  const [neptune, range] = records.map(({ data }) => data);
  assert.equal(neptune.mode, "multiplayer");
  assert.equal(range.mode, "other");
  assert.equal(range.modeSub, "challenge");
  const locations = records.flatMap(({ data }) => data.locations);
  assert.equal(locations.length, 2, "these additions intentionally contribute two marker locations");
  for (const location of locations) {
    assert.equal(location.country, "France");
    assert.equal(location.precision, "approximate");
    assert.ok(location.latitude > 49.3 && location.latitude < 49.4);
    assert.ok(location.longitude > -0.95 && location.longitude < -0.8);
  }
});
