---
id: cod2-stalingrad
title: Stalingrad
games:
  - cod2
mode: multiplayer
wikiArticle: codwiki-stalingrad-call-of-duty-2
locations:
  - id: main
    country: Russia
    region: Volgograd Oblast
    city: Volgograd
    landmark: Volgograd II freight yard (former Stalingrad II)
    latitude: 48.6915
    longitude: 44.4789
    precision: approximate
    confidence: medium
    method: real-world-inspiration
    primary: true
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=%D0%A2%D0%BE%D0%B2%D0%B0%D1%80%D0%BD%D0%B0%D1%8F%20%D0%BA%D0%BE%D0%BD%D1%82%D0%BE%D1%80%D0%B0%20%D0%92%D0%BE%D0%BB%D0%B3%D0%BE%D0%B3%D1%80%D0%B0%D0%B4-II%2C%20%D0%92%D0%BE%D0%BB%D0%B3%D0%BE%D0%B3%D1%80%D0%B0%D0%B4%2C%20%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F
      - wikipedia: https://ru.wikipedia.org/wiki/%D0%92%D0%BE%D0%BB%D0%B3%D0%BE%D0%B3%D1%80%D0%B0%D0%B4_II
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-2/stalingrad-3/
  - id: warsaw-source-map
    country: Poland
    region: Masovian Voivodeship
    city: Warsaw
    landmark: Historic Ursus factory siding
    latitude: 52.1964
    longitude: 20.88525
    precision: approximate
    confidence: medium
    method: real-world-inspiration
    primary: false
    urls:
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Warszawa%20Ursus%20railway%20station%2C%20Warsaw%2C%20Poland
      - wikipedia: https://en.wikipedia.org/wiki/Warszawa_Ursus_railway_station
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

**Stalingrad** is a multiplayer map, so it has no mission narrative, playable character or unit, canonical battle date, briefing, route, or historical objective. In *Call of Duty 2* the map uses the internal name `mp_railyard` and consists of a freight yard surrounded by multi-storey industrial and residential buildings, with freight wagons, warehouses, a tank depot and elevated firing positions. The *Call of Duty 2* version is presented to players as **Stalingrad** and uses the Red Army against the German Army. The Soviet retheming is also visible in the environment: a rooftop sign in the *Call of Duty 2* version reads **УНИВЕРМАГ** (“department store”) in Cyrillic.

At the same time, the geometry has a documented earlier identity. The Call of Duty Wiki describes the map as a remake of **Railyard** from the original *Call of Duty* and links that map to the campaign mission **Warsaw Railyard** (`cod-warsaw-railyard`). Call of Duty Maps likewise calls the *Call of Duty 2* level a returning *Call of Duty 1* favorite, although it retains Warsaw as the location in its database. The atlas therefore needs to preserve two separate facts: *Call of Duty 2* presents this version as Stalingrad, while its map geometry and campaign ancestry come from the earlier Warsaw Railyard.

## The Real Place & Differences

For the *Call of Duty 2* appearance, the match is best classified as a **composite or fictionalized setting with Stalingrad as the represented location and Warsaw as the inherited source geography**.

The primary real-world analogue is **Stalingrad-II**, now **Volgograd II**, in modern Volgograd. This is a real railway station and yard in the former city of Stalingrad. A Stalingrad City Defense Committee document dated 15 April 1942 explicitly refers to a warehouse at Stalingrad-II used for **transshipment cargo**. Modern railway directories still list Volgograd II as a freight-handling station capable of receiving and issuing wagon-load and smaller consignments, including freight on sidings, while Russian Railways has a dedicated Volgograd-II goods office at the site. This makes it a defensible real freight-yard anchor for a map whose principal playable space is a goods railyard.

