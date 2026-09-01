import type { AtlasDataIndexPort } from "../../../application/atlas/ports/atlas-data-index.port.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";
import type { LevelGameViewModel } from "../components/level-details-panel.js";

export function buildLevelGamesViewModel(
  entry: AtlasEntryDto,
  dataIndex: Pick<AtlasDataIndexPort<GameDto, never>, "findGameById">,
  iconFor: (game: GameDto) => string | null | undefined,
): LevelGameViewModel[] {
  return entry.gameIds.flatMap((gameId) => {
    const game = dataIndex.findGameById(gameId);
    if (!game) return [];
    const icon = iconFor(game) ?? null;
    return [{
      game,
      icon,
      external: Boolean(icon && icon !== game.icon),
    }];
  });
}
