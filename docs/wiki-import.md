# Wiki import command

`npm run wiki:import` manually refreshes `content/wiki-import/articles/`
through the Call of Duty Wiki's MediaWiki API. It never edits the Wiki or
curated level files.

## Run through Docker

Host Node/npm is optional. Build the locked tooling service once:

```sh
docker compose build cod-atlas-tools
docker compose run --rm cod-atlas-tools npm run wiki:import -- --id codwiki-88-ridge --dry-run
```

Compose mounts the repo at `/app`, writing non-dry-run JSON to the working
tree, and preserves dependencies in a separate `/app/node_modules` volume.
Use the [Docker prefix](docker-commands.md) for all npm examples below.
Single-line commands work in PowerShell/POSIX; multiline POSIX commands use
trailing `\`, replaced with backticks in PowerShell.

Wiki access is opt-in. Copy/uncomment the Wiki hints from `.env.example` into
ignored `.env`, replacing the example contact:

```dotenv
COD_ATLAS_WIKI_ORIGIN=https://your-wiki.example
COD_ATLAS_WIKI_USER_AGENT=CoDAtlasWikiImporter/0.1 (maintainer@example.com)
```

The origin excludes `/wiki` and `/api.php`; the importer derives both and
rejects records from other origins. Either variable blank prevents requests.
The commented CoD Wiki hints do not enable access. Missing/invalid configuration
exits nonzero with concise guidance, without a JavaScript stack trace.

## Select records

Explicit scope is required.

| Option | Behavior |
| --- | --- |
| `--id <id>` | Select one import; repeat for multiple IDs. |
| `--game <game-id>` | Select distinct Wiki records referenced by levels whose `games` includes this ID; repeat for multiple games. |
| `--limit <n>` | Select first `n` records with null `importedAt`. |
| `--all` | Select all; skip latest revisions. |
| `--force` | Re-import selected records despite unchanged revision IDs. |
| `--dry-run` | Print complete proposed JSON; write nothing. |
| `--delay-ms <n>` | Delay between API calls; default `5000`, minimum `2000`. |
| `--help` | Built-in usage. |

Start with one article's dry run and inspect the result. Game scope rejects
unknown IDs, includes shared/remastered levels when the ID occurs anywhere in
`games`, and fetches shared articles once:

```sh
npm run wiki:import -- --id codwiki-88-ridge --dry-run
npm run wiki:import -- --game cod3 --dry-run
```

Remove `--dry-run` only when correct. Use `--limit 10` for gradual initial
imports (subsequent runs continue with null `importedAt`), then `--all` for
deliberate collection refreshes.

## Imported and preserved fields

Changed pages can update:

- Fandom page ID, resolved source/canonical URLs.
- Latest revision ID, timestamp, SHA-1.
- Raw/display infobox location, previous level, next level, game, date.
- Every previous/next/game Wiki target's title, label, URL for later reviewed
  mapping to curated IDs.
- Per previous/next link: `game` or `chronological` sequence (default `game`)
  and matching local Wiki-import article ID, or `null` if unresolved.
- Main/map image metadata with available license/recognized rights and attribution.
- Import time and small raw evidence summary.

Preserve `mapStyle`, `mapStyleDetail`, `mapStyleConfidence`,
`mapStyleEvidence`. Level records are never opened/changed; curated coordinates,
precision, confidence, method, mode, and editorial notes remain untouched.

API media needs source, web-resolution thumbnail, and detail-page URLs.
Author, uploader, license, and rights are optional and retained when supplied.
CoD Wiki `Copyrighted Media` becomes `rights.status: non-free`; that notice
is not required for main-image display.

Unusable display URLs emit `skipping media without a usable display URL`,
leave media unchanged, and retain the discovered file title in `rawPayload`
for review. Never invent missing metadata.

## Request behavior and failures

Requests are serial, batch at most ten distinct articles, wait five seconds
by default, and use `maxlag=1`. Fetch image metadata in a second batch only
when images are found. Unchanged revisions skip image requests and writes,
except one-time backfills of newly supported fields (no `--force` needed).

Classify each previous/next link by a case-insensitive chronological marker
in text after it, up to the next target; otherwise use `game`. Preserve
original `raw`/`label`, including specific chronology wording.

HTTP 429/503, `maxlag`, and `ratelimited` get bounded exponential backoff;
other errors stop. Never run importers concurrently, lower delay to create
load, or bypass HTTP 403. Atomic JSON writes and revision skipping allow safe
resumption. Missing pages/revisions are reported and skipped; review manually
instead of substituting approximate articles.

## Review and validate

After a non-dry run:

1. Review every changed JSON, especially `levelLocation` and attribution.
2. Confirm no `content/levels/` file changed.
3. Regenerate/validate the derived atlas through Docker when running checks.
4. Commit only reviewed source JSON; never commit generated artifacts.

See [required checks](../CONTRIBUTING.md#required-checks); focused parser tests
are included in `npm test`. Agents follow `AGENTS.md`: recommend relevant
checks and run only on explicit user request.