No evidence was found that `mp_railyard` reconstructs Stalingrad-II's actual track plan, warehouses, goods office or wartime buildings. The selected site is therefore an analogue within the map's represented city, not a claim of exact geometry. The **historic Ursus factory siding in Warsaw** remains in the file as a secondary location because it is the strongest researched analogue for the original Railyard/Warsaw Railyard geometry: the industrial works had rail sidings and German armored-vehicle production and repair activity.

## The Real Mission & Differences

The closest supported Stalingrad historical context is the fighting around the city's railway system in September 1942. Transport-history research documents severe destruction at both Stalingrad-I and Stalingrad-II during the battle. A German XXXXVIII Panzer Corps operational report for **15 September 1942** records the 24th Panzer Division reaching the Stalingrad-II station area during the fighting in the southern part of the city. These events establish Stalingrad-II as a genuine wartime rail and combat site, but they do not demonstrate a battle matching the multiplayer map's exact tank depot, freight-wagon arrangement or objectives.

The map's documented campaign ancestry belongs to a different place and date. **Warsaw Railyard** is set on 17 January 1945 and depicts Soviet troops fighting through a tank-repair factory and railyard. The real entry into Warsaw that day encountered much weaker German resistance than the game depicts. That campaign connection explains the inherited map layout but should not override the represented *Call of Duty 2* setting.

*Call of Duty 2*'s **The Pipeline** (`cod2-the-pipeline`) is also separate. It depicts fighting for Stalingrad Railway Station No. 1 and uses different `trainyard` geometry. It is relevant historical/game context for Stalingrad rail fighting, but it is not the source map for `mp_railyard`.

## Marker Position Explanation

The **primary** atlas marker is stored at `48.6915, 44.4789`, within the **Volgograd II / former Stalingrad-II railway yard**.

This point was selected because the atlas is intended to show where the *Call of Duty 2* map is represented in the real world. The CoD2 appearance is explicitly titled Stalingrad, uses Soviet environmental theming, and centers on freight rail operations. Stalingrad-II is a real wartime Stalingrad rail site with documented cargo handling, and the modern Volgograd II station still performs freight operations. `precision: approximate` is appropriate because the coordinate represents the freight-yard area rather than a verified surviving in-game structure. `confidence: medium` reflects that the city identification is strong but the choice of **this particular Stalingrad goods yard** is an evidence-based analogue, not a developer-confirmed location. `method: real-world-inspiration` records that distinction.

The **secondary** marker remains at `52.1964, 20.88525` beside the historic **Ursus factory siding in Warsaw**. It preserves the map's documented Railyard/Warsaw Railyard ancestry and should be interpreted as the likely real-world analogue for the inherited geometry, not as the primary represented location of the CoD2 version.

**Volgograd-1 Railway Station** was rejected as the primary marker because it is chiefly the central passenger-station landmark and is more directly associated with the separate campaign mission *The Pipeline*. **Sarepta** was also considered because it handled very large wartime freight volumes, but it lies far south of central Stalingrad and there is no map-specific evidence pointing to it. Stalingrad-II provides the stronger combination of urban Stalingrad setting, genuine freight handling and documented wartime combat.

The primary Google Maps URL searches for the real **Volgograd-II goods office** in Volgograd, while the atlas marker uses separately curated coordinates within the railway-yard area. The secondary Google Maps URL searches for **Warszawa Ursus railway station**, adjacent to the historic factory-siding analogue. Neither coordinate should be interpreted as an exact reconstruction of the multiplayer track layout.

## Sources

