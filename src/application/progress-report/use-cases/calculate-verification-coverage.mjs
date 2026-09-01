import { collectLevelLocations } from "./collect-level-locations.mjs";

function calculateCoverage(items, selectVerification) {
  const total = items.length;
  const verified = items.filter((item) => selectVerification(item).byHuman).length;
  return { verified, remaining: total - verified, total };
}

export function calculateVerificationCoverage(levels) {
  return {
    locations: calculateCoverage(
      collectLevelLocations(levels),
      (location) => location.verified,
    ),
    research: calculateCoverage(
      levels,
      (level) => level.verified.research,
    ),
  };
}
