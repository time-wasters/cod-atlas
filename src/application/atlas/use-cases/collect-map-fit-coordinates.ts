type LocatedAtlasEntry = {
  coordinates?: [number, number] | null;
};

type LocatedAtlasGroup<TEntry extends LocatedAtlasEntry> = {
  entries: TEntry[];
};

export function collectMapFitCoordinates<
  TEntry extends LocatedAtlasEntry,
  TGroup extends LocatedAtlasGroup<TEntry>,
>(groups: readonly TGroup[]): [number, number][] {
  const seen = new Set<string>();
  return groups.flatMap((group) => group.entries.flatMap((entry) => {
    if (!entry.coordinates) return [];
    const key = entry.coordinates.join(",");
    if (seen.has(key)) return [];
    seen.add(key);
    return [entry.coordinates];
  }));
}
