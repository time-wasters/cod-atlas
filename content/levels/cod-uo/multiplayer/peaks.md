---
id: cod-uo-peaks
title: Peaks
games:
  - cod-uo
mode: multiplayer
wikiArticle: codwiki-peaks
locations:
  - id: main
    country: Germany
    latitude: 51.1635
    longitude: 10.4475
    precision: country
    confidence: fallback
    method: country-fallback
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Germany
      - wikipedia: https://en.wikipedia.org/wiki/Germany
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-1/Peaks/
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

**Peaks** is a multiplayer map rather than a campaign mission, so it has no playable character, assigned unit, mission date, briefing, route, or historical objective. The Call of Duty Wiki identifies the teams as the United States and Germany and describes the setting as a destroyed, snow-covered village, with predominantly close-quarters fighting and some medium-range engagements. Call of Duty Maps adds that a single road divides much of the combat space, that the battlefield sits on high or mountainous ground, and that the map includes trees, fences, emplaced MG42s, a Horch 1a, and a Willys Jeep.

The map was introduced as one of the two original bonus maps in the official *Call of Duty: United Offensive* map pack, alongside **Streets**; the official readme names it `mp_peaks`. It later also appeared in *Call of Duty 2: Big Red One*. Available sources do not document a relationship to a specific singleplayer mission, and no such relationship should be inferred from scenery alone.

## The Real Place & Differences

No reliable source found for this research identifies a real town, mountain, battlefield, or country as the canonical location of **Peaks**. Call of Duty Maps explicitly lists its location as **Unknown**. The snowy upland village, German half-timbered-looking buildings, U.S.-versus-Germany faction pairing, and road-and-village layout are compatible with several parts of western or central Europe in the winter of 1944–45, including German border uplands and the Ardennes, but those similarities are not enough to select one real settlement.

The atlas classification is therefore **composite or fictionalized setting**, with **Germany used only as a broad country fallback**. Germany is the least-specific terrestrial anchor consistent with the map's German-built visual language and faction context, but it is not presented as a confirmed in-game location or proven inspiration. More specific candidates such as the Hürtgen Forest, the Eifel, Bavaria, or the Belgian Ardennes were rejected because no source ties `mp_peaks` to them. The official map-pack readme is especially useful here because it lists `mp_peaks` separately from the explicitly named `mp_uo_hurtgen`, arguing against silently treating Peaks as another Hürtgen map.

## The Real Mission & Differences

There is no matching real mission to compare with **Peaks**. U.S. Army histories document real American-German fighting in rough, wooded, high-ground terrain along Germany's western border during the Siegfried Line and Hürtgen campaigns in autumn and early winter 1944, which shows that the map's broad visual premise is historically plausible. That context is only an analogue: no source found connects **Peaks** to a particular U.S. division, German formation, date, objective, village, or battle.

Accordingly, vehicle fighting, MG positions, destroyed houses, and control of the central road should be treated as multiplayer design elements rather than a reconstruction of a documented action.

## Marker Position Explanation

The stored coordinates are `51.1635, 10.4475`. They are a deliberately representative **Germany country fallback**, placed at the well-known geographical-centre marker near Niederdorla rather than at a claimed battlefield. The point must **not** be interpreted as the location of the in-game village, a historical battle site, or evidence that the developers modeled Niederdorla.

`precision: country`, `confidence: fallback`, and `method: country-fallback` reflect the evidence: the game sources do not establish a real locality or even a named region. No `region`, `city`, or `landmark` field is stored because those would imply unsupported precision. The Google Maps URL therefore searches only for **Germany**, while the atlas marker uses the separately curated representative coordinates above.

## Sources

- [Call of Duty Wiki — Peaks](https://callofduty.fandom.com/wiki/Peaks) — Game facts: multiplayer status, U.S. vs. Germany teams, snowy destroyed-village setting, combat ranges, `mp_peaks` codename, bonus-map origin, and later appearance in *Call of Duty 2: Big Red One*.
- [Call of Duty Maps — Peaks](https://callofdutymaps.com/call-of-duty-1/Peaks/) — Explicitly lists the real-world location as **Unknown** and describes the road, mountainous/high-ground setting, vegetation, MG42 positions, and drivable vehicles.
- [Call of Duty: United Offensive Map Pack readme mirror — ModDB](https://www.moddb.com/games/call-of-duty-united-offensive/addons/map-pack-1-3) — Preserves the official map-pack readme naming `mp_peaks` as a new bonus map and listing it separately from `mp_uo_hurtgen`; supports treating Peaks as a standalone multiplayer space rather than a documented Hürtgen derivative.
- [U.S. Army Center of Military History — *The Siegfried Line Campaign*](https://history.army.mil/portals/143/Images/Publications/catalog/7-7.pdf) — Authoritative historical context for U.S.-German fighting along the German border, including the Hürtgen Forest, used only as a broad analogue and not as a location claim for Peaks.
- [AMEDD Center of History & Heritage — The Fight for the Hürtgen Forest](https://achh.army.mil/history/book-wwii-huertgenforest-etowestwall/) — Additional U.S. Army historical context for difficult autumn/winter fighting at the West Wall; supports the plausibility of the general terrain and season while not connecting the map to that battle.
- [Thuringia tourism authority — Mittelpunkt Deutschlands](https://www.thueringen-entdecken.de/w/opendata/poi/mittelpunkt-deutschlands) — Establishes the marked geographical centre of Germany at Niederdorla, used only to justify a neutral representative country-fallback point.
- [Wikimedia Commons — Geographical center of Germany in Niederdorla](https://commons.wikimedia.org/wiki/File:Geographical_center_of_germany_in_niederdorla.JPG) — Provides geotagged coordinates for the geographical-centre marker used to round the representative atlas coordinate; it is not evidence for the game's setting.
