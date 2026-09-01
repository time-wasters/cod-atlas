import { normalizeWikiTitle } from "./wiki-title.value-object.mjs";

export function hasSequenceMetadata(article, articleLookup = new Map()) {
  if (!["previousLevels", "nextLevels", "games", "date"].every((field) => Object.hasOwn(article, field))) return false;
  return [article.previousLevels, article.nextLevels].every((references) =>
    Array.isArray(references?.links) && references.links.every((link) => {
      if (!Object.hasOwn(link, "sequence") || !["game", "chronological"].includes(link.sequence)) return false;
      if (!Object.hasOwn(link, "article")) return false;
      const resolvableArticle = articleLookup.get(normalizeWikiTitle(link.wikiTitle));
      return !resolvableArticle || link.article === resolvableArticle;
    }));
}
