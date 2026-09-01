---
id: cod3-crossing
title: Crossing
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-crossing
locations:
  - id: main
    country: France
    region: Normandy
    city: Sainte-Mère-Église
    landmark: La Fière Bridge
    latitude: 49.401
    longitude: -1.36336
    precision: approximate
    confidence: medium
    method: manual-approximate
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=La+Fi%C3%A8re+Bridge%2C+Sainte-M%C3%A8re-%C3%89glise%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/Merderet
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/crossing/
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Map in the Game

*Crossing* is a *Call of Duty 3* multiplayer map released in the Valor Map Pack
on 27 January 2007. The Call of Duty Wiki identifies its location as **Le
Merderet, France**, gives the console codename **`mp_isle`**, and explicitly
states that it is a conversion of the campaign mission *The Island*. The map is
described as a bridge crossing of the Merderet with German fortifications on
one side and an Allied farmhouse base on the other. Call of Duty Maps
also labels the location **Le Merderet** and describes a large open
farm landscape with only a few buildings, additional houses and a church in
the surrounding scenery.

The reused campaign origin is also visible in the type of terrain. *The Island*
contains a stream/bridge approach, barns and houses, open fields, hedgerows,
hills and later German trenches and fortified positions. *Crossing* repackages
that rural combat space into a multiplayer battlefield rather than presenting a
newly documented historical action.

## The Real Place & Differences

The **Merderet** is a river in the Manche department of Normandy. During the
D-Day airborne operation, control of its crossings west of
Sainte-Mère-Église was a major objective of the U.S. 82nd Airborne Division.
The two best documented bridge objectives in this sector were **La Fière** and
**Chef-du-Pont**. The Airborne Museum identifies both bridges as objectives of
the 82nd Airborne, so the game's generic label "Le Merderet" does **not** by
itself prove which real bridge Treyarch intended.

La Fière is the stronger atlas anchor. It is a named, surviving Merderet
crossing tied to a major multi-day battle, and the Cotentin Bay Tourist Office
describes the bridge, the nearby manor on the riverbank and German resistance
there. U.S. War Memorials places the La Fière Bridge memorial site at
approximately **`49.401, -1.36336`**, immediately beside the strategic river
crossing. This gives the map a specific real-world bridge sector without
pretending that the multiplayer layout is a surveyed reconstruction of La
Fière.

Chef-du-Pont remains a plausible alternative because it was the other major
82nd Airborne bridge objective over the Merderet. No source found names
La Fière in connection with *Crossing* itself. The farmhouse, German
fortifications, trenches and surrounding church therefore should be treated as
reused/composite game scenery rather than evidence that every structure maps to
the La Fière battlefield.

## Campaign Relationship

The campaign relationship is unusually important here. *Crossing* is explicitly
a conversion of *The Island* and even retains the internal-style codename
**`mp_isle`**. *The Island*, however, is set at
**Saint-Germain-sur-Sèves** on 26 July 1944, not on the Merderet. Its transcript
starts beside a bridge/stream and then moves through the rural farm and
fortification terrain that supplied material for the multiplayer conversion.

The historically researched campaign anchor for *The Island* is the **Sèves
Island memorial at Gué de la Petite Eau**, `49.222365, -1.389481`. The Côte
Ouest Centre Manche WWII heritage map explicitly identifies that coordinate as
"Seves Island" at Saint-Germain-sur-Sèves. That point is about 20 km from the
La Fière bridge sector.

For atlas purposes, the asset relationship therefore should **not** collapse the
two levels onto one marker. The campaign mission represents the Sèves Island
fighting around Saint-Germain-sur-Sèves, whereas the multiplayer map explicitly
re-contextualizes the converted geometry as a crossing of the **Merderet**. The
campaign relationship explains the shared scenery; it does not override the
multiplayer map's stated location.

## Marker Position Explanation

The previous stored marker was the generic France fallback **`46, 2`** with
`precision: country`, `confidence: fallback` and `method: country-fallback`.
That is much less precise than the information already present in the map's own
sources, which identify the Merderet river in Normandy.

