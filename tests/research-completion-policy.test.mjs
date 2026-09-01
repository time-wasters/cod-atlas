import assert from "node:assert/strict";
import test from "node:test";
import {
  isResearchComplete,
  requiredResearchHeadings,
} from "../src/domain/level/research-completion.policy.mjs";

const missionResearchHeadings = [
  "## The Mission in the Game",
  "## The Real Place & Differences",
  "## The Real Mission & Differences",
  "## Marker Position Explanation",
  "## Sources",
];
const completedBody = missionResearchHeadings
  .map((heading) => `${heading}\n\nSection text.`)
  .join("\n\n");

test("research completion requires every standard heading in order", () => {
  assert.ok(requiredResearchHeadings.every((heading) => heading instanceof RegExp));
  assert.equal(isResearchComplete(completedBody), true);
  assert.equal(isResearchComplete(completedBody.replace("## Sources", "## References")), false);
  assert.equal(isResearchComplete([
    missionResearchHeadings[1],
    missionResearchHeadings[0],
    ...missionResearchHeadings.slice(2),
  ].join("\n\nSection text.\n\n")), false);
});

test("research completion accepts a map heading in place of a mission heading", () => {
  const mapBody = completedBody.replace("## The Mission in the Game", "## The Map in the Game");

  assert.equal(isResearchComplete(mapBody), true);
  assert.equal(isResearchComplete(completedBody.replace(
    "## The Mission in the Game",
    "## The Mission or Map in the Game",
  )), false);
});

test("AI-assisted research also requires a disclosure", () => {
  assert.equal(isResearchComplete(`Generated with AI assistance.\n\n${completedBody}`), false);
  assert.equal(isResearchComplete(`> **AI-generated research note:** Review this against the cited sources.\n\n${completedBody}`), true);
  assert.equal(isResearchComplete(`> **AI-generated historical note.** Review this against the cited sources.\n\n${completedBody}`), true);
});
