---
id: cod3-verdun
title: Verdun
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-verdun
locations:
  - id: main
    country: France
    region: Grand Est
    city: Verdun
    latitude: 49.15964
    longitude: 5.3829
    precision: city
    confidence: high
    method: title
    primary: true
    urls:
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/verdun/
      - wikipedia: https://en.wikipedia.org/wiki/Verdun
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Multiplayer Map in the Game

*Verdun* is a small multiplayer map in *Call of Duty 3*, with American and
German teams. The Call of Duty Wiki identifies the location directly as
**Verdun, France** and describes a mostly flat battlefield built around
bunkers, tunnels and trenches. The layout is deliberately symmetrical: a large
bunker occupies one side of the playable space, an underground dugout and
forking tunnel system connect routes beneath the hill, and a curved trench line
crosses the open ground. The map contains no vehicles.

Call of Duty Maps likewise places the map at Verdun in northeastern France on
the Meuse. Its screenshots and description emphasize bunkers, open outdoor
combat and rural scenery outside the playable boundary, including farm fields,
trees and distant high ground. The result is not an urban reconstruction of
central Verdun despite the real city being the named location.

A particularly useful first-party-adjacent source is level designer **Jason
McCord**, who worked at Treyarch on *Call of Duty 3*. In his portfolio he
identifies *Verdun* as a small mirrored multiplayer map whose gameplay takes
place in and around a bunker system and trench beside a road in Verdun, France.
He also states that he worked on the map from paper design through completion.
That supports treating the layout as a purpose-built multiplayer arena rather
than assuming that its geometry reproduces a surviving real fortification.

## Campaign Relationship

No documented *Call of Duty 3* campaign-map relationship was found for
*Verdun*. The Wiki article does not identify a campaign mission from which the
map was converted, and the Atlas Wiki import contains no previous/next mission
relationship for it. This differs from several other *Call of Duty 3*
multiplayer maps for which the Wiki explicitly names a campaign source.

The wider single-player campaign is centered on the **Normandy breakout and
Falaise Pocket in July-August 1944**, far west of Verdun. None of the campaign
missions therefore provides a more precise geographical anchor for this map.
McCord's description of designing the mirrored map from paper also supports a
standalone multiplayer layout, although it does not rule out reuse of generic
art assets.

## The Real Place & Historical Context

Verdun is a real city in the **Meuse department of the Grand Est region**. It is
best known for the 1916 Battle of Verdun, and the surrounding battlefield still
contains major forts, trenches and underground works. This historical landscape
makes the multiplayer map's bunker-and-trench theme immediately plausible as a
broad Verdun motif.

However, *Call of Duty 3* is a Second World War game and the multiplayer teams
are Americans and Germans. There is also a genuine 1944 connection: the U.S.
XX Corps advanced from Reims toward Verdun at the end of August, and elements
of the 7th Armored Division entered the city on **31 August 1944**. The XX Corps
operational account describes German rear-guard defenses around the Meuse
bridge and the American seizure of Verdun. That provides a historically valid
WWII American-German setting for the map name, but the documented 1944 action
is not a match for the game's symmetrical bunker-and-trench arena.

**Fort Douaumont** was considered as a possible landmark marker because it is
the largest fort of the Verdun fortified ring and its surviving underground
and surface works fit the map's visual theme better than a city-center street.
The Mémorial de Verdun describes it as an emblematic fort on the Verdun
battlefield. Nevertheless, no game source, developer source or historical
source found here identifies *Call of Duty 3*'s *Verdun* with Fort Douaumont.
Its iconic combat association is also the 1916 French-German battle rather than
the 1944 American-German capture of the city. Using the fort as the Atlas
marker would therefore create false landmark precision.

The safest interpretation is that *Verdun* is a **fictional/composite roadside
fortification somewhere in the Verdun setting**, informed by the area's famous
fortified landscape but not tied to a verified surviving bunker, fort or
campaign mission.

## Marker Position Explanation

The previous marker, **`46, 2`**, was only the generic France country fallback.
It lies roughly **433 km** from the identified city of Verdun and does not use
the explicit location supplied by either map reference or the developer.

The updated marker is therefore **`49.15964, 5.3829`**, the GeoNames locality
coordinate for Verdun (GeoNames ID 2969958). This follows the same city-level
approach already used by other clearly named *Call of Duty 3* multiplayer maps
such as Rouen and Mayenne: the map title and sources establish the real city
with high confidence, but the playable geometry is not proven to correspond to
one exact building or battlefield feature.

Accordingly the marker is stored as **`precision: city`**, **`confidence: high`**
and **`method: title`**. This is a substantial evidence-based improvement over
the country fallback without pretending that Fort Douaumont, the 1944 Meuse
bridge action, the underground citadel, or any other individual Verdun
fortification is the exact real-world counterpart of the multiplayer map.

## Sources

- [Call of Duty Wiki — Verdun](https://callofduty.fandom.com/wiki/Verdun) — Supports the map's stated Verdun location, American/German teams, bunker/tunnel/trench terrain, symmetry and lack of vehicles.
- [Call of Duty Maps — Verdun](https://callofdutymaps.com/call-of-duty-3/verdun/) — Independently identifies Verdun, France and describes the bunker/open-ground setting and rural scenery outside the map.
- [Jason McCord / Monsterclip — Call of Duty 3](https://www.monster-clip.com/cod3.html) — Treyarch level designer's portfolio; identifies *Verdun* as a small mirrored map built around a roadside bunker system and trench in Verdun and states that he worked on it from paper design to completion.
- [CoD Atlas Wiki import — Verdun](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-verdun.json) — Confirms the imported Wiki location data and the absence of previous/next mission relationships.
- [Call of Duty Wiki — Call of Duty 3](https://callofduty.fandom.com/wiki/Call_of_Duty_3) — Supports the Normandy-breakout focus of the single-player campaign and the American-versus-German multiplayer faction structure.
- [U.S. Army Command and General Staff College — XX Corps operational report, Verdun section](https://cgsc.contentdm.oclc.org/digital/api/collection/p4013coll8/id/4771/download) — Documents the XX Corps drive on Verdun and the 7th Armored Division's capture of the city on 31 August 1944.
- [Mémorial de Verdun — Fort Douaumont](https://memorial-verdun.fr/en/memorial-et-forts/visiter-le-fort-de-douaumont) — Establishes Fort Douaumont as the largest fort in the Verdun ring and an emblematic site of the 1916 battlefield; used here to evaluate and reject an unsupported landmark-level placement.
- [INSEE — Commune de Verdun](https://www.insee.fr/fr/metadonnees/geographie/commune/55545-verdun) — Confirms modern Verdun as a commune in the Meuse department and Grand Est region.
- [GeoNames — Verdun (2969958)](https://www.geonames.org/2969958/verdun.html) — Gazetteer record used for the city-level marker coordinate `49.15964, 5.3829`.
