import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import countries from "world-countries";
import YAML from "yaml";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const levelsRoot = path.join(contentRoot, "levels");
const outputDirectory = path.join(root, "app/data");
const outputPath = path.join(outputDirectory, "atlas.generated.json");
const mapOverlaysOutputPath = path.join(outputDirectory, "map-overlays.generated.json");
const historyOverlaysOutputPath = path.join(outputDirectory, "history-overlays.generated.json");
const levelBannersRoot = path.join(root, "public/images/levels");
const checkOnly = process.argv.includes("--check");
const validModes = new Set(["singleplayer", "multiplayer", "zombies"]);
const mapTypeDirectoryByMode = new Map([
  ["singleplayer", "campaign"],
  ["multiplayer", "multiplayer"],
  ["zombies", "zombies"],
]);
const validPrecisions = new Set(["exact", "approximate", "city", "region", "country", "off-world"]);
const validConfidences = new Set(["high", "medium", "fallback"]);
const validGameSeries = new Set(["world-war-ii", "modern-warfare", "black-ops", "standalone"]);
const validGameSubseries = new Set(["main", "reboot", "remaster", "add-on", "spin-off"]);
const validMethods = new Set([
  "verified-landmark",
  "real-world-inspiration",
  "manual-approximate",
  "wiki-location",
  "article-context",
  "title",
  "title-mention",
  "region-fallback",
  "country-fallback",
]);
const validWikiSequences = new Set(["game", "chronological"]);
const countryAliases = new Map([
  ["Czech Republic (Czechia)", "Czechia"],
  ["Myanmar (Burma)", "Myanmar"],
  ["Turkey", "Türkiye"],
]);
const flagCodesByCountryName = new Map(countries.flatMap((country) => [
  [country.name.common, country.cca2],
  [country.name.official, country.cca2],
]));
const countriesByName = new Map(countries.flatMap((country) => [
  [country.name.common, country],
  [country.name.official, country],
]));
const specialContinents = new Map([
  ["Adriatic Sea", "Oceans"],
  ["Arctic Circle", "Arctic"],
  ["Atlantic Ocean", "Oceans"],
  ["Baltic Sea", "Oceans"],
  ["Bering Strait", "Oceans"],
  ["Caribbean Sea", "Oceans"],
  ["Dead Sea", "Oceans"],
  ["English Channel", "Oceans"],
  ["Europa (Jupiter Moon)", "Off-world"],
  ["Gulf of Mexico", "Oceans"],
  ["Indian Ocean", "Oceans"],
  ["Mars", "Off-world"],
  ["Mediterranean Sea", "Oceans"],
  ["Moon", "Off-world"],
  ["Pacific Ocean", "Oceans"],
  ["Philippine Sea", "Oceans"],
  ["Polynesia", "Oceania"],
  ["Space", "Off-world"],
]);

function flagCodeForGroup(name) {
  const countryName = countryAliases.get(name) ?? name;
  return flagCodesByCountryName.get(countryName) ?? null;
}

function continentForGroup(name) {
  const special = specialContinents.get(name);
  if (special) return special;
  const countryName = countryAliases.get(name) ?? name;
  const country = countriesByName.get(countryName);
  if (!country) return null;
  if (country.region === "Americas") {
    return country.subregion === "South America" ? "South America" : "North America";
  }
  return country.region === "Antarctic" ? "Antarctica" : country.region;
}

async function filesBelow(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesBelow(target, extension);
    return entry.name.endsWith(extension) ? [target] : [];
  }));
  return nested.flat();
}

function parseMarkdown(text, filename) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: missing YAML frontmatter`);
  return { data: YAML.parse(match[1]), body: match[2].trim() };
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function validateLocationUrl(value, field, filename, supportedHost) {
  if (value == null) return;
  requireValue(typeof value === "string", `${filename}: ${field} must be a URL string`);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${filename}: ${field} must be a valid URL`);
  }
  requireValue(url.protocol === "https:", `${filename}: ${field} must use HTTPS`);
  requireValue(supportedHost(url.hostname), `${filename}: ${field} uses an unsupported host ${url.hostname}`);
}

function validateLocationUrls(urls, filename) {
  if (urls == null) return;
  requireValue(Array.isArray(urls), `${filename}: location urls must be an array`);
  requireValue(urls.length > 0, `${filename}: location urls must not be empty`);
  const providers = new Map([
    ["googleMaps", (hostname) => hostname === "maps.app.goo.gl" || hostname === "maps.google.com" || hostname === "www.google.com"],
    ["wikipedia", (hostname) => hostname === "wikipedia.org" || hostname.endsWith(".wikipedia.org")],
    ["callOfDutyMaps", (hostname) => hostname === "callofdutymaps.com" || hostname === "www.callofdutymaps.com"],
  ]);
  const seenProviders = new Set();
  for (const item of urls) {
    requireValue(item && typeof item === "object" && !Array.isArray(item), `${filename}: each location URL must be an object`);
    const fields = Object.keys(item);
    requireValue(fields.length === 1, `${filename}: each location URL must contain exactly one provider`);
    const provider = fields[0];
    requireValue(providers.has(provider), `${filename}: unsupported location URL provider ${provider}`);
    requireValue(!seenProviders.has(provider), `${filename}: duplicate location URL provider ${provider}`);
    seenProviders.add(provider);
    validateLocationUrl(item[provider], `urls.${provider}`, filename, providers.get(provider));
  }
}

