---
id: wwii-the-tortured-path
title: The Tortured Path
games:
  - wwii
mode: multiplayer
wikiArticle: codwiki-the-tortured-path
locations:
  - id: main
    country: Antarctica
    region: New Swabia
    latitude: -72.0
    longitude: 5.0
    precision: region
    confidence: high
    method: article-context
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Queen+Maud+Mountains%2C+Antarctica
      - wikipedia: https://en.wikipedia.org/wiki/New_Swabia
  - id: atlantic-ocean-2
    country: Atlantic Ocean
    latitude: 26.0
    longitude: -38.0
    precision: region
    confidence: fallback
    method: region-fallback
    primary: false
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Atlantic+Ocean
      - wikipedia: https://en.wikipedia.org/wiki/Atlantic_Ocean
  - id: spain-3
    country: Spain
    region: Andalusia
    city: Málaga
    landmark: Port of Málaga
    latitude: 36.7167
    longitude: -4.4167
    precision: approximate
    confidence: high
    method: article-context
    primary: false
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Port+of+M%C3%A1laga%2C+M%C3%A1laga%2C+Spain
      - wikipedia: https://en.wikipedia.org/wiki/Port_of_M%C3%A1laga
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

The atlas classifies **The Tortured Path** as `multiplayer`; more specifically, it is a cooperative Nazi Zombies story map rather than a singleplayer campaign mission or a conventional competitive arena. It follows **The Shadowed Throne** and precedes **The Frozen Dawn**. The Call of Duty Wiki dates it to months after 18–19 April 1945 and identifies the principal playable cast as Drostan Hynd, Olivia Durant, Marie Fischer, and Jefferson Potts, working with the newly formed Bureau of Archaic Technologies (B.A.T.).

The level is divided into three mission-based chapters. In **Into the Storm**, the team must move the pieces of Barbarossa's Sword toward a port and fight through a storm-lashed settlement. The Wiki labels the chapter “Northern Spain” and its briefing says the caravan is trying to reach Málaga, but Activision's own contemporary description is more specific: it says the action takes place in the destroyed Allied port town of **Málaga**, from which the group departs by sea. **Across the Depths** takes place aboard the **U.S.S. Mount Olympus**, a rocking cargo ship crossing the Atlantic toward Antarctica while the team survives timed objectives and undead attacks. **Beneath the Ice** ends the journey at an underground Nazi dig site where the sword is reforged; its briefing explicitly calls the area **Neuschwabenland**.

The Wiki's structured location field combines “Deception Island, New Swabia, Antarctica” for Beneath the Ice. That combination should not be read literally as one real place. Later Zombies lore describes Deception Island as the convoy's Antarctic staging point and New Swabia as the place where the Raven team actually reforged the sword, which is consistent with the chapter briefing naming Neuschwabenland.

## The Real Place & Differences

Overall, **The Tortured Path is a composite or fictionalized setting built from several real names and places**.

For **Into the Storm**, Málaga is the strongest real anchor. The Port Authority of Málaga places the real port on the southern Mediterranean coast at approximately 36°43′N, 4°25′W. That directly contradicts the Wiki's broader “Northern Spain” label, while agreeing with Activision's official description of the playable chapter as the port town of Málaga. The level's winery, windmill, storm damage, fortifications, and compact combat layout should therefore be treated as a fictionalized combat space in or near Málaga, not a reconstruction of a documented quarter of the city or port.

For **Across the Depths**, no source fixes the ship at a particular point in the Atlantic, so the ocean marker remains deliberately broad. There was, however, a real **USS Mount Olympus (AGC-8)**. The U.S. Naval History and Heritage Command records it as an amphibious-force flagship commissioned in 1944 and later selected as flagship for the U.S. Navy's Antarctic Operation Highjump. That name and Antarctic connection make the real ship a plausible historical inspiration, but no source found establishes that the Zombies vessel is intended as an exact reconstruction. The real Mount Olympus's Antarctic deployment also followed a different route and chronology.

