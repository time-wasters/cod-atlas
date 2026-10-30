import assert from "node:assert/strict";
import test from "node:test";
import { buildChronologicalOrder } from "../src/application/campaigns/use-cases/build-chronological-order.mjs";

function fixture() {
  const ids = ["prologue", "first", "second", "third", "flashback", "last"];
  const levels = ids.map((id) => ({ id, wikiArticle: `wiki-${id}` }));
  const wikiArticles = new Map(ids.map((id, index) => [`wiki-${id}`, {
    previousLevels: { links: index ? [{ sequence: "game", article: `wiki-${ids[index - 1]}` }] : [] },
    nextLevels: { links: index + 1 < ids.length ? [{ sequence: "game", article: `wiki-${ids[index + 1]}` }] : [] },
  }]));
  const chronologicalLink = (id, field, neighbor) => wikiArticles.get(`wiki-${id}`)[field].links.push({
    sequence: "chronological", article: neighbor ? `wiki-${neighbor}` : null,
  });
  return { levels, wikiArticles, chronologicalLink };
}

function chronologicalFixture() {
  const data = fixture();
  data.chronologicalLink("prologue", "previousLevels", "third");
  data.chronologicalLink("prologue", "nextLevels", "last");
  data.chronologicalLink("first", "nextLevels", "flashback");
  data.chronologicalLink("flashback", "previousLevels", "first");
  data.chronologicalLink("flashback", "nextLevels", "second");
  return data;
}

test("chronological links replace conflicting game links while preserving unaffected neighbors", () => {
  const data = chronologicalFixture();
  const snapshot = structuredClone(data.wikiArticles);
  const orders = buildChronologicalOrder(data);

  assert.deepEqual([...orders], [
    ["first", 1], ["flashback", 2], ["second", 3], ["third", 4], ["prologue", 5], ["last", 6],
  ]);
  assert.deepEqual(data.wikiArticles, snapshot);
});

test("in-game links alone do not establish a chronological campaign", () => {
  assert.equal(buildChronologicalOrder(fixture()), null);
});

test("a complete explicit chronology takes precedence over all in-game links", () => {
  const data = fixture();
  const ids = ["last", "flashback", "third", "second", "first", "prologue"];
  for (let index = 0; index + 1 < ids.length; index += 1) {
    data.chronologicalLink(ids[index], "nextLevels", ids[index + 1]);
  }
  assert.deepEqual([...buildChronologicalOrder(data).keys()], ids);
});

test("missing links do not establish a complete chronological order", () => {
  const data = chronologicalFixture();
  data.wikiArticles.get("wiki-second").nextLevels.links = [];
  data.wikiArticles.get("wiki-third").previousLevels.links = [];
  assert.equal(buildChronologicalOrder(data), null);
});

test("unresolved chronological links and ambiguous article mappings suppress the order", () => {
  const unresolved = chronologicalFixture();
  unresolved.chronologicalLink("second", "nextLevels", null);
  assert.equal(buildChronologicalOrder(unresolved), null);

  const ambiguous = chronologicalFixture();
  ambiguous.levels[1].wikiArticle = ambiguous.levels[0].wikiArticle;
  assert.equal(buildChronologicalOrder(ambiguous), null);
});

test("branching or cyclic chronological links do not establish an order", () => {
  const branching = chronologicalFixture();
  branching.chronologicalLink("first", "nextLevels", "second");
  assert.equal(buildChronologicalOrder(branching), null);

  const cyclic = {
    levels: [{ id: "a", wikiArticle: "wiki-a" }, { id: "b", wikiArticle: "wiki-b" }],
    wikiArticles: new Map([
      ["wiki-a", { nextLevels: { links: [{ sequence: "chronological", article: "wiki-b" }] } }],
      ["wiki-b", { nextLevels: { links: [{ sequence: "chronological", article: "wiki-a" }] } }],
    ]),
  };
  assert.equal(buildChronologicalOrder(cyclic), null);
});