function validateHttpsUrl(value, field, filename) {
  requireValue(typeof value === "string" && value, `${filename}: ${field} is required`);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${filename}: ${field} must be a valid URL`);
  }
  requireValue(url.protocol === "https:", `${filename}: ${field} must use HTTPS`);
}

function validateWikiImage(image, field, filename) {
  if (!image?.sourceUrl) return;
  validateHttpsUrl(image.sourceUrl, `${field}.sourceUrl`, filename);
  validateHttpsUrl(image.thumbnailUrl, `${field}.thumbnailUrl`, filename);
  validateHttpsUrl(image.detailPageUrl, `${field}.detailPageUrl`, filename);
}

function validateWikiLevelReferences(article, filename, wikiArticles) {
  for (const field of ["previousLevels", "nextLevels"]) {
    const references = article[field];
    if (references == null) continue;
    requireValue(Array.isArray(references.links), `${filename}: ${field}.links must be an array`);
    for (const [index, link] of references.links.entries()) {
      const linkField = `${field}.links[${index}]`;
      requireValue(link && typeof link === "object" && !Array.isArray(link), `${filename}: ${linkField} must be an object`);
      const hasSequence = Object.hasOwn(link, "sequence");
      const hasArticle = Object.hasOwn(link, "article");
      requireValue(
        hasSequence === hasArticle,
        `${filename}: ${linkField}.sequence and ${linkField}.article must be added together`,
      );
      if (!hasSequence) continue;
      requireValue(validWikiSequences.has(link.sequence), `${filename}: ${linkField}.sequence is invalid`);
      requireValue(
        link.article === null || wikiArticles.has(link.article),
        `${filename}: ${linkField}.article references unknown Wiki article ${link.article}`,
      );
    }
  }
}

async function validateMapOverlay(overlay, levelId, filename) {
  requireValue(overlay && typeof overlay === "object" && !Array.isArray(overlay), `${filename}: mapOverlay must be an object`);
  requireValue(
    /^\/images\/(?:maps\/[a-z0-9/_-]+|levels\/[a-z0-9-]+\/[a-z0-9-]+\/maps\/briefing-map)\.png$/.test(overlay.image ?? ""),
    `${filename}: mapOverlay.image must be a local PNG under /images/maps/ or the level's maps/briefing-map.png`,
  );
  requireValue(Number.isFinite(overlay.opacity) && overlay.opacity > 0 && overlay.opacity <= 1, `${filename}: mapOverlay.opacity must be greater than 0 and at most 1`);
  for (const corner of ["topLeft", "topRight", "bottomLeft", "bottomRight"]) {
    const coordinates = overlay.corners?.[corner];
    requireValue(Array.isArray(coordinates) && coordinates.length === 2, `${filename}: mapOverlay.corners.${corner} must be [latitude, longitude]`);
    requireValue(Number.isFinite(coordinates[0]) && coordinates[0] >= -90 && coordinates[0] <= 90, `${filename}: mapOverlay.corners.${corner} latitude is invalid`);
    requireValue(Number.isFinite(coordinates[1]) && coordinates[1] >= -180 && coordinates[1] <= 180, `${filename}: mapOverlay.corners.${corner} longitude is invalid`);
  }
  const attribution = overlay.attribution;
  requireValue(attribution?.title && attribution.source && attribution.sourceUrl, `${filename}: mapOverlay attribution title, source and sourceUrl are required`);
  requireValue(attribution.extractedBy && attribution.extractedByUrl, `${filename}: mapOverlay extraction credit and URL are required`);
  requireValue(attribution.copyrightHolder, `${filename}: mapOverlay copyright holder is required`);
  requireValue(attribution.rights === "non-free", `${filename}: mapOverlay attribution rights must be non-free`);
  requireValue(attribution.rightsNotice && attribution.rightsNoticeUrl, `${filename}: mapOverlay non-free rights notice and URL are required`);
  for (const field of ["sourceUrl", "extractedByUrl", "rightsNoticeUrl"]) validateHttpsUrl(attribution[field], `mapOverlay.attribution.${field}`, filename);
  const imageFilename = path.join(root, "public", ...overlay.image.slice(1).split("/"));
  const image = await readFile(imageFilename);
  requireValue(image.length >= 8 && image[0] === 0x89 && image.toString("ascii", 1, 4) === "PNG", `${filename}: ${overlay.image} is not a PNG image`);
  return {
    levelId,
    image: overlay.image,
    opacity: overlay.opacity,
    corners: overlay.corners,
    attribution,
  };
}