The new marker is **`49.401, -1.36336`** at the **La Fière Bridge** sector west
of Sainte-Mère-Église. This is a substantial evidence-based refinement because:

1. both multiplayer sources place *Crossing* on the Merderet;
2. the historical record identifies La Fière and Chef-du-Pont as the principal
   strategic Merderet bridge objectives in the relevant Normandy battlefield;
3. La Fière provides a well-documented surviving bridge/battlefield landmark
   whose rural manor and fortified crossing context is a reasonable real-world
   anchor for a map explicitly centered on a Merderet bridge; and
4. using the Sèves Island campaign marker would ignore the multiplayer map's
   deliberate re-location from Saint-Germain-sur-Sèves to the Merderet.

The marker remains **`precision: approximate`**, **`confidence: medium`** and
**`method: manual-approximate`**. The coordinate is precise for the real La
Fière bridge sector, but the match between *Crossing* and La Fière is an
inference: the game sources say only "Le Merderet" and do not distinguish La
Fière from Chef-du-Pont. Marking the map as `exact` or using
`verified-landmark` would therefore overstate the evidence.

The stored Google Maps URL searches for **La Fière Bridge,
Sainte-Mère-Église, France**. The atlas coordinates are separately curated from
historical/location sources rather than extracted from that search URL.

## Sources

- [Call of Duty Wiki — Crossing](https://callofduty.fandom.com/wiki/Crossing) — map location "Le Merderet", American/German teams, `mp_isle` codename, campaign conversion from *The Island*, and bridge/farmhouse/fortification description.
- [Call of Duty Maps — Crossing](https://callofdutymaps.com/call-of-duty-3/crossing/) — also lists the location as Le Merderet and describes the open farm, buildings, surrounding church and rural scenery.
- [CoD Atlas Wiki import — Crossing](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-crossing.json) — confirms the imported Wiki location field is `Le Merderet` and preserves the local article relationship used by the Atlas.
- [Call of Duty Wiki — The Island](https://callofduty.fandom.com/wiki/The_Island) — identifies the campaign mission as Saint-Germain-sur-Sèves on 26 July 1944 and explicitly lists *Crossing* as its multiplayer map.
- [Call of Duty Wiki — The Island transcript](https://callofduty.fandom.com/wiki/The_Island/Transcript) — supports the bridge/stream opening and the rural houses, trenches and fortified positions reused thematically by the multiplayer conversion.
- [CoD Atlas Wiki import — The Island](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-the-island.json) — confirms the campaign's imported Saint-Germain-sur-Sèves location and date.
- [Airborne Museum — Operation Neptune](https://airborne-museum.org/en/history/operation-neptune/) — identifies La Fière and Chef-du-Pont as the two Merderet bridge objectives of the U.S. 82nd Airborne Division.
- [Airborne Museum — D-Day objective changes, 28 May 1944](https://airborne-museum.org/en/fiche-timeline/may-28-1944/) — independently confirms the mission to seize the Merderet bridges at La Fière and Chef-du-Pont.
- [Cotentin Bay Tourist Office — Paratroopers' Monument, Battle of La Fière](https://www.ot-baieducotentin.fr/en/patrimoine-culturel/monument-des-parachutites-bataille-de-la-fiere/) — describes the strategic Merderet bridge, nearby manor and German resistance at La Fière.
- [U.S. War Memorials — Sainte-Mère-Église / La Fière Bridge Memorial Site](https://www.uswarmemorials.org/html/site_details.php?SiteID=36) — places the La Fière bridge memorial site at approximately `49.401, -1.36336` and ties the site directly to the strategic Merderet crossing and fighting.
- [Côte Ouest Centre Manche — *1944: Sites et itinéraires de mémoire*](https://www.tourisme-cocm.fr/app/uploads/2024/06/carte-ww2-reconstruction.pdf) — local WWII heritage map listing `Seves Island 49.222365, -1.389481` at Saint-Germain-sur-Sèves, supporting the separate campaign anchor used for *The Island*.
