---
id: bo7-exposure
title: "Exposure"
games:
  - bo7
mode: singleplayer
wikiArticle: codwiki-exposure-mission
locations:
  - id: avalon
    country: France
    region: French Riviera
    latitude: 43.32
    longitude: 6.67
    precision: region
    confidence: medium
    method: real-world-inspiration
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=French+Riviera%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/French_Riviera
  - id: arlington-national-cemetery
    country: United States
    region: Virginia
    city: Arlington
    landmark: Arlington National Cemetery
    latitude: 38.8792
    longitude: -77.0722
    precision: exact
    confidence: high
    method: verified-landmark
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Arlington+National+Cemetery%2C+Arlington%2C+Virginia%2C+USA
      - wikipedia: https://en.wikipedia.org/wiki/Arlington_National_Cemetery
  - id: nicaragua-hallucination
    country: Nicaragua
    region: North Caribbean Coast Autonomous Region
    city: Wasa King
    latitude: 13.857
    longitude: -84.337
    precision: city
    confidence: medium
    method: article-context
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Wasa+King%2C+Rosita%2C+Nicaragua
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

"Exposure" is the opening campaign mission of *Call of Duty: Black Ops 7*. It follows David "Section" Mason and the JSOC team Specter One in 2035. The opening scene places Mason at the cemetery where Frank Woods has been buried, where Troy Marshall recruits him to investigate the Guild's activities in Avalon. The playable operation then begins on June 18, 2035 at a Guild research facility in southern Avalon. Specter One infiltrates the site, reaches the server room, steals data from a quantum computer, and plants explosives while investigating the Guild's role in the wider threat.

The operation changes when the team is exposed to the Guild's Cradle-derived toxin. Mason and the others enter a shared hallucination that reconstructs Nicaragua through distorted terrain, floating landforms, giant objects, and a version of Raul Menendez's compound. Mason recognizes the setting as connected with Menendez and Nicaragua, and the sequence culminates in a confrontation with a hallucinated Menendez. This part of the mission is deliberately psychological rather than a literal return to 1980s Nicaragua.

The mission also establishes geography used by later campaign levels. "Inside" (`bo7-inside`) continues in Avalon, so the primary marker should remain tied to Avalon's Mediterranean setting rather than to the opening cemetery or the hallucination. The Nicaraguan sequence, however, has a direct relationship to the Menendez material revisited from *Black Ops II*, especially "Time and Fate" (`bo2-time-and-fate`).

## The Real Place & Differences

Avalon is a fictional Mediterranean city-state rather than a place that can be assigned a verified real coordinate. Official *Black Ops 7* material describes it as a sprawling Mediterranean city, while the series' Avalon lore places its pre-independence territory in southern France. That combination makes the French Riviera the strongest broad real-world analogue: it is the real Mediterranean coast of southeastern France and is geographically more consistent with Avalon's stated background than the previous generic central-Mediterranean point. This is a **plausible inspiration/analogue**, not a confirmed developer-identified location. No reliable source was found that justifies identifying Avalon specifically with Monaco, Nice, Cannes, Saint-Tropez, or another single city.

The cemetery scene has a much stronger real-world anchor. The game material inconsistently calls it "Arlington Memorial Cemetery" in some places, while related character material identifies the intended site as Arlington National Cemetery in Arlington, Virginia. Arlington National Cemetery is therefore treated as a **confirmed real location** for the opening scene, although Frank Woods's grave and the meeting depicted there are fictional.

The Nicaragua hallucination can also be narrowed beyond a country fallback. Official *Black Ops 7* material for the related multiplayer map "Fate" describes the same campaign memory-space as a warped vision of Menendez's Nicaraguan compound. In *Black Ops II*, "Time and Fate" identifies the Menendez operation with Wasa King in Nicaragua's then-named Atlántico Norte region. Wasa King (also written Wasakin) is a real community in the municipality of Rosita, now in the North Caribbean Coast Autonomous Region. Nicaraguan government and university sources independently confirm the community's existence. The game compound, mansion, bunker, and surrounding combat layout are fictionalized and should not be treated as real structures at Wasa King.

## The Real Mission & Differences

There is no documented real-world equivalent of Specter One's 2035 raid on the Guild Research Facility. The Guild, the facility, Cradle exposure, quantum-computer theft, and the operation in Avalon are fictional elements of the *Black Ops* timeline. The French Riviera marker therefore represents only a defensible geographical analogue for Avalon, not the site of a historical military action.

The Nicaragua segment is likewise not evidence of a real Menendez raid. "Time and Fate" depicts a fictional 1986 CIA/Panamanian assault on Raul Menendez's organization around Wasa King. The real historical context in Nicaragua during the 1980s was the Sandinista-Contra conflict and extensive United States involvement with the Contra forces. U.S. State Department historical material documents covert assistance, congressional disputes, and the later Iran-Contra affair, but it does not document the game's raid on a Menendez cartel compound at Wasa King. The connection to Wasa King is therefore an inter-game geographic reference, not confirmation that the fictional operation occurred there historically.

## Marker Position Explanation

The primary Avalon marker is stored at `43.32, 6.67`. It is a representative regional point on the French Riviera rather than a supposed location of the Guild Research Facility. `precision: region`, `confidence: medium`, and `method: real-world-inspiration` reflect the evidence: official material establishes a Mediterranean Avalon and series lore associates its origin with southern France, but no source fixes Avalon to a real city. This is a better-supported fit than the former `35, 18` central-Mediterranean fallback because it incorporates the south-French geographic clue while still avoiding false city-level precision. Monaco was considered as a visually and politically plausible analogue but rejected as a marker because no developer or authoritative game source was found that identifies it as Avalon's model.

