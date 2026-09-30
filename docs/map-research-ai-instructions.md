# AI instructions for level map research

Applies to all `content/levels/**/*.md`; supplements `AGENTS.md` and
[contributing-data.md](contributing-data.md).

## Objective

Identify the most defensible real-world place represented by or historically
connected to a level. Research the game mission and real event, choose
evidence-supported coordinates, and document the reasoning and uncertainty in
the level Markdown. Accuracy outranks apparent precision; never invent a match.

## File placement

Follow the [source layout](data-model.md#level-source-layout): Campaign in
`campaign/`, Multiplayer in `multiplayer/`, Special Ops in `special-ops/`,
standalone Survival in `survival/`, Zombies in `zombies/`, Challenges in
`challenge/`. Campaign filenames use `<order>-<descriptive-name>.md`,
contiguous from `1`; other types are unnumbered. Keep one layout per game;
legacy flat rosters stay flat until deliberately reorganized in full.

Any mode/subtype may use source-supported `content-update` for an original
release, map pack, season, or other release grouping. Keep IDs stable and
labels consistent per ID within a game.

## Research process

1. Read the level, game, Wiki import, and related levels before editing.
   Preserve unrelated curated data, overlays, attribution, and notes.
2. Establish mode/subtype, playable character/unit, date, stated location,
   briefing, objectives, route, named buildings/terrain/towns/rivers/roads/military
   sites, and adjacent missions where chronology matters. Apply these distinctions:
   - Multiplayer has no mission narrative: do not invent character, unit, date,
     briefing, route, or historical objectives. Identify and explain any
     documented singleplayer source or relationship.
   - Solo/cooperative Special Ops remains `other`/`special-ops`.
     Separately selectable Survival outside Special Ops is `other`/`survival`.
     Research their own briefing, objectives, route, and setting.
   - Each selectable Challenge is a distinct canonical `other`/`challenge`,
     not a new historical operation or an appearance reference. Preserve its
     number/objectives and identify the reused campaign level through
     `metadata.variantOf`. Omit `locations` to inherit; supply it only for a
     deliberate override. Without a dedicated article, it may reuse the source
     campaign Wiki import while preserving the Challenge's curated classification.
3. Research the real place and operation separately: unit location on the
   mission date, terrain, objectives, surviving landmarks, battlefields,
   memorials, and archaeological sites.
4. Distinguish confirmed location, plausible inspiration/analogue,
   composite/fictionalized setting, and broad city/region/country fallback.
5. Prefer primary/authoritative sources: military histories, archives,
   government/municipal heritage, museums/memorial authorities, academic
   research, contemporary records. Use the CoD Wiki for game claims, never as
   sole historical authority. Supplement weak/local evidence independently where possible.
6. Search relevant local languages when useful. Explain conflicting dates,
   units, and place names rather than silently choosing. Summarize; do not
   copy substantial source text.
7. Verify every cited URL opens the intended source and supports its nearby
   claim. Search results, AI summaries, and unsourced coordinate aggregators
   are not historical evidence.

## Selecting the marker

Choose coordinates independently of the outbound Google Maps URL.

- Prefer an exact surviving landmark/documented event site that represents the level.
- A memorial on the relevant battlefield may mark the area; explain that it
  does not represent every action or the exact game route.
- For routes/dispersed battles, choose the strongest documented anchor and
  explain its coverage and limits.
- Area-only evidence requires `approximate`, `city`, `region`, or `country`;
  never promote inferred coordinates to `exact`.
- Compare plausible candidates and justify the stronger one. Use
  `real-world-inspiration` for an analogue rather than the canonical setting.
- Never alter/merge other levels' coordinates to avoid overlap. Clustering and
  spiderfying belong to presentation.

Follow [field guidance](contributing-data.md) for `precision`, `confidence`,
and `method`. Add only supported `region`, `city`, `landmark`. Use decimal
latitude/longitude with evidence-appropriate digits; extra digits add no accuracy.

## Google Maps URLs

Store `locations[].urls[].googleMaps` as a stable search API URL for the real place:

```yaml
urls:
  - googleMaps: https://www.google.com/maps/search/?api=1&query=Encoded+Place+Name%2C+City%2C+Country
```

- Query a place, landmark, or address, never coordinates.
- Remove tracking; no `maps.app.goo.gl` short links.
- Prefer an unambiguous real listing plus locality/country.
- Retain the URL for future place-directory mapping even when the detail panel
  opens curated coordinates.
- Country fallback: search the country name; do not imply the representative
  coordinate is a meaningful site.

For `locations[].urls[].wikipedia`, use the real location's English article
(`https://en.wikipedia.org/...`). Only if none exists, check the Wikipedia
edition in the country's language.

## Required Markdown body

Place this disclosure immediately after closing frontmatter:

```md
> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.
```

Use these headings in order:

```md
## The Mission in the Game
## The Real Place & Differences
## The Real Mission & Differences
## Marker Position Explanation
## Sources
```

For standalone Multiplayer, replace the first with `## The Map in the Game`;
for Challenges/comparable Other entries use `## The Challenge in the Game`.
All three satisfy the research progress rule.

### The Mission, Map, or Challenge in the Game

Describe character/unit, date, setting, objectives, route, and notable terrain;
identify known fictional characters/formations. Do not present game events as history.

Mode-specific guidance:

- **Multiplayer:** state once that no mission narrative exists. Describe setting,
  layout, and visual clues in one or two compact paragraphs. Cite any campaign
  connection (shared geography/assets, adapted combat area, narrative context)
  with curated title and stable ID; visual similarity alone is insufficient.
  Hyperlink only if the app has a stable level-detail URL format. Keep research
  substantially shorter than singleplayer; include history only to explain the
  location, documented campaign connection, or important difference. Do not pad
  generic settings with broad campaign history or repeat caveats across sections.
- **Zombies:** describe its own briefing, crew/Operators, story date, objectives,
  and playable geography. Solo/co-op is not ordinary multiplayer. Standard,
  Directed, Grief, and limited-time playlists are variants of one map unless
  geography materially changes.
- **Special Ops:** describe its own scenario and distinguish reused Campaign/
  Multiplayer geography/assets. Multiplayer availability in Survival alone
  does not make a dedicated Special Ops mission.
- **Challenge:** give selectable number, exact objectives, and source campaign
  level. Focus on changed rules, without repeating the source's full briefing/history.

### The Real Place & Differences

Describe today's place and relevant wartime geography; compare buildings,
terrain, scale, and layout. Label the match as confirmed, inferred, analogue,
or fallback and identify meaningful differences.

### The Real Mission & Differences

Compare the historical unit's actions at that place/time, chronology, forces,
objectives, and outcome with the game. Label compressed timelines, invented
combat, composites, and unsupported characters/objectives.

Standalone Multiplayer has no mission to compare. Say so briefly or
cross-reference the earlier statement; include only relevant historical context
and limitations. For a linked singleplayer mission, base the comparison on
that level and distinguish map, mission, and historical claims. Avoid repeated
map descriptions, marker rationales, or uncertainty.

If no real mission is documented, say so; closest supported context is not
evidence of identity.

### Marker Position Explanation

Give the exact stored coordinates in backticks. Explain choice, supporting
evidence, precision/confidence, limits, and stronger rejected candidates when
relevant. Confirm that Google Maps searches the real named place while the
atlas uses independent curated coordinates. Explicitly identify country
fallback coordinates as representative only.

### Sources

Use Markdown bullets with descriptive linked titles and short support notes.
Cover game facts; real operation/unit/chronology; place/coordinates; and
disputed/inferential claims where applicable. Keep conclusions within evidence;
use “likely,” “plausible,” “closest documented match,” or “no evidence was found”
when appropriate.

## Finishing the change

Follow `AGENTS.md`: recommend relevant data/lint/test/static-build checks; run
them only on explicit user request. Generated JSON is ignored; never commit it.
Report location, coordinates, main historical conclusion, uncertainty, and
validation results (or commands not run).
