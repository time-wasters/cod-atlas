import assert from "node:assert/strict";
import test from "node:test";
import {
  isResearchComplete,
  requiredResearchHeadings,
} from "../src/domain/level/research-completion.policy.mjs";

const completedBody = requiredResearchHeadings
  .map((heading) => `${heading}\n\nSection text.`)
  .join("\n\n");

test("research completion requires every standard heading in order", () => {
  assert.equal(isResearchComplete(completedBody), true);
  assert.equal(isResearchComplete(completedBody.replace("## Sources", "## References")), false);
  assert.equal(isResearchComplete([
    requiredResearchHeadings[1],
    requiredResearchHeadings[0],
    ...requiredResearchHeadings.slice(2),
  ].join("\n\nSection text.\n\n")), false);
});

test("AI-assisted research also requires a disclosure", () => {
  assert.equal(isResearchComplete(`Generated with AI assistance.\n\n${completedBody}`), false);
  assert.equal(isResearchComplete(`> **AI-generated research note:** Review this against the cited sources.\n\n${completedBody}`), true);
  assert.equal(isResearchComplete(`> **AI-generated historical note.** Review this against the cited sources.\n\n${completedBody}`), true);
});
