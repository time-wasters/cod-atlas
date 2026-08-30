import { parseWikiMarkupText } from "./wiki-markup-text.parser.mjs";

export function parseWikiValue(value) {
  return value ? { raw: value.trim(), label: parseWikiMarkupText(value) } : { raw: null, label: null };
}
