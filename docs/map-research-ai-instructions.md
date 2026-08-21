# AI instructions for level map research

These instructions apply to every curated level Markdown file below
`content/levels/`. They supplement the repository-wide `AGENTS.md` and the
field definitions in `docs/contributing-data.md`.

## Objective

When asked to research a level, identify the most defensible real-world place
represented by, or historically connected to, that level. Research both the
game mission and the real historical event. Select the most accurate
coordinates the evidence supports, explain the choice and uncertainty, and
record the findings in the level Markdown file.

Accuracy is more important than apparent precision. Never invent a match merely
to obtain a detailed marker.

## Research process

1. Read the existing level file, its game record, its Wiki import record and
   any related level files before changing anything. Preserve unrelated curated
   data, overlays, attribution and editorial notes.
2. Establish what the game actually depicts:
   - whether the level is singleplayer or multiplayer;
   - playable character and unit;
   - date and stated location;
   - briefing, objectives and route through the level;
   - named buildings, terrain, towns, rivers, roads or military sites;
   - preceding and following missions when they clarify chronology.
   A multiplayer map is not a mission: do not invent a playable character,
   unit, date, briefing, route or historical objective for it. If it corresponds
   to, reuses, or is derived from a singleplayer mission, identify that level
   and explain the documented relationship.
3. Research the real place and the real operation separately. Look for the
   historical location of the represented unit on the mission date, the
   terrain and objectives involved, and any surviving landmark, battlefield,
   memorial or archaeological site.
4. Compare the evidence. Explicitly distinguish among:
   - a confirmed real location;
   - a plausible real-world inspiration or analogue;
   - a composite or fictionalized setting;
   - a broad city, region or country fallback.
5. Prefer primary and authoritative sources: official military histories,
   archives, government or municipal heritage pages, museums and memorial
   authorities, academic research, and contemporary records. Use the Call of
   Duty Wiki for claims about the game, not as the sole authority for real
   history. Supplement weak or local evidence with independent sources where
   possible.
6. Search in relevant local languages when useful. Resolve conflicting dates,
   unit designations and place names in the prose instead of silently choosing
   one version. Do not copy substantial source text; summarize it.
7. Verify that every cited URL opens the intended source and supports the
   nearby claim. Do not cite search-result pages, AI summaries or unsourced
   coordinate aggregators as historical evidence.

## Selecting the marker

Choose coordinates independently from the outbound Google Maps URL.

- Prefer an exact surviving landmark or documented event site when it genuinely
  represents the level.
- A battlefield memorial may be a strong marker when it is located on the
  relevant battlefield; explain that it marks the historical area rather than
  every action or the exact in-game route.
- For a route or dispersed battle, choose the most relevant documented anchor
  point and explain what the point does and does not represent.
- If sources establish only an area, use an `approximate`, `city`, `region` or
  `country` marker. Do not promote inferred coordinates to `exact`.
- If two candidates are plausible, compare them and state why the selected one
  is stronger. Use `real-world-inspiration` when the chosen place is an analogue
  rather than the canonical setting.
- Never merge or alter another level's coordinates to prevent overlapping
  markers. Clustering and spiderfying are presentation concerns.

Set `precision`, `confidence` and `method` according to
`docs/contributing-data.md`. Add supported `region`, `city` and `landmark`
values. Use decimal latitude and longitude and keep enough decimal places to
reflect the evidence; extra digits do not make an estimate more accurate.

## Google Maps URLs

Keep `locations[].urls[].googleMaps` as a stable Google Maps search API URL for
the real named place:

```yaml
urls:
  - googleMaps: https://www.google.com/maps/search/?api=1&query=Encoded+Place+Name%2C+City%2C+Country
```

- The query must use a place, landmark or address, not latitude/longitude.
- Remove tracking parameters and do not store `maps.app.goo.gl` short links.
- Prefer a specific, unambiguous real listing name plus locality and country.
- Keep the URL even though the detail panel may open the map using the curated
  coordinates; the URL is retained for later place-directory mapping.