The Arlington marker is stored at `38.8792, -77.0722` and identifies Arlington National Cemetery itself. It uses `precision: exact`, `confidence: high`, and `method: verified-landmark` because the real cemetery is identifiable and independently verifiable. The point must not be interpreted as the exact location of Frank Woods's fictional grave or of the characters' conversation within the cemetery.

The hallucination marker is stored at `13.857, -84.337`, representing the real settlement of Wasa King. It uses `precision: city` in the atlas sense of a settlement-level location, `confidence: medium`, and `method: article-context`. The link is stronger than the previous Nicaragua-wide fallback because the related Menendez compound is explicitly tied through *Black Ops II*'s "Time and Fate" to Wasa King, but no evidence identifies an exact real compound or mansion there. The marker therefore represents the settlement connected to the fictional memory, not a building site.

The Google Maps URLs deliberately search for the real named places—French Riviera, Arlington National Cemetery, and Wasa King—while the atlas markers use the separately curated coordinates above.

## Sources

- [Call of Duty Wiki — Exposure (mission)](https://callofduty.fandom.com/wiki/Exposure_%28mission%29) — Game facts for the mission, characters, date, Avalon research facility, Nicaragua hallucination, and campaign relationships.
- [Call of Duty Wiki — Exposure transcript](https://callofduty.fandom.com/wiki/Exposure_%28mission%29/Transcript) — Supports the southern-Avalon infiltration, Guild R&D facility, mission card, Cradle exposure, and Mason's recognition of Nicaragua and Menendez.
- [Call of Duty — Black Ops 7 Campaign](https://www.callofduty.com/blackops7/campaign) — Official description of the 2035 campaign and Avalon as a sprawling Mediterranean city.
- [Call of Duty Blog — Black Ops 7 Reveal](https://www.callofduty.com/blog/2025/08/call-of-duty-black-ops-7-reveal-campaign-multiplayer-zombies) — Official campaign overview describing Avalon and the campaign's transitions into psychological mindscapes, including returns to earlier Black Ops locations.
- [Call of Duty Wiki — Avalon](https://callofduty.fandom.com/wiki/Avalon) — Series-lore background placing fictional Avalon on the Mediterranean and linking its earlier territory to southern France; used only to narrow the analogue, not as proof of a real city match.
- [Call of Duty Blog — Tactical Tour of Avalon](https://www.callofduty.com/blog/2026/03/black-ops-7-black-ops-royale-tour-of-avalon) — Official environmental description of Avalon's varied fictional districts and terrain, supporting treatment of the city as a constructed/composite setting rather than a one-to-one real map.
- [Wikipedia — French Riviera](https://en.wikipedia.org/wiki/French_Riviera) — Geographic and coordinate reference for the real Mediterranean coast of southeastern France; its representative regional coordinate rounds to the stored `43.32, 6.67`. It supports the analogue only, not a claim of confirmed game inspiration.
- [Arlington National Cemetery — Visit](https://www.arlingtoncemetery.mil/Visit) — Official U.S. Army cemetery authority confirming the real Arlington, Virginia landmark used to anchor the opening scene.
- [Wikipedia — Arlington National Cemetery](https://en.wikipedia.org/wiki/Arlington_National_Cemetery) — Coordinate cross-check for the cemetery landmark; its published site coordinate rounds to the stored `38.8792, -77.0722`.
- [Call of Duty Wiki — Troy Marshall](https://callofduty.fandom.com/wiki/Troy_Marshall) — Resolves the game-gallery wording “Arlington Memorial Cemetery” by identifying Mason and Marshall’s meeting place as Arlington National Cemetery.
- [Call of Duty Blog — Black Ops 7 Season 01](https://www.callofduty.com/blog/blackops7/season-01) — Official description of "Fate" as a warped vision of Menendez's Nicaraguan compound derived from Mason's campaign hallucination, strengthening the link between "Exposure" and the earlier Menendez setting.
- [Call of Duty Wiki — Time and Fate](https://callofduty.fandom.com/wiki/Time_and_Fate) — Identifies the *Black Ops II* Menendez operation with Wasa King, Atlántico Norte, Nicaragua and supplies the inter-game geographic connection.
- [Nicaragua Ministry of Health — Health network directory](https://www.minsa.gob.ni/red-de-salud?field_departamento_target_id=All&field_municipio_target_id=All&field_regimen_target_id=All&field_silais_target_id=All&field_tipo_unidad_salud_target_id=All&items_per_page=25&order=field_departamento&page=17&sort=desc&title=) — Government listing for the Wasakin community in the Rosita/Las Minas health network, independently confirming the real settlement.
- [URACCAN, Revista Universitaria del Caribe — “Lingüística Forestal Mayangna Tuahka; Wasakín, Rosita, Nicaragua, 2018”](https://revistas.uraccan.edu.ni/index.php/Caribe/article/download/1400/4718/) — Academic field study locating Wasakín 14 km southeast of Rosita at UTM E=787831, N=1533493; conversion in UTM zone 16N gives approximately `13.857, -84.337`, matching the stored settlement marker.
- [Universidad Nacional de Ingeniería — Wasa King rural broadband thesis](https://ribuni.uni.edu.ni/1698/) — Independent Nicaraguan university source identifying Wasa King as a community associated with Rosita in the former Región Autónoma Atlántico Norte.
- [U.S. Department of State, Office of the Historian — Central America, 1981–1988](https://history.state.gov/milestones/1981-1988/central-america) — Authoritative historical context for U.S. involvement in Nicaragua and the Contra conflict; contrasts the real chronology with the fictional Menendez raid.
