import { replaceGeneratedMarkdownBlock } from "./generated-markdown-block.replacer.mjs";
import { renderLocalizationProgress } from "./localization-progress.renderer.mjs";
import {
  localizationProgressEnd,
  localizationProgressStart,
  researchProgressEnd,
  researchProgressStart,
} from "./progress-report-markers.constants.mjs";
import { renderResearchProgress } from "./research-progress.renderer.mjs";

export function renderProgressDocument(current, data) {
  const withResearch = replaceGeneratedMarkdownBlock(
    current,
    researchProgressStart,
    researchProgressEnd,
    renderResearchProgress(data),
  );
  return replaceGeneratedMarkdownBlock(
    withResearch,
    localizationProgressStart,
    localizationProgressEnd,
    renderLocalizationProgress(data),
  );
}
