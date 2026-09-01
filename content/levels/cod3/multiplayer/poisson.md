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

*Poisson* is a standalone multiplayer map in *Call of Duty 3*, so it has no
campaign briefing, playable character, mission date or historical objective.
The Call of Duty Wiki identifies the opposing sides as Americans and Germans
and explicitly gives the location as **Angers, France**. It describes a
semi-destroyed village surrounded by roads with a creek on the southern side,
mixing close-quarters fighting in the buildings with longer-range and vehicle
combat outside. Call of Duty Maps independently also places the map in
**Angers, France** and describes a village amid broad farmland, with windmills,
roads, paths, buildings, a small waterway and tank-oriented open space.

The Wiki infobox also lists *The Island* as the map's campaign counterpart.
That relationship is ambiguous and should not be used as a geographic override.
The curated campaign level *The Island* (`cod3-the-island`) is set at
Saint-Germain-sur-Sèves in Normandy, but *The Island*'s own Wiki page identifies
*Crossing* as its multiplayer map. The *Crossing* article is even more explicit:
it calls *Crossing* a conversion of *The Island* and gives it the console
codename `mp_isle`, whereas *Poisson* uses the separate codename `poissons`.
The available evidence therefore supports, at most, some relationship to
*The Island* without establishing that *Poisson* represents the
Saint-Germain-sur-Sèves battlefield.

## The Real Place & Differences

Angers is a real commune and the prefecture of Maine-et-Loire in the modern
**Pays de la Loire** region. The direct location evidence for the multiplayer
map is unusually consistent: the Call of Duty Wiki says Angers, Call of Duty
Maps says Angers, and the repository's imported Wiki record already stores the
structured location as `Angers, France`.

The playable environment should nevertheless not be read as a surveyed
reconstruction of central Angers. Both map descriptions emphasize a rural
village, open farmland and a small watercourse, while no source found identifies
a specific Angers suburb, hamlet, road, bridge, farm or surviving building as
the model for *Poisson*. The safest interpretation is therefore a
**fictionalized or composite rural battlefield canonically assigned to the
Angers area**, with only city-level geographic evidence.

## The Real Mission & Differences

There is no multiplayer mission to match to a real operation. The closest
supported historical context is the liberation of Angers in August 1944.
The Municipal Archives of Angers record that Patton made Angers an objective
for the U.S. 5th Infantry Division and that the city was liberated on
**10 August 1944**. Angers heritage material also documents the division's
crossing of the Maine at **Pont de Pruniers** during the approach to the city.

That history makes an American-versus-German battle around Angers plausible
background, but it does **not** identify the multiplayer map with the Pruniers
crossing or any other documented action. *Poisson* supplies no date, named
unit, objective or real landmark that would justify turning this general
historical context into a precise battlefield match. The small waterway and
vehicle combat are not sufficient evidence for such an identification.

## Marker Position Explanation

The stored marker is **`47.473612, -0.554167`**, a representative city-level
point for **Angers**. This supports `precision: city`, `confidence: high` and
`method: wiki-location`: the Wiki's structured location explicitly identifies
Angers, the repository's own Wiki import preserves that value, and Call of Duty
Maps independently agrees. `high` confidence applies to the identification of
the city, not to any exact building or battlefield point inside it.

This replaces the previous **`46.3847, 4.12938`** marker at the real commune of
**Poisson** in Saône-et-Loire. The old marker was not a broad fallback; it was
already labeled `precision: city` and `confidence: high`, but it came from
`method: title`. In this case that title match is misleading: the map title
*Poisson* was interpreted as a French place name even though the map's direct
location metadata says Angers. The new marker is therefore a substantial
semantic correction rather than merely a more precise coordinate.

A more exact Angers landmark was deliberately rejected. Pont de Pruniers is a
documented site in the 1944 liberation of Angers, but no game source connects
*Poisson* to that crossing. Likewise, the exact Stèle de Sèves Island marker
used by the campaign level *The Island* should not be reused: the documented
singleplayer conversion relationship points more specifically to *Crossing*,
while *Poisson* has its own Angers location and codename. Promoting either
candidate to `exact` would overstate the evidence.

The stored Google Maps URL searches for the real named place **Angers, France**.
The atlas marker itself uses the separately curated coordinates above rather
than coordinates encoded in that URL.

## Sources

- [Call of Duty Wiki — Poisson](https://callofduty.fandom.com/wiki/Poisson) — Supports the Angers location, American/German teams, rural village and creek layout, vehicle-oriented combat, `poissons` codename and the infobox's stated relationship to *The Island*.
- [Call of Duty Maps — Poisson](https://callofdutymaps.com/call-of-duty-3/poisson/) — Independently supports Angers as the map location and describes the village, farmland, windmills, roads, waterway and vehicles.
- [CoD Atlas Wiki import — Poisson](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-poisson.json) — Confirms that the repository's imported structured Wiki location is already `Angers, France`.
- [CoD Atlas current Poisson record](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/levels/cod3/multiplayer/poisson.md) — Documents the previous title-derived Poisson commune marker at `46.3847, 4.12938`.
- [CoD Atlas — The Island (`cod3-the-island`)](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/levels/cod3/campaign/2-the-island.md) — Provides the curated campaign relationship context and the exact Saint-Germain-sur-Sèves / Stèle de Sèves Island marker that should not be transferred to *Poisson* without stronger evidence.
- [Call of Duty Wiki — The Island](https://callofduty.fandom.com/wiki/The_Island) — Identifies Saint-Germain-sur-Sèves as the campaign setting and *Crossing* as its multiplayer map.
- [Call of Duty Wiki — Crossing](https://callofduty.fandom.com/wiki/Crossing) — Explicitly describes *Crossing* as a conversion of *The Island* and gives the separate `mp_isle` codename, making it the stronger documented campaign conversion.
- [INSEE — Commune d'Angers](https://www.insee.fr/fr/metadonnees/geographie/commune/49007-angers) — Confirms Angers as a commune in Maine-et-Loire and Pays de la Loire.
- [Archives patrimoniales de la ville d'Angers — Août 1944. Angers est libérée](https://archives.angers.fr/chroniques-historiques/les-chroniques-par-annees/1989-1995/aout-1944-angers-est-liberee/index.html) — Official municipal historical context for the U.S. 5th Infantry Division's advance on Angers and the city's liberation on 10 August 1944.
- [Angers Patrimoine — Monuments commémoratifs](https://www.angers.fr/vivre-a-angers/culture/patrimoine/angers-patrimoine/ressources/fiches-patrimoine/laissez-vous-conter-les-monuments-commemoratifs/index.html) — Official local heritage source for the Pont de Pruniers crossing and its connection to the U.S. 5th Infantry Division.
- [Wikipedia — Angers](https://en.wikipedia.org/wiki/Angers) — Supplies the representative city coordinates used for the city-level marker and the English Wikipedia link required by the atlas URL convention.
