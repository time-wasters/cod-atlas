export const requiredResearchHeadings = Object.freeze([
  /^## The (?:Mission|Map) in the Game$/,
  /^## The Real Place & Differences$/,
  /^## The Real Mission & Differences$/,
  /^## Marker Position Explanation$/,
  /^## Sources$/,
]);

const aiReferencePattern = /\bAI(?:-generated|[- ]assisted| assistance)\b/i;
const aiDisclosurePattern = /^>\s+\*\*AI-generated (?:research|historical) note[.:]\*\*/im;

export function isResearchComplete(body) {
  if (!body.trim()) return false;

  const lines = body.split(/\r?\n/);
  let previousIndex = -1;
  let firstHeadingIndex = -1;
  for (const headingPattern of requiredResearchHeadings) {
    const index = lines.findIndex((line, lineIndex) => (
      lineIndex > previousIndex && headingPattern.test(line)
    ));
    if (index === -1) return false;
    if (firstHeadingIndex === -1) firstHeadingIndex = index;
    previousIndex = index;
  }

  const preamble = lines.slice(0, firstHeadingIndex).join("\n");
  return !aiReferencePattern.test(preamble) || aiDisclosurePattern.test(preamble);
}
