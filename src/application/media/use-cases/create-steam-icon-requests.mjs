export function createSteamIconRequests(game, template) {
  if (!game.images?.steam || !template) return [];
  const steam = game.images.steam;
  return [
    { kind: "icon", hash: steam.icon },
    ...(steam.clienticon ? [{ kind: "clienticon", hash: steam.clienticon }] : []),
  ].map(({ kind, hash }) => {
    const extension = kind === "icon" ? "jpg" : "ico";
    return {
      gameId: game.id,
      provider: "steam",
      kind,
      url: template
        .replaceAll("%app%", encodeURIComponent(String(steam.app)))
        .replaceAll("%icon%", encodeURIComponent(hash))
        .replaceAll("%extension%", extension),
      relativePath: `steam/${game.id}/${kind}.${extension}`,
    };
  });
}
