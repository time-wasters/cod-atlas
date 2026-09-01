import path from "node:path";
import process from "node:process";
import { buildWikiArticleLookup } from "../../../domain/wiki-article/wiki-article-lookup.service.mjs";
import { loadWikiArticleFileRecords } from "../../../infrastructure/content/filesystem/wiki-article-file.repository.mjs";
import { loadWikiArticleIdsForGames } from "../../../infrastructure/content/filesystem/wiki-game-selection.loader.mjs";
import { importWikiArticleBatch } from "./import-wiki-article-batch.mjs";

const BATCH_SIZE = 10;

export async function importWikiArticles(options, configuration) {
  const directory = path.join(process.cwd(), "content/wiki-import/articles");
  const records = await loadWikiArticleFileRecords(directory);
  const articleLookup = buildWikiArticleLookup(records, configuration.origin);
  const ids = new Set(options.ids);
  if (options.gameIds.length) {
    for (const id of await loadWikiArticleIdsForGames(options.gameIds)) ids.add(id);
  }
  let selected = ids.size ? records.filter(({ article }) => ids.has(article.id)) : records;
  const missing = [...ids].filter((id) => !selected.some(({ article }) => article.id === id));
  if (missing.length) throw new Error(`Unknown Wiki import IDs: ${missing.join(", ")}`);
  if (options.limit !== null) {
    selected = selected.filter(({ article }) => options.force || !article.importedAt).slice(0, options.limit);
  }
  if (!selected.length) {
    console.log("No records selected.");
    return;
  }
  console.log(`Checking ${selected.length} record(s) in batches of ${BATCH_SIZE}; API delay ${options.delayMs}ms.`);
  const state = { count: 0 };
  let changed = 0;
  for (let index = 0; index < selected.length; index += BATCH_SIZE) {
    changed += await importWikiArticleBatch(
      selected.slice(index, index + BATCH_SIZE),
      options,
      state,
      configuration,
      articleLookup,
    );
  }
  console.log(`Finished: ${changed} changed record(s), ${state.count} API request(s).`);
}