- [Call of Duty Wiki — Railyard](https://callofduty.fandom.com/wiki/Railyard_(map)) — Game evidence for `mp_railyard`, the *Call of Duty 2* Stalingrad name, Red Army versus German Army teams, freight-wagon/tank-depot layout, differences from the original map, and the explicit *Warsaw Railyard* campaign relationship.
- [Call of Duty Maps — Stalingrad](https://callofdutymaps.com/call-of-duty-2/stalingrad-3/) — Independent documentation that the CoD2 map is the returning CoD1 Railyard combat space; its Warsaw location entry is retained as evidence of the older map identity rather than treated as decisive for the CoD2 marker.
- [Electronic Library of Historical Documents — Stalingrad City Defense Committee resolution no. 261, 15 April 1942](https://docs.historyrussia.org/ru/nodes/224986-postanovlenie-sgko-locale-nil-261-po-pismu-nachalnika-sklada-nko-locale-nil-228-intendanta-ii-ranga-tov-grushkovskogo-s-prosboy-ob-ostavlenii-pakgauza-na-stantsii-stalingrad-ll-dlya-hraneniya-perevalochnyh-gruzov-stalingrad-15-aprelya-1942-g) — Primary archival evidence that Stalingrad-II had a warehouse used for transshipment cargo before the battle.
- [Russian University of Transport — railway transport in the Battle of Stalingrad](https://miit.ru/content/%D0%9A%2080-%D0%BB%D0%B5%D1%82%D0%B8%D1%8E%20%D1%80%D0%B0%D0%B7%D0%B3%D1%80%D0%BE%D0%BC%D0%B0%20%D1%81%D0%BE%D0%B2%D0%B5%D1%82%D1%81%D0%BA%D0%B8%D0%BC%D0%B8%20%D0%B2%D0%BE%D0%B9%D1%81%D0%BA%D0%B0%D0%BC%D0%B8%20%D0%BD%D0%B5%D0%BC%D0%B5%D1%86%D0%BA%D0%BE-%D1%84%D0%B0%D1%88%D0%B8%D1%81%D1%82%D1%81%D0%BA%D0%B8%D1%85%20%D0%B2%D0%BE%D0%B9%D1%81%D0%BA%20%D0%B2%20%D0%A1%D1%82%D0%B0%D0%BB%D0%B8%D0%BD%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%BE%D0%B9%20%D0%B1%D0%B8%D1%82%D0%B2%D0%B5.pdf?id_wm=947466) — Institutional historical study confirming the importance and wartime destruction of the Stalingrad railway node, including Stalingrad-II.
- [Stalingrad 1942–1943 document project — XXXXVIII Panzer Corps report, 15 September 1942](https://stalingrad1942-1943.ru/node/409) — Transcribed wartime operational report placing German armor at the Stalingrad-II station area during the urban fighting.
- [Alta-Soft freight-station directory — Volgograd II](https://www.alta.ru/railway/station/61140/) — Modern railway-location and freight-operation data for Volgograd II; supplies the rounded coordinate used for the primary approximate marker.
- [2GIS — Volgograd-II goods office](https://2gis.ru/volgograd/firm/70000001031365854) — Confirms the dedicated Russian Railways freight/goods office at Militsionera Bukhantseva 15g, supporting the freight-yard rather than passenger-station interpretation.
- [Russian Wikipedia — Volgograd II](https://ru.wikipedia.org/wiki/%D0%92%D0%BE%D0%BB%D0%B3%D0%BE%D0%B3%D1%80%D0%B0%D0%B4_II) — Modern station identification and its former name **Stalingrad II**; used because no equivalent English Wikipedia article was found.
- [Call of Duty Wiki — Warsaw Railyard](https://callofduty.fandom.com/wiki/Warsaw_Railyard) — Campaign-source relationship and game chronology for the inherited Warsaw railyard geometry.
- [Ursus History Centre — former Ursus Mechanical Works heritage complex](https://ursushistoryczny.pl/aktualnosci/zespol-budowlany-d-zakladow-mechanicznych-ursus-wreszcie-w-rejestrze-zabytkow/) — Local heritage evidence for the Warsaw secondary marker, including German wartime armored-vehicle production/repair at the works.
- [Polish Institute of National Remembrance — Red Army entry into Warsaw, 17 January 1945](https://eng.ipn.gov.pl/en/news/9205%2CThe-Red-Army-entered-Warsaw-77-years-ago.html) — Historical comparison showing that the linked Warsaw campaign battle is substantially fictionalized.
