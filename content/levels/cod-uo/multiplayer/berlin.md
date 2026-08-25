---
id: cod-uo-berlin
title: Berlin
games:
  - cod-uo
mode: multiplayer
wikiArticle: codwiki-berlin-map
locations:
  - id: main
    country: Germany
    region: Berlin
    city: Berlin
    landmark: Platz der Republik
    latitude: 52.51865060018308
    longitude: 13.373446194227279
    precision: approximate
    confidence: high
    method: manual-approximate
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Platz+der+Republik%2C+Berlin%2C+Germany
      - wikipedia: https://en.wikipedia.org/wiki/Platz_der_Republik_(Berlin)
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-1/berlin-2/
---
> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

**Berlin** is a multiplayer map, so it has no mission narrative, canonical
playable character or unit, mission date, briefing, route, or historical
objective. The Call of Duty Wiki identifies the opposing sides as the Soviet
Union and Nazi Germany, the setting as urban Berlin, and the combat space as
the area outside the Reichstag: a courtyard and surrounding buildings, with
additional underground sewer passages. Outdoor areas allow longer sightlines,
while the buildings and tunnels emphasize close combat. Call of Duty Maps also
describes Berlin as a very large map with substantial above- and below-ground
play.

The Wiki explicitly lists **The Reichstag** as the map's corresponding campaign
map. In the atlas, that singleplayer level is **The Reichstag**
(`cod-the-reichstag`) from the original *Call of Duty*. This is therefore a
documented relationship rather than one inferred from visual similarity. The
multiplayer map shares the Reichstag setting and adapts the exterior combat
space in front of the building, but it should not inherit the campaign
mission's character, unit, date, objectives, or scripted chronology.

## The Real Place & Differences

**Match classification: confirmed real location.** The strongest real-world
match for the multiplayer combat area is **Platz der Republik**, the large open
square immediately west of and directly in front of the Reichstag building.
During the Nazi period and the Battle of Berlin it was called **Königsplatz**.
The German Bundestag's history identifies the Reichstag as standing on the
historic Königsplatz, while modern Berlin sources identify Platz der Republik
as the square in front of the Bundestag/Reichstag.

This distinction matters for the multiplayer marker. The Reichstag building
itself is the strongest anchor for the linked singleplayer mission, but the
main outdoor multiplayer space is represented more closely by the open ground
in front of it. The modern Platz der Republik is largely lawn and belongs to a
substantially redeveloped parliamentary quarter, so its present appearance does
not reproduce the devastated 1945 square.

The game's ruined buildings and extensive underground passages should still be
treated as a compact multiplayer adaptation rather than a surveyed
reconstruction. The Bundestag documents historical underground utility
infrastructure near the Reichstag, but there is no evidence that the game's
large tunnel network reproduces a verified 1945 sewer or service-tunnel layout.

## The Real Mission & Differences

The closest supported historical context comes from the linked singleplayer
level and the Battle of Berlin. Historically, the open ground represented by
today's Platz der Republik was directly involved in the assault: the atlas
research for **The Reichstag** records that elements of the Soviet 150th Rifle
Division advanced from the former Ministry of the Interior across the
Königsplatz toward the Reichstag on 30 April 1945. Heavy German fire from the
Reichstag and nearby positions repeatedly disrupted those attacks before later
assaults reached the building.

Jeremy Hicks' academic study describes the attack on the Reichstag as involving,
among others, the 674th and 756th Rifle Regiments of the 150th Rifle Division
and the 380th and 525th Regiments of the 171st Rifle Division, with a Soviet
banner raised over the building late on 30 April. The German Bundestag dates
the fight for the Reichstag from 30 April and states that the building was not
finally taken until 2 May.

That makes Soviet-versus-German combat on and around the former Königsplatz
sound historical context for the map. It does not make the multiplayer layout a
literal reconstruction: no evidence was found for a separate real operation
matching its repeated PvP battles, spawn positions, vehicle routes, surrounding
building geometry, or underground network.

## Marker Position Explanation

