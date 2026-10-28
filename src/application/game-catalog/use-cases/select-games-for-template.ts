export type GameTemplate = {
  series: ReadonlySet<string>;
  subseries: ReadonlySet<string>;
  developers: ReadonlySet<string>;
};

type TemplateGame = {
  code: string;
  series: string;
  subseries: string[];
  developer: { id: string }[];
};

/** Select a starting set of games; individual checkboxes can then customize it. */
export function selectGamesForTemplate(games: readonly TemplateGame[], template: GameTemplate) {
  return new Set(games.filter((game) =>
    (template.series.size === 0 || template.series.has(game.series))
    && (template.subseries.size === 0 || game.subseries.some((value) => template.subseries.has(value)))
    && (template.developers.size === 0 || game.developer.some((developer) => template.developers.has(developer.id))),
  ).map((game) => game.code));
}
