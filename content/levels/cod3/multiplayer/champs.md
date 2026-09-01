---
id: cod3-champs
title: Champs
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-champs
locations:
  - id: main
    country: France
    region: Île-de-France
    city: Magny-les-Hameaux
    landmark: Port-Royal-des-Champs
    latitude: 48.74417
    longitude: 2.01611
    precision: approximate
    confidence: high
    method: manual-approximate
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Port-Royal-des-Champs%2C+Magny-les-Hameaux%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/Port-Royal-des-Champs
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/champs/
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Map in the Game

*Champs* is a downloadable multiplayer map for *Call of Duty 3*. The Call of
Duty Wiki places it at **Port Royal des Champs, France**, identifies its terrain
as a farm village and gives the console codename `mp_farm`. The locally imported
Wiki data preserves the same location string.

The official Xbox description is more useful geographically than the original
Atlas fallback. It describes *Champs* as an exclusive multiplayer map set in
**Port Royal des Champs**, portrayed in-game as a war-torn French farm town. A
country road runs between a private chateau and a heavily damaged cathedral,
with wheat fields, ravines and ruined buildings around the playable area. The
Call of Duty Maps page likewise emphasizes the long road, open farm fields,
houses and large church.

The map is therefore clearly meant to evoke a rural French settlement rather
than an unnamed point somewhere in France. The proper-name location supplied by
the game material is specific enough to replace the former country-level
fallback.

## The Real Place & Differences

**Port-Royal-des-Champs is a real historic site** in the commune of
Magny-les-Hameaux, Yvelines, in the Île-de-France region southwest of Paris. The
French Ministry of Culture describes the modern site as a large wooded domain
containing the ruins of the former Port-Royal-des-Champs abbey, the national
museum, parkland and an old farm building. The Ministry's heritage records also
place the former abbey in Magny-les-Hameaux.

This provides a strong real-world match for the map's proper name and rural
theme, but not for its literal architecture. Port-Royal-des-Champs was an abbey,
not a World War II farm town. The monastery was suppressed at the beginning of
the eighteenth century, and the abbey church and monastic buildings were
demolished during the 1710-1713 period. The present site consists largely of
ruins, surviving outbuildings and the former Granges farm/museum complex.
Consequently, the multiplayer map's battered cathedral cannot be a literal
wartime depiction of the historical abbey church.

The World War II context also differs from the map's fictional battle. The
municipality of Magny-les-Hameaux records that the commune was liberated on
**24 August 1944 by French troops of General Leclerc**. *Champs*, by contrast,
uses the standard American-versus-German multiplayer teams. No reliable source
found in this research identifies the level as a reconstruction of a specific
battle at Port-Royal-des-Champs.

The best interpretation is therefore that Treyarch used the real
Port-Royal-des-Champs name and a broadly compatible rural/estate setting as the
basis for a fictionalized multiplayer battlefield rather than reconstructing
the historic site building-for-building.

## Relationship to the Campaign

The marker should **not** be pulled back toward Normandy merely because most of
the *Call of Duty 3* campaign takes place there. The single-player campaign is
built around the Normandy breakout and the closing of the Falaise Pocket,
ending at Chambois. Port-Royal-des-Champs is instead in Île-de-France, southwest
of Paris, and the local liberation date of 24 August places it beyond the
campaign's principal Normandy battlefield geography.

There is also no documented campaign conversion relationship for *Champs* in
the sources reviewed here. The Call of Duty Wiki gives the map the standalone
codename `mp_farm` and does not identify a campaign map. This is significant
because the same Wiki explicitly labels other *Call of Duty 3* multiplayer
maps when they are conversions: for example, *Crossing* is identified as a
conversion of *The Island* and lists that campaign mission directly.

The official Xbox material reinforces this distinction by advertising *Champs*
as an **exclusive new multiplayer map**. No evidence found links it to
Saint-Lô, *The Island*, *Falaise Road*, *Laison River*, Chambois or another
campaign level strongly enough to override the explicit Port Royal des Champs
location.

## Marker Position Explanation

The previous marker was the generic France fallback at **`46, 2`**, with
`precision: country`, `confidence: fallback` and `method: country-fallback`.
That fallback is no longer necessary.

Both the Call of Duty Wiki/import and the official Xbox description identify
the map by the proper name **Port Royal des Champs**. Independent French
heritage sources confirm that Port-Royal-des-Champs is a real site in
Magny-les-Hameaux, Yvelines, Île-de-France. The marker has therefore been moved
to **`48.74417, 2.01611`**, a representative point at the historic
Port-Royal-des-Champs site.