The stored marker is
`52.51865060018308, 13.373446194227279`, a contributor-selected point on
**Platz der Republik**, in the open area directly in front of the Reichstag.
It replaces the Reichstag-building anchor `52.518611, 13.376111` used in the
earlier draft because the multiplayer map's principal exterior combat space is
better represented by the forecourt/square than by the building footprint
itself. The linked singleplayer level **The Reichstag** appropriately retains
the building as its own marker.

`precision: approximate` is appropriate because no source fixes this exact
coordinate as a specific in-game position or documented 1945 event point.
Instead, the real area is securely identified and the coordinate was manually
selected within that area to represent the multiplayer footprint.
`confidence: high` reflects the strong identification of the Reichstag setting
and the named square directly in front of it, while `method:
manual-approximate` records how this particular point was chosen.

The marker must therefore not be interpreted as an exact spawn point, tank
position, sewer entrance, trench, flag location, or surveyed boundary of the
playable map. Its purpose is to place the multiplayer level on the strongest
supported part of the real Reichstag forecourt while avoiding the false
precision of assigning an unverified feature to a specific spot.

The Google Maps URL searches for the real named place, **Platz der Republik,
Berlin, Germany**. The atlas marker uses the separately curated coordinates
above rather than coordinates embedded in that URL.

## Sources

- [Call of Duty Wiki: Berlin (United Offensive)](https://callofduty.fandom.com/wiki/Berlin_(United_Offensive)) — multiplayer classification, factions, Berlin setting, Reichstag exterior/courtyard and sewer description, and the documented relationship to **The Reichstag** campaign map.
- [Call of Duty Maps: Berlin](https://callofdutymaps.com/call-of-duty-1/berlin-2/) — supplemental map-layout evidence for the large above- and below-ground multiplayer combat space.
- [Call of Duty Wiki: The Reichstag](https://callofduty.fandom.com/wiki/The_Reichstag) — facts for the linked singleplayer level, including the 30 April 1945 date, 150th Rifle Division, 3rd Shock Army, and Reichstag assault objectives; these are context for the relationship, not attributes assigned to the multiplayer map.
- [CoD Atlas: The Reichstag curated level record](https://github.com/time-wasters/cod-atlas/blob/main/content/levels/cod/campaign/26-the-reichstag.md) — stable related level ID `cod-the-reichstag`, the separately retained building marker, and the historical finding that Soviet troops advanced across the former Königsplatz toward the Reichstag.
- [German Bundestag: Reichstagsgebäude am Königsplatz](https://www.bundestag.de/parlament/geschichte/schauplaetze/koenigsplatz) — official identification of the Reichstag's historic square as Königsplatz, today's Platz der Republik.
- [Berlin.de: Deutscher Bundestag – Platz vor dem Bundestagsgebäude](https://www.berlin.de/tickets/suche/orte/deutscher-bundestag-platz-vor-dem-bundestagsgebaeude-e7f7fb52-44a6-47c3-879b-f7720e6aa231/) — municipal identification of the open place in front of the Bundestag/Reichstag at Platz der Republik.
- [German Bundestag: The Reichstag building and its historic sites](https://www.bundestag.de/besuche/architektur/reichstag/geschichte/orte) — official history of the building's symbolic role, the 30 April–2 May fighting, the exposed forefield around the Reichstag, the underground utility passage, Soviet graffiti, and the postwar site.
- [German Bundestag: History of the Reichstag building](https://www.bundestag.de/besuche/architektur/reichstag/geschichte) — official summary of wartime destruction and the later reconstruction of the building.
- [Berlin Monument Database: Reichstagsgebäude](https://denkmaldatenbank.berlin.de/daobj.php?obj_dok_nr=09050341) — official identification and address of the surviving Reichstag landmark adjoining the selected square.
- [Jeremy Hicks, *Victory Banner Over the Reichstag* (University of Pittsburgh Press/JSTOR)](https://www.jstor.org/stable/j.ctv19m65f8) — academic account identifying the 150th and 171st Rifle Division regiments involved in the assault and the late-30-April banner raising.
- [Wikipedia: Platz der Republik (Berlin)](https://en.wikipedia.org/wiki/Platz_der_Republik_(Berlin)) — English location article confirming that Platz der Republik is the public square directly west of and in front of the Reichstag building.
