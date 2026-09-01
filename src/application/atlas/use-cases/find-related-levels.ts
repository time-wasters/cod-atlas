type RelatedAtlasEntry = {
  id: string;
  levelId: string;
};

type RelatedAtlasGroup<TEntry extends RelatedAtlasEntry> = {
  entries: TEntry[];
};

export type RelatedLevelSelection<TGroup, TEntry> = {
  group: TGroup;
  entry: TEntry;
};

type FindRelatedLevelsInput<
  TEntry extends RelatedAtlasEntry,
  TGroup extends RelatedAtlasGroup<TEntry>,
> = {
  groups: readonly TGroup[];
  selected: RelatedLevelSelection<TGroup, TEntry>;
  campaignLevels?: readonly RelatedLevelSelection<TGroup, TEntry>[] | null;
};

export function findRelatedLevels<
  TEntry extends RelatedAtlasEntry,
  TGroup extends RelatedAtlasGroup<TEntry>,
>({ groups, selected, campaignLevels }: FindRelatedLevelsInput<TEntry, TGroup>): {
  otherLevelLocations: RelatedLevelSelection<TGroup, TEntry>[];
  relatedLevels: RelatedLevelSelection<TGroup, TEntry>[];
} {
  const otherLevelLocations = groups.flatMap((group) => group.entries
    .filter((entry) => entry.levelId === selected.entry.levelId && entry.id !== selected.entry.id)
    .map((entry) => ({ group, entry })));

  const regionalLevels = selected.group.entries.filter((entry, index, entries) =>
    entry.levelId !== selected.entry.levelId
    && entries.findIndex((candidate) => candidate.levelId === entry.levelId) === index);
  const relatedLevels = campaignLevels
    ? [...campaignLevels]
    : regionalLevels.map((entry) => ({ group: selected.group, entry }));

  return { otherLevelLocations, relatedLevels };
}
