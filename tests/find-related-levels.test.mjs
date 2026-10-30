import assert from "node:assert/strict";
import test from "node:test";
import { findRelatedLevels } from "../src/application/atlas/use-cases/find-related-levels.ts";

test("regional navigation keeps the selected level in a stable, deduplicated list", () => {
  const first = { id: "first-main", levelId: "first" };
  const second = { id: "second-main", levelId: "second" };
  const secondAlternate = { id: "second-alternate", levelId: "second" };
  const region = { entries: [first, second, secondAlternate] };
  const groups = [region];

  for (const entry of region.entries) {
    const { relatedLevels } = findRelatedLevels({
      groups,
      selected: { group: region, entry },
    });

    assert.deepEqual(relatedLevels, [
      { group: region, entry: first },
      { group: region, entry: second },
    ]);
    assert.equal(relatedLevels.filter((item) => item.entry.levelId === entry.levelId).length, 1);
  }
});
