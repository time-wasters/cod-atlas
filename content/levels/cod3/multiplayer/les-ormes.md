---
id: cod3-les-ormes
title: Les Ormes
games:
  - cod3
mode: multiplayer
wikiArticle: codwiki-les-ormes
locations:
  - id: main
    country: France
    region: Yonne
    city: Les Ormes
    latitude: 47.8492
    longitude: 3.2664
    precision: city
    confidence: high
    method: wiki-location
    primary: true
    urls:
      - callOfDutyMaps: https://callofdutymaps.com/call-of-duty-3/les-ormes/
      - googleMaps: https://www.google.com/maps/search/?api=1&query=Les+Ormes%2C+Yonne%2C+France
      - wikipedia: https://en.wikipedia.org/wiki/Les_Ormes,_Yonne
---

> **AI-generated research note:** The historical summary below was generated
> with AI assistance and should be reviewed against the cited sources before
> being treated as authoritative.

## The Mission in the Game

*Les Ormes* is a multiplayer map in *Call of Duty 3*, so it has **no mission
narrative, playable campaign character, unit, date, briefing, route or historical
objective of its own**. The Call of Duty Wiki places it in **Les Ormes, France**,
describes the terrain as a French small town, and identifies its console codename
as `mp_hosta`. The map combines village buildings and alleys with broad roads,
open fields and farmland; motorcycles are a major gameplay feature. Call of Duty
Maps likewise describes fighting that shifts between close-quarters combat in
the small town and longer-range engagements in the surrounding farmland.

The map has a documented campaign relationship: the Wiki explicitly lists
**Hostage!** (`cod3-hostage`) as its campaign map. That is stronger evidence than
a visual resemblance alone, and the `mp_hosta` codename independently points to
the same relationship. *Hostage!* is the SAS/French Resistance mission set at
Les Ormes on 20 August 1944. The multiplayer level should therefore be treated as
a multiplayer adaptation associated with that campaign setting, not as a
standalone historical mission. The available sources establish shared geography
and campaign-map context, but they do not prove that every multiplayer road,
house or field is a one-to-one reuse of a specific campaign space.

## The Real Place & Differences

France has several places named **Les Ormes**, so the game's bare place label is
not sufficient by itself to identify the commune. The strongest match is **Les
Ormes in the Yonne department**, in modern Bourgogne-Franche-Comté. French
government records identify the commune as INSEE **89281**, and the existing
researched *Hostage!* level in this repository also resolves the campaign
location to this Yonne commune.

The Yonne identification is unusually well supported by the historical context.
British **1st SAS** personnel operating under **Operation Kipling** were inserted
in the immediate Les Ormes area during August 1944, with jeeps and support for
local Maquis forces. On 23 August, only three days after the date shown in
*Hostage!*, an SAS jeep patrol led by Captain Derrick Harrison entered Les Ormes
and fought German troops in the village. A local historical exhibition places a
German execution party beside the church near the present mairie and describes
the SAS attack as allowing most of the threatened hostages to escape.

That real event makes Les Ormes, Yonne much more defensible than the previous
generic France fallback. It does **not**, however, establish that the multiplayer
map is a surveyed reconstruction of the real village. The in-game looping roads,
barns, farmland, mine boundaries and enterable houses are gameplay spaces, and
no reliable source found in this research matches them one-to-one to surviving
roads or buildings in Les Ormes. The level is best classified as a **confirmed
real place with a fictionalized/composite multiplayer layout**.

## The Real Mission & Differences

There is no separate real-world "multiplayer mission" corresponding to *Les
Ormes*. The closest supported historical context comes from the campaign level
*Hostage!* and from **Operation Kipling**.

The *Hostage!* campaign mission is set on **20 August 1944 at 0600** and follows
Sergeant James Doyle with SAS and French Resistance characters while attempting
to rescue Major Ingram and other captives. No historical source found supports
that exact rescue, those characters or that precise 20 August sequence as a real
operation.

The closest documented event occurred on **23 August 1944**. Historical and
local accounts describe Captain Derrick Harrison's small 1st SAS jeep party
encountering a much larger German force at Les Ormes. Local research records
hostages lined up near the church and current mairie, two already killed, before
the SAS opened fire. Lance Corporal James "Curly" Hall was killed, Harrison was
wounded, and the surviving SAS withdrew; most of the remaining hostages escaped
during the fighting. Archival-derived infiltration research also places Harrison
and later 1st SAS reinforcements only a few kilometres south of Les Ormes between
13 and 18 August, explicitly under Operation Kipling and in cooperation with the
Maquis.

