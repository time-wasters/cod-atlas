type ContentUpdateGame = {
  id: string;
  code: string;
};

type ContentUpdateAtlasEntry = {
  id: string;
  levelId: string;
  title: string;
  primary: boolean;
  gameIds: string[];
  contentUpdate?: { id: string; label: string } | null;
  coordinates?: [number, number] | null;
  modes: ("singleplayer" | "multiplayer" | "special-ops" | "zombies")[];
};

type ContentUpdateAtlasGroup<TEntry extends ContentUpdateAtlasEntry> = {
  entries: TEntry[];
};

export type ContentUpdateOption<TGroup, TEntry> = {
  key: string;
  gameId: string;
  id: string;
  label: string;
  levels: { group: TGroup; entry: TEntry }[];
};

export function buildContentUpdateOptions<
  TEntry extends ContentUpdateAtlasEntry,
  TGroup extends ContentUpdateAtlasGroup<TEntry>,
>({
  gameCode,
  games,
  groups,
}: {
  gameCode: string;
  games: readonly ContentUpdateGame[];
  groups: readonly TGroup[];
}): ContentUpdateOption<TGroup, TEntry>[] {
  if (gameCode === "all") return [];

  const selectedGame = games.find((game) => game.code === gameCode);
  if (!selectedGame) return [];

  const updatesByKey = new Map<string, {
    key: string;
    gameId: string;
    id: string;
    label: string;
    locationsByLevelId: Map<string, { group: TGroup; entry: TEntry }[]>;
  }>();

  for (const group of groups) {
    for (const entry of group.entries) {
      if (entry.gameIds[0] !== selectedGame.id || !entry.contentUpdate) continue;
      if (!entry.modes.some((mode) => (
        mode === "multiplayer" || mode === "special-ops" || mode === "zombies"
      ))) continue;

      const key = `${selectedGame.id}:${entry.contentUpdate.id}`;
      let update = updatesByKey.get(key);
      if (!update) {
        update = {
          key,
          gameId: selectedGame.id,
          id: entry.contentUpdate.id,
          label: entry.contentUpdate.label,
          locationsByLevelId: new Map(),
        };
        updatesByKey.set(key, update);
      }

      const locations = update.locationsByLevelId.get(entry.levelId) ?? [];
      locations.push({ group, entry });
      update.locationsByLevelId.set(entry.levelId, locations);
    }
  }

  return [...updatesByKey.values()]
    .map(({ key, gameId, id, label, locationsByLevelId }) => ({
      key,
      gameId,
      id,
      label,
      levels: [...locationsByLevelId.values()]
        .map((locations) => locations.find(({ entry }) => entry.primary)
          ?? locations.find(({ entry }) => entry.coordinates)
          ?? locations[0])
        .filter((selection): selection is { group: TGroup; entry: TEntry } => Boolean(selection))
        .sort((left, right) => left.entry.title.localeCompare(right.entry.title)),
    }))
    .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true })
      || left.label.localeCompare(right.label));
}
