import assert from "node:assert/strict";
import test from "node:test";
import { replaceGeneratedMarkdownBlock } from "../src/infrastructure/reporting/markdown/generated-markdown-block.replacer.mjs";
import {
  localizationProgressEnd,
  localizationProgressStart,
  researchProgressEnd,
  researchProgressStart,
} from "../src/infrastructure/reporting/markdown/progress-report-markers.constants.mjs";

test("generated block replacement changes only the delimited block", () => {
  const document = `Before\n${researchProgressStart}\nold\n${researchProgressEnd}\nAfter\n`;
  const generated = `${researchProgressStart}\nnew\n${researchProgressEnd}`;
  assert.equal(
    replaceGeneratedMarkdownBlock(
      document,
      researchProgressStart,
      researchProgressEnd,
      generated,
    ),
    `Before\n${generated}\nAfter\n`,
  );
  assert.throws(
    () => replaceGeneratedMarkdownBlock(
      "No markers",
      localizationProgressStart,
      localizationProgressEnd,
      generated,
    ),
    /marker pair/,
  );
});
