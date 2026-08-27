# CoD Atlas progress

This report is generated from the curated level records under
`content/levels/`. Run `npm run progress:update` after changing research notes
or location precision; `npm run data:check` verifies that the generated tables
are current.

## Research progress

A canonical level counts as researched when its Markdown body contains all five
standard research sections in order. AI-assisted notes must also include an AI
disclosure. Appearance `.ref.md` files are excluded because they inherit
research from their canonical level.

These percentages measure completed historical and geographic research, not
roster completeness or directory organization. For example, Modern Warfare
(2007)'s complete 21-level campaign can remain below 100% here until every
mission has the required research sections.

<!-- research-progress:start -->
| Scope | Researched | Remaining |
| --- | ---: | ---: |
| All currently catalogued levels | 155 / 1113 (14%) | 958 / 1113 (86%) |
| Campaign levels | 101 / 425 (24%) | 324 / 425 (76%) |
| Multiplayer maps | 54 / 682 (8%) | 628 / 682 (92%) |
| Zombies maps | 0 / 6 (0%) | 6 / 6 (100%) |

| Game | Campaign | Multiplayer | Zombies | Overall |
| --- | ---: | ---: | ---: | ---: |
| Call of Duty | 26 / 26 (100%) | 16 / 16 (100%) | — | 42 / 42 (100%) |
| Call of Duty: United Offensive | 13 / 13 (100%) | 14 / 14 (100%) | — | 27 / 27 (100%) |
| Call of Duty: Finest Hour | 19 / 19 (100%) | — | — | 19 / 19 (100%) |
| Call of Duty 2 | 27 / 27 (100%) | 21 / 21 (100%) | — | 48 / 48 (100%) |
| Call of Duty 2: Big Red One | 0 / 14 (0%) | 0 / 9 (0%) | — | 0 / 23 (0%) |
| Call of Duty 3 | 0 / 14 (0%) | 0 / 20 (0%) | — | 0 / 34 (0%) |
| Call of Duty: Roads to Victory | 14 / 14 (100%) | 0 / 2 (0%) | — | 14 / 16 (88%) |
| Modern Warfare (2007) | 0 / 21 (0%) | 0 / 21 (0%) | — | 0 / 42 (0%) |
| World at War | 0 / 15 (0%) | 0 / 24 (0%) | — | 0 / 39 (0%) |
| World at War: Final Fronts | 0 / 13 (0%) | — | — | 0 / 13 (0%) |
| Modern Warfare 2 (2009) | 0 / 18 (0%) | 0 / 22 (0%) | — | 0 / 40 (0%) |
| Black Ops | 0 / 15 (0%) | 1 / 31 (3%) | — | 1 / 46 (2%) |
| Modern Warfare 3 (2011) | 0 / 18 (0%) | 0 / 39 (0%) | — | 0 / 57 (0%) |
| MW3: Defiance | 0 / 14 (0%) | — | — | 0 / 14 (0%) |
| Black Ops II | 0 / 17 (0%) | 0 / 36 (0%) | — | 0 / 53 (0%) |
| Black Ops: Declassified | 0 / 10 (0%) | — | — | 0 / 10 (0%) |
| Ghosts | 1 / 18 (6%) | 0 / 33 (0%) | — | 1 / 51 (2%) |
| Advanced Warfare | 1 / 15 (7%) | 0 / 30 (0%) | — | 1 / 45 (2%) |
| Black Ops III | 0 / 11 (0%) | 0 / 28 (0%) | — | 0 / 39 (0%) |
| Infinite Warfare | 0 / 16 (0%) | 0 / 28 (0%) | — | 0 / 44 (0%) |
| Modern Warfare Remastered | — | 0 / 1 (0%) | — | 0 / 1 (0%) |
| WWII | 0 / 12 (0%) | 2 / 41 (5%) | — | 2 / 53 (4%) |
| Black Ops 4 | — | 0 / 36 (0%) | — | 0 / 36 (0%) |
| Modern Warfare (2019) | 0 / 14 (0%) | 0 / 45 (0%) | — | 0 / 59 (0%) |
| Warzone (2020) | — | 0 / 4 (0%) | — | 0 / 4 (0%) |
| Black Ops Cold War | 0 / 13 (0%) | 0 / 38 (0%) | — | 0 / 51 (0%) |
| Vanguard | 0 / 9 (0%) | 0 / 29 (0%) | — | 0 / 38 (0%) |
| Modern Warfare II (2022) | 0 / 17 (0%) | 0 / 20 (0%) | — | 0 / 37 (0%) |
| Warzone 2.0 | — | 0 / 3 (0%) | — | 0 / 3 (0%) |
| Modern Warfare III (2023) | 0 / 14 (0%) | 0 / 45 (0%) | — | 0 / 59 (0%) |
| Black Ops 6 | 0 / 18 (0%) | 0 / 46 (0%) | 0 / 6 (0%) | 0 / 70 (0%) |
<!-- research-progress:end -->

