export function selectWikiArticleIdsForGames(levels, gameIds) {
  const selectedGames = new Set(gameIds);
  const canonicalById = new Map(levels.filter((level) => level.id).map((level) => [level.id, level]));
  return [...new Set(levels.flatMap((level) => {
    if (level.games?.some((gameId) => selectedGames.has(gameId))) return [level.wikiArticle];
    if (level.level && selectedGames.has(level.appearanceGame)) {
      return [level.wikiArticle ?? canonicalById.get(level.level)?.wikiArticle];
    }
    return [];
  }).filter(Boolean))].sort();
}
