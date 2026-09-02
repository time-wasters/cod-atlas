---
id: cod3-poisson
title: Poisson
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-poisson
locations:
  - id: main
    country: France
    region: Pays de la Loire
    city: Angers
    latitude: 47.473612
    longitude: -0.554167
    precision: city
    confidence: high
    method: wiki-location
    primary: true
    urls:
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/poisson/
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Angers%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/Angers
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

*Poisson* is a multiplayer map in *Call of Duty 3*. It has no mission narrative,
playable campaign character, unit assignment, mission date, briefing route, or
historical objective. The Call of Duty Wiki identifies the opposing teams as
American and German and explicitly lists the setting as **Angers, France**. It
describes a medium-sized, semi-destroyed village surrounded by roads with a creek
on the southern side, combining close-quarters fighting inside the village with
longer-range and vehicle combat outside. The same article gives the console
codename `poissons`.

Call of Duty Maps independently also places the map in **Angers, France**. Its
description emphasizes a small village surrounded by large open fields, with
windmills, paths, roads, buildings, a small waterway, motorcycles, jeeps and
tanks. Taken together, the game sources portray a rural or semi-rural battlefield
in the Angers area rather than a recognizable reconstruction of central Angers.

The Wiki infobox labels *The Island* (`cod3-the-island`) as *Poisson*'s campaign
map, so that relationship must be considered. However, the available evidence
does not justify inheriting *The Island*'s Saint-Germain-sur-Sèves marker.
*The Island* is a campaign mission set at Saint-Germain-sur-Sèves in Normandy,
and the separate multiplayer map *Crossing* (`cod3-crossing`) is explicitly
described by the Wiki as a conversion of *The Island* and uses the codename
`mp_isle`. *Poisson* instead has its own Angers location and the distinct codename
`poissons`. The campaign-map field therefore establishes some documented
relationship to *The Island*, but no source found shows that *Poisson* shares the
Saint-Germain-sur-Sèves geography, the Sèves Island battlefield, or the same
playable combat space. That relationship is kept as context rather than used as
the marker location.

## The Real Place & Differences

Angers is a real commune in the Maine-et-Loire department of the modern
**Pays de la Loire** region. INSEE confirms both the commune and its regional
placement. The map's real-world match is best classified as a **broad city
fallback**: two independent game-oriented sources identify Angers, but neither
provides a district, village, road, bridge, farm, waterway, or surviving landmark
that can be matched securely to the multiplayer environment.

The game's village-and-farmland layout is therefore best treated as a
**composite or fictionalized rural setting assigned to the Angers area**, not as
a surveyed recreation of the modern city. The open fields, windmills, road loop,
small watercourse and vehicle routes may fit the wider Anjou landscape in a
general sense, but no evidence found ties their geometry to a specific place
around Angers. Accuracy therefore requires stopping at city level rather than
selecting a visually convenient rural point.

The documented campaign relationship does not provide a stronger geographic
match. *The Island*'s real battlefield is Saint-Germain-sur-Sèves in Normandy,
well away from Angers, and its curated Atlas marker is the Stèle de Sèves Island.
Reusing that exact marker for *Poisson* would contradict the multiplayer map's
explicit Angers location and would overstate what the campaign relationship
proves.

## The Real Mission & Differences

There is no real mission corresponding directly to *Poisson*, because the map
has no multiplayer narrative or historical objective. The closest supported
historical context is the **liberation of Angers in August 1944**. The municipal
archives of Angers record that General Patton assigned Angers as an objective to
the U.S. 5th Infantry Division after the breakout through Avranches. American
forces entered the Angers area in early August, took control of the surviving
Petit-Anjou railway crossing at Pruniers on 8 August, crossed the Maine, fought
German positions around the southern and western approaches, and liberated
Angers on **10 August 1944**.

That history makes an American-versus-German battle in the Angers area plausible
background for the map, but no evidence found connects *Poisson* to a specific
action in that liberation. In particular, the map's creek and open-field tank
fighting do not establish the Petit-Anjou bridge, Pruniers, La Baumette, the
Doutre, or another documented combat site as the map's real-world model. Those
sites are therefore historical context only, not marker candidates.

This also distinguishes *Poisson* from *The Island*. The real Sèves Island
fighting involved the U.S. 90th Infantry Division in Normandy in July 1944,
whereas the documented liberation of Angers involved the U.S. 5th Infantry
Division in August. No historical evidence supports merging those two operations
into one real mission merely because the Wiki infobox associates *Poisson* with
*The Island* as a campaign map.

