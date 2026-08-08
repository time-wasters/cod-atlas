# Wiki import command

`npm run wiki:import` manually refreshes the machine-oriented records in
`content/wiki-import/articles/` from the Call of Duty Wiki. It reads through
the MediaWiki API and never edits the Wiki or curated level files.

## Run through Docker

The host may not have Node.js or npm. Build the repository's locked tooling
service once:

```sh
docker compose build cod-atlas-tools
```

Compose mounts the repository at `/app` so non-dry runs write updated JSON back
to the working tree. Its separate `/app/node_modules` volume keeps container
dependencies visible beneath that mount:

```sh
docker compose run --rm cod-atlas-tools \
  npm run wiki:import -- --id codwiki-88-ridge --dry-run
```

The syntax works in PowerShell and POSIX-compatible shells. On PowerShell,
enter it on one line or replace each trailing `\` with a backtick.

Wiki access is disabled until it is explicitly configured. Copy the commented
Wiki hints from `.env.example` into the ignored `.env`, uncomment them, and
replace the example contact address:

```dotenv
COD_ATLAS_WIKI_ORIGIN=https://your-wiki.example
COD_ATLAS_WIKI_USER_AGENT=CoDAtlasWikiImporter/0.1 (maintainer@example.com)
```

`COD_ATLAS_WIKI_ORIGIN` is an origin only, without `/wiki` or `/api.php`.
The importer derives both paths from it and rejects source records belonging
to another origin. The command refuses to make a request if either variable is
blank. `.env.example` contains commented Call of Duty Wiki values as a hint;
the repository does not enable that service by default. Missing or invalid
configuration produces concise setup guidance and a non-zero exit status,
without printing a JavaScript stack trace.

## Select records

The importer refuses to run without an explicit scope.

| Option | Behavior |
| --- | --- |
| `--id <id>` | Check one import record. Repeat the option to check several IDs. |
| `--game <game-id>` | Check every distinct Wiki record referenced by levels whose `games` list contains this game ID. Repeat for several games. |
| `--limit <n>` | Check the first `n` records whose `importedAt` is still null. |
| `--all` | Check all import records and skip those already at the latest revision. |
| `--force` | Re-import selected records even when the revision ID is unchanged. |
| `--dry-run` | Print complete proposed JSON without writing any file. |
| `--delay-ms <n>` | Wait this long between API calls; default `5000`, minimum `2000`. |
| `--help` | Print the command's built-in usage reference. |

Start with one dry run and inspect its proposed record:

```sh
npm run wiki:import -- --id codwiki-88-ridge --dry-run
```

Docker equivalent:

```sh
docker compose run --rm cod-atlas-tools npm run wiki:import -- --id codwiki-88-ridge --dry-run
```

To check all levels associated with one game, use its repository game ID. Wiki
articles shared by several matching levels are fetched only once:

```sh
npm run wiki:import -- --game cod3 --dry-run
```

Docker equivalent:

```sh
docker compose run --rm cod-atlas-tools npm run wiki:import -- --game cod3 --dry-run
```

The command rejects unknown game IDs. Levels are selected when the ID appears
anywhere in their `games` list, so shared and remastered levels are included.

Remove `--dry-run` only after the result looks correct. A gradual initial
import can use `--limit 10`; subsequent runs continue with records whose
`importedAt` is null. Use `--all` for a deliberate refresh after the collection
has been populated.

## Imported and preserved fields

For a changed page, the command can update:

- Fandom page ID, resolved source URL, and canonical URL;
- latest revision ID, timestamp, and SHA-1;
- the raw and display forms of the infobox location;
- main/map image metadata when complete attribution is available; and
- import time and a small raw evidence summary.

It preserves `mapStyle`, `mapStyleDetail`, `mapStyleConfidence`, and
`mapStyleEvidence`. It never opens or changes a level record, so curated
coordinates, precision, confidence, method, mode, and editorial notes remain
untouched.

Media is populated only when the API provides all required information: source
URL, file detail page, author, author profile, license name, and license URL.
Otherwise the command prints `skipping media without complete attribution`,
leaves the media record unchanged, and retains the discovered file title in
`rawPayload` for manual review. Do not fill missing attribution by guesswork.

## Request behavior and failures

The importer groups up to ten distinct articles into an API request, sends requests
serially, waits five seconds by default, and supplies `maxlag=1`. Image metadata
is fetched in a second batched request only when images were discovered.
Unchanged revision IDs avoid the image request and any file write.

HTTP 429/503, `maxlag`, and `ratelimited` responses receive bounded exponential
backoff. Other errors stop the run rather than attempting to bypass a block.
Do not run multiple importers concurrently, lower the delay to create load, or
work around HTTP 403. A stopped run is safe to resume: completed JSON files are
written atomically and unchanged revisions are skipped.

Missing pages and missing revisions are reported and skipped. Review these
records manually; do not point them at an approximate article just to complete
the import.

## Review and validate

After a non-dry run:

1. Review every changed JSON file, especially `levelLocation` and attribution.
2. Confirm that no curated file under `content/levels/` changed.
3. Regenerate and validate the derived atlas through Docker.
4. Commit reviewed source JSON and generated data together.

Run the standard checks listed in [CONTRIBUTING.md](../CONTRIBUTING.md). The
focused parser tests are part of `npm test`; the Docker equivalent is
`docker compose run --rm cod-atlas-tools npm test`.
