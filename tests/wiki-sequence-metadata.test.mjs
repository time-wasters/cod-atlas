import assert from "node:assert/strict";
import test from "node:test";
import { hasSequenceMetadata } from "../src/domain/wiki-article/wiki-sequence-metadata.policy.mjs";

test("existing snapshots are refreshed until sequence metadata has been imported", () => {
  assert.equal(hasSequenceMetadata({ latestRevisionId: 123 }), false);
  assert.equal(hasSequenceMetadata({ previousLevels: { links: [] }, nextLevels: { links: [] }, games: {}, date: {} }), true);
  assert.equal(hasSequenceMetadata({
    previousLevels: { links: [{ wikiTitle: "Pathfinder" }] },
    nextLevels: { links: [] },
    games: {},
    date: {},
  }), false);
  const articleLookup = new Map([["pathfinder", "codwiki-pathfinder"]]);
  assert.equal(hasSequenceMetadata({
    previousLevels: { links: [{ sequence: "chronological", article: null, wikiTitle: "Pathfinder" }] },
    nextLevels: { links: [] },
    games: {},
    date: {},
  }, articleLookup), false);
  assert.equal(hasSequenceMetadata({
    previousLevels: { links: [{ sequence: "chronological", article: "codwiki-pathfinder", wikiTitle: "Pathfinder" }] },
    nextLevels: { links: [] },
    games: {},
    date: {},
  }, articleLookup), true);
});
