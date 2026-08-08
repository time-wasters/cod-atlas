# Wiki import command

`npm run wiki:import` manually refreshes the machine-oriented records in
`content/wiki-import/articles/` from the Call of Duty Wiki. It reads through
the MediaWiki API and never edits the Wiki or curated level files.

## Run through Docker

The host may not have Node.js or npm. Build the repository's locked builder
image once:

```sh
docker build --target builder --tag cod-atlas-builder:local .
```

Run the importer with the repository mounted at `/app` so non-dry runs write
updated JSON back to the working tree. The separate `/app/node_modules` volume
keeps the dependencies installed in the image visible beneath that mount:

```sh
docker run --rm \
  --mount "type=bind,source=${PWD},target=/app" \
  --mount "type=volume,target=/app/node_modules" \
  cod-atlas-builder:local \
  npm run wiki:import -- --id codwiki-88-ridge --dry-run
```

The syntax works in PowerShell and POSIX-compatible shells. On PowerShell,
enter it on one line or replace each trailing `\` with a backtick.

To identify a responsible maintainer, pass a contact-bearing user agent:

```sh
docker run --rm \
  --env "COD_ATLAS_WIKI_USER_AGENT=CoDAtlasWikiImporter/0.1 (maintainer@example.com)" \
  --mount "type=bind,source=${PWD},target=/app" \
  --mount "type=volume,target=/app/node_modules" \
  cod-atlas-builder:local \
  npm run wiki:import -- --limit 10 --dry-run
```

The command has a project-identifying default, but maintainers should set the
environment variable to provide current contact information.

## Select records

The importer refuses to run without an explicit scope.

| Option | Behavior |
| --- | --- |
| `--id <id>` | Check one import record. Repeat the option to check several IDs. |
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

The importer groups up to ten articles into an API request, sends requests
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
focused parser tests are part of `npm test`.
