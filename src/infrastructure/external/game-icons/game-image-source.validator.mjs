const HASH_PATTERN = /^[a-f0-9]{40}$/;
const FILE_PATTERN = /^[a-f0-9]{32}\.(?:ico|jpe?g|png|webp)$/;
const MOBYGAMES_ICON_PATTERN = /^cover-[1-9]\d*$/;
const MOBYGAMES_FILE_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:jpe?g|png|webp)$/;

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

export function validateGameImageSource(game, filename = game.id) {
  const images = game.images;
  if (!images) return;
  requireValue(images && typeof images === "object" && !Array.isArray(images), `${filename}: images must be an object`);
  const providers = Object.keys(images);
  requireValue(providers.length === 1, `${filename}: images must contain exactly one provider`);
  const provider = providers[0];
  requireValue(
    provider === "steam" || provider === "steamgriddb" || provider === "mobygames",
    `${filename}: unknown image provider ${provider}`,
  );
  if (provider === "steam") {
    const steam = images.steam;
    requireValue(Number.isInteger(steam?.app) && steam.app > 0, `${filename}: images.steam.app must be a positive integer`);
    requireValue(HASH_PATTERN.test(steam?.icon ?? ""), `${filename}: images.steam.icon must be a 40-character lowercase hexadecimal hash`);
    requireValue(
      steam.clienticon == null || HASH_PATTERN.test(steam.clienticon),
      `${filename}: images.steam.clienticon must be null or a 40-character lowercase hexadecimal hash`,
    );
  } else if (provider === "steamgriddb") {
    const steamGridDb = images.steamgriddb;
    requireValue(
      Number.isInteger(steamGridDb?.game) && steamGridDb.game > 0,
      `${filename}: images.steamgriddb.game must be a positive integer`,
    );
    requireValue(
      Number.isInteger(steamGridDb?.icon) && steamGridDb.icon > 0,
      `${filename}: images.steamgriddb.icon must be a positive integer`,
    );
    requireValue(FILE_PATTERN.test(steamGridDb?.file ?? ""), `${filename}: images.steamgriddb.file is invalid`);
  } else {
    const mobyGames = images.mobygames;
    requireValue(
      Number.isInteger(mobyGames?.game) && mobyGames.game > 0,
      `${filename}: images.mobygames.game must be a positive integer`,
    );
    requireValue(
      MOBYGAMES_ICON_PATTERN.test(mobyGames?.icon ?? ""),
      `${filename}: images.mobygames.icon must use the cover-<id> format`,
    );
    requireValue(
      MOBYGAMES_FILE_PATTERN.test(mobyGames?.file ?? ""),
      `${filename}: images.mobygames.file is invalid`,
    );
  }
}
