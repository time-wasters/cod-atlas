---
id: cod3-merville
title: Merville
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-merville
locations:
  - id: main
    country: France
    region: Normandy
    city: Merville-Franceville-Plage
    latitude: 49.2831
    longitude: -0.2011
    precision: city
    confidence: medium
    method: manual-approximate
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Merville-Franceville-Plage%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/Merville-Franceville-Plage
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/merville/
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Map in the Game

*Merville* is a multiplayer map in *Call of Duty 3*. The Call of Duty Wiki
identifies the setting as **Merville, France**, with American and German teams,
and lists its console codename as `mp_merv`. It also identifies **Night Drop** as
the map's campaign-map counterpart.

The playable environment is a damaged French settlement built around stone
walls and buildings, trenches, roads, gardens and underground passages. The
Wiki describes a large ditch crossed by wooden bridges, a tank, a line of
buildings along the map edge, a garden area and multiple below-ground routes.
The loading-screen text includes the name **"Abbaye du Deuil"** ("Mourning
Abbey"). CallofDutyMaps similarly describes fighting in and around old stone
buildings and notes extensive underground tunnels and rooms, usable vehicles,
and Angel of Sorrow/Angel of Grief statues around a large destroyed building.

These details are useful for identifying the map's visual theme, but neither
source provides a department, region, real abbey, street address or surviving
building that would locate the multiplayer arena more precisely than the name
"Merville, France".

## The Real Place & Differences

The name **Merville** is geographically ambiguous in modern France. There are
communes named Merville in the Nord and Haute-Garonne departments, while the
Normandy commune now called **Merville-Franceville-Plage** is in Calvados.
Importantly for a Second World War setting, the Archives départementales du
Calvados record that Merville-Franceville-Plage was formerly named simply
**Merville**; the compound name was adopted in 1931.

That makes the Calvados locality the strongest fit for the multiplayer map's
short label. It is in Normandy, the principal French theatre represented across
much of *Call of Duty 3*, and it has an unusually strong Second World War
association: the nearby **Merville Battery** was a German coastal fortification
attacked by the British 9th Parachute Battalion during the airborne operations
of 6 June 1944.

That historical relevance must not be overread. No source found connects the
multiplayer map's "Abbaye du Deuil", its angel statues, underground routes,
trenches or destroyed stone-building layout to the Merville Battery or to a
specific surviving location in Merville-Franceville-Plage. The battery is a
preserved fortified position, not evidence that the game map is a surveyed
reconstruction of that site. The multiplayer arena should therefore be treated
as a **fictionalized/stylized Merville setting**, not as an exact model of the
battery or a documented town block.

## Campaign Relationship

The strongest campaign relationship is explicit: the Wiki lists **Night Drop**
as Merville's campaign map. *Night Drop*, however, has its own geographic
identity. Its campaign intertitle places the action **near Toucy, France**, on
22 July 1944, and the researched Atlas campaign entry therefore uses Toucy as
its city-level marker.

For the multiplayer marker, the reused campaign map should **not** override the
multiplayer map's own stated location of Merville. *Call of Duty 3* provides a
useful internal precedent: the multiplayer map **Poisson** is listed as being in
**Angers, France** while naming **The Island** as its campaign map, even though
*The Island* campaign mission is set at **Saint-Germain-sur-Sèves, France**.
This demonstrates that the "Campaign Map" field can describe reused level
geometry/assets without asserting that the multiplayer and campaign versions
share the same canonical real-world location.

Accordingly, *Night Drop* helps explain Merville's inherited environment and
layout, but **Toucy is not the correct marker for the multiplayer map**.

## Marker Position Explanation

The previous Atlas entry used **`46, 2`** with `precision: country`,
`confidence: fallback` and `method: country-fallback`. That point is only a
representative coordinate for France and contains no Merville-specific
geographic information.

The updated marker is **`49.2831, -0.2011`**, a representative city/commune
coordinate for **Merville-Franceville-Plage, Normandy**. This is a meaningful
improvement over the country fallback because several pieces of evidence now
converge on a specific locality:

- the multiplayer sources explicitly name **Merville, France**;
- Calvados archival evidence shows that today's Merville-Franceville-Plage is
  historically the same commune formerly called simply **Merville**;
- the Normandy location fits the wider French/Normandy setting of *Call of Duty
  3* and has a strong Second World War association through the Merville Battery.

The marker remains deliberately conservative at **`precision: city`**,
**`confidence: medium`** and **`method: manual-approximate`**. The confidence is
not high because the game source never says "Calvados", "Normandy" or
"Merville-Franceville-Plage", and other real French places named Merville
exist. The evidence supports this as the **best disambiguation**, not as a
proven developer-identified location.

Two apparently more precise alternatives were rejected:

1. **Merville Battery** — historically compelling, but no source ties the
   multiplayer layout or "Abbaye du Deuil" to the battery. Using the battery's
   coordinates as an exact marker would create false precision.
2. **Toucy** — strongly supported for *Night Drop*, but contradicted as the
   multiplayer location by Merville's own location field and by the game's
   demonstrated practice of assigning different locations to campaign and
   multiplayer versions of reused maps.

The stored Google Maps URL therefore searches for the modern locality
**Merville-Franceville-Plage, France**. The Atlas coordinates are separately
curated as a representative city-level point and should not be interpreted as
the exact position of a real abbey, battery emplacement or individual in-game
building.

## Sources

- [Call of Duty Wiki — Merville](https://callofduty.fandom.com/wiki/Merville) — multiplayer location, teams, console codename, campaign-map relationship to *Night Drop*, map layout and "Abbaye du Deuil" loading-screen detail.
- [CallofDutyMaps — Merville](https://callofdutymaps.com/call-of-duty-3/merville/) — independent map description, old stone buildings, underground areas, vehicles and Angel of Sorrow/Grief statues.
- [CoD Atlas — previous Merville entry](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/levels/cod3/multiplayer/merville.md) — previous France-level fallback marker at `46, 2`.
- [CoD Atlas Wiki import — Merville](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-merville.json) — locally imported Wiki metadata including the raw location "Merville, France".
- [Call of Duty Wiki — Night Drop](https://callofduty.fandom.com/wiki/Night_Drop) — identifies *Night Drop* as a campaign mission set near Toucy, France.
- [Call of Duty Wiki — Night Drop transcript](https://callofduty.fandom.com/wiki/Night_Drop/Transcript) — supports the explicit "Near Toucy, France" gameplay intertitle.
- [CoD Atlas — Night Drop research](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/levels/cod3/campaign/3-night-drop.md) — researched campaign marker and explanation for Toucy.
- [Call of Duty Wiki — Poisson](https://callofduty.fandom.com/wiki/Poisson) — multiplayer precedent: location Angers, France while reusing *The Island* as its campaign map.
- [Call of Duty Wiki — The Island](https://callofduty.fandom.com/wiki/The_Island) — establishes the reused campaign map's different location at Saint-Germain-sur-Sèves.
- [Archives départementales du Calvados — Merville-Franceville-Plage](https://archives.calvados.fr/ark:/52329/xlwnqb463rpj) — records the commune's former name as Merville and the 1931 adoption of Merville-Franceville-Plage.
- [INSEE — Merville-Franceville-Plage](https://www.insee.fr/fr/metadonnees/geographie/commune/14409-merville-franceville-plage) — confirms the modern Calvados/Normandy commune.
- [INSEE — Merville (Nord)](https://www.insee.fr/fr/metadonnees/geographie/commune/59400-merville) — confirms another modern French commune named Merville and therefore the name ambiguity.
- [INSEE — Merville (Haute-Garonne)](https://www.insee.fr/fr/metadonnees/geographie/commune/31341-merville) — confirms another modern French commune named Merville and therefore the name ambiguity.
- [Merville Battery Museum — official site](https://www.batterie-merville.com/en/) — historical context for the German battery and the British 9th Parachute Battalion assault on 6 June 1944.
- [Wikipedia — Merville-Franceville-Plage](https://en.wikipedia.org/wiki/Merville-Franceville-Plage) — representative commune coordinate used for the city-level Atlas marker.