For **Beneath the Ice**, **New Swabia (Neuschwabenland)** is a real historical area of Dronning Maud Land surveyed by the German Antarctic Expedition of 1938–39. The SCAR Composite Gazetteer gives the regional reference position as 72°00′S, 5°00′E. The map's underground Nazi installation, ancient altar, Geistkraft machinery, Guardian, and supernatural sword-forging site have no verified real counterpart.

**Deception Island is a different real place** in the South Shetland Islands, near 62°57′S, 60°38′W. The SCAR reference positions for Deception Island and New Swabia are roughly 2,800 km apart, so the Wiki phrase “Deception Island, New Swabia” is geographically impossible in the real world. Deception Island remains relevant to the fictional route, but it is weaker than New Swabia for the primary marker because the final chapter's own briefing names Neuschwabenland.

## The Real Mission & Differences

No documented real 1945 operation matches the B.A.T. journey, the transportation and reforging of Barbarossa's Sword, or the undead battles.

The Málaga chapter is alternate history. Spain remained outside the Allied war effort during World War II; contemporary U.S. diplomatic records describe Franco's government as maintaining neutrality, despite its political sympathies and complicated relations with both sides. Activision's description of Málaga as an “Allied port town” therefore does not describe the historical status of Málaga in 1945.

The ship chapter deliberately or coincidentally overlaps with a striking real Antarctic connection. **USS Mount Olympus** was a real U.S. Navy command ship, but in May 1945 it was serving in the Pacific Fleet. It became flagship for **Operation Highjump** only after the war, sailing from Norfolk in December 1946 and reaching the Antarctic expedition area in January 1947. Highjump was a U.S. Navy polar training, logistics, surveying, and exploration operation, not a 1945 voyage from Málaga and not an assault on an active Nazi Antarctic base.

The closest real German context for Beneath the Ice is the **German Antarctic Expedition of 1938–39**, which surveyed the area later called Neuschwabenland. A peer-reviewed review in *Polar Record* concludes that there was no secret wartime German base in Dronning Maud Land and that Operation Highjump was not an attack on such a base. Conversely, **Deception Island did have a real wartime base in 1944**, but it was British: Operation Tabarin established Base B there on 3 February 1944. The game therefore combines a real German pre-war survey area, a real British wartime Antarctic base, a real American post-war Antarctic expedition, and a real U.S. Navy ship into a fictional post-1945 supernatural route.

## Marker Position Explanation

The primary stored coordinates are `-72.0, 5.0` for **New Swabia**. These are the SCAR Composite Gazetteer's published regional reference coordinates, not the location of a verified Nazi base, dig site, altar, or underground complex. `precision: region` is appropriate because Neuschwabenland covers a large area and the game gives no defensible real-world position within it. `confidence: high` reflects the final chapter briefing's explicit naming of Neuschwabenland, while `method: article-context` is used because the Wiki's structured field conflates New Swabia with geographically separate Deception Island and therefore cannot safely be followed literally.

The Málaga marker is `36.7167, -4.4167`, derived from the Port Authority of Málaga's general position of 36°43′N, 4°25′W. It is stored as `precision: approximate`, `confidence: high`, and `method: article-context`: Activision explicitly places Into the Storm in the port town of Málaga, but there is no evidence tying the fictional winery/windmill combat area to one exact real dock, street, or building. The point anchors the real port area only.

The Atlantic marker remains `26.0, -38.0`. It is intentionally `precision: region`, `confidence: fallback`, and `method: region-fallback`. No source fixes the U.S.S. Mount Olympus at that point during Across the Depths; the coordinate is only a representative Atlantic marker retained for the chapter's otherwise unlocated ocean transit and must not be interpreted as a historical or canonical ship position.

