export function wikiImportUsage() {
  return `Usage:
  npm run wiki:import -- --id codwiki-88-ridge
  npm run wiki:import -- --game cod3
  npm run wiki:import -- --limit 10
  npm run wiki:import -- --all

Options:
  --id <id>       Import one record; repeat for several records
  --game <id>     Import records used by every level of a game; repeatable
  --limit <n>     Import the first n incomplete records
  --all           Check every Wiki import record
  --force         Rewrite records whose revision is unchanged
  --dry-run       Fetch and report without writing files
  --delay-ms <n>  Delay between API calls (minimum 2000; default 5000)
  --help          Show this message

Configure COD_ATLAS_WIKI_ORIGIN and COD_ATLAS_WIKI_USER_AGENT in .env first.`;
}
