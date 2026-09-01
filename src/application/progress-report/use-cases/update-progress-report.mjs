import { calculateLocalizationCoverage } from "./calculate-localization-coverage.mjs";
import { calculateResearchCoverage } from "./calculate-research-coverage.mjs";
import { collectLevelLocations } from "./collect-level-locations.mjs";

export async function updateProgressReport({
  loadProgressData,
  readProgressDocument,
  renderProgressDocument,
  writeProgressDocument,
}) {
  const data = await loadProgressData();
  const current = await readProgressDocument();
  const expected = renderProgressDocument(current, data);

  if (current !== expected) await writeProgressDocument(expected);

  return {
    research: calculateResearchCoverage(data.levels),
    localization: calculateLocalizationCoverage(collectLevelLocations(data.levels)),
  };
}