The parallels with *Hostage!* are therefore strong—SAS, Maquis, jeeps, German
forces, threatened captives, Les Ormes and the same week of August 1944—but the
game changes the date, participants and detailed objective. The safest conclusion
is that *Hostage!* and its linked multiplayer map draw on a **real SAS/Maquis
operational setting and a closely matching historical incident**, while
fictionalizing the playable action.

## Marker Position Explanation

The stored marker is **`47.8492, 3.2664`**, representing the commune of **Les
Ormes, Yonne**. This is a substantial evidence-based improvement over the
previous France-centroid fallback at **`46, 2`**. The combination of the
multiplayer map's stated Les Ormes location, its explicit *Hostage!* campaign-map
relationship, the campaign file's independently researched Yonne identification,
and documented 1st SAS/Operation Kipling activity at this exact commune makes the
Yonne interpretation the strongest available fit.

The marker uses **`precision: city`**, **`confidence: high`** and
**`method: wiki-location`**. City-level precision is deliberate: the evidence
strongly identifies which Les Ormes is represented, but it does not establish a
specific real building or street as the multiplayer combat space. The town hall,
church and Place de la Libération are stronger **historical** anchors for the
23 August SAS action, but they were rejected as an `exact` multiplayer marker
because no source ties the playable map geometry to those exact landmarks.

The marker therefore must not be read as the position of a particular in-game
barn, motorcycle spawn, road junction, minefield or multiplayer objective. It
represents the confirmed real commune associated with the map and its campaign
counterpart. The stored Google Maps URL searches for the real named place **Les
Ormes, Yonne, France**, while the atlas marker uses the separately curated
coordinates above.

## Sources

- [Call of Duty Wiki — Les Ormes](https://callofduty.fandom.com/wiki/Les_Ormes) — confirms the multiplayer map, Les Ormes location, small-town terrain, layout, motorcycles, console codename `mp_hosta`, and the explicit campaign-map relationship to *Hostage!*.
- [Call of Duty Maps — Les Ormes](https://callofdutymaps.com/call-of-duty-3/les-ormes/) — supports the small-town/farmland layout, close- versus long-range combat character and motorcycle gameplay.
- [CoD Atlas Wiki import — Les Ormes](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/wiki-import/articles/codwiki-les-ormes.json) — preserves the locally imported Wiki location and multiplayer classification used by the repository.
- [Call of Duty Wiki — Hostage!](https://callofduty.fandom.com/wiki/Hostage%21) — confirms the linked campaign mission, James Doyle/SAS perspective, Les Ormes location, 20 August 1944 date and rescue objective.
- [Call of Duty Wiki — Hostage! transcript](https://callofduty.fandom.com/wiki/Hostage%21/Transcript) — confirms the Maquis safehouse near Les Ormes, 0600 timestamp and jeep-based opening of the campaign mission.
- [CoD Atlas — Hostage!](https://raw.githubusercontent.com/time-wasters/cod-atlas/application-architecture-rework/content/levels/cod3/campaign/11-hostage.md) — repository research resolving the campaign level to Les Ormes, Yonne and explaining why the commune is stronger than a France or Normandy fallback.
- [BANATIC — Commune Les Ormes (INSEE 89281)](https://www.banatic.interieur.gouv.fr/commune/89281-les-ormes) — French government record confirming the modern commune and its official administrative identity in Yonne.
- [INSEE — Commune des Ormes (89281)](https://www.insee.fr/fr/statistiques/1405599?geo=COM-89281) — independent French national statistics record confirming commune code 89281.
- [Mairie de Les Ormes — official municipal site](https://lesormes89110.fr/) — confirms the modern municipality and mairie at 9 Place de la Libération, 89110 Les Ormes.
- [Patrimoine et Partage — *Les missions alliées dans l'Yonne*](https://patrimoineetpartage.fr/wp-content/uploads/2024/10/P-ET-P-EXPO-39-45-SAS-3.pdf) — local historical exhibition describing Operation Kipling, the 23 August 1944 SAS jeep action at Les Ormes, the execution party beside the church/current mairie, the escaping hostages and Hall's death.
- [History of WWII Infiltrations into France](https://www.cnd-castille.org/wp-content/uploads/2021/10/infiltrations_into_france.pdf) — compiled archival table citing RAF and UK National Archives references for Derrick Harrison's 1st SAS insertion about 4 km south of Les Ormes on 13 August and further Operation Kipling personnel/jeep drops in the same area on 14, 16 and 18 August.
- [Kipling — Operations & Codenames of WWII](https://codenames.info/operation/kipling/) — secondary operational account of Harrison's two-jeep attack in the Les Ormes village square on 23 August 1944.
- [Les Ormes, Yonne — English Wikipedia](https://en.wikipedia.org/wiki/Les_Ormes,_Yonne) — provides the commune-level coordinate reference used for the city marker and summarizes the documented 23 August SAS action.
