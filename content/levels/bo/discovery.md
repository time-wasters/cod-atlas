---
id: bo-discovery
title: Discovery
games:
  - bo
mode: multiplayer
wikiArticle: codwiki-discovery
locations:
  - id: main
    country: Antarctica
    region: New Swabia
    latitude: -72.0
    longitude: 5.0
    precision: region
    confidence: high
    method: wiki-location
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Queen+Maud+Mountains%2C+Antarctica
      - wikipedia: https://en.wikipedia.org/wiki/New_Swabia
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

**Discovery** is a multiplayer map, so it has no mission narrative, playable campaign character, route, or historical objective. Activision's contemporary description calls it an abandoned German outpost on the coast of Antarctica. The Call of Duty Wiki further places the map in **New Swabia, Antarctica**, lists the multiplayer teams as Black Ops and Spetsnaz, and assigns the setting to 1968. The map is built around snow-covered buildings split by a deep ice chasm, with destructible ice crossings and a ship visible offshore.

The Wiki also explicitly associates Discovery with the singleplayer level **Project Nova** (`bo-project-nova`). Its article points to similar buildings and the offshore ship as evidence of the relationship, while also noting the decisive geographic change: Project Nova is set on Baffin Island in the Canadian Arctic in 1945, whereas Discovery relocates the visual idea to Antarctica. Discovery should therefore be treated as an adapted multiplayer setting rather than another occurrence of Project Nova's canonical location.

## The Real Place & Differences

**New Swabia (Neuschwabenland)** is a real historical name for part of what is now Queen Maud Land in East Antarctica. Germany's official Standing Committee on Geographical Names lists *Neuschwabenland* at the regional reference position **72°00′S, 5°00′E**, and the Norwegian Polar Institute places the wider modern territory within Queen Maud Land. The German name comes from the 1938–39 German Antarctic Expedition and its ship *Schwabenland*.

The match is best classified as a **composite or fictionalized setting with a confirmed real regional reference**. The real New Swabia connection is strong, but no evidence was found for the specific abandoned German research outpost depicted by the map. Discovery's compact coastal combat space, permanent buildings, ice chasm and bridge network are therefore fictionalized rather than a reconstruction of a documented Antarctic site.

## The Real Mission & Differences

The closest supported historical context is the **German Antarctic Expedition of 1938–39**, not a military action in 1968. The Alfred Wegener Institute describes Alfred Ritscher's expedition aboard *Schwabenland* as a politically driven Nazi-era Antarctic expedition that used two flying boats for survey work and was tied to German economic and territorial ambitions. A peer-reviewed study in *Polar Record* concludes that there was **no secret wartime German base in Dronning Maud Land**, directly contradicting the later mythology of a hidden Nazi Antarctic installation.

Accordingly, there is no documented real operation matching Discovery's Black Ops-versus-Spetsnaz fighting or its 1968 setting. The historical connection is the expedition and the regional name; the permanent German base and multiplayer battle are fictional.

## Marker Position Explanation

The atlas marker is stored at `-72.0, 5.0`. This reproduces the regional reference position that Germany's official Antarctic place-name register gives for **Neuschwabenland**. `precision: region` is appropriate because New Swabia covers a very large area and the game does not identify a real station, coast segment, mountain, or other point that could justify a narrower marker. `confidence: high` reflects the explicit in-game/Wiki identification of New Swabia and the independent official verification of that real regional name and reference coordinate; it does **not** imply that the fictional outpost stood at this point.

A more specific Antarctic landmark was rejected because no source ties Discovery to one. The stored Google Maps URL searches for the real named region, **New Swabia, Antarctica**, while the atlas marker uses the separately curated regional reference coordinates above.

## Sources

- [Activision Blizzard — *Call of Duty: Black Ops 'First Strike' Downloadable Content Now Available on Xbox LIVE*](https://investor.activision.com/news-releases/news-release-details/call-dutyr-black-ops-first-strike-downloadable-content-now-0) — Contemporary publisher description identifying Discovery as an abandoned German outpost on the coast of Antarctica.
- [Call of Duty Wiki — *Discovery*](https://callofduty.fandom.com/wiki/Discovery) — Supports the multiplayer setting, New Swabia location, 1968 date metadata, Black Ops/Spetsnaz teams, ice-chasm layout and the documented association with Project Nova.
- [Call of Duty Wiki — *Project Nova*](https://callofduty.fandom.com/wiki/Project_Nova) — Establishes the linked campaign level's Baffin Island, Canada setting and 29 October 1945 date, showing that Discovery relocates rather than preserves its geography.
- [Ständiger Ausschuss für geographische Namen / Bundesamt für Kartographie und Geodäsie — *Deutschsprachige Namen in der Antarktis*](https://stagn.bkg.bund.de/was-wir-veroeffentlichen/uebersichten-listen-und-datenbanken/deutschsprachige-namen-in-der-antarktis) — Official German place-name register listing *Neuschwabenland* at 72°00′S, 5°00′E; basis for the regional marker.
- [Norwegian Polar Institute — *Dronning Maud Land*](https://npolar.no/en/themes/dronning-maud-land/) — Authoritative modern geographic context for the wider Antarctic territory containing the historical New Swabia region.
- [Alfred Wegener Institute — *Geschichte der deutschen Polarforschung*](https://www.awi.de/ueber-uns/service/archiv-fuer-deutsche-polarforschung/geschichte-der-deutschen-polarforschung.html) — Historical context for the 1938–39 German Antarctic Expedition, its political/economic aims, *Schwabenland* and the expedition's aircraft.
- [Summerhayes & Beeching, *Polar Record* — *Hitler's Antarctic base: the myth and the reality*](https://www.cambridge.org/core/journals/polar-record/article/hitlers-antarctic-base-the-myth-and-the-reality/56465FFEA98E416F559C7F02AB20CE19) — Peer-reviewed analysis concluding that no secret wartime German base existed in Dronning Maud Land, supporting the distinction between the real expedition and Discovery's fictional installation.
