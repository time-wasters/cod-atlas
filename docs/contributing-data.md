# Data contribution guide

Reference for hand-authored `content/`. Start from [templates](templates/) and
replace every example. Never edit/commit ignored `app/data/*.generated.json`;
commands regenerate it as needed. Without host npm, prepend
`docker compose run --rm cod-atlas-tools` to npm commands; see
[Docker setup](docker-commands.md).

## What to contribute

| Record | Source path | Template |
| --- | --- | --- |
| Game | `content/games/<game-id>.yaml` | [game.yaml](templates/game.yaml) |
| Terrestrial level | `content/levels/<primary-game>/<map-type>/<filename>.md` | [level-terrestrial.md](templates/level-terrestrial.md) |
| Off-world level | same level path | [level-off-world.md](templates/level-off-world.md) |
| Level appearance | `content/levels/<appearance-game>/<map-type>/<filename>.ref.md` | minimal reference below |
| Wiki import | `content/wiki-import/articles/<article-id>.json` | [wiki-article.json](templates/wiki-article.json) |

Usually only a level changes. Search IDs first; add games/articles only if
absent. IDs are lowercase, stable, hyphenated; never rename for wording alone.
AI research must follow [research instructions](map-research-ai-instructions.md),
including sources, coordinates, Maps URLs, disclosure, and body headings.

