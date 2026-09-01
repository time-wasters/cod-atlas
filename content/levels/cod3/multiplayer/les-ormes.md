---
id: cod3-les-ormes
title: Les Ormes
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-les-ormes
locations:
  - id: main
    country: France
    region: Yonne
    city: Les Ormes
    latitude: 47.8492
    longitude: 3.2664
    precision: city
    confidence: high
    method: wiki-location
    primary: true
    urls:
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/les-ormes/
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Les+Ormes%2C+Yonne%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/Les_Ormes,_Yonne
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

*Les Ormes* is a *Call of Duty 3* multiplayer map, so it has no mission
narrative, playable character, unit or fixed mission date of its own. The Call
of Duty Wiki places the map at **Les Ormes, France**, describes it as based on
the real French town, and identifies its campaign counterpart as *Hostage!*;
the console codename is `mp_hosta`. The playable space mixes a small village
with open farmland and long roads. Call of Duty Maps likewise describes
close-quarters fighting in the town and longer-range fighting across farmland,
with farmhouses, hayfields and drivable sidecar motorcycles.

The documented singleplayer relationship is *Hostage!* (`cod3-hostage`). That
campaign mission is also explicitly set at **Les Ormes, France**, and its Wiki
record identifies *Les Ormes* as the corresponding multiplayer map. The current
curated campaign record has already disambiguated that setting to **Les Ormes,
Yonne**, so the multiplayer marker should follow that stronger campaign-backed
identification rather than remain a generic France fallback.

## The Real Place & Differences

Several French communes are named Les Ormes. **Les Ormes in the Yonne
department** is the strongest match. The French government's BANATIC database
confirms the commune as INSEE **89281**, and French Wikipedia places the village
at approximately `47.8492, 3.2664`. More importantly, the game's SAS/Maquis
campaign context has an unusually close historical match in this same village.

A local 2024 historical exhibition documents British SAS activity in the
Aillantais during August 1944 and records a two-jeep SAS action in Les Ormes on
**23 August 1944**. The patrol encountered Germans preparing to execute
hostages near the present town hall and church. This makes Yonne much more
specific and defensible than choosing another Les Ormes merely by name. The
multiplayer map's village-and-farmland character is compatible with the rural
setting, but no evidence was found that its roads, houses or farm buildings are
a surveyed reconstruction of the real commune.

## The Real Mission & Differences

For the multiplayer map, the closest mission context comes from the linked
*Hostage!* campaign level. That mission is dated **20 August 1944** and follows
James Doyle's SAS group with the French Resistance. Its transcript begins with
the SAS and Maquis driving into a village in time to stop Germans from
executing French civilians, before the fictional rescue of Major Ingram and
other Resistance prisoners.

The real Les Ormes action occurred three days later, on **23 August**, when a
1st SAS patrol in two jeeps attacked German troops around an execution scene in
the village. The parallels in place, British SAS involvement, Maquis context,
jeeps and threatened civilians are striking, but the different date,
participants and later hostage-rescue plot mean neither *Hostage!* nor the
multiplayer map should be presented as a literal recreation of that historical
action.

## Marker Position Explanation

The stored marker is **`47.8492, 3.2664`**, representing the settlement of
**Les Ormes, Yonne** and deliberately matching the curated marker for the linked
campaign mission *Hostage!* (`cod3-hostage`). `precision: city` is appropriate
because the evidence identifies the correct village strongly but does not tie
the multiplayer combat area to one verified building or street. `confidence:
high` reflects the explicit in-game place name, the documented campaign-map
relationship and the unusually specific SAS/Maquis historical context in this
particular Les Ormes. `method: wiki-location` follows the linked campaign
record: the Wiki supplies the canonical place name, while the campaign and
historical evidence disambiguate the Yonne commune.

This is a substantial improvement over the previous **France-centroid fallback
at `46, 2`**. The old marker only represented the country. The new point is tied
to a named commune supported by the multiplayer article, its *Hostage!*
campaign relationship and independent historical evidence for SAS activity in
Les Ormes during the same month.

A seemingly more precise marker at the present **Mairie de Les Ormes / Place de
la Libération** was considered but rejected. The local historical source fixes
the real 23 August SAS firefight near the current mairie and church, but no
source ties the multiplayer layout or the campaign's playable hostage locations
to that exact landmark. Promoting the map to `exact` would therefore overstate
the evidence. The stored Google Maps URL instead searches for the unambiguous
named place **Les Ormes, Yonne, France**; the atlas marker uses the separately
curated coordinates above rather than coordinates encoded in that URL.

## Sources

- [Call of Duty Wiki — Les Ormes](https://callofduty.fandom.com/wiki/Les_Ormes) — multiplayer location, real-town statement, `mp_hosta` codename and documented relationship to the campaign map *Hostage!*.
- [Call of Duty Maps — Les Ormes](https://callofdutymaps.com/call-of-duty-3/les-ormes/) — map layout and environmental details, including the village/farmland split and drivable sidecar motorcycles.
- [Call of Duty Wiki — Hostage!](https://callofduty.fandom.com/wiki/Hostage%21) — campaign protagonist/unit, Les Ormes setting, 20 August 1944 date, objectives and reciprocal identification of *Les Ormes* as its multiplayer map.
- [Call of Duty Wiki — Hostage!/Transcript](https://callofduty.fandom.com/wiki/Hostage%21/Transcript) — confirms the Les Ormes gameplay caption and the opening SAS/Maquis intervention against an attempted execution before the fictional hostage-rescue route.
- [CoD Atlas — Hostage!](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/levels/cod3/campaign/11-hostage.md) — related curated campaign record used to keep the multiplayer location consistent with the researched Yonne identification.
- [BANATIC — Commune Les Ormes (INSEE 89281)](https://www.banatic.interieur.gouv.fr/commune/89281-les-ormes) — French government record confirming the Les Ormes commune in Yonne and its administrative identity.
- [Les Ormes (Yonne) — French Wikipedia](https://fr.wikipedia.org/wiki/Les_Ormes_%28Yonne%29) — settlement coordinates and geographic context used for the city-level marker.
- [Patrimoine & Partage — *Les missions alliées dans l'Yonne* (2024)](https://patrimoineetpartage.fr/wp-content/uploads/2024/10/P-ET-P-EXPO-39-45-SAS-3.pdf) — local historical exhibition documenting SAS activity in the Aillantais and the 23 August two-jeep action at Les Ormes near the present mairie/church execution site.
- [Operation Kipling — Wikipedia](https://en.wikipedia.org/wiki/Operation_Kipling) — independent secondary overview of C Squadron, 1st SAS activity in Yonne/Loiret and the Les Ormes action.
