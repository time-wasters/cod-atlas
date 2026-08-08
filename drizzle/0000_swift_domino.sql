CREATE TABLE `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`release_date` text,
	`release_order` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_code_unique` ON `games` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `games_slug_unique` ON `games` (`slug`);--> statement-breakpoint
CREATE INDEX `games_release_order_idx` ON `games` (`release_order`);--> statement-breakpoint
CREATE TABLE `level_places` (
	`level_id` integer NOT NULL,
	`place_id` integer NOT NULL,
	`is_primary` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`level_id`, `place_id`),
	FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `level_places_place_idx` ON `level_places` (`place_id`);--> statement-breakpoint
CREATE TABLE `level_wiki_articles` (
	`level_id` integer NOT NULL,
	`wiki_article_id` integer NOT NULL,
	`is_primary` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`level_id`, `wiki_article_id`),
	FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`wiki_article_id`) REFERENCES `wiki_articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `level_wiki_articles_article_idx` ON `level_wiki_articles` (`wiki_article_id`);--> statement-breakpoint
CREATE TABLE `levels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`mode` text DEFAULT 'unknown' NOT NULL,
	`overlay_asset` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `levels_game_slug_unique` ON `levels` (`game_id`,`slug`);--> statement-breakpoint
CREATE INDEX `levels_game_idx` ON `levels` (`game_id`);--> statement-breakpoint
CREATE INDEX `levels_mode_idx` ON `levels` (`mode`);--> statement-breakpoint
CREATE TABLE `places` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`country_code` text,
	`region` text,
	`city` text,
	`latitude` real,
	`longitude` real,
	`precision` text DEFAULT 'country' NOT NULL,
	`confidence` text DEFAULT 'fallback' NOT NULL,
	`source` text DEFAULT 'atlas' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `places_country_city_idx` ON `places` (`country_code`,`city`);--> statement-breakpoint
CREATE INDEX `places_coordinates_idx` ON `places` (`latitude`,`longitude`);--> statement-breakpoint
CREATE TABLE `wiki_article_images` (
	`wiki_article_id` integer NOT NULL,
	`wiki_file_id` integer NOT NULL,
	`role` text DEFAULT 'other' NOT NULL,
	`source_field` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`imported_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`wiki_article_id`, `wiki_file_id`, `role`),
	FOREIGN KEY (`wiki_article_id`) REFERENCES `wiki_articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`wiki_file_id`) REFERENCES `wiki_files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `wiki_article_images_file_idx` ON `wiki_article_images` (`wiki_file_id`);--> statement-breakpoint
CREATE INDEX `wiki_article_images_role_idx` ON `wiki_article_images` (`role`);--> statement-breakpoint
CREATE TABLE `wiki_article_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wiki_article_id` integer NOT NULL,
	`label` text NOT NULL,
	`url` text,
	`source_field` text DEFAULT 'location' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`matched_place_id` integer,
	`imported_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`wiki_article_id`) REFERENCES `wiki_articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`matched_place_id`) REFERENCES `places`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `wiki_article_locations_article_idx` ON `wiki_article_locations` (`wiki_article_id`);--> statement-breakpoint
CREATE INDEX `wiki_article_locations_place_idx` ON `wiki_article_locations` (`matched_place_id`);--> statement-breakpoint
CREATE TABLE `wiki_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fandom_page_id` integer NOT NULL,
	`title` text NOT NULL,
	`source_url` text NOT NULL,
	`canonical_url` text NOT NULL,
	`latest_revision_id` integer,
	`latest_revision_at` text,
	`content_sha1` text,
	`raw_payload` text,
	`imported_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`import_run_id` integer,
	FOREIGN KEY (`import_run_id`) REFERENCES `wiki_import_runs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wiki_articles_fandom_page_id_unique` ON `wiki_articles` (`fandom_page_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `wiki_articles_canonical_url_unique` ON `wiki_articles` (`canonical_url`);--> statement-breakpoint
CREATE INDEX `wiki_articles_revision_idx` ON `wiki_articles` (`latest_revision_id`);--> statement-breakpoint
CREATE INDEX `wiki_articles_import_run_idx` ON `wiki_articles` (`import_run_id`);--> statement-breakpoint
CREATE TABLE `wiki_file_credits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wiki_file_id` integer NOT NULL,
	`role` text DEFAULT 'other' NOT NULL,
	`display_name` text,
	`user_url` text,
	`credit_text` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`imported_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`wiki_file_id`) REFERENCES `wiki_files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `wiki_file_credits_file_idx` ON `wiki_file_credits` (`wiki_file_id`);--> statement-breakpoint
CREATE TABLE `wiki_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fandom_page_id` integer,
	`file_title` text NOT NULL,
	`detail_page_url` text NOT NULL,
	`original_url` text NOT NULL,
	`thumbnail_url` text,
	`mime_type` text,
	`width` integer,
	`height` integer,
	`sha1` text,
	`copyright_text` text,
	`license_name` text,
	`license_url` text,
	`raw_payload` text,
	`imported_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`import_run_id` integer,
	FOREIGN KEY (`import_run_id`) REFERENCES `wiki_import_runs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wiki_files_detail_page_url_unique` ON `wiki_files` (`detail_page_url`);--> statement-breakpoint
CREATE UNIQUE INDEX `wiki_files_fandom_page_id_unique` ON `wiki_files` (`fandom_page_id`);--> statement-breakpoint
CREATE INDEX `wiki_files_sha1_idx` ON `wiki_files` (`sha1`);--> statement-breakpoint
CREATE INDEX `wiki_files_import_run_idx` ON `wiki_files` (`import_run_id`);--> statement-breakpoint
CREATE TABLE `wiki_import_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`finished_at` text,
	`status` text DEFAULT 'running' NOT NULL,
	`requested_articles` integer DEFAULT 0 NOT NULL,
	`imported_articles` integer DEFAULT 0 NOT NULL,
	`failed_articles` integer DEFAULT 0 NOT NULL,
	`error_log` text
);
--> statement-breakpoint
CREATE INDEX `wiki_import_runs_status_idx` ON `wiki_import_runs` (`status`);