## Geographic localization progress

Localization here means locating atlas markers in the real world, not
translating the interface. Exact, approximate, city, and region markers count
as localized. Country fallbacks remain localization work. Off-world markers
are reported separately and excluded from the terrestrial percentage because
they intentionally have no Earth location.

The per-game table assigns each marker to its canonical level's owner game.

<!-- localization-progress:start -->
| Scope | Localized | Country fallback | Off-world |
| --- | ---: | ---: | ---: |
| All marker locations | 284 / 1029 (28%) | 745 / 1029 (72%) | 30 |
| Campaign marker locations | 121 / 404 (30%) | 283 / 404 (70%) | 17 |
| Multiplayer marker locations | 163 / 625 (26%) | 462 / 625 (74%) | 13 |
| Zombies marker locations | — | — | 0 |

| Precision | Marker locations | Share of all markers |
| --- | ---: | ---: |
| Exact | 73 | 7% |
| Approximate | 123 | 12% |
| City | 82 | 8% |
| Region | 6 | 1% |
| Country | 745 | 70% |
| Off-world | 30 | 3% |

| Game | Campaign | Multiplayer | Zombies | Overall |
| --- | ---: | ---: | ---: | ---: |
| Call of Duty | 26 / 26 (100%) | 16 / 16 (100%) | — | 42 / 42 (100%) |
| Call of Duty: United Offensive | 12 / 13 (92%) | 12 / 14 (86%) | — | 24 / 27 (89%) |
| Call of Duty: Finest Hour | 19 / 19 (100%) | — | — | 19 / 19 (100%) |
| Call of Duty 2 | 27 / 27 (100%) | 22 / 22 (100%) | — | 49 / 49 (100%) |
| Call of Duty 2: Big Red One | 3 / 14 (21%) | 5 / 9 (56%) | — | 8 / 23 (35%) |
| Call of Duty 3 | 4 / 14 (29%) | 6 / 20 (30%) | — | 10 / 34 (29%) |
| Call of Duty: Roads to Victory | 14 / 14 (100%) | 2 / 2 (100%) | — | 16 / 16 (100%) |
| Modern Warfare (2007) | 0 / 20 (0%) | 20 / 21 (95%) | — | 20 / 41 (49%) |
| World at War | 1 / 15 (7%) | 7 / 24 (29%) | — | 8 / 39 (21%) |
| World at War: Final Fronts | 7 / 14 (50%) | — | — | 7 / 14 (50%) |
| Modern Warfare 2 (2009) | 0 / 17 (0%) | 20 / 22 (91%) | — | 20 / 39 (51%) |
| Black Ops | 1 / 16 (6%) | 3 / 30 (10%) | — | 4 / 46 (9%) |
| Modern Warfare 3 (2011) | 0 / 21 (0%) | 31 / 38 (82%) | — | 31 / 59 (53%) |
| MW3: Defiance | 0 / 14 (0%) | — | — | 0 / 14 (0%) |
| Black Ops II | 0 / 17 (0%) | 0 / 36 (0%) | — | 0 / 53 (0%) |
| Black Ops: Declassified | 0 / 10 (0%) | — | — | 0 / 10 (0%) |
| Ghosts | 1 / 17 (6%) | 2 / 33 (6%) | — | 3 / 50 (6%) |
| Advanced Warfare | 1 / 17 (6%) | 0 / 30 (0%) | — | 1 / 47 (2%) |
| Black Ops III | 0 / 12 (0%) | 0 / 28 (0%) | — | 0 / 40 (0%) |
| Infinite Warfare | 0 / 2 (0%) | 0 / 16 (0%) | — | 0 / 18 (0%) |
| Modern Warfare Remastered | — | 0 / 1 (0%) | — | 0 / 1 (0%) |
| WWII | 0 / 15 (0%) | 11 / 43 (26%) | — | 11 / 58 (19%) |
| Black Ops 4 | — | 1 / 36 (3%) | — | 1 / 36 (3%) |
| Modern Warfare (2019) | 0 / 14 (0%) | 0 / 46 (0%) | — | 0 / 60 (0%) |
| Warzone (2020) | — | 0 / 4 (0%) | — | 0 / 4 (0%) |
| Black Ops Cold War | 2 / 14 (14%) | 2 / 38 (5%) | — | 4 / 52 (8%) |
| Vanguard | 3 / 9 (33%) | 3 / 31 (10%) | — | 6 / 40 (15%) |
| Modern Warfare II (2022) | 0 / 19 (0%) | 0 / 20 (0%) | — | 0 / 39 (0%) |
| Warzone 2.0 | — | 0 / 3 (0%) | — | 0 / 3 (0%) |
| Modern Warfare III (2023) | 0 / 14 (0%) | 0 / 42 (0%) | — | 0 / 56 (0%) |
<!-- localization-progress:end -->
