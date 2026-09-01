---
id: cod3-seine-river
title: Seine River
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-seine-river
locations:
  - id: main
    country: France
    region: Pays de la Loire
    city: Mayenne
    latitude: 48.30337
    longitude: -0.61383
    precision: city
    confidence: medium
    method: real-world-inspiration
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Mayenne%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/Mayenne_(commune)
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/seine-river/
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

**Seine River** is a multiplayer map and has no mission narrative. It depicts an
urban French riverside settlement at night: the Seine lies just outside the
playable area, with docks and buildings visible across the water. The Call of
Duty Wiki explicitly describes the map as resembling the singleplayer
**Mayenne Bridge** level (`cod3-mayenne-bridge`), and the Mayenne Bridge article
reciprocally lists Seine River as a related multiplayer map.

That relationship is more useful for geographic research than the generic map
title alone. It provides a documented connection to the waterfront fighting in
Mayenne Bridge without establishing that the multiplayer map is literally set
in Mayenne.

## The Real Place & Differences

The map's canonical setting is only identified as the **Seine River, France**.
Neither researched game source names a town, bridge, or particular stretch of
the Seine, so selecting Paris, Rouen, Fontainebleau, or another Seine-side
locality would create unsupported precision.

The closest documented real-world analogue is therefore **Mayenne**, in
Pays de la Loire. This is an analogue rather than the canonical location:
Mayenne stands on the **Mayenne River**, not the Seine. The choice is based on
the map's documented relationship to Mayenne Bridge and should not be read as a
claim that the fictional Seine River map has been geolocated to Mayenne.

## The Real Mission & Differences

For the linked campaign context, the U.S. 90th Infantry Division was ordered on
5 August 1944 to seize and secure crossings over the Mayenne River. Its after
action report states that Task Force Weaver reached Mayenne, found a bridge in
the city still intact but prepared for demolition, seized it before the Germans
could destroy it, and occupied the city.

The singleplayer Mayenne Bridge level dramatizes that historical action. Seine
River only borrows or resembles elements of that campaign setting; no source
found identifies the multiplayer battle itself as a reconstruction of the
August 1944 operation.

## Marker Position Explanation

The stored marker is `48.30337, -0.61383`, the same Mayenne city point already
used by the curated **Mayenne Bridge** campaign record and the **Mayenne**
multiplayer record. This replaces the previous France-centroid fallback
`46, 2` with a **city-precision, medium-confidence real-world-inspiration**
marker.

This is a better fit than the old country fallback because Mayenne is the only
specific locality supported by a documented relationship to the map. It is
deliberately not promoted to an exact bridge marker: the available sources say
Seine River resembles Mayenne Bridge, but they do not establish that Seine
River reproduces the real Pont Mac Racken or any other specific Mayenne bridge.
Likewise, choosing an arbitrary point on the Seine would imply a precision the
sources do not support.

The stored Google Maps URL searches for **Mayenne, France** by place name; the
atlas marker itself uses the separately curated coordinates above.

## Sources

- [Seine River — Call of Duty Wiki](https://callofduty.fandom.com/wiki/Seine_River) — Identifies the map's Seine River, France setting and explicitly records its resemblance to the Mayenne Bridge campaign level.
- [Seine River — Call of Duty Maps](https://callofdutymaps.com/call-of-duty-3/seine-river/) — Describes the nighttime French riverside setting, docks, buildings across the river, and map layout clues.
- [Mayenne Bridge — Call of Duty Wiki](https://callofduty.fandom.com/wiki/Mayenne_Bridge) — Identifies Mayenne as the campaign location and reciprocally lists Seine River as a related multiplayer map.
- [90th Infantry Division After Action Report — August 1944](https://www.90thidpg.us/Research/90thDivision/History/AAR/august44.html) — Documents the 90th Division's 5 August advance on Mayenne and seizure of an intact bridge prepared for demolition.
- [Commune de Mayenne — INSEE](https://www.insee.fr/fr/metadonnees/geographie/commune/53147-mayenne) — Official French geographic reference confirming Mayenne in the Pays de la Loire region.
- [Mayenne Bridge — current CoD Atlas record](https://github.com/time-wasters/cod-atlas/blob/application-architecture-rework/content/levels/cod3/campaign/4-mayenne-bridge.md) — Supplies the project's already-curated Mayenne city marker reused here for cross-level consistency.
- [Pont Mac Racken — French Ministry of Culture](https://pop.culture.gouv.fr/notice/merimee/IA53000573) — Confirms the surviving/rebuilt named bridge in Mayenne; useful as a deliberately rejected exact-marker candidate because no source ties Seine River specifically to this bridge.
