---
id: cod2-moscow
title: Moscow
games:
  - cod2
mode: multiplayer
wikiArticle: codwiki-moscow-map
locations:
  - id: main
    country: Russia
    city: Moscow
    latitude: 55.75583
    longitude: 37.61778
    precision: city
    confidence: high
    method: wiki-location
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Moscow%2C+Russia
      - wikipedia: https://en.wikipedia.org/wiki/Moscow
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-2/moscow-2/
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

*Moscow* is a **multiplayer map**, so it has no mission narrative, playable
campaign character, unit, date, briefing, route, or historical objective of its
own. The Call of Duty Wiki explicitly places it in **Moscow, Russia**, with the
Red Army fighting the Wehrmacht, and describes the terrain as snowy and urban.
Its console codename is `mp_downtown`. The map is organized around a large
courtyard and ruined urban buildings; two mounted MG42 positions overlook parts
of the playable space. Call of Duty Maps likewise shows a heavily damaged city
environment with Soviet flags and propaganda details.

The documented campaign relationship is to **Demolition**
(`cod2-demolition`). The Moscow article lists *Demolition* as its campaign map,
while the *Demolition* article reciprocally says that the multiplayer map uses
elements from it. This is important but geographically misleading if read too
literally: *Demolition* is canonically set in **Stalingrad on 2 December 1942**,
not Moscow. The evidence therefore supports shared or adapted combat-space
elements, not a claim that multiplayer Moscow represents the real location of
the *Demolition* mission. Conversely, **Red Army Training**
(`cod2-red-army-training`) is the campaign mission actually set near Moscow,
but no reviewed source identifies it as the multiplayer map's source; its
separate “20 miles west of Moscow” setting should not be transferred to this
map merely because both use the Moscow name.

## The Real Place & Differences

**Match classification: confirmed real city setting, with a fictionalized or
composite combat space.** Moscow itself is explicit in both the Wiki import
record and independent map documentation, so the city identification is strong.
Nothing in the map, however, identifies a real Moscow street, square, railway
station, factory, government building, or other surviving landmark that would
justify a more precise marker. The internal name `mp_downtown` is generic and
does not identify a historical district.

The map's snowy urban destruction is compatible with wartime Moscow as an
atmosphere, but its ground battle is not a literal reconstruction of central
Moscow in 1941. The Boris Yeltsin Presidential Library's Battle of Moscow
project explicitly notes that German forces **did not enter the city**, although
Moscow was under serious threat from air raids and bombing. Moscow municipal
material records the first major air raid in July 1941 and extensive bomb damage
during the following months. Thus ruined buildings are historically plausible
in the city, while Wehrmacht infantry physically occupying and fighting through
a central Moscow courtyard is fictionalized.

## The Real Mission & Differences

There is no matching real multiplayer “mission.” The closest supported
historical context is the **Battle of Moscow**, which began with Operation
Typhoon in autumn 1941 and culminated in the failure of the German drive on the
capital and the Soviet counteroffensive beginning on 5–6 December. Official
Russian archival summaries place the decisive ground fighting on the approaches
to Moscow rather than inside the city. A Moscow city publication summarizes the
situation on 5 December as the enemy being stopped about 15 km from the city.

This matters because the map visually compresses the wider battle into a direct
Red Army-versus-Wehrmacht urban firefight. That is a plausible multiplayer
fiction built around the threatened capital, not a documented episode in which
German troops seized central Moscow streets. The linked *Demolition* campaign
level should also remain separate from this history: its represented 13th
Guards Rifle Division action belongs to Stalingrad in December 1942, so its
real-world Solnechnaya Street/Volgograd marker is not a historical candidate for
this multiplayer map.

## Marker Position Explanation

The stored marker is `55.75583, 37.61778`, the standard representative
coordinate published for **Moscow**. It uses `precision: city`,
`confidence: high`, and `method: wiki-location`. `city` is appropriate because
the map's real-world setting is explicitly identified, but no source fixes the
playable courtyard or ruined blocks to a specific Moscow neighborhood or
landmark. The high confidence applies to the **city identification**, not to the
fictional battlefield geometry.

Two more specific-looking alternatives were rejected. The *Red Army Training*
marker approximately 20 miles west of Moscow belongs to a different campaign
level and has no documented derivation relationship to this multiplayer map.
The *Demolition* marker in modern Volgograd is tied to the campaign level whose
assets or elements are reused, but moving Moscow there would contradict the
multiplayer map's explicit canonical location.

The Google Maps URL searches for the real named place **Moscow, Russia**, while
the atlas marker uses the separately curated coordinates above. The marker must
not be interpreted as an exact 1941 firefight, German position, courtyard,
building, or surviving in-game landmark.

## Sources

- [Call of Duty Wiki — Moscow (Call of Duty 2)](https://callofduty.fandom.com/wiki/Moscow_%28Call_of_Duty_2%29) — explicit Moscow location, Red Army-versus-Wehrmacht teams, snowy urban terrain, `mp_downtown` codename, courtyard/MG42 details, and the documented *Demolition* campaign relationship.
- [Call of Duty Maps — Moscow](https://callofdutymaps.com/call-of-duty-2/moscow-2/) — independent map documentation for the Moscow setting and the destroyed urban environment, Soviet flags, signs, and other visual details.
- [Call of Duty Wiki — Demolition](https://callofduty.fandom.com/wiki/Demolition_%28level%29) — confirms the reciprocal multiplayer relationship while placing the campaign mission in Stalingrad on 2 December 1942; supports treating the connection as reused/adapted elements rather than shared real-world geography.
- [Call of Duty Wiki — Red Army Training](https://callofduty.fandom.com/wiki/Red_Army_Training) — identifies the distinct campaign mission actually associated with Moscow and its 13th Guards Rifle Division game narrative.
- [Call of Duty Wiki — Red Army Training transcript](https://callofduty.fandom.com/wiki/Red_Army_Training/Transcript) — game-text evidence that the campaign mission's playable site is “20 miles west of Moscow,” explaining why that separate campaign marker must not automatically be reused for multiplayer Moscow.
- [Boris Yeltsin Presidential Library — “80 years of the Battle of Moscow” project](https://www.prlib.ru/events/1315026) — authoritative historical context stating that German forces did not enter Moscow while documenting the danger from air raids and bombing.
- [Boris Yeltsin Presidential Library — Beginning of the Battle of Moscow](https://www.prlib.ru/history/619587) — archival historical summary of the German advance, its halt, and the Soviet counteroffensive beginning on 5 December 1941.
- [Moscow city portal — wartime Moscow and bombing](https://www.mos.ru/upload/documents/files/6655/MN_1_2025_SCREEN.pdf) — municipal historical publication documenting the July 1941 start of air raids and substantial bomb damage in Moscow.
- [Moscow city portal — 1941 Moscow timeline](https://www.mos.ru/upload/documents/files/7897/Moskvoved9_2025v9.pdf) — municipal timeline stating that the enemy had been stopped roughly 15 km from the city by 5 December 1941.
- [Moscow — Wikipedia](https://en.wikipedia.org/wiki/Moscow) — English-language article for the represented modern city and the published representative coordinate used for the city-level marker.
