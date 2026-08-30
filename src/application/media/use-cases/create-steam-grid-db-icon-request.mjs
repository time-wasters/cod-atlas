import path from "node:path";

export function createSteamGridDbIconRequest(game, template) {
  if (!game.images?.steamgriddb || !template) return [];
  const steamGridDb = game.images.steamgriddb;
  return [{
    gameId: game.id,
    provider: "steamgriddb",
    kind: "icon",
    url: template
      .replaceAll("%game%", encodeURIComponent(String(steamGridDb.game)))
      .replaceAll("%icon%", encodeURIComponent(String(steamGridDb.icon)))
      .replaceAll("%file%", encodeURIComponent(steamGridDb.file)),
    relativePath: `steamgriddb/${game.id}/icon${path.extname(steamGridDb.file)}`,
  }];
}
