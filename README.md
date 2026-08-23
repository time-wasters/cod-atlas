# CoD Atlas

CoD Atlas is an interactive map tracing the real-world geography portrayed
throughout the Call of Duty series. It connects campaign missions and
multiplayer maps with the countries, regions, cities, landmarks, and historical
sites they depict, adapt, or draw inspiration from.

![CoD Atlas showing its interactive map, filters, and level details](docs/readme_screenshot.png)

## Explore the geography of the series

Browse the atlas on the map or search for a mission, multiplayer map, country,
or place. Results can be filtered by game, country, franchise category, release
era, continent, mode, precision, confidence, and location method. Filters and
the selected level are stored in the URL, so a view can be shared and revisited
with the browser's Back and Forward buttons.

Each entry explains what the marker represents and distinguishes a well-sourced
location from an approximate, regional, or country-level fallback. Where
available, the details include historical context, research notes, source
links, related levels, images, and geographically aligned map overlays.

Filtered locations can also be exported as KML for use in Google Maps and
other compatible mapping tools. Settings without a terrestrial location are
kept in the atlas and presented separately instead of being assigned a
misleading point on Earth.

CoD Atlas is open and community-maintained. Locations are curated with
attention to source quality, geographic precision, and the difference between
a confirmed setting and a plausible real-world inspiration.

## How AI is used

AI may assist with researching levels, comparing in-game settings with real
places and historical events, and drafting cited research notes. It is treated
as a research and editorial aid, not as an authority.

The exact position of a marker is almost always verified or confirmed by a
human before it is published. When the evidence supports only an approximate
area, region, or country, the atlas says so instead of presenting the marker as
more precise than it is. This review-first approach is intended to keep
unverified "AI slop" out of the project.

Whenever AI is used to produce content, that content is explicitly marked at
the point where it appears. The disclosure is kept beside the affected text so
readers do not have to find a separate policy to understand how it was made.

## Research progress

Research coverage is calculated from canonical level records currently present
under `content/levels/`. A level counts as researched when its Markdown body
contains all five standard research sections in order; AI-assisted notes must
also include an AI disclosure. Appearance `.ref.md` files are excluded because
they inherit research from their canonical level.

<!-- research-progress:start -->
| Scope | Researched | Remaining |
| --- | ---: | ---: |
| All currently catalogued levels | 133 / 971 (14%) | 838 / 971 (86%) |
| Campaign levels | 101 / 392 (26%) | 291 / 392 (74%) |
| Multiplayer maps | 32 / 579 (6%) | 547 / 579 (94%) |

| Game | Campaign | Multiplayer | Overall |
| --- | ---: | ---: | ---: |
| Call of Duty | 26 / 26 (100%) | 15 / 16 (94%) | 41 / 42 (98%) |
| Call of Duty: United Offensive | 13 / 13 (100%) | 14 / 14 (100%) | 27 / 27 (100%) |
| Call of Duty: Finest Hour | 19 / 19 (100%) | — | 19 / 19 (100%) |
| Call of Duty 2 | 27 / 27 (100%) | 0 / 19 (0%) | 27 / 46 (59%) |
| Call of Duty 2: Big Red One | 0 / 14 (0%) | 0 / 8 (0%) | 0 / 22 (0%) |
| Call of Duty 3 | 0 / 14 (0%) | 0 / 18 (0%) | 0 / 32 (0%) |
| Call of Duty: Roads to Victory | 14 / 14 (100%) | 0 / 2 (0%) | 14 / 16 (88%) |
| Modern Warfare (2007) | 0 / 20 (0%) | 0 / 21 (0%) | 0 / 41 (0%) |
| World at War | 0 / 15 (0%) | 0 / 24 (0%) | 0 / 39 (0%) |
| World at War: Final Fronts | 0 / 13 (0%) | — | 0 / 13 (0%) |
| Modern Warfare 2 (2009) | 0 / 18 (0%) | 0 / 22 (0%) | 0 / 40 (0%) |
| Black Ops | 0 / 15 (0%) | 1 / 31 (3%) | 1 / 46 (2%) |
| Modern Warfare 3 (2011) | 0 / 18 (0%) | 0 / 38 (0%) | 0 / 56 (0%) |
| MW3: Defiance | 0 / 14 (0%) | — | 0 / 14 (0%) |
| Black Ops II | 0 / 17 (0%) | 0 / 36 (0%) | 0 / 53 (0%) |
| Black Ops: Declassified | 0 / 10 (0%) | — | 0 / 10 (0%) |
| Ghosts | 1 / 18 (6%) | 0 / 33 (0%) | 1 / 51 (2%) |
| Advanced Warfare | 1 / 15 (7%) | 0 / 30 (0%) | 1 / 45 (2%) |
| Black Ops III | 0 / 11 (0%) | 0 / 28 (0%) | 0 / 39 (0%) |
| Infinite Warfare | 0 / 16 (0%) | 0 / 28 (0%) | 0 / 44 (0%) |
| Modern Warfare Remastered | — | 0 / 1 (0%) | 0 / 1 (0%) |
| WWII | 0 / 12 (0%) | 2 / 41 (5%) | 2 / 53 (4%) |
| Black Ops 4 | — | 0 / 36 (0%) | 0 / 36 (0%) |
| Modern Warfare (2019) | 0 / 14 (0%) | 0 / 45 (0%) | 0 / 59 (0%) |
| Warzone (2020) | — | 0 / 4 (0%) | 0 / 4 (0%) |
| Black Ops Cold War | 0 / 13 (0%) | 0 / 38 (0%) | 0 / 51 (0%) |
| Vanguard | 0 / 9 (0%) | 0 / 29 (0%) | 0 / 38 (0%) |
| Modern Warfare II (2022) | 0 / 17 (0%) | 0 / 16 (0%) | 0 / 33 (0%) |
| Warzone 2.0 | — | 0 / 1 (0%) | 0 / 1 (0%) |
<!-- research-progress:end -->

The totals update automatically as levels are added or researched. Run
`npm run research:progress` after changing research notes; `npm run data:check`
verifies that this generated section is current.

## Documentation

Start with [CONTRIBUTING.md](CONTRIBUTING.md) for project setup, development,
data changes, validation, and the pull-request workflow.

Detailed references:

- [Atlas data model](docs/data-model.md)
- [Data contribution guide](docs/contributing-data.md)
- [Running npm commands through Docker](docs/docker-commands.md)
- [Wiki import command](docs/wiki-import.md)
- [AI instructions for level map research](docs/map-research-ai-instructions.md)
- [Level templates](docs/templates/)


## Licensing and attribution

See the [source-code license](LICENSE), [data license](LICENSE-DATA), and
[notices and attribution](NOTICE.md).

### Project status

CoD Atlas is an unofficial, non-commercial community project and is not
affiliated with, endorsed by, or sponsored by Activision or any other
relevant rights holder. The project is provided free of charge and is not
operated for commercial gain.

### Copyright and trademarks

Call of Duty and related game names, logos, imagery, artwork, screenshots,
textures, and other game assets are trademarks and/or copyrighted material
of their respective owners.

Third-party material included or referenced by the project remains subject
to the rights and terms of its respective owners and is not relicensed under
the CoD Atlas source-code or data licenses.

See [NOTICE.md](NOTICE.md) for detailed attribution and rights information.
