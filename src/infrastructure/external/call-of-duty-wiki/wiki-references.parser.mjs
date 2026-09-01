import { normalizeWikiTitle } from "../../../domain/wiki-article/wiki-title.value-object.mjs";
import { parseWikiMarkupText } from "./wiki-markup-text.parser.mjs";

export function parseWikiReferences(value, wikiOrigin, articleLookup = null) {
  if (!value) return { raw: null, label: null, links: [] };
  const matches = [...value.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g)];
  const links = matches.map((match, index) => {
    const wikiTitle = match[1].trim();
    const contextStart = match.index + match[0].length;
    const contextEnd = matches[index + 1]?.index ?? value.length;
    const sequenceContext = value.slice(contextStart, contextEnd);
    return {
      ...(articleLookup ? {
        sequence: /chronolog/i.test(sequenceContext) ? "chronological" : "game",
        article: articleLookup.get(normalizeWikiTitle(wikiTitle)) ?? null,
      } : {}),
      wikiTitle,
      label: parseWikiMarkupText(match[2] ?? match[1]),
      url: `${wikiOrigin}/wiki/${encodeURIComponent(wikiTitle.replace(/ /g, "_"))}`,
    };
  });
  return { raw: value.trim(), label: parseWikiMarkupText(value), links };
}
