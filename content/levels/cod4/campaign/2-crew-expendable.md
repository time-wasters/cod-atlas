---
id: cod4-crew-expendable
title: Crew Expendable
games:
  - cod4
mode: singleplayer
campaign:
  id: "1"
  label: Prologue
wikiArticle: codwiki-crew-expendable
locations:
  - id: main
    country: Bering Strait
    region: Bering Strait
    latitude: 65.8
    longitude: -168.8
    precision: region
    confidence: fallback
    method: region-fallback
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Bering+Strait
      - wikipedia: https://en.wikipedia.org/wiki/Bering_Strait
verified:
  locations:
    byHuman: true
    user: github/PLP-GTR
    reason: Bering strait must be enough. There are no other clues.
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

“Crew Expendable” is the second campaign mission in *Call of Duty 4: Modern Warfare*. On Day 1 of the game’s 2011 timeline, at 01:23:36, the player controls Sgt. John “Soap” MacTavish of the 22nd SAS Regiment. The mission itself deliberately gives only the location **“Somewhere near the Bering Strait.”** Captain Price briefs the team that intelligence from a Russian informant has identified a medium freighter of Estonian registration, number 52775, carrying a suspicious package. Activision’s later official retrospective likewise describes the mission as a British Special Forces raid on an Estonian ship in the Bering Strait to locate and obtain a rogue nuclear device.

The SAS team inserts by helicopter in a storm, boards the freighter from above, clears the bridge and interior compartments, descends through the vessel to the cargo hold, finds the suspected nuclear material and a manifest linking the shipment to Khaled Al-Asad, and then escapes after the ship is attacked and begins to sink. The boarding, firefights, nuclear shipment, hostile aircraft attack, sinking and last-second helicopter extraction are elements of the campaign narrative rather than documented historical events.

The preceding mission, **F.N.G.** (`cod4-f-n-g`), explicitly prepares Soap for the cargo-ship operation, so it establishes the immediate narrative relationship but supplies no additional geographic clue for the freighter. The following mission, **The Coup**, changes character and location and likewise does not constrain the ship’s position. The multiplayer map **Wet Work** (`cod4-wet-work`) is documented as an adaptation of the same freighter combat space; that relationship is useful for identifying the setting, but it does not provide a canonical real-world ship coordinate.

## The Real Place & Differences

The Bering Strait is a real, narrow maritime passage between Alaska and Russia connecting the Bering Sea with the Chukchi Sea and Arctic Ocean. NOAA describes the Diomede Islands as lying in the middle of the strait and dividing it into eastern and western channels; the international boundary also runs between Big Diomede and Little Diomede. National Park Service material similarly emphasizes that the strait separates Alaska and Russia and that the two Diomede islands belong to different countries.

That regional geography fits the game’s stated setting, so the **real-place match is confirmed at the Bering Strait regional scale**. It is not, however, a confirmed match to a particular channel, coastline, island, cape, port or wreck site. The mission presents an isolated freighter in severe weather and does not name or visibly establish a shore landmark that could fix the ship more closely. No independent evidence was found tying the game’s Estonian registration number 52775 or the vessel identified in later game material as *Väljakutse* to a real freighter operating there.

The most important difference is therefore scale: the real Bering Strait is a transboundary maritime region with recognizable islands, coastlines and two principal channels, while the playable level is almost entirely a fictional shipboard combat space. The game’s wording “somewhere near” the strait is intentionally broader than a point location.

## The Real Mission & Differences

No matching real 2011 operation was found in which the 22nd SAS Regiment boarded an Estonian freighter in the Bering Strait to recover a rogue nuclear device. The 22nd SAS Regiment is a real British special-forces formation; the National Army Museum records its post-war formation and describes its modern roles and deployments. The same museum describes the Special Boat Service as Britain’s maritime special-forces unit and notes its long-standing maritime counter-terrorism responsibilities.

That organizational context does **not** prove that SAS personnel could not conduct a maritime boarding, especially because detailed United Kingdom Special Forces tasking is often not public. It does mean there is no basis for converting the game’s unit, target vessel, nuclear cargo, enemy security detail, hostile aircraft attack or sinking into a documented historical operation. The closest defensible classification is therefore **a confirmed real geographic region used for a fictionalized/composite special-forces mission**.

The mission date should likewise be treated as part of the fictional 2011 campaign chronology, not as the date of a known Bering Strait incident. The historical comparison can confirm the existence and broad capabilities of the represented British formations, but no evidence was found for the specific raid portrayed in the level.

