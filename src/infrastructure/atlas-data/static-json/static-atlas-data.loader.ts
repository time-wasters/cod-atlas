import atlasSource from "../../../../app/data/atlas.generated.json";
import type { AtlasDataDto } from "../dto/atlas-data.dto.js";

type JsonObject = Record<string, unknown>;

const GAME_SERIES = new Set(["world-war-ii", "modern-warfare", "black-ops", "standalone"]);
const GAME_SUBSERIES = new Set(["main", "reboot", "remaster", "add-on", "spin-off"]);
const LOCATION_PRECISIONS = new Set(["exact", "approximate", "city", "region", "country", "off-world"]);
const LOCATION_CONFIDENCES = new Set(["high", "medium", "fallback"]);
const LEVEL_MODES = new Set(["singleplayer", "multiplayer", "zombies"]);

function objectValue(value: unknown, path: string): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }
  return value as JsonObject;
}

function arrayValue(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`);
  return value;
}

function stringValue(value: unknown, path: string): string {
  if (typeof value !== "string") throw new Error(`${path} must be a string`);
  return value;
}

function numberValue(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${path} must be a finite number`);
  }
  return value;
}

function booleanValue(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") throw new Error(`${path} must be a boolean`);
  return value;
}

function nullableStringValue(value: unknown, path: string): string | null {
  if (value === null) return null;
  return stringValue(value, path);
}

function optionalStringValue(value: unknown, path: string): void {
  if (value !== undefined && value !== null) stringValue(value, path);
}

function enumValue(value: unknown, allowed: Set<string>, path: string): string {
  const candidate = stringValue(value, path);
  if (!allowed.has(candidate)) throw new Error(`${path} has unsupported value ${candidate}`);
  return candidate;
}

function coordinateTuple(value: unknown, path: string): void {
  const coordinates = arrayValue(value, path);
  if (coordinates.length !== 2) throw new Error(`${path} must contain exactly two coordinates`);
  numberValue(coordinates[0], `${path}[0]`);
  numberValue(coordinates[1], `${path}[1]`);
}

function optionalCoordinateTuple(value: unknown, path: string): void {
  if (value !== undefined && value !== null) coordinateTuple(value, path);
}

function assertCampaign(value: unknown, path: string): void {
  if (value === undefined || value === null) return;
  const campaign = objectValue(value, path);
  stringValue(campaign.id, `${path}.id`);
  stringValue(campaign.label, `${path}.label`);
}

function assertLevelAppearance(value: unknown, path: string): void {
  const appearance = objectValue(value, path);
  stringValue(appearance.gameId, `${path}.gameId`);
  stringValue(appearance.title, `${path}.title`);
  stringValue(appearance.wiki, `${path}.wiki`);
  stringValue(appearance.wikiArticle, `${path}.wikiArticle`);
  stringValue(appearance.notesId, `${path}.notesId`);
  booleanValue(appearance.hasLevelNotes, `${path}.hasLevelNotes`);
  stringValue(appearance.bannerKey, `${path}.bannerKey`);
  assertCampaign(appearance.campaign, `${path}.campaign`);
  if (appearance.campaignOrder !== undefined) numberValue(appearance.campaignOrder, `${path}.campaignOrder`);
  if (appearance.metadata !== undefined) objectValue(appearance.metadata, `${path}.metadata`);
}

function assertAtlasEntry(value: unknown, path: string): void {
  const entry = objectValue(value, path);
  stringValue(entry.id, `${path}.id`);
  stringValue(entry.levelId, `${path}.levelId`);
  stringValue(entry.locationId, `${path}.locationId`);
  booleanValue(entry.primary, `${path}.primary`);
  stringValue(entry.title, `${path}.title`);
  stringValue(entry.game, `${path}.game`);
  arrayValue(entry.gameIds, `${path}.gameIds`).forEach((gameId, index) => {
    stringValue(gameId, `${path}.gameIds[${index}]`);
  });
  assertCampaign(entry.campaign, `${path}.campaign`);
  if (entry.campaignOrder !== undefined) numberValue(entry.campaignOrder, `${path}.campaignOrder`);
  stringValue(entry.wiki, `${path}.wiki`);
  stringValue(entry.wikiArticle, `${path}.wikiArticle`);
  stringValue(entry.country, `${path}.country`);
  optionalStringValue(entry.region, `${path}.region`);
  optionalStringValue(entry.city, `${path}.city`);
  optionalStringValue(entry.landmark, `${path}.landmark`);
  optionalCoordinateTuple(entry.coordinates, `${path}.coordinates`);
  enumValue(entry.precision, LOCATION_PRECISIONS, `${path}.precision`);
  if (entry.confidence !== undefined) enumValue(entry.confidence, LOCATION_CONFIDENCES, `${path}.confidence`);
  if (entry.method !== undefined) stringValue(entry.method, `${path}.method`);
  if (entry.urls !== undefined) {
    arrayValue(entry.urls, `${path}.urls`).forEach((candidate, index) => {
      const urls = objectValue(candidate, `${path}.urls[${index}]`);
      optionalStringValue(urls.googleMaps, `${path}.urls[${index}].googleMaps`);
      optionalStringValue(urls.wikipedia, `${path}.urls[${index}].wikipedia`);
      optionalStringValue(urls.callOfDutyMaps, `${path}.urls[${index}].callOfDutyMaps`);
    });
  }
  booleanValue(entry.hasLevelNotes, `${path}.hasLevelNotes`);
  arrayValue(entry.modes, `${path}.modes`).forEach((mode, index) => {
    enumValue(mode, LEVEL_MODES, `${path}.modes[${index}]`);
  });
  arrayValue(entry.appearances, `${path}.appearances`).forEach((appearance, index) => {
    assertLevelAppearance(appearance, `${path}.appearances[${index}]`);
  });
}

