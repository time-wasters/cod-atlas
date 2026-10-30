/**
 * @typedef {{ code: string, label: string, released: string }} RepresentedGame
 * @typedef {{ game: string }} GameAppearance
 */

/** @param {string} value */
function gameCodes(value) {
  return value.split(" / ").filter((code) => code && code !== "MP");
}

/**
 * @template {RepresentedGame} TGame
 * @param {readonly TGame[]} games
 * @param {readonly { entries: GameAppearance[] }[]} groups
 * @returns {TGame[]}
 */
export function listRepresentedGames(games, groups) {
  const representedCodes = new Set(
    groups.flatMap((group) => group.entries.flatMap((entry) => gameCodes(entry.game))),
  );
  return games
    .filter((game) => representedCodes.has(game.code))
    .sort((left, right) => left.released.localeCompare(right.released) || left.label.localeCompare(right.label));
}
