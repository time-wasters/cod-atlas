export type AtlasDataIndexPort<TGame, TSelection> = {
  findGameById: (gameId: string) => TGame | undefined;
  findGameByCode: (gameCode: string) => TGame | undefined;
  hasCountry: (country: string) => boolean;
  resolveLevelId: (levelId: string) => string;
  findSelectionByEntryId: (entryId: string | null) => TSelection | undefined;
  findSelectionByLevelId: (levelId: string, locationId: string | null) => TSelection | undefined;
};
