---
id: cod2-bro-the-desert-fox
title: The Desert Fox
games:
  - cod2-bro
mode: singleplayer
campaign:
  id: "2"
  label: North Africa
wikiArticle: codwiki-the-desert-fox
mapOverlay:
  image: /images/levels/cod2-bro/campaign/4-the-desert-fox/maps/overlay.png
  opacity: 0.72
  corners:
    topLeft: [40.37602288, -10.16421945]
    topRight: [40.41458155, 17.23105079]
    bottomLeft: [27.99948229, -10.13376478]
    bottomRight: [28.04475701, 17.25659463]
  attribution:
    title: "Call of Duty 2: Big Red One - The Desert Fox loading-screen map"
    source: "Directly extracted from Call of Duty 2: Big Red One by plp-gtr."
    sourceUrl: https://github.com/time-wasters/cod-atlas/blob/main/public/images/maps/cod2-bro/the-desert-fox.png
    extractedBy: plp-gtr
    extractedByUrl: https://github.com/plp-gtr
    copyrightHolder: Activision Publishing, Inc.
    rights: non-free
    rightsNotice: "The extraction is contributed to CoD Atlas; the underlying copyrighted game artwork remains the property of Activision and is used for identification and geographic comparison."
    rightsNoticeUrl: https://www.activision.com/legal/terms-of-use
locations:
  - id: main
    country: Tunisia
    region: Kasserine Governorate
    landmark: Kasserine Pass
    latitude: 35.2596
    longitude: 8.7424
    precision: approximate
    confidence: high
    method: wiki-location
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Kasserine+Pass%2C+Kasserine+Governorate%2C+Tunisia
      - wikipedia: https://en.wikipedia.org/wiki/Battle_of_Kasserine_Pass
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

“The Desert Fox” is the fourth campaign mission in *Call of Duty 2: Big Red One*. The game places Pvt. Roland Roger of the 1st Infantry Division’s “Fox Company” near Kasserine on 19 February 1943 at 09:10. The briefing dialogue says that the 26th has already been overrun by Rommel’s Afrika Korps, that German armor took Kasserine Pass and then pulled out, and that Roger’s regiment is moving up to take the pass back.

The level begins with Roger, Denley, and Hawkins driving toward American positions in rolling, rocky terrain. Roger is put on a 75 mm-armed half-track to stop German tanks, then helps defend the line until friendly armor arrives. The squad subsequently escorts engineers through the mined approach to the pass and fights through a stylized sequence of ridges, paths, German positions, and a village-like built-up area. Later objectives include attacking German-held positions and equipment before the level ends with the German push being broken up and Hawkins ordering the squad back to camp. These events are the game’s narrative and should not be read as a literal reconstruction of the real battle.

The surrounding campaign chronology makes the geographic identification unusually strong. The preceding mission, “Tankers” (`cod2-bro-tankers`), is dated 13 February and is identified only broadly as Tunisia in the imported game data. “The Desert Fox” is explicitly identified as Kasserine Pass on 19 February. The following mission, “Counterattack” (`cod2-bro-counterattack`), moves to Kasserine itself on 22 February. That sequence supports treating the pass as this mission’s location rather than retaining a generic Tunisia marker or collapsing it onto the later Kasserine-city setting.

## The Real Place & Differences

Kasserine Pass is a real mountain pass in west-central Tunisia, in modern Kasserine Governorate. The battlefield lay in restrictive terrain between high ground, with roads funneled through the pass. Historical accounts emphasize exactly the kinds of terrain features that made the position important: narrow approaches, commanding slopes, road junctions, prepared positions, and minefields.

This is therefore best classified as a **confirmed real location with a heavily fictionalized/composite combat space**, not merely a broad country fallback or a real-world analogue. The game names Kasserine Pass directly, uses the opening date of the historical fighting there, and places the 1st Infantry Division in the same battle. Its rugged hills, mined roads, and defensive positions are broadly compatible with the real terrain. However, no evidence was found that the level’s exact footpaths, village/gate sequence, artillery positions, or encounter order reproduce a surveyed route through the historical battlefield. The playable space should be understood as a compressed dramatic interpretation of the pass and nearby fighting.

## The Real Mission & Differences

The strongest historical match is the actual American defense of Kasserine Pass on 19–20 February 1943. U.S. Army history records that the 19th Engineer Combat Regiment moved into the pass before the main attack, dug in, and laid mines. It also identifies the 1st Battalion, 26th Infantry as part of the defense. Colonel Alexander Stark of the 26th Infantry took command of the provisional force early on 19 February as the German attack developed. This makes the game’s references to the 26th, engineers, mines, antitank fighting, and Kasserine Pass more than generic North African scenery.

The chronology is nevertheless substantially rewritten. On the morning of 19 February the Germans had **not** already taken Kasserine Pass and voluntarily abandoned it, as Hawkins says in the game. The real Axis attack into the pass began that day. American defenders frustrated the initial effort on the 19th, while Axis forces finally cleared the pass and gained its exits on 20 February. The wider offensive continued toward Thala and Tébessa before Rommel withdrew after the Allied defense stiffened and the operation failed to achieve its larger objectives.