function assertAtlasGroup(value: unknown, path: string): void {
  const group = objectValue(value, path);
  stringValue(group.name, `${path}.name`);
  stringValue(group.continent, `${path}.continent`);
  if (group.coordinates === null) {
    // Null is the generated representation for groups without a map position.
  } else {
    coordinateTuple(group.coordinates, `${path}.coordinates`);
  }
  enumValue(group.kind, new Set(["terrestrial", "off-world"]), `${path}.kind`);
  nullableStringValue(group.flagCode, `${path}.flagCode`);
  arrayValue(group.entries, `${path}.entries`).forEach((entry, index) => {
    assertAtlasEntry(entry, `${path}.entries[${index}]`);
  });
}

function assertGame(value: unknown, path: string): void {
  const game = objectValue(value, path);
  stringValue(game.id, `${path}.id`);
  stringValue(game.code, `${path}.code`);
  stringValue(game.label, `${path}.label`);
  stringValue(game.labelLong, `${path}.labelLong`);
  stringValue(game.released, `${path}.released`);
  enumValue(game.series, GAME_SERIES, `${path}.series`);
  if (game.subseries !== null) enumValue(game.subseries, GAME_SUBSERIES, `${path}.subseries`);
  nullableStringValue(game.remasterOf, `${path}.remasterOf`);
  if (game.icon !== undefined) stringValue(game.icon, `${path}.icon`);
}

function assertWikiImage(value: unknown, path: string): void {
  const image = objectValue(value, path);
  if (image.origin !== undefined) enumValue(image.origin, new Set(["local"]), `${path}.origin`);
  if (image.mediaType !== undefined) enumValue(image.mediaType, new Set(["image", "video"]), `${path}.mediaType`);
  stringValue(image.sourceUrl, `${path}.sourceUrl`);
  stringValue(image.thumbnailUrl, `${path}.thumbnailUrl`);
  stringValue(image.detailPageUrl, `${path}.detailPageUrl`);
  const author = objectValue(image.author, `${path}.author`);
  nullableStringValue(author.name, `${path}.author.name`);
  nullableStringValue(author.userUrl, `${path}.author.userUrl`);
  if (author.role !== null) enumValue(author.role, new Set(["author", "uploader"]), `${path}.author.role`);
  const license = objectValue(image.license, `${path}.license`);
  nullableStringValue(license.name, `${path}.license.name`);
  nullableStringValue(license.url, `${path}.license.url`);
  const rights = objectValue(image.rights, `${path}.rights`);
  enumValue(rights.status, new Set(["licensed", "non-free", "unknown"]), `${path}.rights.status`);
  nullableStringValue(rights.notice, `${path}.rights.notice`);
  nullableStringValue(rights.noticeUrl, `${path}.rights.noticeUrl`);
}

function assertWikiMedia(value: unknown, path: string): void {
  const media = objectValue(value, path);
  if (media.main !== null) assertWikiImage(media.main, `${path}.main`);
  if (media.map !== null) assertWikiImage(media.map, `${path}.map`);
}

function assertStaticAtlasData(value: unknown): asserts value is AtlasDataDto {
  const atlas = objectValue(value, "atlas data");
  arrayValue(atlas.games, "atlas data.games").forEach((game, index) => {
    assertGame(game, `atlas data.games[${index}]`);
  });
  const aliases = objectValue(atlas.levelIdAliases, "atlas data.levelIdAliases");
  Object.entries(aliases).forEach(([alias, levelId]) => stringValue(levelId, `atlas data.levelIdAliases.${alias}`));
  const banners = objectValue(atlas.levelBanners, "atlas data.levelBanners");
  Object.entries(banners).forEach(([key, image]) => assertWikiImage(image, `atlas data.levelBanners.${key}`));
  const wikiMedia = objectValue(atlas.wikiMedia, "atlas data.wikiMedia");
  Object.entries(wikiMedia).forEach(([key, media]) => assertWikiMedia(media, `atlas data.wikiMedia.${key}`));
  arrayValue(atlas.groups, "atlas data.groups").forEach((group, index) => {
    assertAtlasGroup(group, `atlas data.groups[${index}]`);
  });
  const totals = objectValue(atlas.totals, "atlas data.totals");
  numberValue(totals.groups, "atlas data.totals.groups");
  numberValue(totals.entries, "atlas data.totals.entries");
  numberValue(totals.mapped, "atlas data.totals.mapped");
  numberValue(totals.cityMatched, "atlas data.totals.cityMatched");
  numberValue(totals.countryFallback, "atlas data.totals.countryFallback");
}

assertStaticAtlasData(atlasSource);
const staticAtlasData: AtlasDataDto = atlasSource;

export function loadStaticAtlasData(): AtlasDataDto {
  return staticAtlasData;
}
