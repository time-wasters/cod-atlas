---
id: cod-fh-first-city-to-fall
title: First City to Fall
games:
  - cod-fh
mode: singleplayer
campaign:
  id: "3"
  label: Western Front
wikiArticle: codwiki-first-city-to-fall
locations:
  - id: main
    country: Germany
    region: North Rhine-Westphalia
    city: Aachen
    landmark: Aachen Town Hall
    latitude: 50.76821926557846
    longitude: 6.086938493512666
    precision: exact
    confidence: high
    method: verified-landmark
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Marschiertor%2C+Aachen%2C+Germany
      - wikipedia: https://de.wikipedia.org/wiki/Marschiertor
verified:
  location:
    byHuman: true
    user: github/PLP-GTR
    reason: The Marschiertor is a distinctive landmark at the beginning of the mission
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

*First City to Fall* opens the Western Front campaign in *Call of Duty: Finest
Hour*. The player is Sergeant Chuck Walker of the US 1st Infantry Division's
in-game Able Company in Aachen on October 21, 1944. Walker's orders are
to escort M12 self-propelled 155 mm guns toward the town square, clear German
troops and antitank teams from buildings along their route, and protect the
armoured column. The briefing explicitly identifies **City Hall** as the
fortified destination that the M12 is to destroy.

The advance is presented as a compact urban assault. Walker's squad fights
floor by floor, follows a tunnel between basements, and reaches an upper storey
overlooking the final square. After the M12 fires into the large building
opposite, German troops emerge from a manhole. The squad concludes that the
defenders are using Aachen's sewers to move behind the Americans, and Walker
descends after them; the story continues directly in *Underground Passage*
(`cod-fh-underground-passage`).

The available game descriptions are not fully consistent about the last
building. Walker's transcript calls it City Hall, while walkthrough prose calls
it a theater and the transcript's stage direction calls it a parliamentary
building. City Hall is the strongest identification because it is the named
objective in the mission dialogue; no reviewed source establishes that the
level accurately reproduces either Aachen Town Hall or Theater Aachen.

## The Real Place & Differences

Aachen Town Hall stands on Markt in the historic city centre. The Gothic civic
building was completed around 1350 on the foundations and surviving walls of
Charlemagne's palace, and its prominent medieval form makes it a plausible
visual and narrative anchor for a mission about capturing the city. The
present building is nevertheless not unchanged from 1944. Aachen's official
Town Hall history records heavy air-raid damage in 1943 and 1944, followed by
stabilization and postwar reconstruction; its present tower spires were not
completed until 1979.

The level should not be read as a survey of the real Markt or surrounding
streets. It combines generic ruined blocks, linked cellars, a square, and a
monumental target into a linear combat route. The inconsistent labels for the
target and the absence of a documented street-by-street match mean that only
the named City Hall objective can be fixed precisely. The marker therefore
identifies the real Rathaus, not every part of the playable level.

## The Real Mission & Differences

The historical framework is unusually close even though the level's squad
action is fictionalized. The US Army's official history records that the 26th
Infantry Regiment of the 1st Infantry Division began the assault into Aachen
on October 12-13. Lieutenant Colonel Derrill M. Daniel's 2nd Battalion advanced
through the city centre while Lieutenant Colonel John T. Corley's 3rd
Battalion cleared factories and attacked toward the northern heights. The city
was progressively isolated, and its German garrison surrendered on October 21.
Thus the title is best understood as the fall of the first **large or major**
German city to the Western Allies, rather than an unqualified claim about
every previously occupied German settlement.

The game's methodical building clearance, close cooperation with armour, and
sewer threat all have documented counterparts. American platoons worked with
tanks or tank destroyers, cleared defended buildings and cellars, and learned
to block manholes after German soldiers bypassed them through storm sewers.
When ordinary tank and tank-destroyer fire failed against substantial
buildings and shelters, the 26th Infantry obtained self-propelled 155 mm guns
from Battery C, 991st Field Artillery Battalion. This strongly supports the
mission's equipment and tactical inspiration, but it does not document
Walker, the game's exact company organization, the squad's route, or an M12
assault on Aachen Town Hall.

The ending compresses several days and changes the decisive objective. On the
real October 21, Corley's battalion approached an air-raid bunker at the north
end of Lousbergstrasse that contained Oberst Gerhard Wilck's headquarters. A
self-propelled 155 mm gun was called forward, but Wilck arranged a surrender
before it attacked; the surrender was accepted at 12:05. The official history
does not identify the Rathaus as the garrison's last headquarters or record
its destruction by an M12 during the capture. Indeed, the Town Hall had
already suffered severe air-raid damage before the ground battle. The game
therefore joins authentic urban tactics and the correct final date to an
invented City Hall assault and a fictional squad-level route.

## Marker Position Explanation

The marker at `50.776103, 6.083769` is placed on Aachen Town Hall. The mission
dialogue explicitly names City Hall as the armoured column's destination, and
the real landmark and its position are independently verifiable. That supports
`precision: exact`, `confidence: high`, and `method: verified-landmark` for the
building represented by the marker.

Exact precision applies to the real Rathaus, not to the full in-game route or
the historical surrender site. The point must not be interpreted as proof that
the game's final building is an architectural reconstruction, that Walker's
squad followed real streets to Markt, or that an M12 destroyed the Town Hall.
The documented final German headquarters bunker near Lousbergstrasse is more
appropriate to the following surrender narrative than to this mission's
explicit City Hall objective.

The stored Google Maps URL searches for **Aachen Town Hall, Aachen, Germany**
by name rather than coordinates. The atlas marker separately uses the curated
Town Hall coordinate.

## Sources

- [Call of Duty Wiki: First City to Fall](https://callofduty.fandom.com/wiki/First_City_to_Fall)
  — game, character, unit, date, Aachen setting, objectives, route, M12 support,
  target-name inconsistency, and sewer ending.
- [Call of Duty Wiki: First City to Fall transcript](https://callofduty.fandom.com/wiki/First_City_to_Fall/Transcript)
  — Walker's briefing, the explicit City Hall objective, level chronology, and
  direct mission dialogue.
- [US Army Center of Military History: *The Siegfried Line Campaign*, Chapter XIII](https://www.ibiblio.org/hyperwar/USA/USA-E-Siegfried/USA-E-Siegfried-13.html)
  — official account of the 26th Infantry's assault, combined infantry-armour
  tactics, sewer infiltration, Battery C's 155 mm guns, the October 21 bunker,
  and Wilck's surrender.
- [Army Historical Foundation: Aachen—The Battle for Charlemagne's City](https://armyhistory.org/aachen-the-battle-for-charlemagnes-city-september-october-1944/)
  — independent military-history synthesis of the battle, 1st Infantry
  Division operations, urban tactics, casualties, and surrender chronology.
- [Modern War Institute: Battle of Aachen case study](https://mwi.westpoint.edu/urban-warfare-project-case-study-10-battle-of-aachen/)
  — the two 26th Infantry battalions' routes, building-clearing methods,
  supporting SP-155, and the real final headquarters bunker.
- [Rathaus Aachen: Town Hall history](https://rathaus-aachen.de/en/town-hall/)
  — official description of the building, its Markt address, wartime damage,
  reconstruction, and present form.
- [Aachen Town Hall](https://en.wikipedia.org/wiki/Aachen_Town_Hall)
  — English-language location article and coordinate cross-check for the named
  landmark.
- [Battle of Aachen](https://en.wikipedia.org/wiki/Battle_of_Aachen)
  — English overview of the battle's dates, combatants, outcome, and Aachen's
  status as the first German city captured by the Western Allies.
