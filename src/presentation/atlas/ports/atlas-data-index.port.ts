import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";
import type { AtlasSelection } from "../models/initial-atlas-selection.js";

export type AtlasDataIndexPort = {
  findGameById: (gameId: string) => GameDto | undefined;
  findGameByCode: (gameCode: string) => GameDto | undefined;
  hasCountry: (country: string) => boolean;
  resolveLevelId: (levelId: string) => string;
  findSelectionByEntryId: (entryId: string | null) => AtlasSelection | undefined;
  findSelectionByLevelId: (levelId: string, locationId: string | null) => AtlasSelection | undefined;
};
