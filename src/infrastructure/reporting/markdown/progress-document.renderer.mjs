import { replaceGeneratedMarkdownBlock } from "./generated-markdown-block.replacer.mjs";
import { renderHumanVerificationProgress } from "./human-verification-progress.renderer.mjs";
import { renderLocalizationProgress } from "./localization-progress.renderer.mjs";
import {
  humanVerificationProgressEnd,
  humanVerificationProgressStart,
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
  const withVerification = replaceGeneratedMarkdownBlock(
    withResearch,
    humanVerificationProgressStart,
    humanVerificationProgressEnd,
    renderHumanVerificationProgress(data),
  );
  return replaceGeneratedMarkdownBlock(
    withVerification,
    localizationProgressStart,
    localizationProgressEnd,
    renderLocalizationProgress(data),
  );
}
