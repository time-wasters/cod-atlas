export const requiredResearchHeadings = Object.freeze([
  "## The Mission in the Game",
  "## The Real Place & Differences",
  "## The Real Mission & Differences",
  "## Marker Position Explanation",
  "## Sources",
]);

const aiReferencePattern = /\bAI(?:-generated|[- ]assisted| assistance)\b/i;
const aiDisclosurePattern = /^>\s+\*\*AI-generated (?:research|historical) note[.:]\*\*/im;

export function isResearchComplete(body) {
  if (!body.trim()) return false;

  const lines = body.split(/\r?\n/);
  let previousIndex = -1;
  for (const heading of requiredResearchHeadings) {
    const index = lines.findIndex((line, lineIndex) => (
      lineIndex > previousIndex && line === heading
    ));
    if (index === -1) return false;
    previousIndex = index;
  }

  const preamble = lines.slice(0, lines.indexOf(requiredResearchHeadings[0])).join("\n");
  return !aiReferencePattern.test(preamble) || aiDisclosurePattern.test(preamble);
}
