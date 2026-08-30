import process from "node:process";
import { importWikiArticles } from "../../../application/wiki-import/use-cases/import-wiki-articles.mjs";
import { resolveWikiConfiguration } from "../../external/call-of-duty-wiki/wiki-configuration.mjs";
import { parseWikiImportOptions } from "./wiki-import-options.mjs";
import { wikiImportUsage } from "./wiki-import-usage.mjs";

export async function runWikiImportCommand(argv) {
  let options;
  try {
    options = parseWikiImportOptions(argv);
  } catch (error) {
    console.error(error.message);
    console.error(wikiImportUsage());
    process.exitCode = 1;
    return;
  }
  if (options.help) {
    console.log(wikiImportUsage());
    return;
  }
  const configuration = resolveWikiConfiguration();
  await importWikiArticles(options, configuration);
}
