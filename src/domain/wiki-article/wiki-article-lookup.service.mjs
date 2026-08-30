import { normalizeWikiTitle, wikiTitleFromSource } from "./wiki-title.value-object.mjs";

export function buildWikiArticleLookup(records, wikiOrigin) {
  const idsByTitle = new Map();
  const add = (title, id) => {
    const normalized = normalizeWikiTitle(title);
    if (!normalized) return;
    if (!idsByTitle.has(normalized)) idsByTitle.set(normalized, new Set());
    idsByTitle.get(normalized).add(id);
  };

  for (const record of records) {
    const article = record.article ?? record;
    for (const field of ["sourceUrl", "canonicalUrl"]) {
      if (article[field]) add(wikiTitleFromSource(article[field], wikiOrigin), article.id);
    }
    add(article.rawPayload?.resolvedTitle, article.id);
  }

  return new Map([...idsByTitle].map(([title, ids]) => [title, ids.size === 1 ? [...ids][0] : null]));
}
