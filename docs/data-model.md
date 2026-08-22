# Atlas data model

The repository separates human-curated atlas records from machine-oriented
Wiki imports. There is no database and no shared place entity.

## Relationships

```mermaid
erDiagram
  GAME ||--o{ LEVEL : "referenced by games"
  WIKI_ARTICLE ||--o{ LEVEL : "referenced by wikiArticle"
  LEVEL ||--o{ LOCATION : "embeds"
```

- `content/games/*.yaml` supplies stable game IDs, readable labels, codes,
  release dates, franchise categories, and release eras.
- `content/levels/**/*.md` is the curated source for level classification,
  coordinates, precision, and notes.
- `content/wiki-import/articles/*.json` stores repeatable Wiki-import results
  and media attribution.
- `app/data/atlas.generated.json` is a derived, ignored browser build artifact.

## Game record

```yaml
id: cod3
code: COD3
label: CoD 3
released: 2006-11-07
category: world-war
era: classic
```

The release date controls the game-filter ordering. Labels should be concise
but understandable without prior knowledge of internal abbreviations. An
optional `public/images/games/<game-id>.png` is detected during the build and
exposed as the game's `icon`; games without one continue to display their
label.

Game categories are `world-war`, `modern-warfare`, `black-ops`, and
`standalone`. Release eras are `classic`, `golden`, `sci-fi`, `reboot`, and
`live-service`. Expansions, handheld releases, remasters, and other spinoffs
use the era in which that edition was released.

The generated country groups include a `continent` used by the advanced
filters. Standard countries are classified through `world-countries`; named
waters, the Arctic, and off-world settings use explicit supplemental buckets.

## Level source layout

Level files use one of two directory layouts while map-type folders are rolled
out incrementally:

```text
content/levels/<primary-game>/<level-slug>.md
content/levels/<primary-game>/campaign/<order>-<level-slug>.md
content/levels/<primary-game>/multiplayer/<level-slug>.md
```

A game must use one layout consistently. `cod`, `cod-uo`, `cod-fh`, and `cod2`
use `campaign/` for records whose `mode` is `singleplayer` and `multiplayer/`
for records whose `mode` is `multiplayer`. Games that have not been
reorganized remain flat. Map types are broad content categories; they are
distinct from multiplayer rule sets such as deathmatch or capture the flag.

Campaign orders start at `1`, have no leading zeros, and must be unique and
contiguous within their game. The prefix records play order without becoming
part of the stable level `id` or display title.

## Level record

The YAML frontmatter contains structured data; the Markdown body contains
research or editorial notes.

Required fields:

- `id`: stable, repository-wide level ID.
- `title`: human-readable level or map name.
- `games`: one or more game IDs.
- `mode`: `singleplayer` or `multiplayer`.
- `wikiArticle`: foreign key to a Wiki import record.
- `locations`: embedded location records. Use an empty list only when the
  level is known but its real-world location has not yet been curated.

Optional level fields include `campaign`, a grouping with a stable string `id`
and a human-readable `label`.

One level can embed multiple locations, or temporarily use `locations: []`
until location research is complete. Each location has a locally unique `id`,
a country, and normally coordinates. Optional geographic detail follows
the hierarchy `country` → `region` → `city` → `landmark`. A region may be a
state, province, constituent country, island, territory, or similar area;
landmarks are named sites such as rivers, castles, and buildings. Coordinates
are not deduplicated across levels.

Campaign metadata identifies the named campaign section that contains a level;
it is separate from the numeric play-order prefix in campaign filenames. Keep
the ID stable even if the display label is later corrected or translated.

Precision values:

- `exact`: verified landmark or exact point.
- `approximate`: researched estimate rather than an exact point.
- `city`: city-level evidence.
- `region`: regional evidence.
- `country`: country fallback.
- `off-world`: no terrestrial coordinates.

`confidence` and `method` are required on every location. Their allowed values
and decision guidance are documented in the
[data contribution guide](contributing-data.md). Copy-ready records live in
[`docs/templates/`](templates/).

Use `real-world-inspiration` when a verified real place inspired a fictional or
adapted in-game location. It distinguishes the real reference point from a
canonical claim that the in-game location is the landmark itself.

`primary: true` identifies the main location when a level contains several.

An optional `mapOverlay` belongs in the level Markdown frontmatter when a
reviewed game map can be geographically calibrated. It records a local image,
opacity, all four `[latitude, longitude]` corners, and complete source and
non-free rights attribution. The compiler validates these fields and writes
them to the separate `app/data/map-overlays.generated.json` browser store;
overlay data is not added to the main atlas JSON.

Optional `historyOverlays` attach one or more geographically calibrated
historical figures to images embedded in the level's research Markdown. Each
record has a stable ID, a local PNG under `public/images/maps/`, opacity, four
corners, and complete author, publication, copyright, and non-free-rights
attribution. The Markdown body must embed the corresponding PNG filename.
The compiler validates both the image and that body reference, then writes the
records to `app/data/history-overlays.generated.json`. The frontend renders a
matching Markdown image as a control that can place or remove that historical
figure on the live map. History-overlay data remains separate from the main
atlas JSON and from game-map overlays.

## Wiki import record

The stable `id` is the foreign-key target. Import-oriented fields include:

- Fandom page and revision IDs.
- Source and canonical article URLs.
- Wiki-provided level-location text and link.
- Wiki-provided previous/next-level and game text, with every linked Wiki
  target retained for later reviewed mapping to curated IDs.
- Wiki-provided date text.
- Map-style classification and supporting evidence.
- Main and map images, including web-resolution display URLs.
- Image detail pages and optional author, uploader, license, or rights metadata.
- Optional raw import payload.

Null fields mean that the value has not been imported yet. Metadata supplied by
Fandom is retained, but only usable source, display, and detail-page URLs are
required for an article image.
The generated atlas exposes displayable media once per Wiki article through
the top-level `wikiMedia` object, rather than duplicating it for every marker.

Repository-hosted level banners mirror the level source layout under
`public/images/levels/`, using either
`<primary-game>/<level-filename>.jpg` or
`<primary-game>/<map-type>/<level-filename>.jpg` (PNG is also supported). The
campaign `level-filename` includes its numeric order prefix. The build
validates file signatures and matching level Markdown paths, then exposes them
through `levelBanners`. The frontend prefers these banners and
uses imported Wiki media when no local banner exists or a local image fails to
load. These extracted or captured images are credited to
[plp-gtr](https://github.com/plp-gtr); underlying game artwork retains its
original copyright.

## Build flow

```mermaid
flowchart LR
  A["Curated content"] --> B["Validate and compile"]
  C["Wiki imports"] --> B
  B --> D["Generated atlas JSON (ignored)"]
  D --> E["Static map build"]
```

Run `npm run data:build` to validate IDs, foreign keys, enum values, coordinate
pairs, and ranges before regenerating the browser dataset. Use
`npm run data:check` to perform the same validation without writing build
artifacts. Never manually edit or commit the generated JSON.

Docker equivalent:

```sh
docker compose run --rm cod-atlas-tools npm run data:build
```

Marker clustering is a display concern. It may group nearby markers according
to zoom level, but it must not mutate or merge the underlying locations.