Follow the [source layout](data-model.md#level-source-layout): directories map
Campaign to `singleplayer`, Multiplayer to `multiplayer`, Zombies to `zombies`,
and `special-ops/`, `survival/`, `challenge/` to matching `other` subtypes.
These are map categories, not multiplayer rule sets. Prefer map-type directories;
keep legacy flat games flat until reorganizing the whole game, never mixing layouts.

Primary-game directory identifies ownership; frontmatter defines identity.
Campaign filenames use `<order>-<descriptive-name>.md`, unique/contiguous from
`1` without leading zeros; other types use `<descriptive-name>.md`.
Names need not match IDs (e.g. `example-level` at `campaign/27-river-crossing.md`);
never put campaign order in the stable ID/title.

## Game fields

Required: `id`, short `code`, readable `label`, full `labelLong`,
ISO `released` (`YYYY-MM-DD`, orders filters), `series`, nonempty `developer`.
Developers use stable lowercase underscore-separated `id` and readable
`name`; multiple groupings may apply.

Series: `world-war-ii`, `modern-warfare`, `black-ops`, `standalone`.
Optional `subseries` accepts `main`, `reboot`, `remaster`, `add-on`,
`spin-off`; use a list for multiple memberships, omit if none.
`reboot` means reboot continuity; `add-on` means expansion (e.g. United
Offensive). `remaster` requires `remasterOf` with the original game ID;
otherwise omit it. Follow existing game records for optional image providers.
Builds automatically detect optional `public/images/games/<game-id>.png` icons.

## Level fields

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Repository-wide ID, normally primary-game-prefixed |
| `title` | yes | Display name |
| `games` | yes | Exactly one owner ID from `content/games/`; other appearances use references |
| `mode` | yes | `singleplayer`, `multiplayer`, `zombies`, `other` |
| `modeSub` | only `other` | Required: `special-ops`, `survival`, `challenge`; omit for other modes |
| `campaign` | no | Named section: stable string `id`, display `label` |
| `content-update` | no | Release grouping: stable string `id`, display `label`; any mode/subtype |
| `wikiArticle` | yes | Separate Wiki import ID |
| `locations` | usually | Embedded locations; omit only to inherit via `metadata.variantOf`; explicit `[]` stays empty; no shared places |
| Markdown body | no | Concise research, ambiguity, editorial notes |

Campaign grouping is independent of filename order; keep IDs through label changes:

```yaml
campaign:
  id: "1"
  label: American Campaign
```

`content-update` groups one game's original release, map pack, season, or
other release. Its stable string ID orders updates; keep one label per ID per game.

Separately selectable Special Ops/Survival/Challenge entries use `other` plus
subtype. Every Challenge is canonical, even when several reuse one mission.
Store its number/objectives in `metadata`, link the reused campaign via
`metadata.variantOf`, and omit `locations` to inherit geography.

`metadata.variantOf` links distinct canonical levels, never unchanged
cross-game appearances. Builds follow valid inheritance chains; unknown targets
and cycles are invalid. Any supplied `locations`, including `[]`, overrides
inheritance. Use `.ref.md` for unchanged appearances.

## Roster-completeness audit

Check all categories the source game offers: Campaign, Multiplayer, Zombies,
Challenge, Special Ops, Survival/Hostiles/Safeguard/Exo Survival, Nightmares,
Strike Force, War, Extinction. These audit categories do not automatically
become `mode`/`modeSub`; use supported atlas classifications.

For unchanged cross-game levels, put a reference under the appearance game:

```md
---
level: cod-carentan
---
```

Optional fields: `title`, `wikiArticle`, `campaign`, `content-update`, `metadata`. Omitted
values inherit; optional Markdown precedes canonical notes. References cannot
supply protected canonical fields (including mode/subtype, locations,
precision/confidence/method). Appearance metadata must not contain `variantOf`;
variants need canonical records.

A reference's `content-update` belongs to its appearance game and does not
inherit from the canonical game. For example, BO3's Origins reference uses
Zombies Chronicles while its BO2 canonical record retains Apocalypse.

Location requirements:

- `id` (unique within level), `country`, `precision`, `confidence`, `method`.
- Optional evidence-supported hierarchy: `country → region → city → landmark`.
  Regions include states, provinces, constituent countries, islands, territories;
  landmarks include rivers, castles, buildings, other named sites. Old `label`
  is unsupported.
- Decimal `latitude` (-90..90) and `longitude` (-180..180): both present or
  both absent. Omit both for `off-world`; terrestrial locations need the best
  supported coordinates. Region/country centroids are valid fallbacks, never
  present them as more precise.
- With multiple locations, set `primary: true` on the main one, at most once.
- Optional `urls`: embedded HTTPS single-key objects with provider
  `googleMaps`, `wikipedia`, or `callOfDutyMaps`; no duplicate providers or
  shared places. Maps is an outbound link needing no API key. Prefer
  `https://www.google.com/maps/search/?api=1&query=...`; exact share links to
  the intended listing are also accepted. AI research follows the stricter
  [named-place search URL rules](map-research-ai-instructions.md#google-maps-urls).
  Wikipedia: direct English real-location article; if absent, check the
  country's language edition. CoD Maps: the specific map guide, e.g.
  `https://callofdutymaps.com/call-of-duty-1/pavlov/`.

## Allowed values

### `precision`

Geographic resolution, independent of confidence:

| Value | Use when |
| --- | --- |
| `exact` | Verified real landmark/exact site |
| `approximate` | Known area; researched point estimate |
| `city` | Only city/settlement identified |
| `region` | Only state/province/island/similar area identified |
| `country` | Only country supported; fallback coordinates |
| `off-world` | No terrestrial position; omit coordinates |

### `confidence`

Strength of identification evidence:

| Value | Use when |
| --- | --- |
| `high` | Reliable source explicitly names place, or landmark verified |
| `medium` | Multiple contextual clues, without explicit/exact identification |
| `fallback` | Broad region/country evidence only, or off-world |

### `method`

Choose the most specific method that produced the identification:

| Value | Meaning |
| --- | --- |
| `verified-landmark` | Independently verified landmark/exact site |
| `real-world-inspiration` | Verified real inspiration for fictional/adapted setting, not canonical in-universe position |
| `manual-approximate` | Researched area, manually estimated point |
| `wiki-location` | Wiki structured location explicitly identifies place |
| `article-context` | Article prose/other reliable context identifies place |
| `title` | Level title is the place name |
| `title-mention` | Title mentions place with other wording/ambiguity |
| `region-fallback` | Regional representative point, or no terrestrial point |
| `country-fallback` | Country representative point |

Examples, never automatic rules: `exact/high/verified-landmark`,
`exact/high/real-world-inspiration`, `approximate/medium/manual-approximate`,
`city/high/wiki-location`, `country/fallback/country-fallback`.
Use what evidence supports.

## Game and Wiki records

Game requirements are [above](#game-fields). Wiki records require stable `id`
and `sourceUrl`, separate from curated data. Unknown values stay `null`;
never invent template values. Imported `mapStyle: special-ops` maps to curated
`other`/`special-ops`; `mapStyleConfidence: curated` means atlas-provided
classification pending source refresh.

Challenges without dedicated articles may reuse campaign imports; retain
imported `mapStyle: singleplayer`. Curated `other`/`challenge` remains authoritative.

When adding media, record source, web-resolution, detail-page URLs, author or
uploader name/user URL. Freely reusable media also needs license name/URL;
recognized non-free media needs original rights notice/URL instead. Copyright
exceptions are not licenses. Refreshes must never overwrite curated coordinates,
precision, confidence, method, or notes.

## Refresh Wiki imports

Imports are manual and read-only toward the Wiki. Follow the
[import reference](wiki-import.md) for setup, options, fields, pacing,
attribution safeguards, and recovery. Preview before writing:

```sh
npm run wiki:import -- --id codwiki-88-ridge --dry-run
```

After review, remove `--dry-run`; select an article, game, first incomplete
records, or deliberate full refresh:

```sh
npm run wiki:import -- --id codwiki-88-ridge
npm run wiki:import -- --game cod3
npm run wiki:import -- --limit 10
npm run wiki:import -- --all
```

Enable `COD_ATLAS_WIKI_ORIGIN` and contact-bearing
`COD_ATLAS_WIKI_USER_AGENT` in `.env` using commented `.env.example` hints.
Minimum delay: two seconds. No parallel importers or bypassing HTTP 403.
Review imported location and media attribution before commit.

## Submit and validate

Commit only source files; commands generate ignored JSON as needed. With a
toolchain available, contributor checks are `npm run data:check`,
`npm run lint`, `npm test`, `npm run build:static` (same Docker prefix).
Agents follow `AGENTS.md`: recommend the smallest relevant set and run only
on explicit request.

Explain evidence with reliable PR source links. Explicitly explain marker-count
changes and update the regression test.
