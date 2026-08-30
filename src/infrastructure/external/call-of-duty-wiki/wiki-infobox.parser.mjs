function splitTopLevel(value, separator) {
  const parts = [];
  let start = 0;
  let curly = 0;
  let square = 0;
  for (let index = 0; index < value.length; index += 1) {
    const pair = value.slice(index, index + 2);
    if (pair === "{{") { curly += 1; index += 1; }
    else if (pair === "}}") { curly = Math.max(0, curly - 1); index += 1; }
    else if (pair === "[[") { square += 1; index += 1; }
    else if (pair === "]]" ) { square = Math.max(0, square - 1); index += 1; }
    else if (value[index] === separator && curly === 0 && square === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

export function extractInfobox(wikitext) {
  const match = /{{\s*infobox\b/i.exec(wikitext);
  if (!match) return {};
  let depth = 0;
  let end = wikitext.length;
  for (let index = match.index; index < wikitext.length - 1; index += 1) {
    const pair = wikitext.slice(index, index + 2);
    if (pair === "{{") { depth += 1; index += 1; }
    else if (pair === "}}") {
      depth -= 1;
      index += 1;
      if (depth === 0) { end = index + 1; break; }
    }
  }
  const parameters = {};
  for (const part of splitTopLevel(wikitext.slice(match.index + 2, end - 2), "|").slice(1)) {
    const pieces = splitTopLevel(part, "=");
    if (pieces.length < 2) continue;
    const name = pieces.shift().trim().toLowerCase().replace(/[ _-]+/g, "_");
    parameters[name] = pieces.join("=").trim();
  }
  return parameters;
}
