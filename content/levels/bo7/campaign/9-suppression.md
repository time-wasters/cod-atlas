---
id: bo7-suppression
title: "Suppression"
games:
  - bo7
mode: singleplayer
wikiArticle: codwiki-suppression
locations:
  - id: vorkuta-hallucination
    country: Russia
    region: Komi Republic
    city: Vorkuta
    landmark: Yur-Shor Memorial Cemetery (Mine No. 29)
    latitude: 67.60367
    longitude: 64.03571
    precision: exact
    confidence: medium
    method: real-world-inspiration
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Yur-Shor+Memorial+Cemetery%2C+Vorkuta%2C+Russia
      - wikipedia: https://en.wikipedia.org/wiki/Yurshor
  - id: alaska-hallucination
    country: United States
    region: Alaska
    latitude: 64.2008
    longitude: -149.4937
    precision: region
    confidence: fallback
    method: region-fallback
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Alaska%2C+United+States
      - wikipedia: https://en.wikipedia.org/wiki/Alaska
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

“Suppression” is the ninth *Call of Duty: Black Ops 7* campaign mission. Emma Kagan disrupts Specter One’s C-Links at the end of “Quarantine,” while David “Section” Mason, Mike Harper, Eric Samuels, and Leilani “50/50” Tupuola are inside the Sanctum in Avalon. The Cradle-induced hallucination then places the team in Vorkuta, U.S.S.R., on October 6, 1963—the same date used for Alex Mason’s fictional Vorkuta escape in the original *Black Ops*—before shifting to David Mason’s childhood cabin in Alaska in the mid-1980s and later returning to Vorkuta.

The hallucination deliberately distorts David’s inherited memories of his father. Alex Mason appears as the prison’s warden rather than its inmate, and the team fights through an exaggerated prison landscape of cells, tunnels, torture spaces, a courtyard, an armory, and the main gate. The final breakout with hallucinated inmates echoes the original mission’s escape language and sequence, including phrases such as “Ascend from darkness,” “Raise hell,” and “Freedom.” Guild troops, monsters, and the VTOL belong to the hallucination rather than to a historical event.

This is a mental interlude, not physical travel by Specter One. “Quarantine” ends in Avalon on June 19, 2035 with the C-Link disruption, and “Breakpoint” resumes the real-world operation in Avalon’s Western Sector on the same date. BO7 multiplayer also revisits David’s childhood home as “Homestead” (`bo7-homestead`); official material describes it only as an isolated home in the Alaskan wilderness, so that relationship supports the identity of the cabin without establishing a more precise real-world location.

## The Real Place & Differences

Vorkuta is a real Arctic coal-mining city in the Komi Republic whose Soviet forced-labor history was spread across a network of camp departments, mines, settlements, and industrial sites rather than one self-contained prison matching the game. The closest documented historical analogue to the level’s prisoner revolt is the Vorkuta uprising of 1953, not the fictional October 1963 escape depicted in *Black Ops* and recalled by “Suppression.”

The strongest surviving anchor for that history is the Yur-Shor Memorial Cemetery near former Mine No. 29. Map of Memory identifies the site as a burial ground for prisoners of Vorkutlag/Rechlag and Mine No. 29 workers and records that 53 prisoners killed during the suppression of the uprising on August 1, 1953 were buried there. The Sakharov Center likewise documents a memorial at the cemetery by former Mine No. 29 dedicated to victims of that shooting.

The Vorkuta match is therefore classified as a **plausible real-world inspiration/analogue**, not a confirmed location for the in-game prison. The original *Black Ops* calls its fictional setting “Mine N1,” and no evidence was found identifying that game complex—or the tunnels, armory, courtyard, and gate shown in “Suppression”—with real Mine No. 29. Yur-Shor is nevertheless a better atlas anchor than Vorkuta city center because it is a surviving, documented site directly connected to the historical uprising that most closely parallels the game’s imagery.

Alaska remains a **broad region fallback**. Official BO7 material establishes that David Mason spent his childhood in Alaska and describes the “Homestead” location as his childhood home in the Alaskan wilderness, but no town, address, named lake, or surviving real cabin has been documented. Selecting a narrower Alaskan point would therefore create unsupported precision.

## The Real Mission & Differences

No historical October 6, 1963 prison escape led by Alex Mason is documented: Alex Mason, Viktor Reznov’s role in the game narrative, the Guild forces, monsters, VTOL combat, and the transition to David’s childhood cabin are fictional. The closest real event was the Vorkuta uprising of July–August 1953, roughly a decade earlier. Prisoners across parts of the Vorkuta camp system refused to work and protested camp conditions; the confrontation at Mine No. 29/Yur-Shor on August 1 ended with guards firing on prisoners.

That real event differs substantially from the game’s cinematic mass breakout. It was part of a dispersed camp-system protest rather than an eight-step escape through one prison complex, and its geography cannot be collapsed into the fictional Mine N1 layout. Memorial’s overview of the Vorkutlag system describes multiple sites centered on coal extraction around Vorkuta, reinforcing that a single marker can represent only a historical anchor, not the complete geography of the uprising.

The 1963 date in “Suppression” is best understood as continuity with the original *Black Ops* Vorkuta mission, not as the date of the real uprising. The historical parallel therefore supports the choice of a Vorkuta-uprising memorial as an analogue while also requiring a clear distinction between the game’s fictional chronology and the events of 1953.

