# MWII roster and location audit

Audited on 2026-10-13. AI-assisted research; proposed markers await human review.
All 43 added level/appearance files contain frontmatter only. Research evidence
and limitations are recorded here for review, outside the level bodies.

## Scope and counts

The [MWII roster](https://callofduty.fandom.com/wiki/Call_of_Duty%3A_Modern_Warfare_II),
[Multiplayer category](https://callofduty.fandom.com/wiki/Category%3ACall_of_Duty%3A_Modern_Warfare_II_Multiplayer_Maps),
[Special Ops roster](https://callofduty.fandom.com/wiki/Special_Ops/Modern_Warfare_II),
and publisher season announcements establish the released roster below.

| Category | Existing appearances | Added | Result |
| --- | ---: | ---: | ---: |
| Campaign | 17 | 0 | 17 |
| MP Core, including Shipmas | 13 | 14 | 27 |
| MP Battle | 4 | 7 | 11 |
| MP Gunfight, including Shipment | 4 | 6 | 10 |
| Special Ops missions | 0 | 7 | 7 |
| Raids | 0 | 4 | 4 |
| DMZ | 1 | 4 | 5 |
| Firing Range | 0 | 1 | 1 |

Shipment is already present and supports both Core and Gunfight, as confirmed by
the [Season 3 patch notes](https://www.callofduty.com/patchnotes/2023/04/Call-of-Duty-Modern-Warfare-II-Warzone-2-Season-03-Patch-Notes.html).
It needs no second record. There are 81 distinct MWII source appearances.
Taraq's larger Battle layout and Santa Seña Border Crossing are distinct canonical
variants because their playable areas differ from the existing records.
The [Taraq article](https://callofduty.fandom.com/wiki/Taraq) and
[Santa Seña article](https://callofduty.fandom.com/wiki/Santa_Se%C3%B1a) support these distinctions.

The [Singleplayer category](https://callofduty.fandom.com/wiki/Category%3ACall_of_Duty%3A_Modern_Warfare_II_Single_Player_Levels)
contains the existing 17 missions. No additional campaign entry was needed.
No released Zombies, standalone Survival, Nightmares, Strike Force, War,
Extinction, or separate numbered Challenge roster was identified for MWII.
The Gunsmith Firing Range is represented as `other/challenge`, the supported
category for this selectable training activity; its terrestrial site is unknown.
The [publisher's launch overview](https://www.callofduty.com/uk/en/blog/2022/10/call-of-duty-modern-warfare-II-campaign-early-access-launch-overview)
confirms the feature.

[Cut-content maps](https://callofduty.fandom.com/wiki/Cut_Content/Call_of_Duty%3A_Modern_Warfare_II)
were excluded from the released roster. Temporary Halloween decorations on
El Asilo and Embassy do not establish distinct playable geography; their existing
records cover those appearances. See the
[Season 6 patch notes](https://www.callofduty.com/patchnotes/2023/09/Call-of-Duty-Modern-Warfare-II-Warzone-Season-06-Patch-Notes).

## Added records

| Category | Additions |
| --- | --- |
| MP Core | Santa Seña Border Crossing; Dome; Himmelmatt Expo; Black Gold; Pelayo's Lighthouse; Alboran Hatchery; Showdown; Kunstenaar District; Vondel Waterfront; Strike; Punta Mar; DRC – Zone 1; La Casa; Koro Village |
| MP Battle | Taraq (Battle Map); Al Malik International; Zaya Observatory; Rohan Oilfields; Sattiq Cave Complex; Ahkdar; Mawizeh Marsh |
| MP Gunfight | Mercado; Penthouse; Canal; Lounge; King; Fight |
| Special Ops | Low Profile; Denied Area; Defender: Mt. Zaya; High Ground; Gun Game: Mt. Zaya; One In The Chamber: Low Profile; Defender: Hafid Port |
| Raids | Atomgrad - Episode 01; Episode 02; Episode 03; Episode 04 |
| DMZ | Al Mazrah; Ashika Island; Koschei Complex; Vondel |
| Training | Firing Range |

Raids use `special-ops/`, `mode: other`, `modeSub: special-ops`, and the
documented `campaign` grouping labelled Raids. No unsupported raid subtype was
introduced. Gun Game: Mt. Zaya and One In The Chamber: Low Profile are separately
selectable canonical variants; they inherit their base missions' empty locations.
Their shared Wiki imports are intentional: the
[Defender article](https://callofduty.fandom.com/wiki/Defender%3A_Mt._Zaya) and
[Low Profile article](https://callofduty.fandom.com/wiki/Low_Profile_(Spec_Ops))
describe the respective variants.

Dome, Showdown, Strike, and Koro Village link their earlier counterparts through
`metadata.variantOf`, but explicitly use `locations: []`: their changed settings
do not justify inheriting the earlier maps' real-world coordinates.
King uses a reference to MW19's canonical map: the
[Season 6 announcement](https://www.callofduty.com/blog/2023/09/call-of-duty-modern-warfare-II-warzone-season-06-haunting-multiplayer-modes-zombies)
confirms its returning layout.

Al Mazrah, Ashika Island, and Vondel use references to their existing WZ2
canonical records with appearance-specific `modeSub: dmz`. The
[DMZ roster](https://callofduty.fandom.com/wiki/DMZ/Modern_Warfare_II) confirms all
five exclusion zones. Existing canonical locations and notes remain unchanged;
these references inherit them and do not constitute new geographic research.
The same applies to King's inherited United Kingdom country fallback.

## Proposed new markers

Each row represents independently owned level locations. Country and region
fallback coordinates are representative points, not the exact playable site.
Google Maps URLs search real named places; they do not control stored coordinates.

| New level(s) | Stored coordinates | Precision / confidence | Evidence and limitation |
| --- | --- | --- | --- |
| Alboran Hatchery | 43.16, -9.21 | approximate / medium | The [publisher guide](https://www.callofduty.com/blog/2023/05/call-of-duty-modern-warfare-II-season-03-reloaded-alboran-hatchery-map-intel) names Galicia; the [map article](https://callofduty.fandom.com/wiki/Alboran_Hatchery) narrows it to Cape Vilan. [Cape Vilan](https://en.wikipedia.org/wiki/Cape_Vilan) supplies the geographic anchor. The point represents the cape area, not a verified hatchery footprint. |
| Himmelmatt Expo | 46.6, 8.5 | region / fallback | The [publisher guide](https://www.callofduty.com/blog/2023/03/call-of-duty-modern-warfare-II-season-02-reloaded-himmelmatt-expo-map-intel) identifies the Swiss Alps. A representative point within the [Swiss Alps](https://en.wikipedia.org/wiki/Swiss_Alps) is used. The internal name mentioning Davos does not prove an exact congress-center match. |
| Penthouse | 41.88, -87.63 | city / high | The [Season 4 announcement](https://www.callofduty.com/ca/en/blog/2023/06/call-of-duty-modern-warfare-II-warzone-season-04-multiplayer-maps-modes-vondel) identifies central Chicago. [Chicago](https://en.wikipedia.org/wiki/Chicago) provides the rounded city anchor; no particular skyscraper is claimed. |
| Pelayo's Lighthouse | 40, -4 | country / fallback | The [publisher guide](https://www.callofduty.com/uk/en/blog/2023/04/call-of-duty-modern-warfare-II-season-03-lighthouse-map-intel-multiplayer-tips) identifies Spain, without establishing a real island or lighthouse. The inland point represents Spain only. |
| Santa Seña Border Crossing | 23, -102 | country / fallback | The [map article](https://callofduty.fandom.com/wiki/Santa_Se%C3%B1a) identifies the US–Mexico border. Mexico is the country fallback; the point does not depict the crossing. References to Nogales are insufficient to claim a verified port of entry. |
| Mercado | 23, -102 | country / fallback | The [map article](https://callofduty.fandom.com/wiki/Mercado) identifies fictional Las Almas in Mexico. No specific real market was established. |
| Punta Mar | 23, -102 | country / fallback | The [Season 5 announcement](https://www.callofduty.com/uk/en/blog/2023/07/call-of-duty-modern-warfare-II-warzone-season-05-content-drop-maps-modes-hip-hop) places the map in Las Almas. Mexico is inferred from that established fictional region; the same announcement's reference to a South American beach is geographically inconsistent, so no real seaside town is claimed. |
| La Casa | 23, -102 | country / fallback | The [Season 6 announcement](https://www.callofduty.com/blog/2023/09/call-of-duty-modern-warfare-II-warzone-season-06-haunting-multiplayer-modes-zombies) explicitly identifies Las Almas, Mexico. No specific real estate was established. |
| Kunstenaar District | 52.5, 5.75 | country / fallback | The [map article](https://callofduty.fandom.com/wiki/Kunstenaar_District) identifies Vondel, Netherlands. The point represents the country; it does not assert a real arts district. |
| Vondel Waterfront | 52.5, 5.75 | country / fallback | The [map article](https://callofduty.fandom.com/wiki/Vondel_Waterfront) identifies Vondel's floating district in the Netherlands. No specific real floating neighborhood was established. |
| Canal | 52.5, 5.75 | country / fallback | The [Season 5 announcement](https://www.callofduty.com/uk/en/blog/2023/07/call-of-duty-modern-warfare-II-warzone-season-05-content-drop-maps-modes-hip-hop) places it near Vondel; the [Canal article](https://callofduty.fandom.com/wiki/Canal_(Modern_Warfare_II)) supports the Dutch setting. No particular real brewery or canal is claimed. |

New markers are explicitly marked as not human-verified. No historical operation
is asserted for these multiplayer maps.

## Unresolved geography

The other 28 new canonical records have no resolved marker, including the two
Special Ops variants inheriting empty locations.

Dome, Black Gold, Showdown, Taraq (Battle Map), Al Malik International,
Zaya Observatory, Rohan Oilfields, Sattiq Cave Complex, Ahkdar, Mawizeh Marsh,
Koschei Complex, and the five base Special Ops missions are set in fictional
Al Mazrah/Adal. Publisher announcements and linked map articles establish their
in-game settings, but this audit did not establish a defensible real site.
Comparisons to Yemen, Iraq, and other countries were insufficient to assign
each level a real-world marker. Existing curated country choices were preserved
without extending them to new maps.

Strike, Koro Village, and the four Atomgrad raids use fictional Urzikstan.
The [Koro article](https://callofduty.fandom.com/wiki/Koro_Village) also records
conflicting Adal signage. The [raid articles](https://callofduty.fandom.com/wiki/Atomgrad/Episode_01)
identify a Soviet bunker in the fictional Sattiq Mountains; that does not locate
a real Soviet installation.

[DRC Zone 1](https://www.callofduty.com/blog/2023/08/call-of-duty-modern-warfare-II-season-05-reloaded-drc-zone-1-map-intel)
has a classified location. [Lounge](https://callofduty.fandom.com/wiki/Lounge),
[Fight](https://callofduty.fandom.com/wiki/Fight), and the Firing Range do not
establish a real terrestrial site. These entries remain unlocated rather than
being assigned arbitrary countries or off-world precision.

Some Fandom pages were unavailable directly; indexed article text, accessible
category pages, existing imports, and publisher announcements were used together.
The supplied Call of Duty Maps index returned HTTP 403 and was not bypassed.
The 32 new Wiki records are template-based source-link stubs: unknown import,
revision, location, and media fields remain null. No snapshot refresh or media
import was performed, and existing imports were preserved.

## Validation handoff

No data checks, lint, tests, or builds were run, following repository instructions.
Run the focused content check:

```sh
docker compose run --rm cod-atlas-tools npm run data:check
```

The additions intentionally contribute 11 new canonical marker locations.
References reuse existing canonical markers. Against the documented 1277-marker
baseline, the expected total is 1288; it has not been confirmed by a data check.
No live content counts were added to tests.