**Deception Island was considered and rejected as the primary Antarctic marker.** It is a real and important place in the Zombies storyline, but the final chapter briefing explicitly names Neuschwabenland and later lore distinguishes Deception Island as a staging/return point from New Swabia. Real-world geography also proves that Deception Island is not within New Swabia.

The Google Maps URLs search for the real named places **New Swabia**, **Port of Málaga**, and **Atlantic Ocean**. The atlas marker coordinates are curated independently from those outbound searches.

## Sources

- [Call of Duty Wiki — The Tortured Path](https://callofduty.fandom.com/wiki/The_Tortured_Path) — Supports the cast, approximate chronology, three-chapter structure, chapter objectives, U.S.S. Mount Olympus name, and the Wiki's Northern Spain / Deception Island / New Swabia location claims.
- [Call of Duty — “The New Nazi Zombies DLC Puts a Three-Part Spin on the Epic Adventure”](https://www.callofduty.com/ca/en/blog/archives/the-new-nazi-zombies-dlc-puts-a-three-part-spin-on-the-epic-adventure) — Official 2018 description explicitly placing Into the Storm in the destroyed port town of Málaga, Across the Depths on a rocking cargo ship, and Beneath the Ice at a secret frozen Nazi dig site.
- [Call of Duty Wiki — Sword of Barbarossa](https://callofduty.fandom.com/wiki/Sword_of_Barbarossa) — Supports the fictional distinction between arrival at Deception Island and the reforging of the sword in New Swabia; used to resolve the Wiki infobox's geographic conflation.
- [Port Authority of Málaga — General Information](https://www.puertomalaga.com/en/general-information/) — Authoritative real-place description and reference position for the Port of Málaga: 36°43′N, 4°25′W.
- [U.S. Naval History and Heritage Command — Mount Olympus (AGC-8)](https://www.history.navy.mil/research/histories/ship-histories/danfs/m/mount-olympus.html) — Official history of the real USS Mount Olympus, including its 1945 Pacific service and later role as Operation Highjump flagship.
- [U.S. Naval History and Heritage Command — Polar Exploration](https://www.history.navy.mil/browse-by-topic/exploration-and-innovation/polar-exploration0.html) — Supports the real post-war Operation Highjump context and its Antarctic charting role.
- [U.S. Army / Combined Arms Research Library — Army observers' report of Operation Highjump](https://cgsc.contentdm.oclc.org/digital/collection/p4013coll11/id/860/) — Contemporary government documentation of the 1946–47 Naval Antarctic Development Project and its operational/scientific program.
- [SCAR Composite Gazetteer — Neuschwabenland](https://data.aad.gov.au/aadc/gaz/display_name.cfm?gaz_id=107016) — Authoritative regional reference coordinates `-72.0, 5.0` and documentation connecting the name to the German Antarctic Expedition of 1938–39.
- [SCAR Composite Gazetteer — Deception Island](https://data.aad.gov.au/aadc/gaz/display_name.cfm?gaz_id=124209) — Authoritative identification and reference coordinates for the separate South Shetland island, used to demonstrate that it is not in New Swabia.
- [British Antarctic Survey — Operation Tabarin: first bases](https://www.bas.ac.uk/about/about-bas/history/operation-tabarin/gallery/) — Documents the British establishment of Base B at Deception Island on 3 February 1944.
- [Summerhayes & Beeching, *Polar Record* — “Hitler's Antarctic base: the myth and the reality”](https://www.cambridge.org/core/journals/polar-record/article/hitlers-antarctic-base-the-myth-and-the-reality/56465FFEA98E416F559C7F02AB20CE19) — Peer-reviewed assessment separating the 1938–39 German expedition, Operation Tabarin, and Operation Highjump from later claims of a secret German Antarctic base.
- [U.S. Department of State, Office of the Historian — 1943 discussion of Spanish neutrality](https://history.state.gov/historicaldocuments/frus1943v02/d554) — Contemporary diplomatic evidence for Spain's non-belligerent/neutral position, relevant to the game's fictional “Allied port town” description of Málaga.
