import type { AtlasDataIndexPort } from "../../../application/atlas/ports/atlas-data-index.port.js";
import type { AtlasDataDto } from "../dto/atlas-data.dto.js";
import type { AtlasEntryDto } from "../dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../dto/atlas-group.dto.js";
import type { GameDto } from "../dto/game.dto.js";

export type IndexedAtlasSelection = {
  group: AtlasGroupDto;
  entry: AtlasEntryDto;
};

export class AtlasDataIndex implements AtlasDataIndexPort<GameDto, IndexedAtlasSelection> {
  private readonly gamesById: Map<string, GameDto>;
  private readonly gamesByCode: Map<string, GameDto>;
  private readonly countryNames: Set<string>;
  private readonly selections: IndexedAtlasSelection[];
  private readonly selectionsByEntryId: Map<string, IndexedAtlasSelection>;

  constructor(private readonly data: AtlasDataDto) {
    this.gamesById = new Map(data.games.map((game) => [game.id, game]));
    this.gamesByCode = new Map(data.games.map((game) => [game.code, game]));
    this.countryNames = new Set(data.groups.map((group) => group.name));
    this.selections = data.groups.flatMap((group) => (
      group.entries.map((entry) => ({ group, entry }))
    ));
    this.selectionsByEntryId = new Map(
      this.selections.map((selection) => [selection.entry.id, selection]),
    );
  }

  findGameById(gameId: string): GameDto | undefined {
    return this.gamesById.get(gameId);
  }

  findGameByCode(gameCode: string): GameDto | undefined {
    return this.gamesByCode.get(gameCode);
  }

  hasCountry(country: string): boolean {
    return this.countryNames.has(country);
  }

  resolveLevelId(levelId: string): string {
    return this.data.levelIdAliases[levelId] ?? levelId;
  }

  findSelectionByEntryId(entryId: string | null): IndexedAtlasSelection | undefined {
    return entryId === null ? undefined : this.selectionsByEntryId.get(entryId);
  }

  findSelectionByLevelId(
    levelId: string,
    locationId: string | null = null,
  ): IndexedAtlasSelection | undefined {
    return this.selections.find(({ entry }) => (
      entry.levelId === levelId && (!locationId || entry.locationId === locationId)
    ));
  }
}
