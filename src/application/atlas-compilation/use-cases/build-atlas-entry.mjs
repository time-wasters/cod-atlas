export function buildAtlasEntry({
  appearances,
  gameCodes,
  level,
  location,
  wikiUrl,
}) {
  const coordinates = Number.isFinite(location.latitude)
    ? [location.latitude, location.longitude]
    : null;

  return {
    id: `${level.id}:${location.id}`,
    levelId: level.id,
    locationId: location.id,
    primary: location.primary === true,
    title: level.title,
    game: gameCodes,
    gameIds: appearances.map((appearance) => appearance.gameId),
    appearances,
    ...(level.campaign ? { campaign: level.campaign } : {}),
    ...(level.campaignOrder ? { campaignOrder: level.campaignOrder } : {}),
    wiki: wikiUrl,
    wikiArticle: level.wikiArticle,
    country: location.country,
    city: location.city ?? null,
    region: location.region ?? null,
    landmark: location.landmark ?? null,
    coordinates,
    precision: location.precision,
    confidence: location.confidence ?? (location.precision === "country" ? "fallback" : "medium"),
    method: location.method ?? null,
    ...(location.urls ? { urls: location.urls } : {}),
    hasLevelNotes: Boolean(level.notes.trim()),
    modes: [level.mode],
  };
}