## Marker Position Explanation

The stored atlas coordinate remains **`65.8, -168.8`**. It is retained because it is a reasonable representative point within the real Bering Strait and does not require inventing a specific ship route or wreck position. Scientific work on Bering Strait circulation places long-running observation sites across the eastern and western channels around this latitude and longitude range, which supports the point as being geographically inside the strait rather than on an unrelated shore. The coordinate is nevertheless only a regional anchor; it is not evidence for where the fictional freighter was boarded or sank.

The metadata is therefore changed from `precision: country` to **`precision: region`**, while retaining **`confidence: fallback`** and **`method: region-fallback`**. The location identity “Bering Strait” is explicit and well supported, but the point itself exists only to represent that broad setting. The existing `country: Bering Strait` water-body label is retained rather than arbitrarily assigning the level to Russia or the United States, because the mission never identifies which national channel or side of the strait the ship occupies.

A seemingly more precise candidate exists in the related **Wet Work** record at approximately `65.8938131, -168.3953957`, but its own method is `manual-approximate`. No game, official, historical or geographic source was found that fixes the freighter to those decimal coordinates. Reusing that point would therefore add numerical precision without adding evidential accuracy. For the campaign mission, retaining the coarser `65.8, -168.8` regional point is more defensible.

Google Maps searches for the real named place **Bering Strait**, while the atlas marker continues to use the separately curated coordinate `65.8, -168.8`. The marker must not be interpreted as the position of *Väljakutse*, a wreck site, a documented SAS operation, the Diomede Islands, or a claim that the mission occurs specifically in Russian or United States territorial waters.

## Sources

- [Call of Duty Wiki — Crew Expendable](https://callofduty.fandom.com/wiki/Crew_Expendable) — Game-level facts, campaign order, playable character, objectives, freighter setting and relationship to *Wet Work*.
- [Call of Duty Wiki — Crew Expendable/Transcript](https://callofduty.fandom.com/wiki/Crew_Expendable/Transcript) — Supports the on-screen “Somewhere near the Bering Strait” location, Day 1 timestamp, 22nd SAS identification, Estonian registration number 52775 and mission briefing/action.
- [Call of Duty Maps — Call of Duty 4: Modern Warfare Campaign](https://callofdutymaps.com/cod-4-modern-warfare/campaign-12/) — Campaign chronology; lists *F.N.G.* as preparation for the cargo-ship operation and *Crew Expendable* as the Day 1 Bering Strait infiltration.
- [Activision Games Blog — Modern Warfare Editions / “Crew Expendable” Operator Pack](https://blog.activision.com/ca/fr/call-of-duty/2019-05/Announcement-Call-of-Duty-Modern-Warfare-Editions-Now-Available-for-Pre-Order) — Official publisher retrospective identifying Soap, the Estonian ship, the Bering Strait and the objective of locating a rogue nuclear device.
- [Call of Duty Wiki — Wet Work](https://callofduty.fandom.com/wiki/Wet_Work) — Supports the documented multiplayer relationship to the *Crew Expendable* freighter; it does not establish a real ship position.
- [NOAA Fisheries — Strait Connecting Pacific and Arctic Oceans Larger Than Previously Measured](https://www.fisheries.noaa.gov/feature-story/strait-connecting-pacific-and-arctic-oceans-larger-previously-measured) — Authoritative geographic description of the Bering Strait, including Russia/Alaska, the Diomede Islands and the eastern/western channels.
- [U.S. National Park Service — How Close is Alaska to Russia?](https://www.nps.gov/anch/learn/historyculture/how-close-is-alaska-to-russia.htm) — Confirms the Alaska–Russia geography and the international division between Little and Big Diomede.
- [University of Washington / Woodgate & Aagaard — Revising the Bering Strait freshwater flux into the Arctic Ocean](https://psc.apl.washington.edu/HLD/Bstrait/BSFWpaper.html) — Peer-reviewed regional geography with observation points across the Bering Strait; used only to verify that the representative atlas coordinate lies within the strait-scale study area, not to infer the fictional ship’s route.
- [National Army Museum — Special Air Service](https://www.nam.ac.uk/explore/SAS) — Historical background on the SAS and 22nd SAS Regiment.
- [National Army Museum — Special Boat Service](https://www.nam.ac.uk/explore/special-boat) — Historical background on Britain’s maritime special-forces organization and maritime counter-terrorism role; used as organizational context, not as evidence of a specific Bering Strait operation.