## Marker Position Explanation

The primary atlas marker is stored at `67.60367, 64.03571`, at the Yur-Shor Memorial Cemetery / former Mine No. 29 memorial area. It replaces the previous generic Vorkuta city marker at `67.50867, 64.0667`. This is a stronger fit because the named surviving site is directly associated with victims of the 1953 Vorkuta uprising, whereas a city-center point expresses only the broad setting.

`precision: exact` refers to the position of the named real memorial cemetery, not to the fictional prison. `confidence: medium` and `method: real-world-inspiration` reflect the more limited claim being made: Yur-Shor is the best documented historical analogue found for the level, but no source establishes it as the canonical position of “Suppression,” the original game’s Mine N1, or any specific in-game room, tunnel, courtyard, or route. The cemetery coordinate is used only after cross-checking its mapped position against authoritative descriptions placing the memorial near former Mine No. 29 and about two kilometres from Yur-Shor on the road toward Severny.

The secondary Alaska marker remains `64.2008, -149.4937`. It is a representative regional point only, with `precision: region`, `confidence: fallback`, and `method: region-fallback`; it must not be interpreted as David Mason’s cabin. No stronger candidate was found despite the documented relationship to “Homestead.” Google Maps searches the real named places—Yur-Shor Memorial Cemetery in Vorkuta and Alaska in the United States—while the atlas marker coordinates are curated separately.

## Sources

- [Call of Duty Wiki — Suppression](https://callofduty.fandom.com/wiki/Suppression) — game setting, playable team, Vorkuta/Alaska hallucination structure, dates, and mission chronology.
- [Call of Duty Wiki — Suppression/Transcript](https://callofduty.fandom.com/wiki/Suppression/Transcript) — mission dialogue, the October 6, 1963 title card, Vorkuta breakout language, route references, and explicit links to Alex Mason’s revolt memory.
- [Call of Duty Wiki — Vorkuta (level)](https://callofduty.fandom.com/wiki/Vorkuta_(level)) — establishes the original *Black Ops* fictional Mine N1 escape on October 6, 1963 and the eight-step breakout echoed by “Suppression.”
- [Call of Duty Wiki — Quarantine](https://callofduty.fandom.com/wiki/Quarantine_(mission)) — documents the C-Link disruption in the Sanctum immediately before “Suppression.”
- [Call of Duty Wiki — Breakpoint](https://callofduty.fandom.com/wiki/Breakpoint) — documents the return to the Avalon operation immediately after the hallucination.
- [Call of Duty — Black Ops 7 Reveal](https://www.callofduty.com/blog/2025/08/call-of-duty-black-ops-7-reveal-campaign-multiplayer-zombies) — official background for David Mason’s childhood in Alaska and BO7’s reuse of his childhood home.
- [Call of Duty — Black Ops 7 Multiplayer Maps and Modes](https://www.callofduty.com/blog/2025/11/call-of-duty-black-ops-7-multiplayer-maps-modes-launch) — official description of “Homestead” as David Mason’s childhood home in the Alaskan wilderness; supports the cabin relationship but not a narrower real location.
- [Map of Memory — Burial Ground of Vorkutlag and Rechlag Prisoners, Yur-Shor](https://en.mapofmemory.org/11-04) — authoritative memorial record for the Yur-Shor cemetery, former Mine No. 29 association, and the 53 prisoners killed during suppression of the August 1, 1953 uprising.
- [Map of Memory — Gulag in Northwest Russia (1931–1960)](https://en.mapofmemory.org/gulag-northwest-russia-1931-1960) — overview based on Memorial’s Gulag handbook; supports Vorkutlag’s scale, mining function, and multi-site geography around Vorkuta.
- [Gulag.cz — Vorkuta](https://gulag.cz/en/article/vorkuta) — independent historical overview of the 1953 Vorkuta uprising and the prisoners’ strike/refusal to work.
- [Sakharov Center — Memorial to Lithuanian Prisoners at Yur-Shor](https://sakharov-center.ru/asfcd/pam/?id=277&pic=1&t=pam) — identifies the memorial cemetery by former Mine No. 29 and its connection to victims of the August 1, 1953 shooting.
- [Russian Cemetery Registry — Yur-Shor Memorial Cemetery](https://xn----8sbdlcazmj9bcln0i.xn--p1ai/%D1%80%D0%B5%D1%81%D0%BF%D1%83%D0%B1%D0%BB%D0%B8%D0%BA%D0%B0-%D0%BA%D0%BE%D0%BC%D0%B8/%D0%B2%D0%BE%D1%80%D0%BA%D1%83%D1%82%D0%B0/%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D1%81%D0%BA%D0%B8%D0%B5-%D0%BA%D0%BB%D0%B0%D0%B4%D0%B1%D0%B8%D1%89%D0%B0/%D0%BC%D0%B5%D0%BC%D0%BE%D1%80%D0%B8%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5-%D0%BA%D0%BB%D0%B0%D0%B4%D0%B1%D0%B8%D1%89%D0%B5-%D1%8E%D1%80-%D1%88%D0%BE%D1%80/) — supplies the mapped cemetery point used for coordinate placement; historical claims are instead based on Map of Memory and the Sakharov Center.
