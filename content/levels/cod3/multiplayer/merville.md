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
    latitude: 49.2775
    longitude: -0.20329
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

## The Mission in the Game

*Merville* is a multiplayer map in *Call of Duty 3*. It has no campaign-style mission narrative, playable character, unit assignment, date, briefing, route or historical objective. The Call of Duty Wiki identifies the opposing multiplayer teams as American and German and gives the setting simply as **"Merville, France."** The local Wiki import preserves the same location string.

The map is a ruined French settlement built around streets, destroyed stone buildings and walls, trenches or pits, gardens, a large ditch, underground passages and vehicle routes. Call of Duty Maps likewise describes old stone buildings, underground tunnels and operational vehicles, while the Wiki notes that the loading screen carries the otherwise undocumented name **"Abbaye du Deuil"** ("Mourning Abbey"). No evidence was found that this is the name of a real abbey at Merville.

The Wiki explicitly lists the campaign map **Night Drop** (`cod3-night-drop`) as the map's singleplayer relationship. That relationship is best understood as reuse or adaptation of combat space/assets, not inherited geography. *Night Drop* itself is explicitly set **near Toucy, France**, on 22 July 1944 and uses the British SAS/French Resistance storyline. Merville therefore should not be moved to Toucy merely because it reuses that campaign map.

## The Real Place & Differences

The strongest real-world interpretation of the multiplayer label **"Merville, France"** is **Merville-Franceville-Plage in Calvados, Normandy**. This is not the only French place called Merville, so the identification is inferential rather than confirmed. It is nevertheless much stronger than a country fallback for two reasons.

First, the Archives départementales du Calvados document that the commune was historically named **Merville** and that the suffix **Franceville-Plage** was added by decree on 11 February 1931. The modern commune therefore preserves an actual Normandy locality whose historical core name exactly matches the map title. INSEE confirms Merville-Franceville-Plage as a commune in Calvados, Normandy.

Second, Merville-Franceville-Plage has an unusually strong Second World War association: the surviving **Merville Battery**, a German coastal-artillery position on the eastern flank of the Normandy landings. The battery makes this Merville a substantially more plausible wartime reference than the unrelated Merville communes in northern or southern France.

The multiplayer environment must still be treated as a **plausible inspiration/analogue**, not a reconstruction of either the town or the battery. The game depicts a broad ruined settlement with stone buildings, gardens, trenches, tunnels and roads. The real battery is a purpose-built coastal fortification of casemates, defensive works, minefields and wire outside the settlement. No reliable source found in this research identifies the game's large ruined building, underground routes, angel statues or fictional "Abbaye du Deuil" with a real structure in Merville-Franceville-Plage. The game map also contains no coastline or unmistakable battery feature that would justify placing the marker on the fortification itself.

## The Real Mission & Differences

There is no documented real mission that matches *Merville* as a multiplayer scenario, because the map supplies no date, unit, briefing or historical objective.

The closest supported historical context is the assault on the **Merville Battery on 6 June 1944**. The Merville Battery museum identifies the position as a German Army fortification on the eastern flank of the Allied landings and states that it was neutralised by the **9th British Parachute Battalion**. Its material on the battalion describes Lieutenant-Colonel Terence Otway's planned airborne assault and the battery's prepared defenses.

That history should not be retrofitted into the multiplayer match. The game's teams are **American versus German**, not British airborne versus German defenders, and the map provides no D-Day date or battery-destruction objective. The surviving Merville Battery is therefore valuable evidence for identifying which real French Merville is the strongest wartime analogue, but it is not evidence that Treyarch intended the multiplayer fighting to reproduce Otway's assault.

The documented *Night Drop* relationship also points away from a literal Merville Battery reconstruction. That singleplayer mission is set near Toucy on 22 July 1944 and follows a fictionalized British SAS/Maquis action. Merville borrows its game space while assigning a different place name and multiplayer teams. Campaign reuse, multiplayer naming and historical Merville context must therefore remain separate claims.

