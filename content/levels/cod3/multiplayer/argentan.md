---
id: cod3-argentan
title: Argentan
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-argentan
locations:
  - id: main
    country: France
    region: Normandy
    city: L'Orée-d'Écouves
    landmark: Char Sherman Valois (Carrefour de la Croix de Médavy)
    latitude: 48.55018
    longitude: 0.04873
    precision: approximate
    confidence: medium
    method: manual-approximate
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Char+Sherman+Valois%2C+Carrefour+de+la+Croix+de+M%C3%A9davy%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/For%C3%AAt_d%27%C3%89couves
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/argentan/
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Map in the Game

*Argentan* is a multiplayer map in *Call of Duty 3*. The Call of Duty Wiki's
location data is more specific than the title alone: the Atlas Wiki import gives
**"Forêt d'Écouves, Argentan, France"** as the map location. Call of Duty Maps
similarly describes the setting as a battle in the "deep woods" of Argentan,
with a trench and a raised route useful to snipers.

The playable space is therefore clearly presented as a **forest battlefield**,
not as the built-up center of Argentan. Contemporary multiplayer guides describe
heavy foliage and soft cover, bunkers, a long trench, small outposts and elevated
sniping positions. Motorcycles are also available on the map. These details are
useful for identifying the intended landscape, but they do not establish a
one-to-one reconstruction of a particular surviving road, bunker or trench in
Forêt d'Écouves.

## Relation to *The Forest* Campaign Mission

The strongest campaign connection is explicit rather than inferred. The Call of
Duty Wiki identifies **Argentan** as the multiplayer map associated with the
campaign mission *The Forest*. That mission is set in **Forêt d'Écouves, France**
on 11 August 1944 and follows Private Nichols and the 90th Infantry Division as
they clear the wooded area so the Second Battalion can move through.

This relationship is important for the marker. The multiplayer map's title by
itself points toward the town of Argentan, but the multiplayer Wiki location and
the linked campaign mission both point instead to the **Forêt d'Écouves massif**.
The current campaign Markdown on the branch still contains a France-level
fallback coordinate, but its imported Wiki record already names Forêt d'Écouves.
That fallback should therefore not be treated as evidence that the forest cannot
be localized more precisely.

The game should not be read as a literal historical order of battle. The
campaign's Nichols/90th Infantry Division action is a fictionalized playable
mission. The best-documented fighting in Forêt d'Écouves immediately afterward
involved General Leclerc's French 2e Division Blindée and elements of the German
9. Panzer-Division on 12-14 August 1944. The campaign relationship supports the
**place**, not an assertion that the multiplayer map reproduces one specific
historical engagement.

## The Real Place & Historical Context

Forêt d'Écouves is a real forest massif in the Orne department of Normandy,
south of Argentan. Departmental history describes hard fighting in this sector
from 12 to 14 August 1944 as the 2e Division Blindée fought German armor in and
around the forest while securing the route toward Argentan. The Département de
l'Orne specifically identifies the Croix de Médavy sector, the nearby Les Gateys
cemetery and the displayed Sherman **Valois** as surviving memory sites for those
fights.

An older Département de l'Orne historical feature gives an especially useful
caution for the marker: it records a violent fight at **Croix-de-Médavy** on the
evening of 12 August, but says the Sherman *Valois* displayed at the crossroads
was **destroyed elsewhere** and later installed there. A Commune d'Écouves
historical document likewise treats the tank at the top of the forest as a
witness or memorial to the violent armored fighting in the region.

Accordingly, the present-day tank is useful as a named, geocodable battlefield
**anchor**, but it is not evidence that the multiplayer map depicts the exact
spot where that vehicle was knocked out. Nor is there evidence that the game's
bunker/trench complex is a surveyed reconstruction of Croix de Médavy.

## Marker Position Explanation

The previous marker, **`48.74441, -0.02023`**, is the Argentan city marker derived
from the map title. It is **not a country fallback**: the existing file already
uses `precision: city`, `confidence: high` and `method: title`. However, it is too
broad for the evidence now available because the project's own imported Wiki
record explicitly refines the setting to **Forêt d'Écouves**, and *The Forest*
campaign mission independently supplies the same forest setting while naming
Argentan as its multiplayer counterpart.

