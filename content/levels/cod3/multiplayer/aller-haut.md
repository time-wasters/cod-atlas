---
id: cod3-aller-haut
title: Aller Haut
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-aller-haut
locations:
  - id: main
    country: France
    latitude: 46
    longitude: 2
    precision: country
    confidence: fallback
    method: country-fallback
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=France
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/aller-haut/
---

> **AI-generated research note:** The historical and location analysis below was
> generated with AI assistance and should be reviewed against the cited sources
> before being treated as authoritative.

## The Map in the Game

*Aller Haut* is a downloadable multiplayer map for *Call of Duty 3*. It was one
of the three newly created maps in the **Bravo Map Pack**, alongside *Seine
River* and *Rimling*. The pack also brought back *Gare Centrale* and
*Marseilles* from earlier *Call of Duty* releases and was released for Xbox 360
on **31 May 2007**.

The surviving official Xbox Marketplace description is useful because it gives
a little more environmental context than the present Atlas import. It describes
the new Bravo maps as including combat around **hilltop abbeys**. A contemporary
Activision press release, preserved in a 2007 forum post, is more specific and
calls *Aller Haut* an **Axis-held hilltop fortress**. Another contemporary report
describes the Axis beginning in an abbey above an Allied village, with the steep
slope and rock faces making an uphill assault more difficult than a downhill
defense.

Call of Duty Maps describes the playable area as a **steep hillside town with a
large building at the top of the hill**. Beyond the playable boundary are more
houses climbing the hillsides, fields and tall trees, with long views over the
surrounding landscape. The map supports vehicular combat including tanks, a
Horch utility vehicle and the SAS-style assault jeep. Crucially for the Atlas,
that source lists the map's real-world **Location as “Unknown.”**

The map is therefore best understood as a deliberately vertical fictional or
composite battlefield: a lower settlement, a steep climb and an elevated
fortified religious/large-building complex. The available descriptions establish
the map's form much more clearly than they establish its geography.

## Location Research & Campaign Connections

The current CoD Atlas Wiki import contains no extracted `levelLocation`, date,
previous/next-level relationship or campaign-map relationship for *Aller Haut*.
That absence alone would not prove that the map is fictional, but it agrees with
Call of Duty Maps explicitly listing its location as unknown.

Campaign reuse is important to check because several *Call of Duty 3*
multiplayer maps do have documented single-player relationships. The Call of
Duty Wiki identifies *Crossing* as a conversion of **The Island**, *Mayenne* as
using **Mayenne Bridge**, and *Seine River* as resembling **Mayenne Bridge**.
Those are useful precedents: when a campaign relationship is known, it can
provide a much stronger geographical anchor than a map's generic scenery.

No comparable published relationship was found for *Aller Haut*.

### Why not Mont Ormel / Hill 262?

The most tempting campaign comparison is **The Mace**. That mission is explicitly
set at Mont Ormel / Hill 262 and repeatedly sends the Polish defenders back
uphill; its later sequence also reaches a large building near the higher
positions. At a superficial level, that sounds compatible with the vertical
design of *Aller Haut*.

The evidence is not strong enough to identify the multiplayer map with Hill 262,
however. The official Bravo material describes *Aller Haut* as an abbey or
hilltop fortress, while no reliable source calls it a conversion, remake or
adaptation of *The Mace*. The Call of Duty Wiki gives *The Mace* a precise
campaign location but gives no corresponding *Aller Haut* relationship in the
material available to this research. Searches combining the two map names,
Mont Ormel and Hill 262 did not produce a documented connection.

There is some development-team overlap: a résumé attributed to Pi Studios lead
level designer David Mertz says he provided additional design support for
*Aller Haut*, *Seine River* and *Rimling*, and separately supported campaign
missions including *The Forest*, *Laison River* and *The Mace*. That is useful
production context, but it is **not evidence of level reuse**. It cannot justify
placing *Aller Haut* at Mont Ormel.

### Why not the SAS campaign / Night Drop?

The SAS assault jeep and the hilltop building also invite comparison with the
British/French campaign, especially *Night Drop*, which contains SAS vehicles
and a manor-house assault. This is likewise too weak for geolocation. *Call of
Duty 3* multiplayer uses American-versus-German teams, and the SAS-style jeep
appears on unrelated multiplayer battlefields such as *Eder Dam* and
*Marseilles*. It is therefore a reusable gameplay vehicle, not a reliable
location clue. The official *Aller Haut* description also refers to an
abbey/fortress rather than identifying the campaign manor.

### Why not a generic Normandy marker?

The single-player campaign follows the Normandy breakout and the closing of the
Falaise Pocket, so Normandy is an obvious first area to test. The multiplayer
catalogue is not restricted to that campaign corridor, however: named maps range
from places such as Verdun and Metz to Marseilles/Toulon, and *Eder Dam* is in
Germany. A generic Norman hillside or abbey would therefore be an inference from
the campaign's overall theme rather than evidence about *Aller Haut* itself.

