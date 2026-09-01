type FilterableGame = {
  id: string;
  code: string;
  series: string;
  subseries: string | null;
};

type FilterableAtlasEntry = {
  game: string;
  gameIds: string[];
  title: string;
  region?: string | null;
  city?: string | null;
  landmark?: string | null;
  precision: string;
  confidence?: string;
  method?: string;
  modes: string[];
  appearances: { title: string }[];
};

type FilterableAtlasGroup<TEntry extends FilterableAtlasEntry> = {
  name: string;
  continent: string;
  flagCode: string | null;
  entries: TEntry[];
};

export type AtlasFilterCriteria = {
  query: string;
  gameCode: string;
  country: string;
  gameSeries: ReadonlySet<string>;
  gameSubseries: ReadonlySet<string>;
  continents: ReadonlySet<string>;
  precisions: ReadonlySet<string>;
  confidences: ReadonlySet<string>;
  methods: ReadonlySet<string>;
  showSingleplayer: boolean;
  showMultiplayer: boolean;
  showZombies: boolean;
};

export type CountryAvailability = {
  name: string;
  flagCode: string | null;
  available: boolean;
};

export type FilteredAtlasGroup<
  TEntry extends FilterableAtlasEntry,
  TGroup extends FilterableAtlasGroup<TEntry>,
> = Omit<TGroup, "entries"> & { entries: TEntry[] };

type FilterAtlasGroupsInput<
  TEntry extends FilterableAtlasEntry,
  TGroup extends FilterableAtlasGroup<TEntry>,
> = {
  groups: readonly TGroup[];
  games: readonly FilterableGame[];
  criteria: AtlasFilterCriteria;
};

export function filterAtlasGroups<
  TEntry extends FilterableAtlasEntry,
  TGroup extends FilterableAtlasGroup<TEntry>,
>({ groups, games, criteria }: FilterAtlasGroupsInput<TEntry, TGroup>): {
  groups: FilteredAtlasGroup<TEntry, TGroup>[];
  countries: CountryAvailability[];
} {
  const gamesById = new Map(games.map((game) => [game.id, game]));

  function matchesStructuredFilters(entry: TEntry) {
    const matchesGame = criteria.gameCode === "all"
      || entry.game.split(" / ").includes(criteria.gameCode);
    const matchesSeries = criteria.gameSeries.size === 0 || entry.gameIds.some((gameId) => {
      const entryGame = gamesById.get(gameId);
      return entryGame ? criteria.gameSeries.has(entryGame.series) : false;
    });
    const matchesSubseries = criteria.gameSubseries.size === 0 || entry.gameIds.some((gameId) => {
      const entryGame = gamesById.get(gameId);
      return entryGame?.subseries ? criteria.gameSubseries.has(entryGame.subseries) : false;
    });
    const matchesPrecision = criteria.precisions.size === 0 || criteria.precisions.has(entry.precision);
    const matchesConfidence = criteria.confidences.size === 0
      || (entry.confidence ? criteria.confidences.has(entry.confidence) : false);
    const matchesMethod = criteria.methods.size === 0
      || (entry.method ? criteria.methods.has(entry.method) : false);
    const matchesMode =
      (criteria.showSingleplayer && entry.modes.includes("singleplayer"))
      || (criteria.showMultiplayer && entry.modes.includes("multiplayer"))
      || (criteria.showZombies && entry.modes.includes("zombies"));

    return matchesGame
      && matchesSeries
      && matchesSubseries
      && matchesPrecision
      && matchesConfidence
      && matchesMethod
      && matchesMode;
  }

  const countries = groups
    .map(({ name, flagCode, continent, entries }) => ({
      name,
      flagCode,
      available: (criteria.continents.size === 0 || criteria.continents.has(continent))
        && entries.some(matchesStructuredFilters),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  const needle = criteria.query.trim().toLowerCase();
  const filteredGroups = groups
    .map((group): FilteredAtlasGroup<TEntry, TGroup> => ({
      ...group,
      entries: group.entries.filter((entry) => {
        const matchesText = !needle
          || group.name.toLowerCase().includes(needle)
          || entry.region?.toLowerCase().includes(needle)
          || entry.city?.toLowerCase().includes(needle)
          || entry.landmark?.toLowerCase().includes(needle)
          || entry.title.toLowerCase().includes(needle)
          || entry.appearances.some((appearance) => appearance.title.toLowerCase().includes(needle))
          || entry.game.toLowerCase().includes(needle);

        return matchesStructuredFilters(entry) && matchesText;
      }),
    }))
    .filter((group) => group.entries.length > 0
      && (criteria.country === "all" || group.name === criteria.country)
      && (criteria.continents.size === 0 || criteria.continents.has(group.continent)));

  return { groups: filteredGroups, countries };
}
