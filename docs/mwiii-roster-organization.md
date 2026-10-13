# MWIII roster organization

This first pass sorts existing records only. Campaign records, stable IDs,
locations, variant relationships, Wiki imports, and Markdown bodies are preserved.
No new levels or marker locations are added.

## Classification

The documented `campaign` field supplies named sections within each mode.
These multiplayer categories all remain in `multiplayer/` with
`mode: multiplayer`; they do not introduce new `modeSub` values.

| Mode / section | Existing entries | Membership |
| --- | ---: | --- |
| Multiplayer / Regular / Seasonal | 53 | Remaining core maps, carry-forward appearances, and seasonal variants |
| Multiplayer / Ground War | 3 | Levin Resort; Orlov Military Base; Popov Power |
| Multiplayer / War | 2 | Operation Spearhead; Operation Tin Man |
| Multiplayer / Gunfight | 4 | Alley; Blacksite; Exhibit; Training Facility |
| Multiplayer / Vortex | 6 | Tetanus; Satan's Quarry; Sporeyard; Airborne; Skidgrow; Das Gross |
| Multiplayer / Bit Party | 1 | Bitvela |
| Multiplayer / G3T_H1GH | 2 | Get High; G3T H1GH3R |
| Zombies / Operation Deadbolt | 1 | Operation Deadbolt, moved to `zombies/operation-deadbolt.md` |
| Other / Challenge / Training | 1 | Firing Range, moved to `challenge/firing-range.md` |

The Gunfight section follows the supplied four-map category for dedicated
Gunfight arenas. Core maps also playable in Gunfight stay in Regular / Seasonal;
the section is not an exhaustive list of playlist availability. Likewise,
G3T H1GH3R stays in G3T_H1GH despite its later 6v6 availability.
Bit-ment is a regular Season 6 Shipment variant; Bitvela is the Bit Party map.

Operation Deadbolt retains ID `mwiii-urzikstan` and both existing locations,
including the Dark Aether marker. This does not establish standalone Rift
records. The requested seven Story Missions and four Dark Aether Rifts have
no existing files and remain outstanding. The campaign's 14 files are unchanged.

## Release groups

`content-update` separates Included (`"0"`), November Updates (`"0.1"`), and
Seasons 1–6 (`"1"`–`"6"`). November Updates includes Crown Raceway, Farm 18,
Mercado Las Almas, Shoot House, and Shipment. Mid-season additions stay in
their parent season. Each reference receives its MWIII release group rather
than its canonical game's release group.

## Sources

- [MWIII Wiki roster](https://callofduty.fandom.com/wiki/Call_of_Duty%3A_Modern_Warfare_III) and [Bitvela roster navigation](https://callofduty.fandom.com/wiki/Bitvela): released map categories and season memberships. Indexed article text was available when direct access failed.
- [Publisher multiplayer overview](https://www.callofduty.com/guides/training/call-of-duty-modern-warfare-III-training-multiplayer-how-to-play): launch Core, Ground War, and War categories.
- [Publisher Training Facility guide](https://www.callofduty.com/guides/multiplayer-maps/call-of-duty-guides-modern-warfare-iii-multiplayer-map-guide-training-facility): dedicated Gunfight classification.
- [Publisher Season 1 announcement](https://news.blizzard.com/en-us/article/24034082/season-1-of-call-of-duty-modern-warfare-iii-and-call-of-duty-warzoneall-you-need-to-know): returning Gunfight maps and the original three Vortex variants.
- [Publisher Season 3 patch notes](https://www.callofduty.com/patchnotes/2024/04/call-of-duty-modern-warfare-iii-season-3-patch-notes): six seasonal Core maps.
- [Publisher Season 4 Reloaded announcement](https://www.callofduty.com/ca/en/blog/2024/06/call-of-duty-modern-warfare-iii-warzone-wzm-season-4-reloaded-maps-modes-zombies-announcement): Das Gross, Bitvela, and G3T_H1GH3R.
- [Publisher Season 5 announcement](https://news.blizzard.com/en-us/article/24104606/fully-revealed-season-5-content-drop): Bait, Yard, and cel-shaded variants.
- [Publisher Season 6 patch notes](https://www.callofduty.com/patchnotes/2024/09/call-of-duty-modern-warfare-iii-season-6-patch-notes): Drive Thru, Mad Cow, and the five Shipment variants, including Bit-ment.

No data checks, lint, tests, or builds were run. The focused validation command is:

```sh
docker compose run --rm cod-atlas-tools npm run data:check
```