Accordingly, there is no documented historical mission in which Roger’s “Fox Company” retook an empty pass on the morning of 19 February, escorted engineers along the game’s exact route, recaptured the specific artillery pieces shown in the level, and immediately sent Rommel into retreat. The game combines recognizable ingredients from the real Kasserine fighting—1st Infantry Division elements, the 26th Infantry, combat engineers, minefields, armored attacks, and the pass itself—with invented characters, compressed timing, and composite objectives. The historical relationship is strongest at the level of **place, date, participating formations, terrain, and defensive circumstances**, not at the level of the player’s precise route or objectives.

## Marker Position Explanation

The stored marker is `35.2596, 8.7424`. This replaces the former Tunisia country fallback at `34, 9`.

The new point is tied to the mapped Battle of Kasserine Pass location and lies within the named pass/battlefield area. It is a much stronger fit because the game’s own structured location is “Kasserine Pass, Tunisia,” the mission date is 19 February 1943, and independent historical sources place 26th Infantry and 19th Engineer elements defending that pass as the Axis attack opened. A modern gazetteer places the named Kasserine Pass landform at approximately `35.25, 8.75`, about 1.3 km from the battle coordinate; this small difference illustrates why the battlefield should be treated as an area rather than a single exact spot.

`precision: approximate` is therefore intentional even though `confidence: high` is justified for the place identification. The battle covered the pass, slopes, roads, and exits, and the selected point must not be interpreted as the verified location of Roger’s fictional squad, a specific 26th Infantry foxhole, a particular minefield, the in-game village, or the full mission route. `method: wiki-location` records that the Wiki’s structured location field explicitly identifies Kasserine Pass; the historical research independently confirms that identification.

The adjacent missions do not require moving or merging markers for display purposes. “Tankers” currently remains a broad Tunisia fallback, while “Counterattack” is explicitly identified in its imported data as Kasserine on 22 February. The pass marker for “The Desert Fox” follows the evidence for this mission itself and also preserves the meaningful geographic distinction between the mountain-pass battle and the later Kasserine setting.

The stored Google Maps URL searches for the real named place, **Kasserine Pass, Kasserine Governorate, Tunisia**. The atlas marker uses the separately curated coordinates above rather than coordinates embedded in that outbound URL.

## Sources

- [Call of Duty Wiki — “The Desert Fox”](https://callofduty.fandom.com/wiki/The_Desert_Fox) — Game facts: playable character, 1st Infantry Division/Fox Company framing, Kasserine Pass location, 19 February 1943 date, objectives, mission sequence, and neighboring levels.
- [Call of Duty Wiki — “The Desert Fox/Transcript”](https://callofduty.fandom.com/wiki/The_Desert_Fox/Transcript) — Opening briefing and dialogue establishing “Near Kasserine,” the 09:10 time, the game’s claim that the 26th had been overrun and the pass taken, the 75 mm half-track, and the fictionalized plan to retake the pass.
- [Call of Duty Wiki — “Counterattack”](https://callofduty.fandom.com/wiki/Counterattack) — Confirms the next mission is set in Kasserine on 22 February 1943, helping distinguish the pass setting of this mission from the later town setting.
- [GameFAQs — *Call of Duty: Legacy* Guide and Walkthrough, “The Desert Fox” section](https://gamefaqs.gamespot.com/ps2/944148-call-of-duty-legacy/faqs/50167) — Supplemental route/objective detail for the playable level, including the tank defense, engineers, mined approach, village-like section, and later German positions.
- [U.S. Army Center of Military History — *The Corps of Engineers: The War Against Germany*](https://history.army.mil/Portals/143/Images/Publications/Publication%20By%20Title%20Images/C%20Pdf/corps-war-against-germany.pdf) — Authoritative history of the 19th Engineer Combat Regiment at Kasserine Pass, its mine-laying and defensive work, the presence of 1st Battalion, 26th Infantry, and Stark’s assumption of command as the 19 February attack began.
- [U.S. Army Center of Military History — World War II, European-African-Middle Eastern Theater](https://history.army.mil/Research/Reference-Topics/Army-Campaigns/Brief-Summaries/World-War-II/World-War-II-European-African-Middle-Eastern-Theater/) — Official campaign overview describing the German thrust through Kasserine Pass, the Allied withdrawal, and the later German retreat after the offensive was stopped.
- [The National WWII Museum — “Kasserine Pass: German Offensive, American Victory”](https://www.nationalww2museum.org/war/articles/kasserine-pass-german-offensive-american-victory) — Independent historical synthesis for the 19–22 February chronology, restrictive pass terrain, Allied minefields and defensive positions, the defense on the 19th, the Axis clearing of the pass on the 20th, and the later withdrawal.
- [Wikipedia — “Battle of Kasserine Pass”](https://en.wikipedia.org/wiki/Battle_of_Kasserine_Pass) — Modern reference for the named battle location and the published battlefield coordinate used as the atlas anchor; not used as the sole authority for the historical interpretation.
- [Mapcarta — “Kasserine Pass”](https://mapcarta.com/17285576) — Modern gazetteer cross-check, based on GeoNames/Wikidata/OpenStreetMap-linked data, placing the named pass in Kasserine Governorate at approximately `35.25, 8.75`; used only to bound the modern landform, not as historical evidence.
