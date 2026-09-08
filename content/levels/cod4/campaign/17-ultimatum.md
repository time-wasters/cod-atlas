---
id: cod4-ultimatum
title: Ultimatum
games:
  - cod4
mode: singleplayer
campaign:
  id: "4"
  label: Act III
wikiArticle: codwiki-ultimatum
locations:
  - id: main
    country: Russia
    region: Altai Republic
    landmark: Altai Mountains
    latitude: 49.6667
    longitude: 86.0000
    precision: region
    confidence: high
    method: wiki-location
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Altai+Mountains%2C+Altai+Republic%2C+Russia
      - wikipedia: https://en.wikipedia.org/wiki/Altai_Mountains
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

*Ultimatum* is a singleplayer mission played as Sgt. John "Soap" MacTavish of the 22nd SAS Regiment during a joint SAS/U.S. Marine operation. The mission overlay gives **Day 6, 06:19:34** and **Altay Mountains, Russia**. After Imran Zakhaev threatens nuclear retaliation, Price's team makes a HALO insertion from a C-130 toward the launch complex. Griggs is separated from the main group, activates an emergency transponder roughly half a kilometre to the southwest, and is recovered after being captured by Ultranationalists. The team then advances through forested, steep mountain terrain, sabotages a power-transmission tower with C4 to cut power to the facility, breaches the perimeter, and moves toward the ICBM complex. The mission ends as missiles are launched, leading directly into *All In* (`cod4-all-in`).

The campaign chronology is important for the location. The preceding mission, *The Sins of the Father* (`cod4-the-sins-of-the-father`), is on Day 5 in southern Russia/Krasnodar Krai, but *Ultimatum* begins with a new airborne insertion rather than a continuous ground route. The next two missions, *All In* and *No Fighting In The War Room* (`cod4-no-fighting-in-the-war-room`), again explicitly display **Altay Mountains, Russia** and continue through the same launch-facility complex. Some satellite-style campaign graphics appear to place the action much farther west in the Caucasus; that conflicts with the repeated mission text and is best treated as an internal graphical inconsistency rather than a separate canonical location.

## The Real Place & Differences

The **Altai Mountains** are a real mountain system in southern Siberia and Central Asia. UNESCO describes the Russian Altai as a major mountain region of western Siberia with environments ranging from steppe and forest-steppe through mixed forest to subalpine and alpine zones. Its Russian World Heritage components lie in the **Altai Republic**, including the Katunsky reserve/Belukha area and the Ukok Plateau. Those high-relief, forested and snow-capped landscapes are broadly compatible with the visual setting of *Ultimatum*.

The match is best classified as a **composite or fictionalized setting with a confirmed broad in-game region**. The game explicitly fixes the action in the Altay Mountains, but no evidence was found for a real ICBM launch complex matching the mission's fixed industrial site, perimeter, power infrastructure and underground control complex in the high Altai. The real Barnaul strategic-missile deployment area is a useful historical comparison because it is in Altai Krai, but it lies well north of the high-mountain landscape represented by the mission and should not be used as the canonical marker without evidence that Infinity Ward based the level on it.

## The Real Mission & Differences

No matching real 2011 SAS/U.S. Marine assault on a Russian ICBM facility is documented; Zakhaev, the Ultranationalist seizure of the base, the hostage rescue, the sabotage operation and the missile launch crisis are fictional campaign events.

There was, however, a real Russian strategic-missile presence in the broader Altai area. A May 2011 Nuclear Threat Initiative summary lists **Barnaul** among the deployment locations for road-mobile SS-25/Topol ICBMs. The same source places silo-based Topol-M missiles at **Tatishchevo**, not in the Altai Mountains. Earlier START treaty data likewise listed Barnaul as a **road-mobile ICBM base**. This makes Barnaul the closest documented real-world strategic-missile context, but not a match for the game's mountain launch facility. The real systems, geography and basing pattern therefore differ substantially from the fictional fixed complex shown in Act III.

