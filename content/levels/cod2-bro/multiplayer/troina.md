---
id: cod2-bro-troina
title: Troina
games:
  - cod2-bro
mode: multiplayer
wikiArticle: codwiki-troina
locations:
  - id: main
    country: Italy
    region: Sicily
    city: Troina
    latitude: 37.78535
    longitude: 14.600989
    precision: city
    confidence: high
    method: wiki-location
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Troina%2C+Sicily%2C+Italy
      - wikipedia: https://en.wikipedia.org/wiki/Troina
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

**Troina** is a multiplayer map in *Call of Duty 2: Big Red One*. It has no campaign-style mission narrative, playable character, unit assignment, briefing, route, date, or historical objective. The Call of Duty Wiki identifies the map as an **urban** setting in **Troina, Italy**, with the United States and Italy as the opposing multiplayer factions; its internal console name is `mp_troina`.

The same game also contains the singleplayer level **Farewell to Friends** (`cod2-bro-farewell-to-friends`), which is explicitly set in Troina and depicts fighting through the town toward a church. That establishes a shared geographic and narrative setting. However, the multiplayer article does not identify **Troina** as a campaign-derived map, and no reliable source was found showing that its playable geometry or assets were directly reused from **Farewell to Friends**. The relationship should therefore be treated as **same named place, not confirmed shared combat space**.

## The Real Place & Differences

**Match classification: confirmed real location at city level.** Troina is a real hill town in central-eastern Sicily. The Comune di Troina places it at roughly 1,120 metres above sea level and describes the historic centre along Via Conte Ruggero as a medieval fabric of narrow, winding streets, steep alleys, stairs, ramps, arches, courtyards, and irregular openings. A detailed U.S. Army history likewise describes wartime Troina as a steep stone town with narrow streets and sharp turns, with a Norman church overlooking a small public square near the top of the town.

Those characteristics are a strong real-world fit for the multiplayer map's documented urban Troina setting, but they do not prove that any particular in-game building or street is a literal reconstruction. The map should be treated as a game-scaled, fictionalized urban representation of Troina rather than an exact plan of the historic centre.

The previous marker, `37.78437, 14.59605`, was already a **city-level** Troina point rather than a country fallback. It corresponds to a generic populated-place coordinate for Troina. The revised point moves the marker about 450 metres east into the historic-core area around Piazza/Via Conte Ruggero and the Chiesa Madre, where both municipal evidence and the U.S. Army's description place the dense historic urban fabric most relevant to the map. This is a better representative anchor, but it does **not** justify raising the multiplayer location above `city` precision.

## The Real Mission & Differences

The closest supported historical context is the **Battle of Troina** during the Allied campaign in Sicily. U.S. Army histories describe Troina as an important anchor of the Axis Etna Line. The U.S. 1st Infantry Division, reinforced during the fighting, attacked positions defended principally by the German 15th Panzer Grenadier Division together with elements of the Italian Aosta Division. Much of the decisive fighting took place on the rugged hills and ridges around the town rather than as a simple street-by-street assault through its centre.

The detailed U.S. Army account places the opening attacks at the end of July 1943, followed by several days of hard fighting and repeated counterattacks. German forces began withdrawing from Troina during the night of **5 August 1943**, and patrols of the U.S. 16th Infantry entered the ruined town after 08:00 on **6 August**, meeting only sporadic rifle fire. Troina's municipal history commonly frames the principal battle as 1-6 August; this is compatible with the longer U.S. Army chronology but starts the named battle slightly later.

The multiplayer factions therefore have some broad historical basis—Italian troops did participate in the defense alongside German forces—but a normal multiplayer match is not evidence for a particular unit action, date, objective, or outcome. No matching historical "mission" corresponding to the multiplayer ruleset is documented.

## Marker Position Explanation

The stored atlas coordinate is **`37.78535, 14.600989`**. It is the verified historic-core anchor already used by the related campaign level **Farewell to Friends**, at the Chiesa Madre Maria Santissima Assunta/Piazza Conte Ruggero area. Reusing the coordinate here is deliberate because independent place and wartime evidence identifies this part of Troina as the heart of the steep historic urban fabric, not because the multiplayer map has been proven to reproduce the campaign church or its exact streets.

For that reason the multiplayer marker remains `precision: city` with `confidence: high` and `method: wiki-location`. Confidence is high that the map represents the real city of Troina because the game's structured location explicitly names it; precision remains city-level because no source ties the multiplayer arena to a specific surviving landmark. An exact church marker was considered and rejected for the multiplayer interpretation, as was a battlefield-ridge marker such as Monte Basilio: the former would overstate the map-to-building evidence, while the latter would poorly represent the map's explicitly urban setting.

The Google Maps URL therefore searches the real named place **Troina, Sicily, Italy**, while the atlas marker uses the separately curated historic-core coordinate above. Sharing a coordinate with the campaign marker must not be read as proof that the two playable spaces are identical.

## Sources

- [Call of Duty Wiki - Troina](https://callofduty.fandom.com/wiki/Troina) - Supports the multiplayer-map identification, Troina/Italy location, urban terrain, U.S.-versus-Italy factions, and `mp_troina` console name.
- [CoD Atlas Wiki import - Troina](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-troina.json) - Confirms the imported structured game location is "Troina, Italy" and that the record is a multiplayer map without a mission date.
- [Call of Duty Wiki - Farewell to Friends](https://callofduty.fandom.com/wiki/Farewell_to_Friends) - Supports the separate singleplayer mission's explicit Troina setting and urban/church combat context.
- [CoD Atlas - Farewell to Friends](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/levels/cod2-bro/campaign/9-farewell-to-friends.md) - Documents the related campaign level's independently researched Troina historic-core marker and the limits of the church correspondence.
- [Comune di Troina - Cenni storici](https://www.comune.troina.en.it/it/page/cenni-storici) - Supports Troina's elevation and the steep, narrow medieval street fabric of the historic centre around Via Conte Ruggero.
- [Comune di Troina - La battaglia di Troina](https://www.comune.troina.en.it/it/page/109941) - Provides local historical context for the 1943 battle, Axis defense, destruction of the town, and American entry after the withdrawal.
- [Comune di Troina - 80th anniversary of the Battle of Troina](https://www.comune.troina.en.it/it/news/il-5-e-il-6-agosto-la-celebrazione-dell80-anniversario-della-battaglia-di-troina) - Identifies Via and Piazza Conte Ruggero as the heart of Troina's historic centre and supports using that area as the representative urban anchor.
- [U.S. Army Center of Military History - Sicily: The U.S. Army Campaigns of World War II](https://history.army.mil/Portals/143/Images/Publications/catalog/72-16.pdf) - Authoritative overview of the Battle of Troina, the Etna Line, opposing forces, surrounding hill fighting, and German withdrawal.
- [U.S. Army in World War II - Sicily and the Surrender of Italy, Chapter XVII](https://www.ibiblio.org/hyperwar/USA/USA-MTO-Sicily/USA-MTO-Sicily-17.html) - Detailed official-history transcription describing Troina's narrow streets, Norman church and square, the 5 August withdrawal decision, and U.S. patrols entering on 6 August.
- [GeoNames - Troina / Draginai](https://www.geonames.org/2522849/troina-draginai.html) - Records the previous generic populated-place coordinate `37.78437, 14.59605`, useful for explaining why the marker was moved within the same city-level location.
- [Wikidata - Chiesa Madre Maria Santissima Assunta](https://www.wikidata.org/wiki/Q48808827) - Supplies the geographic reference for the historic-core anchor used for the stored coordinate; its use here does not assert that the multiplayer map reproduces the church.
