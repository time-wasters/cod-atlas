# CoD Atlas

An open, static atlas of real-world locations represented in CoD. The
website has no database and no write API: Git is the source of truth, so data
corrections can be reviewed as normal pull requests.

## Content model

```text
content/
├── atlas.yaml                 # catalog metadata and original source
├── games/                     # one small YAML file per game
├── levels/<game>/             # one Markdown file per level
└── wiki-import/articles/      # machine-oriented Wiki import records
```

A level owns its marker coordinates. There is deliberately no shared `place`
table: two levels in Berlin, for example, may point to different buildings.
Leaflet can group nearby markers for display at low zoom without changing their
source coordinates.

Example level:

```md
---
id: cod3-laison-river
title: Laison River
games:
  - cod3
mode: singleplayer
wikiArticle: codwiki-laison-river
locations:
  - id: main
    label: Laizon River near Falaise
    country: France
    region: Normandy
    city: Falaise
    latitude: 48.944742
    longitude: -0.229523
    precision: approximate
    confidence: medium
    method: manual-approximate
    primary: true
---

Historical or editorial notes can live here.
```

One level can contain several `locations`. Coordinate precision is one of
`exact`, `approximate`, `city`, `region`, `country`, or `off-world`.

Wiki import files remain separate so an automated refresh cannot silently
overwrite curated coordinates, classifications, or historical notes. Each
record has a stable local ID and placeholders for the Fandom page ID, revision,
location links, map style, main image, map image, image detail pages, authors,
licenses, and raw import payload.

## Editing data

1. Edit or add a file under `content/levels/`.
2. Add a referenced game or Wiki import record when needed.
3. Run `npm run data:build` to validate relationships and regenerate the compact
   browser dataset.
4. Open a pull request with both the source change and regenerated
   `app/data/atlas.generated.json`.

The build fails for duplicate IDs, missing foreign keys, invalid modes,
incomplete coordinate pairs, or stale generated data.

## Local development

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Useful commands:

- `npm run data:build` validates content and refreshes the generated dataset.
- `npm run data:check` verifies that the committed generated dataset is current.
- `npm test` builds the static site and checks important migrated records.
- `npm run build` creates the Sites/Worker deployment in `dist/`.
- `npm run build:static` creates a plain, relative-path website in
  `dist-static/` for GitHub Pages, Nginx, or basic webspace.

The finished `dist-static/` directory can be uploaded as-is by CI. No Supabase
or other database service is required.

The included GitHub Actions workflow validates every pull request and attaches
the static website as a downloadable build artifact on `main`.

## Codex and VSCodium

Codex automatically reads the repository instructions in `AGENTS.md`. The
instructions preserve the data architecture, required checks, and licensing
rules so a new session can begin without repeating the project history.

After opening the repository in VSCodium:

```sh
npm ci
codex
```

Sign in to Codex with ChatGPT when prompted. Use **Terminal → Run Task** for
one-click data validation, tests, development, and static builds. Personal
model, login, and approval settings are intentionally not committed.

See `CONTRIBUTING.md` for the pull-request workflow and `docs/data-model.md` for
the complete content relationships.

## License

- Source code: GNU Affero General Public License v3.0 only
  (`AGPL-3.0-only`). Modified versions offered over a network must provide the
  corresponding source under the same license.
- Original project data and editorial content: Creative Commons
  Attribution-ShareAlike 4.0 International (`CC-BY-SA-4.0`).
- Third-party Wiki material and media retain their original licenses and
  attribution requirements. See `NOTICE.md`.

`LICENSE-DATA` applies to original material under `content/` and the generated
`app/data/atlas.generated.json`, to the extent copyright or database rights
apply. It does not relicense third-party material.

## Provenance

The project was inspired by
[u/robracer97's CoD location post](https://www.reddit.com/r/CallOfDuty/comments/10c3jbd/cod_every_location_visited_in_the_cod_franchise/).
CoD Wiki links and imported metadata remain subject to their source
pages' licensing and attribution requirements.
