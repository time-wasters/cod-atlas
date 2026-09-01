const DEFAULT_DELAY_MS = 5_000;
const MIN_DELAY_MS = 2_000;

export function parseWikiImportOptions(argv) {
  const options = {
    ids: [],
    gameIds: [],
    limit: null,
    all: false,
    force: false,
    dryRun: false,
    delayMs: DEFAULT_DELAY_MS,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--id" || argument === "--game") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
      if (argument === "--id") options.ids.push(value);
      else options.gameIds.push(value);
      index += 1;
    }
    else if (argument === "--limit") options.limit = Number(argv[++index]);
    else if (argument === "--delay-ms") options.delayMs = Number(argv[++index]);
    else if (argument === "--all") options.all = true;
    else if (argument === "--force") options.force = true;
    else if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--help") options.help = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  if (options.help) return options;
  if (!options.ids.length && !options.gameIds.length && options.limit === null && !options.all) {
    throw new Error("Select records with --id, --game, --limit, or --all");
  }
  if (options.limit !== null && (!Number.isInteger(options.limit) || options.limit < 1)) {
    throw new Error("--limit must be a positive integer");
  }
  if (!Number.isInteger(options.delayMs) || options.delayMs < MIN_DELAY_MS) {
    throw new Error(`--delay-ms must be at least ${MIN_DELAY_MS}`);
  }
  return options;
}
