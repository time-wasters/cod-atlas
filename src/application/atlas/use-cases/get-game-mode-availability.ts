type AtlasMode = "singleplayer" | "multiplayer" | "zombies" | "other";

type ModeAvailabilityEntry = {
  gameIds: string[];
  modes: AtlasMode[];
};

type ModeAvailabilityGroup = {
  entries: ModeAvailabilityEntry[];
};

type ModeAvailabilityGame = {
  id: string;
  code: string;
};

export type GameModeAvailability = Record<AtlasMode, boolean>;

const ALL_MODES_AVAILABLE: GameModeAvailability = {
  singleplayer: true,
  multiplayer: true,
  zombies: true,
  other: true,
};

export function getGameModeAvailability({
  gameCodes,
  games,
  groups,
}: {
  gameCodes: ReadonlySet<string>;
  games: readonly ModeAvailabilityGame[];
  groups: readonly ModeAvailabilityGroup[];
}): GameModeAvailability {
  if (gameCodes.size === 0) return ALL_MODES_AVAILABLE;

  const gameIds = new Set(games.filter((game) => gameCodes.has(game.code)).map((game) => game.id));
  const availability: GameModeAvailability = {
    singleplayer: false,
    multiplayer: false,
    zombies: false,
    other: false,
  };

  for (const entry of groups.flatMap((group) => group.entries)) {
    if (!entry.gameIds.some((gameId) => gameIds.has(gameId))) continue;
    for (const mode of entry.modes) availability[mode] = true;
  }

  return availability;
}
