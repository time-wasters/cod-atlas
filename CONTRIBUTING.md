# Contributing to Call of Duty Atlas

Thanks for helping improve the atlas. Git is the source of truth; corrections
and additions should arrive as focused pull requests with supporting sources.

## Set up the project

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

VSCodium users can run the common commands through **Terminal → Run Task**.

## Correct an existing level

1. Find the Markdown file under `content/levels/`.
2. Change the curated frontmatter or add a concise note to the Markdown body.
3. Include a reliable source link in the pull-request description.
4. Run `npm run data:build`.
5. Commit the level file and `app/data/atlas.generated.json` together.

Coordinates belong to the level location itself. Do not create a shared place
record even when several levels use the same city name.

## Add a level

Create a Markdown file under the primary game's directory:

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
    method: historical-research
    primary: true
---

Optional research notes belong here.
```

Add a game YAML file only when its referenced game does not already exist. Add
or reference a separate Wiki import JSON record for `wikiArticle`.

## Wiki imports and media

Wiki import records must remain separate from curated level files. A refresh
may update the Fandom page ID, revision, source location, map style evidence,
and image metadata. It must not silently replace curated coordinates or notes.

Do not add an image unless its import record contains the source URL, image
detail page, author, author profile link, license name, and license URL.

## Required checks

```sh
npm run data:check
npm run lint
npm test
npm run build:static
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
