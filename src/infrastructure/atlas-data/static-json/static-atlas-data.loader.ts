import atlasSource from "../../../../app/data/atlas.generated.json";
import type { AtlasDataDto } from "../dto/atlas-data.dto.js";
import {
  arrayValue,
  booleanValue,
  coordinateTuple,
  enumValue,
  nullableStringValue,
  numberValue,
  objectValue,
  optionalCoordinateTuple,
  optionalStringValue,
  stringValue,
} from "./shared/json-value.validator.js";

const GAME_SERIES = new Set(["world-war-ii", "modern-warfare", "black-ops", "standalone"]);
const GAME_SUBSERIES = new Set(["main", "reboot", "remaster", "add-on", "spin-off"]);
const LOCATION_PRECISIONS = new Set(["exact", "approximate", "city", "region", "country", "off-world"]);
const LOCATION_CONFIDENCES = new Set(["high", "medium", "fallback"]);
const LEVEL_MODES = new Set(["singleplayer", "multiplayer", "zombies"]);

/**
 * Validates an optional campaign object.
 *
 * @param value - The campaign value to validate.
 * @param path - The data path used to identify the campaign in validation errors.
 *
 * @throws Error
 * Thrown if a present campaign value does not match the expected structure.
 */
function assertCampaign(value: unknown, path: string): void {
  if (value === undefined || value === null) return;
  const campaign = objectValue(value, path);
  stringValue(campaign.id, `${path}.id`);
  stringValue(campaign.label, `${path}.label`);
}

/**
 * Validates the human-review metadata for one part of a level record.
 */
function assertHumanReview(value: unknown, path: string): void {
  const review = objectValue(value, path);
  const byHuman = booleanValue(review.byHuman, `${path}.byHuman`);
  const user = nullableStringValue(review.user, `${path}.user`);
  if (byHuman && !user?.trim()) throw new Error(`${path}.user is required when byHuman is true`);
  if (!byHuman && user !== null) throw new Error(`${path}.user must be null when byHuman is false`);
}

/**
 * Validates the location and research review metadata for a level.
 */
function assertLevelVerification(value: unknown, path: string): void {
  const verified = objectValue(value, path);
  assertHumanReview(verified.locations, `${path}.locations`);
  assertHumanReview(verified.research, `${path}.research`);
}

/**
 * Validates the structure of a level appearance object.
 *
 * @param value - The level appearance value to validate.
 * @param path - The data path used to identify the appearance in validation errors.
 *
 * @throws Error
 * Thrown if the level appearance does not match the expected structure.
 */
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

/**
 * Validates the structure of an atlas entry.
 *
 * @param value - The atlas entry value to validate.
 * @param path - The data path used to identify the entry in validation errors.
 *
 * @throws Error
 * Thrown if the atlas entry does not match the expected structure.
 */
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
  if (entry.verified !== undefined) assertLevelVerification(entry.verified, `${path}.verified`);
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

/**
 * Validates the structure of an atlas group and its nested entries.
 *
 * @param value - The atlas group value to validate.
 * @param path - The data path used to identify the group in validation errors.
 *
 * @throws Error
 * Thrown if the atlas group or one of its entries does not match the expected structure.
 */
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

/**
 * Validates the structure of a game definition.
 *
 * @param value - The game value to validate.
 * @param path - The data path used to identify the game in validation errors.
 *
 * @throws Error
 * Thrown if the game definition does not match the expected structure.
 */
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

/**
 * Validates the structure of wiki image metadata.
 *
 * @param value - The wiki image value to validate.
 * @param path - The data path used to identify the image in validation errors.
 *
 * @throws Error
 * Thrown if the wiki image metadata does not match the expected structure.
 */
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

/**
 * Validates the structure of wiki media metadata and its optional images.
 *
 * @param value - The wiki media value to validate.
 * @param path - The data path used to identify the media in validation errors.
 *
 * @throws Error
 * Thrown if the wiki media metadata does not match the expected structure.
 */
function assertWikiMedia(value: unknown, path: string): void {
  const media = objectValue(value, path);
  if (media.main !== null) assertWikiImage(media.main, `${path}.main`);
  if (media.map !== null) assertWikiImage(media.map, `${path}.map`);
}

/**
 * Validates the complete generated atlas data structure.
 *
 * @param value - The generated atlas data to validate.
 *
 * @throws Error
 * Thrown if the generated atlas data does not match the expected {@link AtlasDataDto} structure.
 */
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

/**
 * Returns the validated static atlas data loaded from the generated data source.
 *
 * @returns The validated static atlas data.
 */
export function loadStaticAtlasData(): AtlasDataDto {
  return staticAtlasData;
}
