export function normalizeWikiTitle(value) {
  return value?.replace(/_/g, " ").trim().toLocaleLowerCase("en-US") ?? "";
}

export function wikiTitleFromSource(sourceUrl, wikiOrigin) {
  const url = new URL(sourceUrl);
  if (url.origin !== wikiOrigin) {
    throw new Error(`Wiki record origin does not match COD_ATLAS_WIKI_ORIGIN: ${sourceUrl}`);
  }
  const index = url.pathname.indexOf("/wiki/");
  if (index < 0) throw new Error(`Unsupported Wiki URL: ${sourceUrl}`);
  return decodeURIComponent(url.pathname.slice(index + 6));
}
