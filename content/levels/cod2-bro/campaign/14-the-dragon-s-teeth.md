---
id: cod2-bro-the-dragon-s-teeth
title: The Dragon's Teeth
games:
  - cod2-bro
mode: singleplayer
campaign:
  id: "4"
  label: Western Europe
wikiArticle: codwiki-the-dragon-s-teeth
mapOverlay:
  image: /images/levels/cod2-bro/campaign/14-the-dragon-s-teeth/maps/overlay.png
  opacity: 0.72
  corners:
    topLeft: [51.29601087, -3.25042718]
    topRight: [51.49830905, 8.59881191]
    bottomLeft: [47.03803329, -3.07131693]
    bottomRight: [47.25857388, 8.77643992]
  attribution:
    title: "Call of Duty 2: Big Red One - The Dragon's Teeth loading-screen map"
    source: "Directly extracted from Call of Duty 2: Big Red One by plp-gtr."
    sourceUrl: https://github.com/time-wasters/cod-atlas/blob/main/public/images/maps/cod2-bro/the-dragon-s-teeth.png
    extractedBy: plp-gtr
    extractedByUrl: https://github.com/plp-gtr
    copyrightHolder: Activision Publishing, Inc.
    rights: non-free
    rightsNotice: "The extraction is contributed to CoD Atlas; the underlying copyrighted game artwork remains the property of Activision and is used for identification and geographic comparison."
    rightsNoticeUrl: https://www.activision.com/legal/terms-of-use
locations:
  - id: main
    country: Germany
    region: North Rhine-Westphalia
    city: Losheim
    landmark: Westwall - Tank Barrier Losheim
    latitude: 50.348258
    longitude: 6.395606
    precision: exact
    confidence: medium
    method: real-world-inspiration
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Westwall+Tank+Barrier+Losheim%2C+Hellenthal%2C+Germany
      - wikipedia: https://de.wikipedia.org/wiki/Losheim_%28Hellenthal%29
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

*The Dragon's Teeth* is the final singleplayer mission of *Call of Duty 2: Big Red One*. The game places Sergeant Roland Roger and Fox Company of the U.S. 1st Infantry Division at "The Siegfried Line, Germany" on 19 January 1945 at 1015 hours. The stated objective is to secure a route across the Siegfried Line for General Patton's tanks.

The mission is explicitly continuous with *The Last Train* (`cod2-bro-the-last-train`): its transcript says it begins where the previous level ended. *The Last Train* is set near Buchholz at 0720 the same morning and finishes after Roger's group passes through a railway station and abandons a captured Panzer when it runs out of fuel. Roughly three hours later, *The Dragon's Teeth* sends the squad through a wooded German defensive belt of bunkers, wire and concrete anti-tank obstacles. Alvin Bloomfield is killed by mortar fire while opening a wire obstacle; the squad then crosses the main fortifications, clears another bunker, crosses a frozen river/bridge, and destroys two V-2 rockets before a Sherman column arrives.

These are game events, not a documented historical reconstruction. The mission combines recognizable Westwall features with an invented tactical route and a V-2 set piece.

## The Real Place & Differences

Losheim is a border village in the municipality of Hellenthal, North Rhine-Westphalia, directly beside Belgium. This is genuine Westwall country. Hellenthal's municipal history describes the Westwall here as a defensive system of concrete anti-tank obstacles (*Höckerlinien*, or "dragon's teeth") and bunkers. Municipal planning documents are more specific: south of Losheim, two concrete *Höckerlinien* belonging to the protected monument "Westwallanlage" follow the Belgian border. A separately catalogued surviving section on the B265 is recorded as **Westwall - Tank Barrier Losheim** at the coordinates used by this level.

The location also fits the campaign's immediate geography better than a generic Germany marker. The previous mission is explicitly "near Buchholz" and ends at a railway station. Buchholz station was a real wartime railway position in the Losheimergraben/Losheim-gap border corridor, although its documented December 1944 defenders were the 394th Infantry Regiment of the 99th Infantry Division, not Roger's 1st Infantry Division. That mismatch is important: the game appears to reuse real Ardennes/Westwall geography while changing unit, date and action.

**Match classification:** **composite or fictionalized setting**, anchored to a **plausible real-world inspiration/analogue** at Losheim. No evidence was found that the developers intended this exact surviving barrier, and the in-game bunker/river/V-2 layout should not be read as a map of the modern site.

## The Real Mission & Differences

The 1st Infantry Division's real position on 19 January 1945 does not match the mission's immediate breach of the German frontier. U.S. Army history describes V Corps beginning its counteroffensive on 15 January, with the 1st Division assigned to help open the Ondenval defile in eastern Belgium. The 23d Infantry Regiment of the 2d Division was attached to the 1st Division for that drive. Contemporary/divisional material reproduced by the European Center of Military History places fighting on 19 January at Eibertingen, Iveldingen and Montenau, with the division's line by 20 January running roughly Deidenberg-Eibertingen-Schoppen. In other words, the division was still fighting through the Belgian Ardennes rather than conducting the depicted Losheim Westwall crossing that morning.

The Patton objective is also chronologically and organizationally compressed. The 1st Division was operating under First Army's V Corps. The U.S. Army's *The Last Offensive* states that Patton's Third Army only drew up to the German frontier from the Losheim Gap southward at the **end of January**, with its Eifel offensive opening in early February. A 19 January mission in which Fox Company clears a Westwall route specifically for Patton's tanks is therefore not a documented 1st Division operation.

