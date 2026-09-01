---
id: cod3-marseilles
title: Marseilles
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-marseilles
locations:
  - id: main
    country: France
    region: Provence-Alpes-Côte d'Azur
    city: Marseille
    latitude: 43.2964
    longitude: 5.3700
    precision: city
    confidence: high
    method: wiki-location
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Marseille%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/Marseille
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/marseilles/
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

“Marseilles” is a multiplayer map in *Call of Duty 3*, so it has no mission
narrative, campaign character, assigned unit, briefing or historical objective.
The Call of Duty Wiki places it in Marseilles, France and describes city streets
and urban train tracks, with American and German teams. Call of Duty Maps
likewise describes a large, open, war-damaged French city designed for tank
fights and long-range engagements, with drivable tanks and light vehicles.

The map is explicitly documented as a remake of **Kharkov** from *Call of Duty:
United Offensive*. That earlier multiplayer map is itself associated by the
Call of Duty Wiki with the singleplayer levels “Kharkov Outskirts”
(`cod-uo-kharkov-1`) and “Kharkov Station” (`cod-uo-kharkov-2`); its curated
atlas record is `cod-uo-karkov`. This establishes a documented layout/content
ancestry, but not a shared canonical location. “Marseilles” deliberately
reimagines the Kharkov arena as southern France, and no source found documents a
direct relationship to a *Call of Duty 3* campaign mission.

## The Real Place & Differences

The stated real place is **Marseille**, the modern French spelling of the city
named “Marseilles” by the map. Both supplied game sources identify Marseille at
city level, so the old France-wide fallback is unnecessarily broad. The map
does not name a district, station, street, rail yard or surviving landmark
inside Marseille.

That limit matters because the playable environment is inherited from a map
originally presented as Kharkov/Kharkiv. The French setting is therefore best
treated as a **fictionalized adaptation located in Marseille**, not as a
street-for-street reconstruction of the city. Urban railway tracks are
consistent with a major port and transport city, but they are not enough to
identify Marseille-Saint-Charles, a freight yard or another specific rail
facility. Selecting one of those would create unsupported precision.

## The Real Mission & Differences

The closest supported historical context is the **Liberation of Marseille in
August 1944**, after Operation Dragoon. French Ministry of the Armed Forces
histories record the Marseille uprising beginning before the arrival of regular
troops and the 3rd Algerian Infantry Division entering the city on 23 August,
with French armoured forces and Moroccan tabors also involved. German
resistance continued until the surrender at the end of the month.

That history is context rather than an identification of the multiplayer
battle. “Marseilles” gives no historical date, operation or objective, and its
American-versus-German team setup does not mirror the principal ground forces
that liberated the city, which were predominantly French and North African
formations alongside the Resistance. No evidence found ties the map's railway
streets, vehicle fights or individual combat spaces to a documented Marseille
engagement.

## Marker Position Explanation

The marker is stored at `43.2964, 5.3700`, the published city coordinate for
**Marseille, France**. It uses `city` precision because the game sources
explicitly identify Marseille but provide no evidence for a particular
neighbourhood or landmark. Confidence is `high`, and `wiki-location` is the
appropriate method because the Call of Duty Wiki's structured location field
directly names “Marseilles, France”; Call of Duty Maps independently agrees on
the city.

This is a clear improvement over the previous `46, 2` France fallback. A
country centroid was only justified while no more specific evidence had been
curated, whereas the map title and both supplied references identify Marseille
directly. **Kharkiv was rejected** despite the remake relationship: it explains
the inherited map design, but the *Call of Duty 3* version is explicitly
re-themed and relocated to Marseille. Specific Marseille railway stations,
Notre-Dame de la Garde and other wartime battle sites were also rejected because
no game source identifies them as the playable location.

The stored Google Maps URL searches for **Marseille, France** by name and does
not encode the atlas coordinates. The atlas marker uses the separately curated
city coordinate above. The Wikipedia URL points to the English article for
Marseille.

## Sources

- [Call of Duty Wiki — Marseilles](https://callofduty.fandom.com/wiki/Marseilles)
  — multiplayer status, American-versus-German teams, structured location
  “Marseilles, France,” urban railway terrain and the explicit remake
  relationship to *United Offensive*'s Kharkov map.
- [Call of Duty Maps — Marseilles](https://callofdutymaps.com/call-of-duty-3/marseilles/)
  — independently identifies the Marseille setting and describes Kharkov as
  reimagined in France, along with the open urban layout, vehicles and
  long-range/tank-focused combat.
- [Call of Duty Wiki — Kharkov (Map)](https://callofduty.fandom.com/wiki/Kharkov_(Map))
  — identifies the original *United Offensive* multiplayer map and its explicit
  association with the “Kharkov Outskirts” and “Kharkov Station” campaign maps.
- [French Ministry of the Armed Forces — Liberation of Marseille, 28 August 1944](https://www.defense.gouv.fr/terre/mieux-nous-connaitre/histoire-larmee-terre/lengagement-larmee-terre-seconde-guerre-mondiale/liberation-1)
  — authoritative chronology for the uprising, entry of the 3rd Algerian
  Infantry Division and the French-led fighting for Marseille.
- [Chemins de mémoire — 28 August 1944: the Liberation of Marseille](https://www.defense.gouv.fr/chemins-memoire/histoire-memoires/ressources-historiques/seconde-guerre-mondiale/operations-militaires/1944-15)
  — additional official context for the German garrison, French and North
  African forces, and the final surrender.
- [Wikipedia — Marseille](https://en.wikipedia.org/wiki/Marseille)
  — English-language place article, modern spelling and administrative context,
  and the published city coordinate `43.2964, 5.3700` used for the marker.