The revised marker is **`48.55018, 0.04873`**, at the current **Char Sherman
Valois / Carrefour de la Croix de Médavy** memorial site inside Forêt d'Écouves.
OpenStreetMap-derived location data places the displayed tank at those
coordinates, while a battlefield-site directory gives the locality as
L'Orée-d'Écouves and the address as Carrefour de la Croix de Médavy. The point is
about **22 km south of the previous Argentan city marker**, moving the Atlas from
a title-based town-center location into the forest explicitly named by the map's
source data.

This is a more precise **geographical fit**, but the metadata intentionally uses
**`precision: approximate`**, **`confidence: medium`** and
**`method: manual-approximate`**. The coordinate is exact for the modern memorial
anchor, not for the fictional multiplayer battlefield. No reliable source found
identifies the game's trench, bunker complex, outposts or high road with this
specific crossroads. Promoting the level itself to `exact` or `high` confidence
would overstate the evidence.

The stored Google Maps URL searches for the named memorial at Croix de Médavy;
the Atlas marker uses the separately curated coordinates above rather than
coordinates encoded in that URL.

## Sources

- [Call of Duty Wiki - Argentan](https://callofduty.fandom.com/wiki/Argentan) - Identifies the map and supports the Forêt d'Écouves / Argentan location used by the Atlas Wiki import.
- [Call of Duty Maps - Argentan](https://callofdutymaps.com/call-of-duty-3/argentan/) - Supports the deep-woods setting, trench/high-road description and motorcycles.
- [CoD Atlas Wiki import - Argentan](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-argentan.json) - Preserves the imported Wiki location as "Forêt d'Écouves, Argentan, France" and confirms the multiplayer classification.
- [Call of Duty Wiki - The Forest](https://callofduty.fandom.com/wiki/The_Forest) - Supports the campaign mission's Forêt d'Écouves setting, date/unit information and its explicit multiplayer-map relationship to Argentan.
- [CoD Atlas Wiki import - The Forest](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-the-forest.json) - Preserves Forêt d'Écouves as the campaign location and the mission's sequence relationships.
- [CoD Atlas - current The Forest level file](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/levels/cod3/campaign/8-the-forest.md) - Shows that the current campaign Markdown still uses a France-level fallback despite the more specific imported source location.
- [GameFAQs - Call of Duty 3 Multiplayer Guide](https://gamefaqs.gamespot.com/ps2/932965-call-of-duty-3/faqs/45778) - Contemporary gameplay description of Argentan as a foliage-heavy forest map with bunkers, trench systems and outposts.
- [Conseil départemental de l'Orne - Route through Forêt d'Écouves](https://www.orne.fr/actualite/apres-la-refection-du-pont-du-vignage-la-route-de-la-foret-decouves-va-rouvrir) - Official local-authority account of the 12-14 August 1944 fighting in the forest sector and the advance toward Argentan; also identifies Les Gateys and Char Valois as nearby memory sites.
- [Conseil départemental de l'Orne - *Orne Magazine* No. 89, "Des chars dans le paysage"](https://www.orne.fr/sites/default/files/2020-01/om89_0.pdf) - Records the violent fighting at Croix-de-Médavy and, importantly, states that the displayed Valois was destroyed elsewhere, supporting its use as a memorial anchor rather than an exact event site.
- [Commune d'Écouves - *La libération de Radon les 12 et 13 août 1944*](https://www.commune-ecouves.fr/wp-content/uploads/2025/03/Liberation-de-Radon-13-aout-1944-11-03-2025-1.pdf) - Local historical account describing the forest as a German defensive refuge and the Valois memorial as a witness to violent armored fighting in the region.
- [D-Day Overlord - Char Sherman "Valois" de la Croix de Médavy](https://www.dday-overlord.com/map_point/char-sherman-valois-croix-de-medavy) - Supports the modern locality/address and the memorial's relationship to fighting between Forêt d'Écouves and Argentan.
- [Mapcarta / OpenStreetMap - Char Sherman 'Valois'](https://mapcarta.com/N767187843) - Supports the present-day memorial coordinates `48.55018, 0.04873` and OSM historic-site identification.