## Marker Position Explanation

The stored marker is **`47.473612, -0.554167`**, a representative city coordinate
for **Angers, France**. The coordinate is the standard coordinate published for
Angers and is deliberately stored with `precision: city`, `confidence: high` and
`method: wiki-location`.

`city` is appropriate because the evidence establishes Angers but no specific
sub-location inside or around it. `high` confidence applies to the identification
of the city itself: the Call of Duty Wiki, the repository's imported Wiki record
and Call of Duty Maps all independently point to Angers. It does **not** mean that
the coordinate identifies the exact in-game village or any real 1944 firefight.

This replaces the previous **`46.3847, 4.12938`** marker at the commune of
**Poisson** in Saône-et-Loire. That point was already more precise than a country
fallback in a technical sense, but its `method: title` reveals the problem: the
map title was interpreted as the French commune name even though the game's
actual location metadata says Angers. The old point is therefore a false title
match, not a defensible real-world location for the level. Moving the marker to
Angers is a correction of the represented place, not merely an increase in
coordinate precision.

Two apparently more precise alternatives were rejected. The **Pont de Pruniers**
area is a well-documented site in the real liberation of Angers, but no source
links *Poisson* specifically to that crossing. The **Stèle de Sèves Island** is
an exact documented marker for the campaign mission *The Island*, but the stronger
documented direct conversion of that mission is *Crossing*, while *Poisson*
retains its own Angers location and codename. Either exact marker would imply a
one-to-one relationship that the sources do not establish.

The stored Google Maps URL searches for the real named place **Angers, France**.
The Atlas marker uses the separately curated coordinates above rather than
coordinates embedded in the Google Maps URL.

## Sources

- [Call of Duty Wiki — Poisson](https://callofduty.fandom.com/wiki/Poisson) — Supports the multiplayer classification, American/German teams, Angers location, village/creek terrain, combat style, `poissons` codename and the stated campaign-map relationship to *The Island*.
- [Call of Duty Maps — Poisson](https://callofdutymaps.com/call-of-duty-3/poisson/) — Independently identifies Angers and describes the open farmland, village, windmills, roads, waterway and vehicle-oriented layout.
- [CoD Atlas Wiki import — Poisson](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-poisson.json) — Confirms that the repository's imported structured Wiki location is `Angers, France`.
- [CoD Atlas current Poisson record](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/levels/cod3/multiplayer/poisson.md) — Documents the previous title-derived marker at `46.3847, 4.12938` in the commune of Poisson.
- [CoD Atlas — The Island (`cod3-the-island`)](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/levels/cod3/campaign/2-the-island.md) — Provides the curated Saint-Germain-sur-Sèves setting and exact Stèle de Sèves Island marker for the related campaign mission.
- [Call of Duty Wiki — Crossing](https://callofduty.fandom.com/wiki/Crossing) — Explicitly identifies *Crossing* as a conversion of *The Island* and records the separate `mp_isle` codename, limiting how strongly *Poisson*'s campaign-map field can be used geographically.
- [INSEE — Commune d'Angers](https://www.insee.fr/fr/metadonnees/geographie/commune/49007-angers) — Authoritative modern administrative identification of Angers in Maine-et-Loire and Pays de la Loire.
- [Archives patrimoniales de la ville d'Angers — Août 1944. Angers est libérée](https://archives.angers.fr/chroniques-historiques/les-chroniques-par-annees/1989-1995/aout-1944-angers-est-liberee/index.html) — Municipal historical account of the U.S. 5th Infantry Division's advance, the Pruniers crossing and the liberation of Angers on 10 August 1944.
- [Angers Patrimoine — Monuments commémoratifs](https://www.angers.fr/vivre-a-angers/culture/patrimoine/angers-patrimoine/ressources/fiches-patrimoine/laissez-vous-conter-les-monuments-commemoratifs/index.html) — Official heritage source confirming the 5th Infantry Division's Pruniers crossing during the liberation, used as historical context but rejected as an exact map marker.
- [Wikipedia — Angers](https://en.wikipedia.org/wiki/Angers) — Provides the representative city coordinate `47.473612, -0.554167` and the English Wikipedia article used by the Atlas URL.
