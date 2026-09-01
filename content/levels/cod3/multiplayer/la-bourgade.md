---
id: cod3-la-bourgade
title: La Bourgade
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-la-bourgade
locations:
  - id: main
    country: France
    region: Normandy
    city: Périers
    latitude: 49.1872
    longitude: -1.4061
    precision: city
    confidence: high
    method: wiki-location
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=P%C3%A9riers%2C+Manche%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/P%C3%A9riers%2C_Manche
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/la-bourgade/
---
> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

*La Bourgade* is a standalone *Call of Duty 3* multiplayer map and has no mission narrative. The Call of Duty Wiki identifies its setting as **Périers, France** and describes the map as taking place in a fictional version of the town. Call of Duty Maps likewise places it in Périers and describes a large old-town battlefield with extensive buildings, churches, damaged roads and vehicle-supported combat; Battle and Team Battle use only part of the full playable area.

No documented singleplayer mission was found that *La Bourgade* directly reuses or adapts. The nearby campaign mission *The Island* (`cod3-the-island`) is relevant geographically and historically, but the Call of Duty Wiki identifies **Crossing**, not *La Bourgade*, as that mission's associated multiplayer map. The Périers connection should therefore be treated as shared campaign geography rather than evidence of a direct map conversion.

## The Real Place & Differences

Périers is a commune in the Manche department of Normandy. The game-location evidence is unusually explicit for a multiplayer map: both map-specific sources name Périers, while the Wiki also calls the playable version fictional. That supports Périers as the canonical real-world anchor without implying that the map reproduces the town's real street plan.

No source found ties a particular in-game church, building, road junction or other structure to a verified surviving Périers landmark. An exact church, town-hall or memorial marker would therefore introduce false precision. The strongest defensible match is the town itself.

## The Real Mission & Differences

There is no documented real operation that *La Bourgade* specifically claims to recreate. The closest supported campaign context is nevertheless strong: the real 90th Infantry Division fighting represented nearby in *The Island* took place at Saint-Germain-sur-Sèves. U.S. Army history states that securing the Saint-Germain “island” would put the division in position to threaten **Périers** and reach the Périers-Coutances highway.

During the subsequent Operation COBRA advance, the VIII Corps after-action report records the 90th Infantry Division occupying Périers on **27 July 1944**. This makes Périers a coherent continuation of the historical geography behind *The Island*, but it does **not** prove that *La Bourgade* depicts that specific liberation action or reuses the campaign mission's battlefield.

## Marker Position Explanation

The stored marker is **`49.1872, -1.4061`**, the published town coordinate for Périers. This replaces the previous France country fallback at **`46, 2`** because the Call of Duty Wiki explicitly identifies Périers in its structured location field and Call of Duty Maps independently gives the same location.

This supports `precision: city`, `confidence: high` and `method: wiki-location`: the town is explicitly identified, but the playable map is a fictionalized version and no exact real landmark has been verified as the represented site. The marker must therefore not be read as the location of a particular in-game building, spawn, objective or documented July 1944 action. Exact candidates inside Périers were deliberately rejected because none is tied to the map by the available evidence.

The stored Google Maps URL searches for the named real place **Périers, Manche, France**; the atlas marker uses the separately curated coordinates above.

## Sources

- [Call of Duty Wiki — La Bourgade](https://callofduty.fandom.com/wiki/La_Bourgade) — Identifies the multiplayer map's American-versus-German setting as Périers, France, and explicitly calls it a fictional version of the town.
- [Call of Duty Maps — La Bourgade](https://callofdutymaps.com/call-of-duty-3/la-bourgade/) — Independently lists Périers, France and describes the old-town layout, surrounding buildings, damaged roads, vehicles and reduced Battle/Team Battle play area.
- [INSEE — Commune de Périers](https://www.insee.fr/fr/metadonnees/geographie/commune/50394-periers) — Official French geographic identification of Périers as commune 50394 in Manche, Normandy.
- [Wikipedia — Périers, Manche](https://en.wikipedia.org/wiki/P%C3%A9riers%2C_Manche) — Present-day town overview and published town coordinate used for the city-level marker.
- [CoD Atlas — The Island (`cod3-the-island`)](https://github.com/time-wasters/cod-atlas/blob/application-architecture-rework/content/levels/cod3/campaign/2-the-island.md) — Curated campaign record linking *The Island* to Saint-Germain-sur-Sèves and its historical approach toward Périers.
- [Call of Duty Wiki — The Island](https://callofduty.fandom.com/wiki/The_Island) — Identifies Saint-Germain-sur-Sèves, the 90th Infantry Division and **Crossing** as the associated multiplayer map, preventing an unsupported direct adaptation claim for *La Bourgade*.
- [U.S. Army Center of Military History — *Breakout and Pursuit*, Chapter XI](https://www.ibiblio.org/hyperwar/USA/USA-E-Breakout/USA-E-Breakout-11.html) — Official history stating that seizure of the Saint-Germain-sur-Sèves island would threaten Périers and open access to the Périers-Coutances highway.
- [VIII Corps After Action Report — July 1944](https://www.90thdivisionassoc.org/afteractionreports/PDF/VIII%20AAR%2007-44.pdf) — Records the 90th Infantry Division occupying Périers on 27 July 1944 during the COBRA advance.
