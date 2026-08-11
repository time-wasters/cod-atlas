import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const HASH_PATTERN = /^[a-f0-9]{40}$/;
const FILE_PATTERN = /^[a-f0-9]{32}\.(?:ico|jpe?g|png|webp)$/;

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function configuredTemplate(value, name, requiredPlaceholders) {
  const template = value?.trim();
  if (!template) return null;
  let example;
  try {
    example = new URL(template.replaceAll("%app%", "1").replaceAll("%icon%", "a").replaceAll("%game%", "1").replaceAll("%file%", "a.png"));
  } catch {
    throw new Error(`${name} must be a valid URL template`);
  }
  requireValue(example.protocol === "https:", `${name} must use HTTPS`);
  for (const placeholder of requiredPlaceholders) {
    requireValue(template.includes(placeholder), `${name} must include ${placeholder}`);
  }
  return template;
}

export function resolveIconConfiguration(environment = process.env) {
  return {
    steamTemplate: configuredTemplate(environment.STEAM_ICON_URL, "STEAM_ICON_URL", ["%app%", "%icon%", "%extension%"]),
    steamGridDbTemplate: configuredTemplate(environment.STEAMGRIDDB_ICON_URL, "STEAMGRIDDB_ICON_URL", ["%file%"]),
  };
}

export function validateGameImageSource(game, filename = game.id) {
  const images = game.images;
  if (!images) return;
  requireValue(images && typeof images === "object" && !Array.isArray(images), `${filename}: images must be an object`);
  const providers = Object.keys(images);
  requireValue(providers.length === 1, `${filename}: images must contain exactly one provider`);
  const provider = providers[0];
  requireValue(provider === "steam" || provider === "steamgriddb", `${filename}: unknown image provider ${provider}`);
  if (provider === "steam") {
    const steam = images.steam;
    requireValue(Number.isInteger(steam?.app) && steam.app > 0, `${filename}: images.steam.app must be a positive integer`);
    requireValue(HASH_PATTERN.test(steam?.icon ?? ""), `${filename}: images.steam.icon must be a 40-character lowercase hexadecimal hash`);
    requireValue(steam.clienticon == null || HASH_PATTERN.test(steam.clienticon), `${filename}: images.steam.clienticon must be null or a 40-character lowercase hexadecimal hash`);
  } else {
    const steamGridDb = images.steamgriddb;
    requireValue(Number.isInteger(steamGridDb?.game) && steamGridDb.game > 0, `${filename}: images.steamgriddb.game must be a positive integer`);
    requireValue(Number.isInteger(steamGridDb?.icon) && steamGridDb.icon > 0, `${filename}: images.steamgriddb.icon must be a positive integer`);
    requireValue(FILE_PATTERN.test(steamGridDb?.file ?? ""), `${filename}: images.steamgriddb.file is invalid`);
  }
}

export function iconRequestsForGame(game, configuration) {
  validateGameImageSource(game);
  if (game.images?.steam && configuration.steamTemplate) {
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
      url: configuration.steamTemplate
        .replaceAll("%app%", encodeURIComponent(String(steam.app)))
        .replaceAll("%icon%", encodeURIComponent(hash))
        .replaceAll("%extension%", extension),
      relativePath: `steam/${game.id}/${kind}.${extension}`,
      };
    });
  }
  if (game.images?.steamgriddb && configuration.steamGridDbTemplate) {
    const steamGridDb = game.images.steamgriddb;
    return [{
      gameId: game.id,
      provider: "steamgriddb",
      kind: "icon",
      url: configuration.steamGridDbTemplate
        .replaceAll("%game%", encodeURIComponent(String(steamGridDb.game)))
        .replaceAll("%icon%", encodeURIComponent(String(steamGridDb.icon)))
        .replaceAll("%file%", encodeURIComponent(steamGridDb.file)),
      relativePath: `steamgriddb/${game.id}/icon${path.extname(steamGridDb.file)}`,
    }];
  }
  return [];
}