## Marker Position Explanation

The stored marker is **`49.2775, -0.20329`**, a representative city-level point for **Merville-Franceville-Plage, France**. It replaces the previous country-level fallback at **`46, 2`**.

This is a genuine evidence-based improvement over the old marker. The imported game record and both map references identify the multiplayer setting as "Merville, France"; the Calvados archives establish that modern Merville-Franceville-Plage was historically named Merville; and its Normandy wartime context gives it a much stronger *Call of Duty 3*-era fit than an arbitrary France-wide point. The coordinate itself represents the modern commune rather than a claimed combat position.

The appropriate classification is **`precision: city`**, **`confidence: medium`**, **`method: manual-approximate`**. `city` is used because the evidence supports the locality but not a particular building or battlefield feature. `medium` reflects the unresolved ambiguity among French places named Merville and the absence of developer documentation explicitly identifying Merville-Franceville-Plage. `manual-approximate` reflects that the locality was selected through historical disambiguation rather than copied directly from an explicit game coordinate or verified landmark match.

A more precise point at the **Merville Battery** was considered and rejected. The battery is a strong surviving historical landmark and the main reason the Calvados Merville is compelling, but selecting its exact coordinates would overstate the evidence: the game map does not depict a recognizable coastal battery, its teams do not match the historical British assault, and "Abbaye du Deuil" has not been identified as a real Merville landmark. Likewise, **Toucy** was rejected despite the *Night Drop* reuse because campaign-map reuse does not override Merville's own explicit multiplayer location.

The stored Google Maps URL searches for the real named place **Merville-Franceville-Plage, France**. The atlas marker uses the separately curated coordinates above rather than coordinates embedded in the Maps URL.

## Sources

- [Call of Duty Wiki — Merville](https://callofduty.fandom.com/wiki/Merville) — supports the multiplayer classification, American-versus-German teams, stated "Merville, France" location, `mp_merv` codename, *Night Drop* campaign-map relationship, layout description and "Abbaye du Deuil" loading-screen text.
- [Call of Duty Maps — Merville](https://callofdutymaps.com/call-of-duty-3/merville/) — independently supports the Merville, France setting and describes the old stone buildings, underground tunnels, vehicles and other environmental details.
- [CoD Atlas Wiki import — Merville](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-merville.json) — supports the locally imported "Merville, France" location and multiplayer classification used by the repository.
- [CoD Atlas — Night Drop](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/levels/cod3/campaign/3-night-drop.md) — supports `cod3-night-drop` as the related singleplayer level and, critically, its separate "Near Toucy" setting and SAS/Maquis context.
- [Archives départementales du Calvados — Merville-Franceville-Plage](https://archives.calvados.fr/document/thesaurus-lieux) — authoritative local-administrative evidence that Merville-Franceville-Plage was formerly Merville and that "Franceville-Plage" was added by decree on 11 February 1931.
- [INSEE — Commune de Merville-Franceville-Plage (14409)](https://www.insee.fr/fr/metadonnees/geographie/commune/14409-merville-franceville-plage) — confirms the modern commune in Calvados, Normandy.
- [Merville Battery Museum — The Merville Battery](https://www.batterie-merville.com/en/merville-battery/) — identifies the surviving German battery at Merville-Franceville and its neutralisation by the 9th British Parachute Battalion on D-Day; used as historical context and locality evidence, not as proof that the multiplayer map depicts the battery.
- [Merville Battery Museum — Training of the 9th Para Bn.](https://www.batterie-merville.com/en/the-museum/the-battery/training-of-the-9th-para-bn/) — provides the historical assault planning, defensive layout and unit context used to distinguish the real battery action from the multiplayer scenario.
- [Wikipedia — Merville-Franceville-Plage](https://en.wikipedia.org/wiki/Merville-Franceville-Plage) — provides the representative commune coordinate `49.2775, -0.20329` used for the city-level atlas marker.
