# Data contribution guide

This is the reference for hand-authored data under `content/`. Start from a
file in [`docs/templates/`](templates/) and replace every example value. Do not
edit `app/data/atlas.generated.json`; `npm run data:build` regenerates it.

## What to contribute

| Record | Source path | Template |
| --- | --- | --- |
| Game | `content/games/<game-id>.yaml` | [game.yaml](templates/game.yaml) |
| Terrestrial level | `content/levels/<primary-game>/<level-id>.md` | [level-terrestrial.md](templates/level-terrestrial.md) |
| Off-world level | `content/levels/<primary-game>/<level-id>.md` | [level-off-world.md](templates/level-off-world.md) |
| Wiki import | `content/wiki-import/articles/<article-id>.json` | [wiki-article.json](templates/wiki-article.json) |

Most contributions only change a level. Add a game only if it does not exist,
and add a Wiki record only if the level's article is not already represented.
Search IDs before adding anything. IDs are lowercase, stable, and hyphenated;
do not rename an ID merely to improve its wording.

## Level fields

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Repository-wide level ID, normally prefixed with the primary game ID. |
| `title` | yes | Display name of the level or map. |
| `games` | yes | One or more IDs from `content/games/`; put the primary/earliest release first. |
| `mode` | yes | `singleplayer` or `multiplayer`. |
| `wikiArticle` | yes | ID of a separate Wiki import JSON record. |
| `locations` | yes | One or more locations owned by this level. Never reference a shared place. |
| Markdown body | no | Concise research, ambiguity, or editorial notes. |

Each location requires `id`, `country`, `precision`, `confidence`, and `method`.
The location ID only needs to be unique within its level. `label`, `region`, and
`city` are optional display context. `latitude` and `longitude` must either
both be present or both be absent. Latitude is -90 through 90 and longitude is
-180 through 180. Use decimal degrees. Set `primary: true` on the main location
when a level contains multiple locations; use it at most once.

For `off-world`, omit both coordinates. For terrestrial records, provide the
best evidence-supported coordinates. A country or region centroid is allowed
as a fallback, but it must not be presented as a more precise point.

## Allowed values

### `precision`

Precision describes the geographic resolution of the coordinates, not how
confident you feel about the evidence.

| Value | Use when |
| --- | --- |
| `exact` | The point is a verified real landmark or exact site. |
| `approximate` | The real area is known, but the selected point is a researched estimate. |
| `city` | Evidence identifies only a city or settlement. |
| `region` | Evidence identifies only a state, province, island, or similar region. |
| `country` | Only the country is supported; coordinates are a country fallback. |
| `off-world` | The setting has no terrestrial position; omit coordinates. |

### `confidence`

Confidence describes the strength of the identification evidence.

| Value | Use when |
| --- | --- |
| `high` | A reliable source explicitly identifies the place, or the landmark is verified. |
| `medium` | Multiple contextual clues support the identification, but it is not explicit or exact. |
| `fallback` | The marker exists only to represent broad country/region evidence, or the setting is off-world. |

### `method`

Method records how the place was identified. Choose the most specific method
that actually produced the location.

| Value | Meaning |
| --- | --- |
| `verified-landmark` | A real landmark or exact site was independently verified. |
| `manual-approximate` | Research established an area and a contributor manually selected an approximate point. |
| `wiki-location` | The Wiki's structured location field explicitly identifies the place. |
| `article-context` | Article prose or other reliable contextual evidence identifies it. |
| `title` | The level title itself is the place name. |
| `title-mention` | The title mentions a place but contains other wording or ambiguity. |
| `region-fallback` | Only regional evidence is available, so a regional representative point is used—or no terrestrial point exists. |
| `country-fallback` | Only country evidence is available, so a country representative point is used. |

Common combinations are `exact` + `high` + `verified-landmark`,
`approximate` + `medium` + `manual-approximate`, `city` + `high` +
`wiki-location`, and `country` + `fallback` + `country-fallback`. These are
examples, not automatic rules: record what the evidence supports.

## Game and Wiki records

A game requires `id`, short `code`, human-readable `label`, and ISO
`released` date (`YYYY-MM-DD`). Release dates control filter order.

A Wiki import record requires a stable `id` and `sourceUrl`. Keep import data
separate from curated level data. Unknown import values are `null`; do not
invent values just to fill the template. `mapStyle` is `singleplayer` or
`multiplayer`, matching the curated classification. Existing
`mapStyleConfidence` uses `curated` when that classification came from the
atlas pending a future source refresh.

Do not add media without its source URL, detail page URL, author name and user
URL, license name, and license URL. A refresh must never overwrite curated
coordinates, precision, confidence, method, or notes.

## Submit and validate

After editing `content/`, run `npm run data:build` and include the regenerated
`app/data/atlas.generated.json` in the same pull request. Then run:

```sh
npm run data:check
npm run lint
npm test
npm run build:static
```

Explain the evidence and link reliable sources in the pull-request description.
If the marker count changes, make that explicit and update the regression test.
