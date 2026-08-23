# Contributing to CoD Atlas

Thanks for helping improve the atlas. Git is the source of truth; corrections
and additions should arrive as focused pull requests with supporting sources.

## Set up the project

Requires Node.js 22.13 or newer.

Use the ignored `.env` for local settings. `.env.example` documents available
variables; its Wiki settings are commented because imports are opt-in.

```sh
npm ci
npm run dev
```

Docker equivalent (no host Node.js/npm required):

```sh
docker compose build cod-atlas-tools
docker compose run --rm --service-ports cod-atlas-tools npm run dev -- --port 3000
```

See [Docker npm commands](docs/docker-commands.md) for other commands.

VSCodium users can run the common commands through **Terminal → Run Task**.

## Correct an existing level

1. Find the Markdown file under `content/levels/`.
2. Change the curated frontmatter or add a concise note to the Markdown body.
3. Include a reliable source link in the pull-request description.
4. After changing the standard research sections or location precision, run
   `npm run progress:update` (Docker:
   `docker compose run --rm cod-atlas-tools npm run progress:update`) to
   refresh the generated tables in `docs/progress.md`.
5. If a local Node or Docker toolchain is available, run `npm run data:check`
   or `docker compose run --rm cod-atlas-tools npm run data:check`. CI runs the
   same validation for every pull request.
6. Commit the curated source change. Generated JSON is built automatically and
   is not committed.

Coordinates belong to the level location itself. Do not create a shared place
record even when several levels use the same city name.

## Add a level

See the [data contribution guide](docs/contributing-data.md) for every field,
all allowed `mode`, `precision`, `confidence`, and `method` values, selection
guidance, and copy-ready templates for every source record type.

Create a Markdown file under the primary game's directory. If that game is
already organized by map type, place it in `campaign/` or `multiplayer/` to
match its `mode` field. Currently `cod`, `cod-uo`, `cod-fh`, `cod2`, `wz`, and
`wz2` use this layout; games that have not been reorganized retain their
existing flat layout.

Campaign files in a map-type layout are named
`<order>-<level-slug>.md`, starting at `1` without leading zeros or gaps.
Multiplayer and flat-layout files use `<level-slug>.md`. Never repeat the
primary game ID or include the campaign order in the stable ID. For example,
an `id` of `cod3-example-level` belongs at
`content/levels/cod3/example-level.md` while `cod-example-level` could belong
at `content/levels/cod/campaign/27-example-level.md`.

```md
---
id: cod3-example-level
title: Example Level
games:
  - cod3
mode: singleplayer
wikiArticle: codwiki-example-level
locations:
  - id: main
    label: Example landmark
    country: France
    region: Normandy
    city: Falaise
    latitude: 48.9
    longitude: -0.2
    precision: approximate
    confidence: medium
    method: manual-approximate
    primary: true
---

Optional research notes belong here.
```

Add a game YAML file only when its referenced game does not already exist. Add
or reference a separate Wiki import JSON record for `wikiArticle`.

If the same level also appears in another game without material geographic or
playable-layout changes, add `<level-slug>.ref.md` under that game's directory
instead of putting several IDs in `games`. A reference contains only
`level: <canonical-level-id>` plus optional appearance-specific `title`,
`wikiArticle`, `campaign`, `metadata`, or Markdown notes. Missing values and
notes inherit from the canonical record. Locations, mode, overlays, and stable
IDs cannot be overridden. A materially changed remake gets its own canonical
level record instead.

An optional interface icon can be added at
`public/images/games/<game-id>.png`. The filename must exactly match the game
ID; no game record change is needed.

Copy templates from [`docs/templates/`](docs/templates/) instead of using an
existing record whose assumptions may not fit the new contribution.

## Wiki imports and media

Wiki import records must remain separate from curated level files. A refresh
may update the Fandom page ID, revision, source location, map style evidence,
and image metadata. It must not silently replace curated coordinates or notes.

Use the manual [Wiki import command](docs/wiki-import.md) to refresh records.
The reference documents Docker execution, dry runs, selection options, request
pacing, imported fields, and media-attribution safeguards.

Imported Fandom images require a source URL, web-resolution URL, and image
detail page. Author, uploader, license, and rights metadata are optional; the
importer preserves them when Fandom provides them. Never invent missing
attribution or describe a copyright exception as a license.

## Required checks

```sh
npm run data:check
npm run lint
npm test
npm run build:static
```

Docker equivalents:

```sh
docker compose run --rm cod-atlas-tools npm run data:check
docker compose run --rm cod-atlas-tools npm run lint
docker compose run --rm cod-atlas-tools npm test
docker compose run --rm cod-atlas-tools npm run build:static
```

If a change intentionally adds or removes marker locations, update the explicit
regression count in the tests and explain the count change in the pull request.

## Pull-request checklist

- The change is limited to one coherent correction or feature.
- Game and Wiki foreign keys resolve.
- Location precision reflects the quality of the evidence.
- Singleplayer/multiplayer classification has been checked.
- Generated data is current.
- Third-party attribution and licensing are preserved.

## Contributor licensing

By contributing, you agree that code contributions are provided under
`AGPL-3.0-only` and original data/editorial contributions under
`CC-BY-SA-4.0`. Third-party material remains under its original license.
