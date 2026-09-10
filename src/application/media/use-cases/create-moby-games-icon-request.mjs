import path from "node:path";

export function createMobyGamesIconRequest(game, template) {
  if (!game.images?.mobygames || !template) return [];
  const mobyGames = game.images.mobygames;
  return [{
    gameId: game.id,
    provider: "mobygames",
    kind: "icon",
    url: template
      .replaceAll("%game%", encodeURIComponent(String(mobyGames.game)))
      .replaceAll("%icon%", encodeURIComponent(mobyGames.icon))
      .replaceAll("%file%", encodeURIComponent(mobyGames.file)),
    relativePath: `mobygames/${game.id}/icon${path.extname(mobyGames.file).toLowerCase()}`,
  }];
}
