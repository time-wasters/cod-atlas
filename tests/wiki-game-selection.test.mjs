import assert from "node:assert/strict";
import test from "node:test";
import { selectWikiArticleIdsForGames } from "../src/application/wiki-import/use-cases/select-wiki-article-ids-for-games.mjs";
import { loadWikiArticleIdsForGames } from "../src/infrastructure/content/filesystem/wiki-game-selection.loader.mjs";

test("game selection includes every matching level and deduplicates Wiki articles", () => {
  const levels = [
    { id: "cod3-one", games: ["cod3"], wikiArticle: "codwiki-one" },
    { id: "cod3-shared", games: ["cod3"], wikiArticle: "codwiki-shared" },
    { level: "cod3-shared", appearanceGame: "cod4-r" },
    { level: "cod3-shared", appearanceGame: "cod4", wikiArticle: "codwiki-remake" },
    { games: ["cod4-r"], wikiArticle: "codwiki-shared" },
    { games: ["cod4"], wikiArticle: "codwiki-other" },
  ];
  assert.deepEqual(selectWikiArticleIdsForGames(levels, ["cod3"]), ["codwiki-one", "codwiki-shared"]);
  assert.deepEqual(selectWikiArticleIdsForGames(levels, ["cod3", "cod4-r"]), ["codwiki-one", "codwiki-shared"]);
  assert.deepEqual(selectWikiArticleIdsForGames(levels, ["cod4"]), ["codwiki-other", "codwiki-remake"]);
});

test("game selection resolves curated levels and rejects unknown game IDs", async () => {
  const ids = await loadWikiArticleIdsForGames(["cod3"]);
  assert.ok(ids.includes("codwiki-the-corridor-of-death"));
  assert.equal(ids.length, new Set(ids).size);
  await assert.rejects(loadWikiArticleIdsForGames(["not-a-game"]), /Unknown game IDs: not-a-game/);
});
