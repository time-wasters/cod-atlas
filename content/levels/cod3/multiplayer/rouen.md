---
id: cod3-rouen
title: Rouen
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-rouen
locations:
  - id: main
    country: France
    region: Normandy
    city: Rouen
    landmark: Vestiges de l'église Saint-Vincent
    latitude: 49.4403
    longitude: 1.08883
    precision: approximate
    confidence: medium
    method: manual-approximate
    primary: true
    urls:
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/rouen/
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Vestiges+de+l%27%C3%A9glise+Saint-Vincent%2C+Rouen%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/Rouen
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Map in the Game

*Rouen* is a multiplayer map in *Call of Duty 3*. The Call of Duty Wiki places
the map explicitly in **Rouen, France** and describes its terrain as an urban,
large-town environment. The fighting is concentrated in streets and
bomb-damaged buildings, with several enterable structures and elevated firing
positions. The Wiki describes the layout as successive rows of buildings
divided by roads, with a more heavily destroyed area toward the Allied side.

Call of Duty Maps likewise identifies the setting as the **capital city of
Normandy** and describes the playable space as a close- to medium-range urban
map built around a main street and back alleys. Its screenshots and description
show a deliberately generic French wartime streetscape rather than a
recognizable reconstruction of one famous Rouen landmark.

The Wiki also records the map's displayed street title as **"Rue Du Rasior"**
and glosses it as "Razor Road". No reliable evidence was found that this is an
actual historic Rouen street name; searches for the phrase and the plausible
French spelling "Rue du Rasoir" did not establish a real Rouen location. It
should therefore not be used as a geocoding clue.

## The Real Place & Differences

Rouen is a real city on the Seine and was very heavily damaged during the
Second World War. The City of Rouen records that the sector between the
cathedral and the Seine had already burned during the German occupation of
June 1940. The city was then struck repeatedly by Allied bombing, especially
during the **"Semaine rouge" (Red Week), 30 May-5 June 1944**, when transport
and river-crossing infrastructure was attacked in preparation for the Normandy
campaign. Rouen's municipal history describes major destruction to the
cathedral area, Saint-Maclou, the Palais de Justice and large parts of the left
bank, and states that the Canadians entered a city that was effectively a field
of ruins on 30 August 1944.

Contemporary and archival material narrows the most characteristic ruined
urban sector further. Mémoire Normande's film descriptions of the liberation
identify destroyed buildings and streets around **Rue des Charrettes,
Saint-Vincent, the Seine quays and the cathedral/Vieux-Marché area**. The former
Église Saint-Vincent, near Rue Jeanne-d'Arc and the quays, was almost completely
destroyed on 31 May 1944. Its surviving south portal and wall on Rue des
Charrettes provide a documented, present-day anchor inside one of the real
wartime destruction zones.

The multiplayer map should still be treated as a **fictionalized/composite
representation of bomb-damaged Rouen**, not a surveyed reconstruction of Rue
des Charrettes or Saint-Vincent. The in-game street pattern, shops and
buildings have not been matched reliably to individual pre-war structures in
Rouen. The historical evidence supports the wider central/quays destruction
sector, but not a one-to-one correspondence between the game's buildings and
this particular church ruin.

## Campaign Relationship

No documented *Call of Duty 3* campaign-map conversion or direct campaign
reuse was found for *Rouen*. The Call of Duty Wiki identifies it simply as a
multiplayer map and, unlike entries where a campaign resemblance/reuse is
explicitly called out, gives no campaign-map relationship for Rouen.

The game files also keep the map under its own multiplayer directory,
`mp/rouen`. That is consistent with Rouen being a standalone multiplayer
environment rather than a named campaign mission reused wholesale.

This matters for the marker choice: there is no campaign mission whose existing
Atlas coordinate should automatically be inherited by *Rouen*. The marker must
instead be based on the multiplayer map's stated city and on independently
documented wartime geography inside Rouen.

## Marker Position Explanation

The previous marker, **`49.44313, 1.09932`**, is a general city-level point for
Rouen. It correctly places the map in the named city, so it was not a
country-level fallback, but it does not use the map's strongest additional clue:
the level is specifically presented as a heavily bomb-damaged urban area.

The updated marker is **`49.4403, 1.08883`**, at the surviving remains of the
former **Église Saint-Vincent** near Rue des Charrettes. This is a stronger
Atlas anchor because:

- Saint-Vincent was almost completely destroyed by Allied bombing on
  **31 May 1944**, directly within the Red Week destruction described by Rouen's
  municipal history.
- Archival liberation footage explicitly records the destroyed Saint-Vincent
  church, Rue des Charrettes, nearby ruined housing and the Seine-side district.
- The site lies inside the central urban destruction zone between the historic
  center and the Seine rather than at an arbitrary city-center coordinate.
- A surviving fragment remains today, so the coordinate can be tied to a
  verifiable real-world place.

The marker deliberately remains **`precision: approximate`**,
**`confidence: medium`** and **`method: manual-approximate`**. The coordinate is
an evidence-based historical anchor for the type and area of destruction shown
by the multiplayer map; it is **not** a claim that the playable map literally
depicts Église Saint-Vincent or Rue des Charrettes.

This is therefore a meaningful refinement over the previous city point without
overstating the evidence. If future developer material, level-design documents
or recognizable in-game geometry ties *Rouen* to a specific real street, the
marker could be refined further.

## Sources

- [Call of Duty Wiki — Rouen](https://callofduty.fandom.com/wiki/Rouen) — confirms the multiplayer map, Rouen location, urban terrain, bomb-damaged setting, layout and the in-game "Rue Du Rasior" trivia.
- [Call of Duty Maps — Rouen](https://callofdutymaps.com/call-of-duty-3/rouen/) — confirms the Normandy-capital setting and the main-street/back-alley urban design.
- [City of Rouen — Rouen pendant la Seconde Guerre mondiale](https://www.rouen.fr/fr/seconde-guerre-mondiale) — municipal account of the 1940 destruction, Red Week bombing, damaged districts and the ruined condition of Rouen at liberation.
- [Mémoire Normande — Libération de Rouen](https://www.memoirenormande.fr/medias-liberation-de-rouen-614-3213-1-0.html) — archival film description identifying ruined Rouen locations including Saint-Vincent, Rue des Charrettes, Boulevard des Belges, the cathedral sector and the quays.
- [Mémoire Normande — Destruction et libération de Rouen](https://www.memoirenormande.fr/medias-destruction-et-liberation-de-rouen-614-7814-1-0.html) — archival description of 1944 destruction on the right bank, including Saint-Vincent, Rue des Charrettes and the Seine quays.
- [Paroisse Notre-Dame de Rouen — Ancienne Église Saint-Vincent](https://www.cathedrale-rouen.net/patrimoine/visites/stvincent.htm) — records the destruction of Saint-Vincent by a bomb on 31 May 1944 and the surviving fragment.
- [Wikidata — Église Saint-Vincent de Rouen](https://www.wikidata.org/wiki/Q3584670) — provides the documented coordinate for the former church site.
- [SteamDB — Call of Duty 3 depot manifest](https://steamdb.info/depot/3611391/manifests/) — shows the standalone `mp/rouen` multiplayer directory in the game data.