## Marker Position Explanation

The stored marker remains **`46, 2`**, the France country fallback.

This is one of the cases where retaining a fallback is more accurate than
inventing a visually plausible point. The research substantially improves the
description of the map — the battlefield is an Axis-held hilltop abbey/fortress
above a lower settlement — but none of the reliable sources identifies the
abbey, town, département or region. Call of Duty Maps explicitly records the
location as **Unknown**, and the Atlas Wiki import currently contains no
location data at all.

For that reason the existing metadata remains appropriate:

- **`precision: country`**
- **`confidence: fallback`**
- **`method: country-fallback`**

Moving the marker to **Mont Ormel / Hill 262**, **Toucy**, a random Norman abbey,
or any other attractive hillside location would create false precision. Unlike
*Crossing*, *Mayenne* and *Seine River*, there is no documented campaign
conversion or resemblance that permits the Atlas to inherit a campaign
mission's real-world coordinates.

The current coordinate is therefore not being kept because no alternatives were
considered; it is being kept because the available evidence does **not yet
support a more precise real-world marker**. If a future primary source, design
document, console codename, developer statement or recovered Wiki revision
identifies a locality or a campaign conversion, this map should be revisited.

## Sources

- [Call of Duty Wiki — Aller Haut](https://callofduty.fandom.com/wiki/Aller_Haut) — Canonical Wiki article for the multiplayer map; the current Atlas import points to this article but contains no extracted location or campaign relationship.
- [Xbox Wire — Call of Duty 3 Bravo Map Pack](https://news.xbox.com/en-us/2007/05/31/call-of-duty-3-bravo-map-pack/) — Contemporary official Xbox Marketplace announcement; supports the 31 May 2007 release and the official “hilltop abbey” environmental description.
- [Xbox Store — Call of Duty 3 Bravo Map Pack](https://www.xbox.com/en-us/games/store/call-of-duty-3-bravo-map-pack/C5HX520DMXDK) — Current official store listing preserving the Bravo Map Pack description and release date.
- [XboxAchievements forum — preserved Activision Bravo Map Pack press release](https://www.xboxachievements.com/forum/topic/12234-map-pack/) — Reproduces Activision's 31 May 2007 release text identifying *Aller Haut* as an Axis-held hilltop fortress.
- [SimHQ — Call of Duty 3 Bravo Map Pack release discussion](https://simhq.net/forum/ubbthreads.php/topics/2224540/news-call-of-duty-3-new-bravo-map-pack-released) — Contemporary description of the Axis starting in a hilltop abbey above the Allied village and of the steep uphill terrain.
- [Call of Duty Maps — Aller Haut](https://callofdutymaps.com/call-of-duty-3/aller-haut/) — Supports the steep hillside town, large hilltop building, surrounding houses/fields/trees, vehicles and, most importantly, the explicit `Location: Unknown`.
- [Call of Duty Wiki — Call of Duty 3](https://callofduty.fandom.com/wiki/Call_of_Duty_3) — Supports the Bravo Map Pack membership, the wider Normandy-breakout campaign context and the American-versus-German multiplayer faction structure.
- [Call of Duty Wiki — Crossing](https://callofduty.fandom.com/wiki/Crossing) — Documents *Crossing* as a conversion of campaign mission *The Island*, used here as a comparison for what a supported campaign-map relationship looks like.
- [Call of Duty Wiki — Mayenne (Multiplayer)](https://callofduty.fandom.com/wiki/Mayenne_(Multiplayer)) — Documents *Mayenne Bridge* as the campaign source for the multiplayer map.
- [Call of Duty Wiki — Seine River](https://callofduty.fandom.com/wiki/Seine_River) — Documents a resemblance to *Mayenne Bridge* and shows that even a Bravo Map Pack map can have a stated campaign relationship when one is known.
- [Call of Duty Wiki — The Mace](https://callofduty.fandom.com/wiki/The_Mace) — Supports Mont Ormel / Hill 262 as the campaign mission's explicit setting and the uphill defensive action; considered and rejected as an unsupported marker source for *Aller Haut*.
- [David Mertz résumé mirror — Pi Studios level-design credits](https://studylib.net/doc/8483232/david-mertz) — Secondary source showing design-support overlap between *Aller Haut* and several campaign missions; useful production context, but not evidence that the multiplayer map reuses a campaign location.
- [CoD Atlas Wiki import — Aller Haut](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-aller-haut.json) — Shows that the current import contains no level location, date or previous/next-level relationship.
- [CoD Atlas — current Aller Haut level file](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/levels/cod3/multiplayer/aller-haut.md) — Baseline file containing the existing France country fallback at `46, 2`.
