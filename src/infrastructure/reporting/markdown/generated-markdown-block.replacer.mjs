export function replaceGeneratedMarkdownBlock(document, startMarker, endMarker, generated) {
  const start = document.indexOf(startMarker);
  const end = document.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`docs/progress.md must contain one ordered ${startMarker} marker pair`);
  }
  if (document.indexOf(startMarker, start + startMarker.length) !== -1
    || document.indexOf(endMarker, end + endMarker.length) !== -1) {
    throw new Error(`docs/progress.md must contain exactly one ${startMarker} marker pair`);
  }
  return `${document.slice(0, start)}${generated}${document.slice(end + endMarker.length)}`;
}
