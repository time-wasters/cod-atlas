type CampaignGame = {
  id: string;
  code: string;
  label: string;
  released: string;
};

type CampaignAtlasEntry = {
  id: string;
  levelId: string;
  title: string;
  primary: boolean;
  gameIds: string[];
  campaign?: { id: string; label: string } | null;
  campaignOrder?: number;
  coordinates?: [number, number] | null;
};

type CampaignAtlasGroup<TEntry extends CampaignAtlasEntry> = {
  entries: TEntry[];
};

export type CampaignOption<TGroup, TEntry> = {
  key: string;
  gameId: string;
  id: string;
  label: string;
  levels: { group: TGroup; entry: TEntry }[];
  routeLevels: {
    entryId: string | null;
    levelId: string;
    title: string;
    order: number | null;
    coordinates: [number, number] | null;
  }[];
};

type BuildCampaignOptionsInput<
  TEntry extends CampaignAtlasEntry,
  TGroup extends CampaignAtlasGroup<TEntry>,
> = {
  gameCode: string;
  games: readonly CampaignGame[];
  groups: readonly TGroup[];
};

export function buildCampaignOptions<
  TEntry extends CampaignAtlasEntry,
  TGroup extends CampaignAtlasGroup<TEntry>,
>({ gameCode, games, groups }: BuildCampaignOptionsInput<TEntry, TGroup>): CampaignOption<TGroup, TEntry>[] {
  if (gameCode === "all") return [];

  const gamesById = new Map(games.map((game) => [game.id, game]));
  const campaignsByKey = new Map<string, {
    key: string;
    gameId: string;
    id: string;
    label: string;
    locationsByLevelId: Map<string, { group: TGroup; entry: TEntry }[]>;
  }>();

  for (const group of groups) {
    for (const entry of group.entries) {
      if (!entry.campaign) continue;
      const campaignGame = gamesById.get(entry.gameIds[0] ?? "");
      if (!campaignGame || campaignGame.code !== gameCode) continue;

      const key = `${campaignGame.id}:${entry.campaign.id}`;
      let campaign = campaignsByKey.get(key);
      if (!campaign) {
        campaign = {
          key,
          gameId: campaignGame.id,
          id: entry.campaign.id,
          label: entry.campaign.label,
          locationsByLevelId: new Map(),
        };
        campaignsByKey.set(key, campaign);
      }

      const levelLocations = campaign.locationsByLevelId.get(entry.levelId) ?? [];
      levelLocations.push({ group, entry });
      campaign.locationsByLevelId.set(entry.levelId, levelLocations);
    }
  }

  return [...campaignsByKey.values()]
    .map(({ key, gameId, id, label, locationsByLevelId }) => {
      const orderedLevels = [...locationsByLevelId.values()]
        .map((locations) => {
          const primaryLocation = locations.find(({ entry }) => entry.primary) ?? null;
          const mappedLocations = locations.filter(({ entry }) => entry.coordinates !== null);
          const displayLocation = primaryLocation ?? mappedLocations[0] ?? locations[0];
          if (!displayLocation) throw new Error(`Campaign ${key} contains an empty level`);

          const mappedPrimaryLocation = primaryLocation?.entry.coordinates ? primaryLocation : null;
          const routeLocation = mappedPrimaryLocation
            ?? (mappedLocations.length === 1 ? mappedLocations[0] : null);

          return {
            displayLocation,
            routeLevel: {
              entryId: routeLocation?.entry.id ?? null,
              levelId: displayLocation.entry.levelId,
              title: displayLocation.entry.title,
              order: displayLocation.entry.campaignOrder ?? null,
              coordinates: routeLocation?.entry.coordinates ?? null,
            },
          };
        })
        .sort((left, right) =>
          (left.displayLocation.entry.campaignOrder ?? Number.MAX_SAFE_INTEGER)
            - (right.displayLocation.entry.campaignOrder ?? Number.MAX_SAFE_INTEGER)
          || left.displayLocation.entry.title.localeCompare(right.displayLocation.entry.title));

      return {
        key,
        gameId,
        id,
        label,
        levels: orderedLevels.map(({ displayLocation }) => displayLocation),
        routeLevels: orderedLevels.map(({ routeLevel }) => routeLevel),
      };
    })
    .sort((left, right) => {
      const leftGame = gamesById.get(left.gameId);
      const rightGame = gamesById.get(right.gameId);
      const gameComparison = leftGame && rightGame
        ? leftGame.released.localeCompare(rightGame.released) || leftGame.label.localeCompare(rightGame.label)
        : 0;
      if (gameComparison) return gameComparison;

      return (left.levels[0]?.entry.campaignOrder ?? Number.MAX_SAFE_INTEGER)
        - (right.levels[0]?.entry.campaignOrder ?? Number.MAX_SAFE_INTEGER)
        || left.label.localeCompare(right.label);
    });
}