- When only a country fallback is supported, search for the country name. Do
  not imply that the representative coordinate is a meaningful site.

When adding `locations[].urls[].wikipedia`, link to the English Wikipedia
article for the real location (`https://en.wikipedia.org/...`). Do not use a
different language edition when an English article for that location exists.
If no English Wikipedia article exists, use the language of the country and check if an article exists in the corresponding wikipedia.

## Required Markdown body

For researched levels, place the AI disclosure immediately after the closing
frontmatter delimiter:

```md
> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.
```

Then use these headings in this order:

```md
## The Mission in the Game

## The Real Place & Differences

## The Real Mission & Differences

## Marker Position Explanation

## Sources
```

Fill them as follows:

### The Mission in the Game

Summarize the playable character and unit, date, stated location, objectives,
route and notable terrain. Identify fictional characters or formations when
known. Describe the game without presenting its events as historical fact.

For a multiplayer map, state clearly that it has no mission narrative. Describe
the map's setting and relevant layout or environmental clues instead. If a
corresponding singleplayer mission exists, reference its curated level record
by title and stable level ID, and summarize the relationship—for
example, shared geography, reused assets, an adapted combat area or narrative
context. Add a hyperlink only when the application has a stable level-detail
URL format. Do not infer a relationship from visual similarity alone; cite
evidence for it.

Keep multiplayer analysis substantially shorter than singleplayer mission
research. State that there is no mission once, then avoid repeating the same
caveat in every section. Summarize the map layout and visual evidence in one or
two compact paragraphs. Include only enough historical context to explain the
location choice, a documented campaign connection or an important difference.
Do not pad a generic multiplayer setting with a broad campaign history.

### The Real Place & Differences

Describe the present-day place and the relevant wartime geography. Compare
buildings, terrain, scale and layout with the level. State whether the match is
confirmed, inferred, an analogue or only a fallback, and name meaningful
differences.

### The Real Mission & Differences

Explain what the represented unit was historically doing in that place and
time. Compare the real chronology, forces, objectives and outcome with the
game. Clearly label compressed timelines, invented combat, composite events
and unsupported characters or objectives.

For a standalone multiplayer map, state that there is no in-game mission to
compare with a real operation. Historical context may still be included when
the map identifies a real place or event. When the map corresponds to a
singleplayer mission, base the mission comparison on that linked level and
keep clear which claims belong to the multiplayer map, the singleplayer
mission and the historical record.

If the lack of a mission was already made clear under **The Mission in the
Game**, do not restate it at length here. Use a short cross-reference or explain
only the closest historical context and its limitations. Do not repeat the map
description, marker rationale or uncertainty already covered elsewhere.

If no matching real mission is documented, say so directly and present the
closest supported historical context without turning it into a claim of
identity.

### Marker Position Explanation

State the exact stored coordinates in backticks. Explain why this point was
selected, what evidence fixes or approximates it, why its precision and
confidence are appropriate, and what the marker must not be interpreted to
mean. Mention stronger rejected candidates when that comparison matters.

Confirm that the stored Google Maps URL searches for the real named place and
that the atlas marker uses the separately curated coordinates. For a country
fallback, explicitly say that the coordinate is only representative.

### Sources

Use a Markdown bullet list. Give every source a descriptive linked title and a
short note saying what it supports. Include sources for:

- the game mission's facts;
- the real operation, unit and chronology;
- the place identification and marker coordinates;
- disputed or inferential claims when applicable.

Keep conclusions close to what the cited evidence establishes. Use language
such as “likely,” “plausible,” “closest documented match” and “no evidence was
found” where certainty is limited.

## Finishing the change

After editing a level, run the repository's required data check, lint, tests
and static build. These commands generate ignored JSON build artifacts when
needed; do not commit them. Report the selected location, coordinates, main
historical conclusion, uncertainty and validation results.