async function validateHistoryOverlay(overlay, levelId, body, filename) {
  requireValue(overlay && typeof overlay === "object" && !Array.isArray(overlay), `${filename}: each historyOverlay must be an object`);
  requireValue(/^[a-z0-9-]+$/.test(overlay.id ?? ""), `${filename}: historyOverlay.id must use lowercase letters, numbers and hyphens`);
  requireValue(
    /^\/images\/(?:maps\/[a-z0-9/_-]+|levels\/[a-z0-9-]+\/[a-z0-9-]+\/extra\/[a-z0-9_-]+)\.png$/.test(overlay.image ?? ""),
    `${filename}: historyOverlay.image must be a local PNG under /images/maps/ or the level's extra/ directory`,
  );
  requireValue(Number.isFinite(overlay.opacity) && overlay.opacity > 0 && overlay.opacity <= 1, `${filename}: historyOverlay.opacity must be greater than 0 and at most 1`);
  for (const corner of ["topLeft", "topRight", "bottomLeft", "bottomRight"]) {
    const coordinates = overlay.corners?.[corner];
    requireValue(Array.isArray(coordinates) && coordinates.length === 2, `${filename}: historyOverlay.corners.${corner} must be [latitude, longitude]`);
    requireValue(Number.isFinite(coordinates[0]) && coordinates[0] >= -90 && coordinates[0] <= 90, `${filename}: historyOverlay.corners.${corner} latitude is invalid`);
    requireValue(Number.isFinite(coordinates[1]) && coordinates[1] >= -180 && coordinates[1] <= 180, `${filename}: historyOverlay.corners.${corner} longitude is invalid`);
  }
  const attribution = overlay.attribution;
  requireValue(attribution?.title && attribution.source && attribution.sourceUrl, `${filename}: historyOverlay attribution title, source and sourceUrl are required`);
  requireValue(attribution.author, `${filename}: historyOverlay attribution author is required`);
  requireValue(attribution.copyrightHolder, `${filename}: historyOverlay copyright holder is required`);
  requireValue(attribution.rights === "non-free", `${filename}: historyOverlay attribution rights must be non-free`);
  requireValue(attribution.rightsNotice && attribution.rightsNoticeUrl, `${filename}: historyOverlay non-free rights notice and URL are required`);
  for (const field of ["sourceUrl", "rightsNoticeUrl"]) validateHttpsUrl(attribution[field], `historyOverlay.attribution.${field}`, filename);
  const imageFilename = path.join(root, "public", ...overlay.image.slice(1).split("/"));
  const image = await readFile(imageFilename);
  requireValue(image.length >= 8 && image[0] === 0x89 && image.toString("ascii", 1, 4) === "PNG", `${filename}: ${overlay.image} is not a PNG image`);
  const markdownImage = path.posix.basename(overlay.image);
  requireValue(body.includes(`](${markdownImage})`), `${filename}: historyOverlay ${overlay.id} must be referenced as ![...](${markdownImage}) in the Markdown body`);
  return {
    levelId,
    id: overlay.id,
    image: overlay.image,
    opacity: overlay.opacity,
    corners: overlay.corners,
    attribution,
  };
}

