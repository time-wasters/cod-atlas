type RepresentedGame = {
  code: string;
  label: string;
  released: string;
};

type GameAppearance = {
  game: string;
};

type GameAppearanceGroup<TEntry extends GameAppearance> = {
  entries: TEntry[];
};

function gameCodes(value: string) {
  return value.split(" / ").filter((code) => code && code !== "MP");
}

export function listRepresentedGames<
  TGame extends RepresentedGame,
  TEntry extends GameAppearance,
  TGroup extends GameAppearanceGroup<TEntry>,
>(games: readonly TGame[], groups: readonly TGroup[]): TGame[] {
  const representedCodes = new Set(
    groups.flatMap((group) => group.entries.flatMap((entry) => gameCodes(entry.game))),
  );
  return games
    .filter((game) => representedCodes.has(game.code))
    .sort((left, right) => left.released.localeCompare(right.released) || left.label.localeCompare(right.label));
}
