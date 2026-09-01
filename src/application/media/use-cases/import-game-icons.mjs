import path from "node:path";
import process from "node:process";
import { loadGameFileRecords } from "../../../infrastructure/content/filesystem/game-file.repository.mjs";
import { downloadGameIcon } from "../../../infrastructure/external/game-icons/game-icon.downloader.mjs";
import { resolveGameIconProviderConfiguration } from "../../../infrastructure/external/game-icons/game-icon-provider.configuration.mjs";
import { validateGameImageSource } from "../../../infrastructure/external/game-icons/game-image-source.validator.mjs";
import { writeGameIconManifest } from "../../../infrastructure/media/game-icons/game-icon-manifest.repository.mjs";
import { createGameIconRequests } from "./create-game-icon-requests.mjs";

export async function importGameIcons({
  contentRoot = path.join(process.cwd(), "content/games"),
  outputRoot = path.join(process.cwd(), "public/images/games_external"),
  environment = process.env,
  fetchImplementation = fetch,
  strict = false,
} = {}) {
  const configuration = resolveGameIconProviderConfiguration(environment);
  if (!configuration.steamTemplate && !configuration.steamGridDbTemplate) {
    return { enabled: false, imported: 0, manifest: {} };
  }

  const records = await loadGameFileRecords(contentRoot);
  for (const { filename, game } of records) validateGameImageSource(game, filename);
  const requests = records.flatMap(({ game }) => createGameIconRequests(game, configuration));
  const manifest = {};
  const failures = [];
  let cached = 0;
  for (const request of requests) {
    try {
      const imported = await downloadGameIcon(request, outputRoot, fetchImplementation);
      if (imported.cached) cached += 1;
      manifest[request.gameId] ??= {};
      manifest[request.gameId][request.kind] = {
        provider: request.provider,
        path: imported.publicPath,
      };
    } catch (error) {
      if (strict) throw error;
      failures.push({
        gameId: request.gameId,
        provider: request.provider,
        kind: request.kind,
        message: error.message,
      });
    }
  }
  await writeGameIconManifest(outputRoot, manifest);
  return {
    enabled: true,
    imported: requests.length - failures.length - cached,
    cached,
    failed: failures.length,
    failures,
    manifest,
  };
}