This is a substantial evidence-based improvement over the country centroid:
the marker now resolves the game's named location to a real site rather than
placing the map generically in central France.

The marker remains **`precision: approximate`** even though confidence in the
named place is **high**. Port-Royal-des-Champs is a sizeable historic estate,
and published coordinates differ slightly depending on whether a source is
marking the abbey ruins, museum/Granges complex or the wider domain. More
importantly, the game provides no evidence that its chateau, road, church or
individual farm buildings correspond to an exact surviving point within the
estate. Using an `exact` or `verified-landmark` marker for one particular
building would therefore imply a level of one-to-one reconstruction that the
sources do not support.

The selected point should be read as an atlas anchor for the **real named
Port-Royal-des-Champs site**, not as the exact position of the multiplayer
church, chateau, spawn points or fictional WWII firefight.

## Sources

- [Call of Duty Wiki — Champs](https://callofduty.fandom.com/wiki/Champs) — Supports the map's Port Royal des Champs location, American/German teams, farm-village terrain, `mp_farm` codename and the road/chateau/cathedral/wheat-field description.
- [CoD Atlas Wiki import — Champs](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-champs.json) — Confirms that the repository's imported Wiki record stores the location as "Port Royal des Champs, France" and contains no previous/next campaign-level relationship.
- [Call of Duty Maps — Champs](https://callofdutymaps.com/call-of-duty-3/champs/) — Supports the long street, open farm fields, houses, surrounding farm scenery and prominent church.
- [Xbox — Call of Duty 3 Bonus Map "Champs"](https://www.xbox.com/en-us/games/store/call-of-duty-3-bonus-map-champs/c3l3qs9ds5g2) — Official platform description placing the map at Port Royal des Champs and describing it as a war-torn French farm town with a chateau, cathedral, wheat fields and ravines.
- [Xbox Wire — COD3: Bonus Map "Champs"](https://news.xbox.com/en-us/2007/01/11/cod3-bonus-map-champs/) — Contemporary official announcement repeating the Port Royal des Champs setting and describing *Champs* as an exclusive new multiplayer map.
- [Ministère de la Culture — Musée national de Port-Royal des Champs](https://www.culture.gouv.fr/rechercher-une-publication-du-ministere-de-la-culture/repertoire-des-informations-publiques/Musees-d-Histoire/musee-national-de-port-royal-des-champs) — Confirms that Port-Royal-des-Champs is a real domain at Route des Granges, 78114 Magny-les-Hameaux, containing the abbey ruins, national museum, park and former farm.
- [Ministère de la Culture — Ancienne abbaye de Port-Royal des Champs](https://pop.culture.gouv.fr/notice/merimee/PA00087487) — Official French heritage record placing the former abbey at Magny-les-Hameaux in Yvelines.
- [Musée national de Port-Royal des Champs — De la destruction à la mémoire](https://port-royal-des-champs.fr/lhistoire/de-la-destruction-a-la-memoire/) — Documents the suppression and demolition of the monastery and abbey church in 1709-1713, showing that the in-game battered cathedral cannot be a literal WWII survival of the abbey church.
- [Magny-les-Hameaux — Magny-les-Hameaux en quelques dates](https://magny-les-hameaux.fr/article/magny-les-hameaux-en-quelques-dates) — Local-authority timeline stating that Magny-les-Hameaux was liberated on 24 August 1944 by General Leclerc's French troops.
- [Wikipedia — Port-Royal-des-Champs](https://en.wikipedia.org/wiki/Port-Royal-des-Champs) — Used for the representative site coordinate `48.74417, 2.01611` and as a secondary summary of the abbey's location and surviving estate.
- [Wikidata — Port-Royal-des-Champs](https://www.wikidata.org/wiki/Q652981) — Provides an independent nearby coordinate for the same historic site and confirms its association with Magny-les-Hameaux; the small coordinate variation supports retaining `precision: approximate`.
- [Call of Duty Wiki — Crossing](https://callofduty.fandom.com/wiki/Crossing) — Comparison source showing that the Wiki explicitly labels a multiplayer map when it is a campaign conversion, identifying *Crossing* as derived from *The Island*.
- [Call of Duty Wiki — Call of Duty 3](https://callofduty.fandom.com/wiki/Call_of_Duty_3) — Supports the campaign's Normandy-breakout focus and identifies *Champs* separately as a free downloadable multiplayer map.
- [CoD Atlas Wiki import — Chambois](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-chambois-level.json) — Confirms Chambois as the campaign finale location and its 20 August 1944 in-game date, useful for distinguishing the campaign's Falaise-Pocket geography from the later liberation of Magny-les-Hameaux.
