# Warzone Mobile roster audit

Audited on 2026-10-13. AI-assisted roster research; geographic verification is
outside this change. Existing curated locations and Wiki snapshots are preserved.

## Scope and counts

The existing game ID is `wz-m`. The
[game overview](https://callofduty.fandom.com/wiki/Call_of_Duty:_Warzone_Mobile#Multiplayer)
lists nine Multiplayer maps and two Battle Royale/Resurgence maps. The
[Multiplayer category](https://callofduty.fandom.com/wiki/Category:Call_of_Duty:_Warzone_Mobile_Multiplayer_Maps)
also includes Broadcast, Breenbergh Hotel, and El Asilo. The map navigation
identifies those three as Limited Release-only; they remain in the historical
roster.

| Category | Before | After |
| --- | ---: | ---: |
| Multiplayer | 0 | 9 |
| Historical MP | 0 | 3 |
| Battle Royale / Resurgence | 0 | 2 |
| Tutorial | 0 | 1 |
| Practice Zone | 0 | 1 |
| Distinct level appearances | 0 | 16 |

All Multiplayer maps, including historical maps and Battle Royale, live in
`multiplayer/`. The documented `campaign` field separates Multiplayer,
Historical MP, and Battle Royale. Battle Royale/Resurgence uses
`modeSub: battle-royale`; standard Multiplayer omits subtypes.

Tutorial and Practice Zone are distinct canonical `other` / `challenge`
activities in `challenge/`, grouped separately as Tutorial and Practice Zone.
No unsupported tutorial or practice subtype is introduced.

No Campaign or standalone Zombies roster was identified. Zombie Royale is a
Battle Royale ruleset on existing maps, not a separate Zombies level. The
review also found no dedicated Special Ops, Survival/Hostiles/Safeguard/Exo
Survival, numbered Challenges, Nightmares, Strike Force, War, or Extinction
roster. Multiplayer playlists and events are not additional maps.

## References, variants, and releases

| Entry | Group | Canonical target / relationship | Release group |
| --- | --- | --- | --- |
| Shipment | Multiplayer | Reference: `mwii-shipment` | Limited Release |
| Shoot House | Multiplayer | Reference: `mwii-shoothouse`; appearance title uses Shoot House | Limited Release |
| Scrapyard | Multiplayer | Reference: `mw19-scrapyard` | Limited Release |
| Rust | Multiplayer | Reference: `mw19-rust` | MWIII Season 3 |
| Crash | Multiplayer | Reference: `mw19-crash` | MWIII Season 4 |
| Meat | Multiplayer | Reference: `mwiii-meat` | MWIII Season 5 |
| Bitvela | Multiplayer | Reference: `mwiii-bitvela` | MWIII Season 5 Reloaded |
| Hardhat | Multiplayer | Reference: `mw19-hardhat` | MWIII Season 6 |
| Nuketown | Multiplayer | Reference: `bo-nuketown`, also referenced by BO6 | BO6 Season 1 |
| Broadcast | Historical MP | Reference: `mw19-broadcast` | Limited Release |
| Breenbergh Hotel | Historical MP | Reference: `mwii-breenbergh-hotel` | Limited Release |
| El Asilo | Historical MP | Reference: `mwii-el-asilo` | Limited Release |
| Verdansk | Battle Royale | Canonical `wz-m-verdansk`, variant of `wz-verdansk` | Limited Release |
| Rebirth Island | Battle Royale | Reference: `wz-rebirth-island` | Limited Release |
| Tutorial | Tutorial | Canonical `wz-m-tutorial`, no established map relationship | Worldwide Launch |
| Practice Zone | Practice Zone | Canonical `wz-m-practice-zone`, variant of `wz-rebirth-island` | MWIII Season 5 |

Release IDs use `0` for the earlier Limited Release phase and sortable
year-month strings for later groups. Labels distinguish MWIII seasons from BO6
seasons. References supply their own appearance release groups instead of
inheriting the originating game's groups.

Version evidence:

- [Shoot House](https://callofduty.fandom.com/wiki/Shoot_House) and [Shipment](https://callofduty.fandom.com/wiki/Shipment) identify the MWII versions in Warzone Mobile. Referencing their MW2019 versions would inherit the wrong setting.
- [Scrapyard's MW2019 article](https://callofduty.fandom.com/wiki/Scrapyard_(Modern_Warfare)) identifies the returning Zhokov Boneyard map.
- [Rust](https://callofduty.fandom.com/wiki/Rust) and [Hardhat](https://callofduty.fandom.com/wiki/Hardhat) distinguish their MW2019 appearances from the original maps; Hardhat's article identifies its mobile release as that version.
- [Official MWIII Season 4 announcement](https://www.callofduty.com/blog/2024/05/call-of-duty-modern-warfare-iii-warzone-wzm-season-4-maps-modes-zombies-announcement) explicitly identifies the MW2019 version of Crash.
- [Official MWIII Season 5 announcement](https://www.callofduty.com/blog/2024/07/call-of-duty-modern-warfare-iii-warzone-wzm-season-5-essential-maps-modes-zombies-announcement) identifies Meat's return from MWIII.
- [Official MWIII Season 5 Reloaded announcement](https://www.callofduty.com/blog/2024/08/call-of-duty-modern-warfare-iii-warzone-wzm-season-5-reloaded-maps-modes-zombies-announcement) identifies Bitvela. Its appearance references the existing Bitvela canonical variant, preserving its `variantOf: mw2-favela` relationship.
- [Nuketown](https://callofduty.fandom.com/wiki/Nuketown_(map)) identifies the BO6/mobile appearance and BO6 Season 1 release. The repository already indexes BO6 Nuketown as an unchanged appearance of `bo-nuketown`.
- [Rebirth Island](https://callofduty.fandom.com/wiki/Rebirth_Island_(Warzone)#Call_of_Duty:_Warzone_Mobile) identifies the returning Reinforced version from original Warzone. It references `wz-rebirth-island` rather than the later `wz2-rebirth-island` variant.
- [Verdansk's mobile overview](https://callofduty.fandom.com/wiki/Verdansk_(map)#Call_of_Duty:_Warzone_Mobile) and the official Season 5 announcement document material mobile-specific POIs. A distinct mobile variant preserves that history while inheriting existing geography.

Release evidence:

- [Official September 2023 community update](https://www.reddit.com/r/officialwarzonemobile/comments/16u4ohw/) announces Shipment and Shoot House during Limited Release.
- [Official October 2023 NEXT recap](https://www.reddit.com/r/officialwarzonemobile/comments/170uyz9/) and the Rebirth Island article document its Limited Release arrival.
- [Official MWIII Season 3 announcement](https://www.callofduty.com/blog/2024/03/call-of-duty-modern-warfare-iii-warzone-wzm-season-3-maps-modes-zombies-announcement) documents Rust's mobile arrival.
- The official Season 4, Season 5, and Season 5 Reloaded announcements above document Crash, Meat/Practice Zone, and Bitvela respectively.
- [Official MWIII Season 6 announcement](https://www.callofduty.com/ca/en/blog/2024/08/call-of-duty-modern-warfare-iii-warzone-wzm-season-6-haunting-returns-maps-modes-zombies-announcement) documents Hardhat's arrival.
- [Official BO6 Season 1 community update](https://www.reddit.com/r/officialwarzonemobile/comments/1grglrr/) documents Nuketown's addition.

## Source differences and remaining geography

The [March 14 launch preview](https://www.callofduty.com/blog/2024/03/call-of-duty-warzone-mobile-prepare-for-launch-need-to-know)
listed Hotel and El Asilo in its proposed Mosh Pit pool. The Wiki map navigation
classifies these alongside Broadcast as Limited Release-only. This audit keeps
the requested historical grouping, without asserting exact removal dates.
Historical MP is a roster grouping, not a claim about current server availability.

Some individual map articles and official community posts were available through
indexed source excerpts, while direct page opens returned tool errors. Their
links and existing imported snapshots were retained; no live Wiki refresh was
performed. The accessible category and game/map overviews support the roster.

The [official tutorial guide](https://www.callofduty.com/guides/training/call-of-duty-guides-warzone-mobile-how-to-play)
establishes selectable guided training but does not establish its geographic
setting. Tutorial therefore has explicit `locations: []` and no speculative
variant relationship. Its release group records documented worldwide-launch
availability; an earlier first appearance has not been established.

The official Season 5 announcement places Practice Zone on Rebirth Island.
The [game overview's Practice Zone section](https://callofduty.fandom.com/wiki/Call_of_Duty:_Warzone_Mobile#Practice_Zone)
records its later removal with BO6 Season 1. It remains in the released activity
roster and inherits `wz-rebirth-island` locations.

All 13 references reuse existing canonical location data. Verdansk and Practice
Zone each intentionally add one inherited marker location: Ukraine at `49, 32`
and Kazakhstan at `48, 68` respectively. These remain country fallbacks;
neither is a verified site. Tutorial adds none. The expected marker-count delta
is **+2**, or **1279** against the documented **1277** regression baseline;
the current compiled total was not measured.

The new `codwiki-warzone-mobile` record is an unimported game-overview link for
Tutorial. Practice Zone reuses the existing Rebirth Island article. Existing
Wiki imports and media attribution are unchanged; no new media is added.

## Validation

No data checks, lint, tests, builds, imports, or progress generation were run,
following repository instructions. For this content-only change, run:

```sh
docker compose run --rm cod-atlas-tools npm run data:check
```
