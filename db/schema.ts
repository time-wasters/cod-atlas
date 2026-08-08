import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const createdAt = () =>
  text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`);

const updatedAt = () =>
  text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`);

/*
 * Atlas-owned data
 *
 * These tables contain data curated by this project. Wiki imports may be linked
 * to them, but must never overwrite them automatically.
 */

export const games = sqliteTable(
  "games",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    releaseDate: text("release_date"),
    releaseOrder: integer("release_order").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("games_code_unique").on(table.code),
    uniqueIndex("games_slug_unique").on(table.slug),
    index("games_release_order_idx").on(table.releaseOrder),
  ],
);

export const places = sqliteTable(
  "places",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    countryCode: text("country_code"),
    region: text("region"),
    city: text("city"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    precision: text("precision", {
      enum: ["exact", "city", "region", "country", "off-world"],
    })
      .notNull()
      .default("country"),
    confidence: text("confidence", {
      enum: ["verified", "high", "medium", "fallback"],
    })
      .notNull()
      .default("fallback"),
    source: text("source").notNull().default("atlas"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("places_country_city_idx").on(table.countryCode, table.city),
    index("places_coordinates_idx").on(table.latitude, table.longitude),
  ],
);

export const levels = sqliteTable(
  "levels",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "restrict" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    mode: text("mode", {
      enum: ["singleplayer", "multiplayer", "zombies", "other", "unknown"],
    })
      .notNull()
      .default("unknown"),
    overlayAsset: text("overlay_asset"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("levels_game_slug_unique").on(table.gameId, table.slug),
    index("levels_game_idx").on(table.gameId),
    index("levels_mode_idx").on(table.mode),
  ],
);

export const levelPlaces = sqliteTable(
  "level_places",
  {
    levelId: integer("level_id")
      .notNull()
      .references(() => levels.id, { onDelete: "cascade" }),
    placeId: integer("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "restrict" }),
    isPrimary: integer("is_primary", { mode: "boolean" })
      .notNull()
      .default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({
      name: "level_places_pk",
      columns: [table.levelId, table.placeId],
    }),
    index("level_places_place_idx").on(table.placeId),
  ],
);

/*
 * Wiki import data
 *
 * Every value below is evidence copied from the remote Wiki. Keeping it
 * separate makes re-imports repeatable and preserves manual atlas corrections.
 */

export const wikiImportRuns = sqliteTable(
  "wiki_import_runs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    startedAt: text("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    finishedAt: text("finished_at"),
    status: text("status", {
      enum: ["running", "succeeded", "partial", "failed"],
    })
      .notNull()
      .default("running"),
    requestedArticles: integer("requested_articles").notNull().default(0),
    importedArticles: integer("imported_articles").notNull().default(0),
    failedArticles: integer("failed_articles").notNull().default(0),
    errorLog: text("error_log"),
  },
  (table) => [index("wiki_import_runs_status_idx").on(table.status)],
);

export const wikiArticles = sqliteTable(
  "wiki_articles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fandomPageId: integer("fandom_page_id").notNull(),
    title: text("title").notNull(),
    sourceUrl: text("source_url").notNull(),
    canonicalUrl: text("canonical_url").notNull(),
    latestRevisionId: integer("latest_revision_id"),
    latestRevisionAt: text("latest_revision_at"),
    contentSha1: text("content_sha1"),
    rawPayload: text("raw_payload"),
    importedAt: text("imported_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    importRunId: integer("import_run_id").references(() => wikiImportRuns.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("wiki_articles_fandom_page_id_unique").on(table.fandomPageId),
    uniqueIndex("wiki_articles_canonical_url_unique").on(table.canonicalUrl),
    index("wiki_articles_revision_idx").on(table.latestRevisionId),
    index("wiki_articles_import_run_idx").on(table.importRunId),
  ],
);

export const levelWikiArticles = sqliteTable(
  "level_wiki_articles",
  {
    levelId: integer("level_id")
      .notNull()
      .references(() => levels.id, { onDelete: "cascade" }),
    wikiArticleId: integer("wiki_article_id")
      .notNull()
      .references(() => wikiArticles.id, { onDelete: "cascade" }),
    isPrimary: integer("is_primary", { mode: "boolean" })
      .notNull()
      .default(true),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({
      name: "level_wiki_articles_pk",
      columns: [table.levelId, table.wikiArticleId],
    }),
    index("level_wiki_articles_article_idx").on(table.wikiArticleId),
  ],
);

export const wikiArticleLocations = sqliteTable(
  "wiki_article_locations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    wikiArticleId: integer("wiki_article_id")
      .notNull()
      .references(() => wikiArticles.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    url: text("url"),
    sourceField: text("source_field").notNull().default("location"),
    sortOrder: integer("sort_order").notNull().default(0),
    matchedPlaceId: integer("matched_place_id").references(() => places.id, {
      onDelete: "set null",
    }),
    importedAt: text("imported_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("wiki_article_locations_article_idx").on(table.wikiArticleId),
    index("wiki_article_locations_place_idx").on(table.matchedPlaceId),
  ],
);

export const wikiFiles = sqliteTable(
  "wiki_files",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fandomPageId: integer("fandom_page_id"),
    fileTitle: text("file_title").notNull(),
    detailPageUrl: text("detail_page_url").notNull(),
    originalUrl: text("original_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    mimeType: text("mime_type"),
    width: integer("width"),
    height: integer("height"),
    sha1: text("sha1"),
    copyrightText: text("copyright_text"),
    licenseName: text("license_name"),
    licenseUrl: text("license_url"),
    rawPayload: text("raw_payload"),
    importedAt: text("imported_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    importRunId: integer("import_run_id").references(() => wikiImportRuns.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("wiki_files_detail_page_url_unique").on(table.detailPageUrl),
    uniqueIndex("wiki_files_fandom_page_id_unique").on(table.fandomPageId),
    index("wiki_files_sha1_idx").on(table.sha1),
    index("wiki_files_import_run_idx").on(table.importRunId),
  ],
);

export const wikiFileCredits = sqliteTable(
  "wiki_file_credits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    wikiFileId: integer("wiki_file_id")
      .notNull()
      .references(() => wikiFiles.id, { onDelete: "cascade" }),
    role: text("role", {
      enum: ["uploader", "author", "copyright-holder", "other"],
    })
      .notNull()
      .default("other"),
    displayName: text("display_name"),
    userUrl: text("user_url"),
    creditText: text("credit_text").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    importedAt: text("imported_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("wiki_file_credits_file_idx").on(table.wikiFileId)],
);

export const wikiArticleImages = sqliteTable(
  "wiki_article_images",
  {
    wikiArticleId: integer("wiki_article_id")
      .notNull()
      .references(() => wikiArticles.id, { onDelete: "cascade" }),
    wikiFileId: integer("wiki_file_id")
      .notNull()
      .references(() => wikiFiles.id, { onDelete: "cascade" }),
    role: text("role", {
      enum: ["main", "map", "gallery", "other"],
    })
      .notNull()
      .default("other"),
    sourceField: text("source_field"),
    sortOrder: integer("sort_order").notNull().default(0),
    importedAt: text("imported_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({
      name: "wiki_article_images_pk",
      columns: [table.wikiArticleId, table.wikiFileId, table.role],
    }),
    index("wiki_article_images_file_idx").on(table.wikiFileId),
    index("wiki_article_images_role_idx").on(table.role),
  ],
);
