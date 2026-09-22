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
  gameCode,
  games,
  groups,
}: {
  gameCode: string;
  games: readonly ModeAvailabilityGame[];
  groups: readonly ModeAvailabilityGroup[];
}): GameModeAvailability {
  if (gameCode === "all") return ALL_MODES_AVAILABLE;

  const gameId = games.find((game) => game.code === gameCode)?.id;
  const availability: GameModeAvailability = {
    singleplayer: false,
    multiplayer: false,
    zombies: false,
    other: false,
  };
  if (!gameId) return availability;

  for (const entry of groups.flatMap((group) => group.entries)) {
    if (!entry.gameIds.includes(gameId)) continue;
    for (const mode of entry.modes) availability[mode] = true;
  }

  return availability;
}
