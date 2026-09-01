import { parseWikiMarkupText } from "./wiki-markup-text.parser.mjs";

export function parseWikiLink(value, wikiOrigin) {
  if (!value) return { raw: null, label: null, url: null };
  const match = value.match(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/);
  const target = match?.[1]?.trim();
  return {
    raw: value.trim(),
    label: parseWikiMarkupText(match?.[2] ?? match?.[1] ?? value),
    url: target ? `${wikiOrigin}/wiki/${encodeURIComponent(target.replace(/ /g, "_"))}` : null,
  };
}