const atlas = YAML.parse(await readFile(path.join(contentRoot, "atlas.yaml"), "utf8"));
const gameFiles = (await filesBelow(path.join(contentRoot, "games"), ".yaml")).sort();
const allLevelFiles = (await filesBelow(levelsRoot, ".md")).sort();
const levelFiles = allLevelFiles.filter((filename) => !filename.endsWith(".ref.md"));
const levelReferenceFiles = allLevelFiles.filter((filename) => filename.endsWith(".ref.md"));
const gamesWithMapTypeDirectories = new Set(levelFiles.flatMap((filename) => {
  const parts = path.relative(levelsRoot, filename).split(path.sep);
  return parts.length === 3 ? [parts[0]] : [];
}));
const wikiFiles = (await filesBelow(path.join(contentRoot, "wiki-import/articles"), ".json")).sort();
let levelBannerFiles = [];
try {
  levelBannerFiles = [
    ...(await filesBelow(levelBannersRoot, ".jpg")),
    ...(await filesBelow(levelBannersRoot, ".png")),
    ...(await filesBelow(levelBannersRoot, ".webm")),
  ].filter((filename) => {
    const parts = path.relative(levelBannersRoot, filename).split(path.sep);
    return path.parse(filename).name === "main" || parts.length <= 3;
  }).sort();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const levelBannerFilesByBase = new Map();
for (const filename of levelBannerFiles) {
  const relative = path.relative(levelBannersRoot, filename).replaceAll("\\", "/");
  const base = relative.replace(/\.(?:jpg|png|webm)$/, "");
  requireValue(!levelBannerFilesByBase.has(base), `public/images/levels/${base}: use one main media file only`);
  levelBannerFilesByBase.set(base, filename);
}

const games = new Map();
for (const filename of gameFiles) {
  const game = YAML.parse(await readFile(filename, "utf8"));
  requireValue(game?.id, `${filename}: game id is required`);
  requireValue(!games.has(game.id), `${filename}: duplicate game id ${game.id}`);
  requireValue(game.code && game.label && game.labelLong && game.released, `${filename}: code, label, labelLong and released are required`);
  requireValue(validGameSeries.has(game.series), `${filename}: unsupported game series ${game.series}`);
  requireValue(
    game.subseries == null || validGameSubseries.has(game.subseries),
    `${filename}: unsupported game sub-series ${game.subseries}`,
  );
  games.set(game.id, {
    ...game,
    subseries: game.subseries ?? null,
    remasterOf: game.remasterOf ?? null,
  });
}
for (const [gameId, game] of games) {
  const isRemaster = game.subseries === "remaster";
  requireValue(
    isRemaster === (game.remasterOf !== null),
    `${gameId}: remaster games require remasterOf and other games must omit it`,
  );
  if (game.remasterOf !== null) {
    requireValue(game.remasterOf !== gameId, `${gameId}: remasterOf cannot reference the same game`);
    requireValue(games.has(game.remasterOf), `${gameId}: remasterOf references unknown game ID ${game.remasterOf}`);
  }
}

const gameIconDirectory = path.join(root, "public/images/games");
let gameIconFiles = [];
try {
  gameIconFiles = (await readdir(gameIconDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
    .map((entry) => entry.name)
    .sort();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
for (const filename of gameIconFiles) {
  const gameId = filename.slice(0, -4);
  requireValue(games.has(gameId), `public/images/games/${filename}: filename must use a known game ID`);
  const cachedIcon = await readFile(path.join(gameIconDirectory, filename));
  requireValue(
    cachedIcon.length >= 8
      && cachedIcon[0] === 0x89
      && cachedIcon.toString("ascii", 1, 4) === "PNG",
    `public/images/games/${filename}: file is not a PNG image`,
  );
  games.get(gameId).icon = `/images/games/${filename}`;
}

const wikiArticles = new Map();
const wikiArticleFilenames = new Map();
for (const filename of wikiFiles) {
  const article = JSON.parse(await readFile(filename, "utf8"));
  requireValue(article?.id, `${filename}: wiki article id is required`);
  requireValue(!wikiArticles.has(article.id), `${filename}: duplicate wiki article id ${article.id}`);
  requireValue(article.sourceUrl, `${filename}: sourceUrl is required`);
  validateWikiImage(article.images?.main, "images.main", filename);
  validateWikiImage(article.images?.map, "images.map", filename);
  wikiArticles.set(article.id, article);
  wikiArticleFilenames.set(article.id, filename);
}
for (const [id, article] of wikiArticles) {
  validateWikiLevelReferences(article, wikiArticleFilenames.get(id), wikiArticles);
}

const levels = [];
const mapOverlays = {};
const historyOverlays = {};
const levelBanners = {};
const usedLevelBannerBases = new Set();
const levelIds = new Set();
const levelIdAliases = {};
const campaignOrdersByGame = new Map();
let markerCount = 0;
for (const filename of levelFiles) {
  const { data: level, body } = parseMarkdown(await readFile(filename, "utf8"), filename);
  requireValue(level?.id && level.title, `${filename}: level id and title are required`);
  requireValue(!levelIds.has(level.id), `${filename}: duplicate level id ${level.id}`);
  requireValue(validModes.has(level.mode), `${filename}: invalid mode ${level.mode}`);
  requireValue(Array.isArray(level.games) && level.games.length === 1, `${filename}: canonical levels must contain exactly one owner game; use .ref.md files for other appearances`);
  for (const gameId of level.games) requireValue(games.has(gameId), `${filename}: unknown game ${gameId}`);
  if (level.campaign != null) {
    requireValue(
      level.campaign && typeof level.campaign === "object" && !Array.isArray(level.campaign),
      `${filename}: campaign must be an object`,
    );
    requireValue(
      typeof level.campaign.id === "string" && level.campaign.id.trim(),
      `${filename}: campaign id must be a non-empty string`,
    );
    requireValue(
      typeof level.campaign.label === "string" && level.campaign.label.trim(),
      `${filename}: campaign label must be a non-empty string`,
    );
  }
  const primaryGame = level.games[0];
  const idPrefix = `${primaryGame}-`;
  requireValue(level.id.startsWith(idPrefix), `${filename}: level id must start with primary game ${idPrefix}`);
  const levelSlug = level.id.slice(idPrefix.length);
  const levelSlugFilename = `${levelSlug}.md`;
  let campaignOrder = null;
  if (gamesWithMapTypeDirectories.has(primaryGame)) {
    const mapTypeDirectory = mapTypeDirectoryByMode.get(level.mode);
    const expectedDirectory = path.join(levelsRoot, primaryGame, mapTypeDirectory);
    requireValue(path.dirname(filename) === expectedDirectory, `${filename}: expected level directory ${expectedDirectory}`);
    if (mapTypeDirectory === "campaign") {
      const campaignFilename = path.basename(filename).match(/^([1-9]\d*)-(.+)\.md$/);
      requireValue(campaignFilename, `${filename}: campaign filename must start with a positive order number without leading zeros`);
      requireValue(campaignFilename[2] === levelSlug, `${filename}: campaign filename must end with ${levelSlugFilename}`);
      campaignOrder = Number(campaignFilename[1]);
      requireValue(Number.isSafeInteger(campaignOrder), `${filename}: campaign order is too large`);
      if (!campaignOrdersByGame.has(primaryGame)) campaignOrdersByGame.set(primaryGame, new Map());
      const campaignOrders = campaignOrdersByGame.get(primaryGame);
      requireValue(!campaignOrders.has(campaignOrder), `${filename}: duplicate campaign order ${campaignOrder} for ${primaryGame}`);
      campaignOrders.set(campaignOrder, level.id);
    } else {
      const expectedFilename = path.join(expectedDirectory, levelSlugFilename);
      requireValue(filename === expectedFilename, `${filename}: expected level path ${expectedFilename}`);
    }
  } else {
    const expectedFilename = path.join(levelsRoot, primaryGame, levelSlugFilename);
    requireValue(filename === expectedFilename, `${filename}: expected level path ${expectedFilename}`);
  }
  if (level.legacyIds != null) {
    requireValue(Array.isArray(level.legacyIds) && level.legacyIds.length, `${filename}: legacyIds must be a non-empty list`);
    for (const legacyId of level.legacyIds) {
      requireValue(/^[a-z0-9-]+$/.test(legacyId ?? ""), `${filename}: invalid legacy level ID ${legacyId}`);
      requireValue(legacyId !== level.id && !levelIdAliases[legacyId], `${filename}: duplicate or current legacy level ID ${legacyId}`);
      levelIdAliases[legacyId] = level.id;
    }
  }
  const legacyLevelBannerBase = path.relative(levelsRoot, filename).replaceAll("\\", "/").replace(/\.md$/, "");
  const levelBannerBase = `${primaryGame}/${levelSlug}/main`;
  const levelBannerFilename = levelBannerFilesByBase.get(levelBannerBase) ?? levelBannerFilesByBase.get(legacyLevelBannerBase);
  if (levelBannerFilename) {
    const extension = path.extname(levelBannerFilename);
    const image = await readFile(levelBannerFilename);
    const validImage = extension === ".png"
      ? image.length >= 8 && image[0] === 0x89 && image.toString("ascii", 1, 4) === "PNG"
      : extension === ".webm"
        ? image.length >= 4 && image[0] === 0x1a && image[1] === 0x45 && image[2] === 0xdf && image[3] === 0xa3
        : image.length >= 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
    requireValue(validImage, `${levelBannerFilename}: file contents do not match its extension`);
    const relativeImage = path.relative(path.join(root, "public"), levelBannerFilename).replaceAll("\\", "/");
    const publicPath = `/${relativeImage}`;
    const bannerKey = `${level.id}@${primaryGame}`;
    levelBanners[bannerKey] = {
      origin: "local",
      mediaType: extension === ".webm" ? "video" : "image",
      sourceUrl: publicPath,
      thumbnailUrl: publicPath,
      detailPageUrl: `https://github.com/time-wasters/cod-atlas/blob/main/public/${relativeImage}`,
      author: { name: "plp-gtr", userUrl: "https://github.com/plp-gtr", role: "author" },
      license: { name: null, url: null },
      rights: {
        status: "non-free",
        notice: "Extracted from the relevant game files or captured as a screenshot by plp-gtr. The underlying copyrighted game artwork remains the property of its respective copyright holders and is used for identification and geographic comparison.",
        noticeUrl: "https://www.activision.com/legal/terms-of-use",
      },
    };
    usedLevelBannerBases.add(levelBannerFilesByBase.has(levelBannerBase) ? levelBannerBase : legacyLevelBannerBase);
  }
  requireValue(wikiArticles.has(level.wikiArticle), `${filename}: unknown wikiArticle ${level.wikiArticle}`);
  requireValue(Array.isArray(level.locations), `${filename}: locations must be a list`);
  if (level.mapOverlay) mapOverlays[level.id] = await validateMapOverlay(level.mapOverlay, level.id, filename);
  if (level.historyOverlays != null) {
    requireValue(Array.isArray(level.historyOverlays) && level.historyOverlays.length, `${filename}: historyOverlays must be a non-empty array`);
    const historyOverlayIds = new Set();
    historyOverlays[level.id] = [];
    for (const overlay of level.historyOverlays) {
      requireValue(!historyOverlayIds.has(overlay?.id), `${filename}: duplicate historyOverlay id ${overlay?.id}`);
      historyOverlayIds.add(overlay?.id);
      historyOverlays[level.id].push(await validateHistoryOverlay(overlay, level.id, body, filename));
    }
  }
  const locationIds = new Set();
  for (const location of level.locations) {
    requireValue(location.id && !locationIds.has(location.id), `${filename}: duplicate or missing location id`);
    locationIds.add(location.id);
    requireValue(location.country, `${filename}: location country is required`);
    requireValue(
      location.primary == null || typeof location.primary === "boolean",
      `${filename}: location primary must be a boolean`,
    );
    requireValue(location.label == null, `${filename}: location label was replaced by landmark`);
    for (const field of ["region", "city", "landmark"]) {
      requireValue(
        location[field] == null || (typeof location[field] === "string" && location[field].trim()),
        `${filename}: location ${field} must be a non-empty string`,
      );
    }
    requireValue(validPrecisions.has(location.precision), `${filename}: invalid precision ${location.precision}`);
    requireValue(validConfidences.has(location.confidence), `${filename}: invalid or missing confidence ${location.confidence}`);
    requireValue(validMethods.has(location.method), `${filename}: invalid or missing method ${location.method}`);
    validateLocationUrls(location.urls, filename);
    const hasLatitude = Number.isFinite(location.latitude);
    const hasLongitude = Number.isFinite(location.longitude);
    requireValue(hasLatitude === hasLongitude, `${filename}: latitude and longitude must be supplied together`);
    const hasCoordinates = hasLatitude && hasLongitude;
    requireValue(location.precision !== "off-world" || !hasCoordinates, `${filename}: off-world locations cannot use terrestrial coordinates`);
    if (hasCoordinates) {
      requireValue(location.latitude >= -90 && location.latitude <= 90, `${filename}: latitude out of range`);
      requireValue(location.longitude >= -180 && location.longitude <= 180, `${filename}: longitude out of range`);
    }
    markerCount += 1;
  }
  levelIds.add(level.id);
  levels.push({
    ...level,
    ...(campaignOrder !== null ? { campaignOrder } : {}),
    notes: body,
    appearances: [],
  });
}

const levelsById = new Map(levels.map((level) => [level.id, level]));
for (const legacyId of Object.keys(levelIdAliases)) {
  requireValue(!levelsById.has(legacyId), `${legacyId}: legacy level ID collides with a current canonical level`);
}
const appearanceFields = new Set(["level", "title", "wikiArticle", "campaign", "metadata"]);
for (const filename of levelReferenceFiles) {
  const { data: reference, body } = parseMarkdown(await readFile(filename, "utf8"), filename);
  requireValue(reference && typeof reference === "object" && !Array.isArray(reference), `${filename}: appearance reference frontmatter must be an object`);
  for (const field of Object.keys(reference)) {
    requireValue(appearanceFields.has(field), `${filename}: appearance references cannot set ${field}`);
  }
  requireValue(typeof reference.level === "string" && reference.level, `${filename}: level is required`);
  const level = levelsById.get(reference.level);
  requireValue(level, `${filename}: unknown canonical level ${reference.level}`);
  const parts = path.relative(levelsRoot, filename).split(path.sep);
  requireValue(parts.length === 2 || parts.length === 3, `${filename}: appearance references must live below a game directory`);
  const gameId = parts[0];
  requireValue(games.has(gameId), `${filename}: unknown appearance game ${gameId}`);
  requireValue(gameId !== level.games[0], `${filename}: the owner game uses the canonical level file, not a reference`);
  requireValue(!level.appearances.some((appearance) => appearance.gameId === gameId), `${filename}: duplicate ${gameId} appearance for ${level.id}`);
  const levelSlug = level.id.slice(level.games[0].length + 1);
  const referenceFilename = parts.at(-1);
  let campaignOrder = null;
  if (gamesWithMapTypeDirectories.has(gameId)) {
    requireValue(parts.length === 3, `${filename}: ${gameId} uses map-type directories`);
    const mapTypeDirectory = mapTypeDirectoryByMode.get(level.mode);
    requireValue(parts[1] === mapTypeDirectory, `${filename}: expected ${mapTypeDirectory} directory for ${level.mode}`);
    if (mapTypeDirectory === "campaign") {
      const match = referenceFilename.match(/^([1-9]\d*)-(.+)\.ref\.md$/);
      requireValue(match && match[2] === levelSlug, `${filename}: campaign appearance filename must be <order>-${levelSlug}.ref.md`);
      campaignOrder = Number(match[1]);
    } else {
      requireValue(referenceFilename === `${levelSlug}.ref.md`, `${filename}: expected filename ${levelSlug}.ref.md`);
    }
  } else {
    requireValue(parts.length === 2 && referenceFilename === `${levelSlug}.ref.md`, `${filename}: expected appearance path ${gameId}/${levelSlug}.ref.md`);
  }
  if (reference.title != null) requireValue(typeof reference.title === "string" && reference.title.trim(), `${filename}: title must be a non-empty string`);
  if (reference.wikiArticle != null) requireValue(wikiArticles.has(reference.wikiArticle), `${filename}: unknown wikiArticle ${reference.wikiArticle}`);
  if (reference.campaign != null) {
    requireValue(reference.campaign && typeof reference.campaign === "object" && !Array.isArray(reference.campaign), `${filename}: campaign must be an object`);
    requireValue(typeof reference.campaign.id === "string" && reference.campaign.id.trim(), `${filename}: campaign id must be a non-empty string`);
    requireValue(typeof reference.campaign.label === "string" && reference.campaign.label.trim(), `${filename}: campaign label must be a non-empty string`);
  }
  if (reference.metadata != null) requireValue(reference.metadata && typeof reference.metadata === "object" && !Array.isArray(reference.metadata), `${filename}: metadata must be an object`);
  const bannerKey = `${level.id}@${gameId}`;
  const appearanceBannerBase = `${gameId}/${levelSlug}/main`;
  const legacyBannerBase = path.relative(levelsRoot, filename).replaceAll("\\", "/").replace(/\.ref\.md$/, "");
  const bannerFilename = levelBannerFilesByBase.get(appearanceBannerBase) ?? levelBannerFilesByBase.get(legacyBannerBase);
  if (bannerFilename) {
    const extension = path.extname(bannerFilename);
    const image = await readFile(bannerFilename);
    const validImage = extension === ".png"
      ? image.length >= 8 && image[0] === 0x89 && image.toString("ascii", 1, 4) === "PNG"
      : extension === ".webm"
        ? image.length >= 4 && image[0] === 0x1a && image[1] === 0x45 && image[2] === 0xdf && image[3] === 0xa3
        : image.length >= 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
    requireValue(validImage, `${bannerFilename}: file contents do not match its extension`);
    const relativeImage = path.relative(path.join(root, "public"), bannerFilename).replaceAll("\\", "/");
    const publicPath = `/${relativeImage}`;
    levelBanners[bannerKey] = {
      origin: "local",
      mediaType: extension === ".webm" ? "video" : "image",
      sourceUrl: publicPath,
      thumbnailUrl: publicPath,
      detailPageUrl: `https://github.com/time-wasters/cod-atlas/blob/main/public/${relativeImage}`,
      author: { name: "plp-gtr", userUrl: "https://github.com/plp-gtr", role: "author" },
      license: { name: null, url: null },
      rights: {
        status: "non-free",
        notice: "Extracted from the relevant game files or captured as a screenshot by plp-gtr. The underlying copyrighted game artwork remains the property of its respective copyright holders and is used for identification and geographic comparison.",
        noticeUrl: "https://www.activision.com/legal/terms-of-use",
      },
    };
    usedLevelBannerBases.add(levelBannerFilesByBase.has(appearanceBannerBase) ? appearanceBannerBase : legacyBannerBase);
  }
  level.appearances.push({
    gameId,
    title: reference.title ?? level.title,
    wikiArticle: reference.wikiArticle ?? level.wikiArticle,
    campaign: reference.campaign ?? level.campaign ?? null,
    ...(campaignOrder !== null ? { campaignOrder } : {}),
    ...(reference.metadata ? { metadata: reference.metadata } : {}),
    notes: body || level.notes,
    notesId: body ? `${level.id}--${gameId}` : level.id,
    bannerKey,
  });
}

for (const [gameId, campaignOrders] of campaignOrdersByGame) {
  const orders = [...campaignOrders.keys()].sort((a, b) => a - b);
  requireValue(
    orders.every((order, index) => order === index + 1),
    `${gameId}: campaign order must be contiguous from 1; found ${orders.join(", ")}`,
  );
}

const groups = new Map();
for (const level of levels) {
  const article = wikiArticles.get(level.wikiArticle);
  const ownerGameId = level.games[0];
  const appearances = [{
    gameId: ownerGameId,
    title: level.title,
    wikiArticle: level.wikiArticle,
    wiki: article.sourceUrl,
    notesId: level.id,
    hasLevelNotes: Boolean(level.notes.trim()),
    bannerKey: `${level.id}@${ownerGameId}`,
    ...(level.campaign ? { campaign: level.campaign } : {}),
    ...(level.campaignOrder ? { campaignOrder: level.campaignOrder } : {}),
    ...(level.metadata ? { metadata: level.metadata } : {}),
  }, ...level.appearances.map((appearance) => ({
    gameId: appearance.gameId,
    title: appearance.title,
    wikiArticle: appearance.wikiArticle,
    wiki: wikiArticles.get(appearance.wikiArticle).sourceUrl,
    notesId: appearance.notesId,
    hasLevelNotes: Boolean(appearance.notes.trim()),
    bannerKey: appearance.bannerKey,
    ...(appearance.campaign ? { campaign: appearance.campaign } : {}),
    ...(appearance.campaignOrder ? { campaignOrder: appearance.campaignOrder } : {}),
    ...(appearance.metadata ? { metadata: appearance.metadata } : {}),
  }))];
  const appearanceGameIds = appearances.map((appearance) => appearance.gameId);
  const gameCodes = appearanceGameIds.map((id) => games.get(id).code).join(" / ");
  for (const location of level.locations) {
    const key = location.country;
    if (!groups.has(key)) {
      const continent = continentForGroup(key);
      requireValue(continent, `${key}: no continent classification is available`);
      groups.set(key, {
        name: key,
        continent,
        coordinates: null,
        kind: location.precision === "off-world" ? "off-world" : "terrestrial",
        flagCode: flagCodeForGroup(key),
        entries: [],
      });
    }
    const group = groups.get(key);
    const coordinates = Number.isFinite(location.latitude)
      ? [location.latitude, location.longitude]
      : null;
    if (!group.coordinates && coordinates) group.coordinates = coordinates;
    group.entries.push({
      id: `${level.id}:${location.id}`,
      levelId: level.id,
      locationId: location.id,
      primary: location.primary === true,
      title: level.title,
      game: gameCodes,
      gameIds: appearanceGameIds,
      appearances,
      ...(level.campaign ? { campaign: level.campaign } : {}),
      ...(level.campaignOrder ? { campaignOrder: level.campaignOrder } : {}),
      wiki: article.sourceUrl,
      wikiArticle: level.wikiArticle,
      country: location.country,
      city: location.city ?? null,
      region: location.region ?? null,
      landmark: location.landmark ?? null,
      coordinates,
      precision: location.precision,
      confidence: location.confidence ?? (location.precision === "country" ? "fallback" : "medium"),
      method: location.method ?? null,
      ...(location.urls ? { urls: location.urls } : {}),
      hasLevelNotes: Boolean(level.notes.trim()),
      modes: [level.mode],
    });
  }
}

const compiledGroups = [...groups.values()]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((group) => ({
    ...group,
    entries: group.entries.sort((a, b) => a.title.localeCompare(b.title) || a.game.localeCompare(b.game)),
  }));
const entries = compiledGroups.flatMap((group) => group.entries);
const wikiMedia = Object.fromEntries([...wikiArticles].flatMap(([id, article]) => {
  const main = article.images?.main?.sourceUrl ? article.images.main : null;
  const map = article.images?.map?.sourceUrl ? article.images.map : null;
  return main || map ? [[id, { main, map }]] : [];
}));
const compiled = {
  updatedAt: atlas.updatedAt,
  games: [...games.values()].sort((a, b) => String(a.released).localeCompare(String(b.released))),
  levelIdAliases,
  levelBanners,
  wikiMedia,
  groups: compiledGroups,
  totals: {
    groups: compiledGroups.length,
    levels: levels.length,
    entries: markerCount,
    mapped: entries.filter((entry) => entry.coordinates).length,
    cityMatched: entries.filter((entry) => !["country", "off-world"].includes(entry.precision)).length,
    countryFallback: entries.filter((entry) => entry.precision === "country").length,
  },
};
const serialized = `${JSON.stringify(compiled, null, 2)}\n`;
const mapOverlaysSerialized = `${JSON.stringify(mapOverlays, null, 2)}\n`;
const historyOverlaysSerialized = `${JSON.stringify(historyOverlays, null, 2)}\n`;

if (!checkOnly) {
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(outputPath, serialized),
    writeFile(mapOverlaysOutputPath, mapOverlaysSerialized),
    writeFile(historyOverlaysOutputPath, historyOverlaysSerialized),
  ]);
}

for (const bannerBase of levelBannerFilesByBase.keys()) {
  requireValue(usedLevelBannerBases.has(bannerBase), `public/images/levels/${bannerBase}: no matching level Markdown file`);
}

console.log(`Validated ${levels.length} levels, ${markerCount} markers, ${wikiArticles.size} wiki articles and ${games.size} games.`);