## Marker Position Explanation

The stored marker is `49.6667, 86.0000`. This is a **regional anchor inside the Russian Altai**, using UNESCO's published coordinate for the Katunsky Zapovednik/Belukha-buffer component of the Golden Mountains of Altai World Heritage property. It is intentionally not placed on a guessed military compound. The mission itself only supports the mountain range as a location, so `precision: region` is appropriate even though the identification of the Altay Mountains is strong enough for `confidence: high`.

This is a substantial improvement over the previous Russia-wide fallback at `60, 100`: the game repeatedly names the Altay Mountains, and adjacent Act III missions continue at the same complex. The **Caucasus** was rejected despite the misleading satellite artwork because the textual mission overlays and campaign chronology explicitly identify Altay, and the team arrives by a fresh C-130/HALO insertion after the Krasnodar mission. **Barnaul** was also rejected as the marker: it is a real and historically relevant missile deployment area, but there is no evidence that it is the level's actual or intended site, and its terrain does not match the depicted high mountains.

The Google Maps URL searches for the real named place **Altai Mountains, Altai Republic, Russia**. The atlas marker uses the separately curated coordinates above; it must not be interpreted as the exact location of Zakhaev's fictional launch facility or as a claim that a real missile base exists at the UNESCO site.

## Sources

- [Call of Duty Wiki — Ultimatum](https://callofduty.fandom.com/wiki/Ultimatum) — game character, unit, Day 6 timestamp, Altay Mountains location, mission objectives and the relationship to *The Sins of the Father* and *All In*.
- [Call of Duty Wiki — Ultimatum transcript](https://callofduty.fandom.com/wiki/Ultimatum/Transcript) — mission overlay, C-130/HALO insertion, Griggs's separation and the opening route toward the launch facility.
- [Call of Duty Maps — Call of Duty 4 campaign](https://callofdutymaps.com/cod-4-modern-warfare/campaign-12/) — independent campaign summary listing *Ultimatum*, *All In*, *No Fighting in the War Room* and *Game Over* in the Altay Mountains on Day 6, and *The Sins of the Father* in Krasnodar Krai on Day 5.
- [Call of Duty Wiki — All In](https://callofduty.fandom.com/wiki/All_In) — confirms that the following mission continues at the same Altay Mountains ICBM facility.
- [Call of Duty Wiki — No Fighting In The War Room](https://callofduty.fandom.com/wiki/No_Fighting_In_The_War_Room) — confirms the same Altay Mountains setting and documents the conflicting satellite graphic that appears to place the facility in the Caucasus.
- [UNESCO World Heritage Centre — Golden Mountains of Altai](https://whc.unesco.org/en/list/768) — authoritative description of the Russian Altai's geography, terrain and vegetation zones.
- [UNESCO World Heritage Centre — Golden Mountains of Altai maps](https://whc.unesco.org/en/list/768/maps/) — publishes component coordinates, including `49°40′N, 86°00′E` for Katunsky Zapovednik and the Belukha buffer area used as the regional marker anchor.
- [UNESCO nomination file — Golden Mountains of Altai](https://whc.unesco.org/uploads/nominations/768rev.pdf) — identifies the Russian Federation/Altai Republic and the geographic extent of the nominated Altai mountain region.
- [Nuclear Threat Initiative — Russia's Land, Air and Naval Nuclear Deterrent Capabilities (May 2011)](https://www.nti.org/wp-content/uploads/2021/09/russias_land_air_and_naval_nuclear_deterrent_capabilities_4.pdf) — contemporary-to-the-game-year summary listing Barnaul among SS-25/Topol deployment locations and Tatishchevo for silo-based Topol-M.
- [START I Memorandum of Understanding — Russian Federation, July 1998](https://nuke.fas.org/control/start1/text/mou/russianfed/rfmou798annexi.htm) — treaty-era listing of Barnaul as a road-mobile ICBM base, supporting the distinction between the real Altai-area missile presence and the game's fictional fixed mountain complex.
