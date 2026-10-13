# Warzone 2.0 roster audit

Audited on 2026-10-13. AI-assisted roster research; geographic verification is
outside this change. Level files retain empty Markdown bodies. Existing curated
locations and Wiki snapshots are preserved.

## Scope and counts

The WZ2 game ID covers the continuing Warzone platform launched in November
2022, including its MWIII, BO6, and BO7 integrations. Removed maps remain part
of the released roster. It does not include the original 2020 Warzone or
Warzone Mobile as separate releases.

The [game's map roster](https://callofduty.fandom.com/wiki/Call_of_Duty%3A_Warzone_2.0#Maps)
and [map category](https://callofduty.fandom.com/wiki/Category%3ACall_of_Duty%3A_Warzone_2.0_Maps)
identify ten Battle Royale/Resurgence maps, two DMZ-only maps, and Al Easima
Field. The category's 13 maps do not include the separately selectable Shadow
Siege event or Warzone Bootcamp training activity.

| Category | Before | After |
| --- | ---: | ---: |
| Battle Royale / Resurgence | 4, without explicit subtypes | 10 |
| Warzone Cup | 0 | 1 |
| DMZ | 0 explicit memberships | 5 |
| Shadow Siege | 0 | 1 |
| Warzone Bootcamp | 0 | 1 |
| Distinct level appearances | 4 | 15 |

Al Mazrah, Ashika Island, and Vondel each support both Battle Royale/Resurgence
and DMZ. Each has one canonical file with `modeSub: [battle-royale, dmz]`.
Building 21 and Koschei Complex reference their existing MWII canonical
records. The [DMZ roster](https://callofduty.fandom.com/wiki/DMZ/Modern_Warfare_II)
and [DMZ notes overview](https://callofduty.fandom.com/wiki/DMZ/Modern_Warfare_II/Notes)
identify the five exclusion zones. These overlapping memberships account for
18 category memberships across 15 distinct appearances.

## Classification and release groups

All map files remain in `multiplayer/`; Resurgence and Black Ops Royale use
the supported `battle-royale` subtype. All regular maps use the documented
`campaign` group `maps` / `Maps`, which groups each appearance under its own
resolved subtype, including both subtypes for the three shared maps.

Al Easima Field is standard `multiplayer` with the `Warzone Cup` campaign
group and no Battle Royale subtype. Shadow Siege and Bootcamp are distinct
canonical `other` / `challenge` activities under `challenge/`, grouped as
Story Events and Training respectively. No unsupported subtype was added.

Release IDs use sortable year-month strings; labels include the integration
game so repeated season numbers remain unambiguous. Each record represents
its first WZ2 release, rather than every later playlist return or decoration.

| Entry | Membership / activity | First release group |
| --- | --- | --- |
| Al Mazrah | Battle Royale, DMZ | MWII Season 1 |
| Al Easima Field | Warzone Cup | MWII Season 1 Reloaded |
| Building 21 | DMZ | MWII Season 1 Reloaded |
| Ashika Island | Battle Royale / Resurgence, DMZ | MWII Season 2 |
| Koschei Complex | DMZ | MWII Season 3 Reloaded |
| Vondel | Battle Royale / Resurgence, DMZ | MWII Season 4 |
| Shadow Siege | Story event | MWII Season 5 |
| Urzikstan | Battle Royale / Resurgence | MWIII Season 1 |
| Fortune's Keep | Resurgence | MWIII Season 2 |
| Rebirth Island | Resurgence | MWIII Season 3 |
| Warzone Bootcamp | Training | MWIII Season 3 |
| Area 99 | Resurgence | BO6 Season 1 |
| Verdansk | Battle Royale | BO6 Season 3 |
| Haven's Hollow | Resurgence | BO7 Season 1 |
| Avalon | Black Ops Royale | BO7 Season 2 Reloaded |

Release evidence:

- [Warzone overview](https://callofduty.fandom.com/wiki/Call_of_Duty%3A_Warzone_2.0#Maps): Al Mazrah, Ashika Island, Vondel, and the December 2023 Urzikstan integration.
- [MWII Season 1 Reloaded announcement](https://www.callofduty.com/au/en/blog/2022/12/call-of-duty-modern-warfare-II-warzone-2-0-season-01-reloaded-multiplayer-bundles-maps): Building 21 and Warzone Cup.
- [MWII Season 3 Reloaded announcement](https://www.callofduty.com/blog/2023/05/call-of-duty-modern-warfare-II-warzone-2-0-season-03-reloaded-multiplayer-maps-ranked-play): Koschei Complex.
- [Shadow Siege event guide](https://www.callofduty.com/uk/en/blog/2023/08/call-of-duty-modern-warfare-III-warzone-shadow-siege-limited-time-event): August 17, 2023 release and the Zaya Observatory assault in Al Mazrah.
- [MWIII Season 2 announcement](https://www.callofduty.com/blog/2024/02/call-of-duty-modern-warfare-iii-warzone-season-2-announcement): Fortune's Keep's February 2024 return.
- [MWIII Season 3 announcement](https://www.callofduty.com/blog/2024/03/call-of-duty-modern-warfare-iii-warzone-wzm-season-3-maps-modes-zombies-announcement): Rebirth Island and Bootcamp's April 2024 releases; Bootcamp takes place on a randomized slice of Urzikstan.
- [Area 99 article](https://callofduty.fandom.com/wiki/Area_99): November 14, 2024 release in BO6 Season 1.
- [Verdansk return guide](https://www.callofduty.com/en/blog/2025/03/call-of-duty-warzone-verdansk-map-return-intel-drop): April 3, 2025 return in BO6 Season 3.
- [BO7 Season 1 announcement](https://www.callofduty.com/blog/2025/11/call-of-duty-black-ops-7-warzone-zombies-season-01.html): Haven's Hollow and the December 4, 2025 integration.
- [Avalon article](https://callofduty.fandom.com/wiki/Avalon_%28map%29): March 13, 2026 Warzone release in BO7 Season 2 Reloaded.

## Canonical relationships and geography

Urzikstan's previous reference targeted `mwiii-urzikstan`, titled Operation
Deadbolt, with both a Syria main marker and a Yemen Dark Aether marker.
Warzone now owns `wz2-urzikstan`, retaining only the existing main marker
(`35, 38`, country/fallback). This preserves the previous curated geographic
choice without exposing the Zombies activity's Dark Aether location in WZ2.
It is not new evidence that fictional Urzikstan is in Syria. The MWIII record
and its locations remain unchanged.

Fortune's Keep, Rebirth Island, and Verdansk are canonical WZ2 variants of
their original Warzone maps, rather than unchanged appearance references:

- Fortune's Keep has a new underground laboratory, ruptured terrain, and changed coastal access, documented in the MWIII Season 2 announcement.
- Rebirth Island adds Building No. 06, submerged/shoreline access, and structural changes during Infil Strikes, documented in the MWIII Season 3 announcement.
- Verdansk is rebuilt with newly accessible coast and shoreline trenches, documented in the Verdansk return guide.

These variants omit `locations` and inherit their existing canonical geography:
Fortune's Keep's Fort George / Vis analogue (`43.0741, 16.1966`), Rebirth
Island's Kazakhstan country fallback (`48, 68`), and Verdansk's Ukraine
country fallback (`49, 32`). Inheritance preserves those choices; this audit
does not independently verify or improve them. The original Fortune's Keep
research describes the 2022 version, not the new WZ2 layout.

Avalon is a distinct Multiplayer variant of `bo7-endgame`. The
[publisher's Avalon tour](https://www.callofduty.com/blog/2026/03/black-ops-7-black-ops-royale-tour-of-avalon)
explicitly compares it with the Endgame map and documents new traversal
opportunities. Its inherited marker is Endgame's Monaco analogue
(`43.7333, 7.4167`, city/medium/real-world-inspiration), an inference rather
than a confirmed canonical location.

Shadow Siege inherits Al Mazrah's existing Yemen country fallback (`15, 48`).
Bootcamp inherits the new Urzikstan main marker. These indicate the reused
map's broad geography, not exact event objectives or the randomized training
area. There is no claimed real historical counterpart to these activities.

Area 99, Haven's Hollow, and Al Easima Field explicitly use `locations: []`
pending geographic research. The
[publisher's Area 99 overview](https://www.callofduty.com/blog/2024/11/call-of-duty-black-ops-6-season-one-mp-zombies-maps-modes-announcement/)
identifies fictional Echo Ridge Weapons Station in Nevada; the
[Haven's Hollow guide](https://www.callofduty.com/guides/warzone/havens-hollow)
identifies an Appalachian town. Neither establishes an exact real site.
The [Al Easima Field article](https://callofduty.fandom.com/wiki/Al_Easima_Field)
places the stadium in fictional Adal, without a verified real analogue.
The DMZ-only references retain their canonical empty locations.

## Other categories and source limitations

No separate Campaign, Zombies, Special Ops, Survival/Hostiles/Safeguard/Exo
Survival, Nightmares, Strike Force, War, or Extinction level roster was
identified for WZ2. Zombie Royale and other rules-only playlists reuse the
listed maps and do not establish separate Zombies maps. Shadow Siege and
Bootcamp are included as the requested selectable event/training activities.

The [WZ2 cut-content article](https://callofduty.fandom.com/wiki/Cut_Content/Call_of_Duty%3A_Warzone_2.0)
lists discarded DMZ features, including non-combatants, teammate buyback,
SAM-site contracts, and extraction balloons. It does not identify an extra
released map. No unreleased map was added from it.

Some supplied Wiki pages were unavailable directly. Indexed article text,
accessible map/category pages, existing imports, and publisher announcements
were used together. Six new Wiki records are template-based source-link stubs;
unknown revision, import, location, and media fields remain null. Existing
snapshots and media attribution were not refreshed.

## Validation handoff

No data checks, lint, tests, or builds were run, following repository instructions.
Run the focused content validation:

```sh
docker compose run --rm cod-atlas-tools npm run data:check
```

The expected canonical marker delta is **+7**: Urzikstan's independently owned
main marker, four inherited map-variant markers, and two inherited activity
markers. The two DMZ references add no markers. WZ2 appearances should expose
10 marker locations instead of the previous five; the Zombies Dark Aether
marker is no longer included in WZ2. These figures have not been confirmed by
validation. No live-content totals were added to tests, and no generated files
were edited.
