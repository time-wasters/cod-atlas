export function calculateResearchCoverage(levels) {
  const total = levels.length;
  const researched = levels.filter((level) => level.researched).length;
  return { researched, remaining: total - researched, total };
}
