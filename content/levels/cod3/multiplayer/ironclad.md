---
id: cod3-ironclad
title: Ironclad
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-ironclad
locations:
  - id: main
    country: France
    region: Brittany
    city: Saint-Malo
    latitude: 48.64944
    longitude: -2.02611
    precision: city
    confidence: high
    method: wiki-location
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Saint-Malo%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/Saint-Malo
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/ironclad/
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

*Ironclad* is a multiplayer map, so it has no mission narrative, playable
character, unit, date, briefing, route, or historical objective. The Call of
Duty Wiki identifies the map as American forces versus German forces in
Saint-Malo, France, and gives the console codename `shipyard`. The imported Wiki
record likewise preserves the raw level location as `Saint-Malo, France`.
Call of Duty Maps independently lists Saint-Malo and describes a compact combat
space between two large ships under construction, with tunnels providing flank
routes and shipbuilding machinery and parts around the edges.

A primary developer source provides the strongest description of the intended
setting. Treyarch level designer Jason McCord describes *Ironclad* as a large
dry dock containing giant ships under construction and a train wreck in the
center. He says that he designed it for the Xbox 360-exclusive Valor DLC while
the rest of the team was moving into pre-production for *World at War*.

No evidence was found that *Ironclad* is derived from, reuses the combat space
of, or is narratively linked to a *Call of Duty 3* campaign mission. It should
therefore be treated as a standalone multiplayer setting rather than being tied
to a campaign level simply because the wider campaign also takes place in
France.

## The Real Place & Differences

Saint-Malo is a historic port city on the north coast of Brittany at the Rance
estuary. Its maritime character, harbor basins, rail-served industrial areas,
and ship-repair history make it a plausible broad setting for the map's
dry-dock imagery. The game sources, however, identify only **Saint-Malo** and do
not name a specific real dry dock, shipyard, basin, quay, or wartime industrial
facility.

The closest-looking documented industrial candidate is the site on quai
Garnier-Dufougeray. Brittany's official heritage inventory records an early
20th-century shipbuilding works there and describes a maritime- and
rail-served industrial site that later included a dry dock and launch slip.
That resemblance is not enough to make it the real *Ironclad* location. The
same heritage record shows that the site had become a cod-drying and salting
works before the war; in 1944 that establishment was about 95 percent destroyed.
The major post-war shipbuilding occupation and the documented dry-dock-centered
industrial configuration therefore cannot simply be projected backward onto
the game's implied wartime scene.

The best classification is consequently **composite or fictionalized setting**:
Saint-Malo is confirmed as the map's stated real-world city, while the detailed
dry-dock battlefield appears to be a designed multiplayer environment rather
than a defensibly identified reconstruction of one Saint-Malo facility.

## The Real Mission & Differences

There is no real mission corresponding directly to *Ironclad*, because the map
has no singleplayer narrative or stated date. The closest supported historical
context is the Battle of Saint-Malo in August 1944.

The U.S. Army's official history records that Major General Robert C. Macon's
83rd Infantry Division was assigned the reduction of the Saint-Malo fortress
after unexpectedly strong German resistance blocked the American advance. By
5 August the entire division was committed. The German fortress encompassed
Saint-Malo, Paramé, Saint-Servan, the Citadel, and surrounding strongpoints,
with additional artillery support from Cézembre and the Dinard side of the
Rance.

The historical fighting does establish an American-versus-German battle around
Saint-Malo's port. It does **not** document a battle matching the playable map's
two ships under construction, central train wreck, tunnels, or dry-dock
configuration. In fact, the official history states that on 7 August German
demolitions destroyed the port's quays, locks, breakwaters, and harbor
machinery. The battle was a dispersed fortress siege across a much larger urban
and coastal area, not the compact shipbuilding arena represented in
*Ironclad*.

Accordingly, the Battle of Saint-Malo is useful historical context for the
map's city and opposing factions, but it should not be presented as a one-to-one
historical mission represented by the multiplayer level.

## Marker Position Explanation

The stored atlas marker is `48.64944, -2.02611`.

This point is a representative **city-level coordinate for Saint-Malo**, not a
claim about the exact position of the fictionalized dry dock. The old marker
was the generic France fallback at `46, 2` with `precision: country`,
`confidence: fallback`, and `method: country-fallback`. Replacing that fallback
is justified because both the Call of Duty Wiki/import record and Call of Duty
Maps explicitly identify Saint-Malo.

`precision: city` is deliberately conservative. There is enough evidence for
Saint-Malo but not for a specific dock, quay, shipyard, or wartime battle site.
`confidence: high` reflects the agreement of the independent game-location
sources about the city rather than confidence in the detailed in-game layout.
`method: wiki-location` reflects that the canonical level-location record
supplies the real named city, independently corroborated by Call of Duty Maps.

The quai Garnier-Dufougeray industrial site was considered as a stronger marker
because its documented history includes shipbuilding, rail access, and later a
dry dock. It was rejected as an exact or approximate level anchor because its
documented 1944 use was a cod-processing works and the evidence does not connect
that site to Treyarch's map.

The Google Maps URL searches for the real named place **Saint-Malo, France**.
The atlas marker uses the separately curated city coordinate above; the map URL
does not encode or determine that coordinate.

## Sources

- [Call of Duty Wiki — Ironclad](https://callofduty.fandom.com/wiki/Ironclad) — game facts: *Call of Duty 3* multiplayer map, American versus German teams, stated location Saint-Malo, and `shipyard` console codename.
- [CoD Atlas Wiki import — codwiki-ironclad](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-ironclad.json) — repository import record preserving the raw Wiki location as `Saint-Malo, France` and confirming that no mission date or previous/next level relationship is recorded.
- [Call of Duty Maps — Ironclad](https://callofdutymaps.com/call-of-duty-3/ironclad/) — independently supports Saint-Malo and describes the two ships under construction, tunnels, machinery, ship parts, surrounding water, and distant terrain.
- [Jason McCord — Call of Duty 3 level portfolio](https://www.monster-clip.com/cod3.html) — primary developer source describing *Ironclad* as a large dry dock with ships under construction and a central train wreck, and explaining its Valor DLC development.
- [Inventaire Général du Patrimoine Culturel de Bretagne — quai Garnier-Dufougeray industrial site](https://patrimoine.bzh/gertrude-diffusion/dossier/IA35000662) — authoritative heritage record for the strongest tempting shipyard candidate; documents the site's shipbuilding history, railway access, later dry dock, its wartime cod-processing use, and approximately 95-percent destruction in 1944.
- [Ville de Saint-Malo — Mémorial 39-45](https://www.saint-malo.fr/accueil/sortir/musees/memorial-39-45/) — official municipal history of Fortress Saint-Malo and the 83rd Infantry Division's liberation of the sector.
- [U.S. Army Center of Military History — *Breakout and Pursuit*, Chapter XXI: “St. Malo and the North Shore”](https://www.ibiblio.org/hyperwar/USA/USA-E-Breakout/USA-E-Breakout-21.html) — authoritative account of the 83rd Infantry Division's Saint-Malo operation, fortress geography, chronology, and destruction of the port on 7 August 1944.
- [Wikipedia — Saint-Malo](https://en.wikipedia.org/wiki/Saint-Malo) — supports the modern city identification, Brittany region, and city-level coordinate used for the representative marker.