The V-2 episode is likewise unsupported as a Losheim event. The Smithsonian describes the V-2 as a mobile-launched long-range weapon used overwhelmingly against cities such as London and Antwerp. U.S. Army history identifies the March 1945 attack on the Ludendorff Bridge at Remagen as the only tactical use of V-weapons during the war. No evidence was found for a two-rocket V-2 position beside this Losheim barrier on 19 January. The rockets are best treated as a dramatic fictional element rather than evidence for a more precise launch-site marker.

## Marker Position Explanation

The stored marker is `50.348258, 6.395606`, the published position of the surviving **Westwall - Tank Barrier Losheim** on the B265 near Losheim. The point replaces the previous Germany-wide fallback at `51, 9` with a real, surviving feature that directly matches the mission's defining terrain: a Westwall anti-tank *Höckerlinie*. Its location on the German-Belgian border also preserves the geographic logic of the same-morning progression from *The Last Train*'s Buchholz/railway setting toward the Siegfried Line without forcing the two levels to share a marker.

`precision: exact` refers only to the resolution of the selected real landmark: the coordinates identify a documented surviving tank barrier. `confidence: medium` reflects the weaker level-to-landmark identification: the game names only the Siegfried Line in Germany, not Losheim or this exact barrier. `method: real-world-inspiration` is therefore more defensible than `verified-landmark` for the mission itself.

A marker around Eibertingen/Iveldingen would be stronger for the **1st Infantry Division's real 19 January 1945 fighting**, but weaker for what the game actually depicts because those places are in Belgium and are not the German Siegfried Line crossing shown in the level. The old `51, 9` point is weaker still because it represents only Germany and has no mission-specific historical or geographic relationship. The selected Losheim point is consequently the best atlas anchor for the depicted setting, while the prose preserves the historical contradiction.

The Google Maps URL deliberately searches for the named real place, **Westwall Tank Barrier Losheim, Hellenthal, Germany**. The atlas marker uses the separately curated coordinates above; the Maps query is not the source of the marker position.

## Sources

- [The Dragon's Teeth — Call of Duty Wiki](https://callofduty.fandom.com/wiki/The_Dragon%27s_Teeth) — Game facts for character/unit, stated Siegfried Line location, 19 January 1945 time, Patton objective, bunkers, dragon's teeth, V-2 rockets and mission ending.
- [The Dragon's Teeth/Transcript — Call of Duty Wiki](https://callofduty.fandom.com/wiki/The_Dragon%27s_Teeth/Transcript) — Confirms the level begins where the previous mission ended and supplies the in-game route/context through the German defenses.
- [The Last Train — Call of Duty Wiki](https://callofduty.fandom.com/wiki/The_Last_Train) — Establishes the preceding mission near Buchholz at 0720 on the same date and its railway-station objective, which is important to the marker's campaign continuity.
- [Westwall — Gemeinde Hellenthal](https://www.hellenthal.de/freizeit-tourismus/sehenswertes/westwall) — Municipal overview confirming that the local Westwall consisted of *Höckerlinien* and bunkers and that surviving structures remain around Hellenthal.
- [Bebauungsplan Nr. 63, Begründung — Gemeinde Hellenthal (PDF)](https://www.hellenthal.de/fileadmin/user_upload/lns-placeholder-files/webseite/bauen/baumassnahmen-planung/Bebauungsplan_Nr._63__Flaechen_fuer_Windenergieanlagen_in_Losheim/Anlage_3_-_Begruendung.pdf) — Official local planning document stating that two concrete *Höckerlinien* of the protected "Westwallanlage" follow the Belgian border in the southern Losheim area.
- [Westwall - Tank Barrier Losheim — TracesOfWar](https://www.tracesofwar.com/sights/11171/Westwall---Tank-Barrier-Losheim.htm) — Catalogues the surviving Losheim dragon's-teeth barrier on the B265 and provides the marker coordinates `50.348258, 6.395606`; used together with the municipal sources rather than as sole historical authority.
- [German Failure on the North Shoulder: The Ardennes, December 1944 — Army Historical Foundation](https://armyhistory.org/german-failure-on-the-north-shoulder-the-ardennes-december-1944/) — Places the 99th Infantry Division's 3/394 around Buchholz station in December 1944, showing that the real railway position belongs to a different unit/date than the game's January sequence.
- [The Last Offensive — U.S. Army Center of Military History (PDF)](https://history.army.mil/portals/143/Images/Publications/catalog/7-9.pdf) — Authoritative account of the January 1945 V Corps counteroffensive, the 1st Division's assignment at the Ondenval defile, and Third Army reaching the Losheim-gap frontier only at the end of January.
- [1st Infantry Division – Dom Butgenbach – January 1945 — European Center of Military History](https://eucmh.com/2022/10/18/1st-infantry-division-dom-butgenbach-january-1945/2/) — Secondary publication reproducing detailed period/divisional material for the 19 January fighting at Eibertingen, Iveldingen and Montenau; used to refine the date-specific comparison with the game.
- [V-2 Missile — Smithsonian National Air and Space Museum](https://airandspace.si.edu/collection-objects/missile-surface-surface-v-2-4/nasm_A19600342000) — Explains the V-2's mobile launch system, strategic city-target role and the rarity of tactical employment.
- [The Corps of Engineers: The War Against Germany — U.S. Army Center of Military History (PDF)](https://history.army.mil/portals/143/Images/Publications/catalog/10-22.pdf) — Identifies the March 1945 V-2 attack on the Ludendorff Bridge at Remagen as the only tactical use of V-weapons during the war.