function detectedImageType(buffer) {
  if (buffer.length >= 4 && buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") return "png";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length >= 4 && buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) return "ico";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

async function downloadIcon(request, outputRoot, fetchImplementation) {
  const destination = path.join(outputRoot, ...request.relativePath.split("/"));
  const expectedExtension = path.extname(request.relativePath).slice(1).replace("jpeg", "jpg");
  try {
    const cached = await readFile(destination);
    if (cached.length > 0 && cached.length <= MAX_IMAGE_BYTES && detectedImageType(cached) === expectedExtension) {
      return { publicPath: `/images/games_external/${request.relativePath}`, cached: true };
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const response = await fetchImplementation(request.url, { redirect: "follow" });
  requireValue(response.ok, `${request.gameId}: ${request.provider} ${request.kind} returned HTTP ${response.status}`);
  const declaredLength = Number(response.headers.get("content-length"));
  requireValue(!Number.isFinite(declaredLength) || declaredLength <= MAX_IMAGE_BYTES, `${request.gameId}: downloaded icon exceeds 5 MiB`);
  const buffer = Buffer.from(await response.arrayBuffer());
  requireValue(buffer.length > 0 && buffer.length <= MAX_IMAGE_BYTES, `${request.gameId}: downloaded icon is empty or exceeds 5 MiB`);
  const imageType = detectedImageType(buffer);
  requireValue(imageType, `${request.gameId}: downloaded ${request.provider} ${request.kind} is not a supported image`);
  requireValue(imageType === expectedExtension, `${request.gameId}: downloaded ${imageType} does not match .${expectedExtension} output`);

  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.tmp-${process.pid}`;
  await writeFile(temporary, buffer);
  await rename(temporary, destination);
  return { publicPath: `/images/games_external/${request.relativePath}`, cached: false };
}

export async function importGameIcons({
  contentRoot = path.join(process.cwd(), "content/games"),
  outputRoot = path.join(process.cwd(), "public/images/games_external"),
  environment = process.env,
  fetchImplementation = fetch,
  strict = false,
} = {}) {
  const configuration = resolveIconConfiguration(environment);
  if (!configuration.steamTemplate && !configuration.steamGridDbTemplate) {
    return { enabled: false, imported: 0, manifest: {} };
  }

  const filenames = (await readdir(contentRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
    .map((entry) => path.join(contentRoot, entry.name))
    .sort();
  const games = await Promise.all(filenames.map(async (filename) => {
    const game = YAML.parse(await readFile(filename, "utf8"));
    validateGameImageSource(game, filename);
    return game;
  }));
  const requests = games.flatMap((game) => iconRequestsForGame(game, configuration));
  const manifest = {};
  const failures = [];
  let cached = 0;
  for (const request of requests) {
    try {
      const imported = await downloadIcon(request, outputRoot, fetchImplementation);
      if (imported.cached) cached += 1;
      manifest[request.gameId] ??= {};
      manifest[request.gameId][request.kind] = { provider: request.provider, path: imported.publicPath };
    } catch (error) {
      if (strict) throw error;
      failures.push({ gameId: request.gameId, provider: request.provider, kind: request.kind, message: error.message });
    }
  }
  await mkdir(outputRoot, { recursive: true });
  const manifestPath = path.join(outputRoot, "manifest.json");
  const temporaryManifest = `${manifestPath}.tmp-${process.pid}`;
  await writeFile(temporaryManifest, `${JSON.stringify(manifest, null, 2)}\n`);
  await rename(temporaryManifest, manifestPath);
  return {
    enabled: true,
    imported: requests.length - failures.length - cached,
    cached,
    failed: failures.length,
    failures,
    manifest,
  };
}

async function main() {
  const result = await importGameIcons();
  if (!result.enabled) {
    console.log("External game icon import skipped; STEAM_ICON_URL and STEAMGRIDDB_ICON_URL are not configured.");
    return;
  }
  for (const failure of result.failures) {
    console.warn(`External icon unavailable: ${failure.gameId} ${failure.provider} ${failure.kind}: ${failure.message}`);
  }
  console.log(`Imported ${result.imported} external game icons; reused ${result.cached} cached${result.failed ? `; ${result.failed} unavailable` : ""}.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(`Game icon import failed: ${error.message}`);
    process.exitCode = 1;
  });
}
