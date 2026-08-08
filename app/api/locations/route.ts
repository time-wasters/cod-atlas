import countries from "world-countries";
import locationData from "../../data/locations.json";
import cityData from "../../data/city-enrichment.json";

type CityRecord = {
  key: string;
  city: string | null;
  coordinates: [number, number] | null;
  precision: "city" | "country";
  confidence: "high" | "medium" | "fallback";
  method: string;
};

type Mode = "singleplayer" | "multiplayer";

const singleplayerEntries = new Set([
  "COD::camp toccoa", "COD::pathfinder", "COD::ste. mere-eglise", "COD::ste. mere eglise-day",
  "COD::normandy route n13", "COD::brecourt manor", "COD::alps chateau", "COD::dulag iiia",
  "COD::festung recogne", "COD::pegasus bridge", "COD::pegasus bridge-day", "COD::the eder dam",
  "COD::eder dam getaway", "COD::airfield escape", "COD::battleship tirpitz", "COD::warsaw factory",
  "COD::warsaw railyard", "COD::stalingrad", "COD::red square", "COD::train station",
  "COD::stalingrad sewers", "COD::pavlov's house", "COD::oder river country", "COD::oder river town",
  "COD::v-2 rocket site", "COD::berlin",
  "UO::bois jacques", "UO::crossroads", "UO::foy", "UO::noville", "UO::bomber",
  "UO::train bridge", "UO::sicily 1", "UO::sicily 2", "UO::trenches", "UO::ponyri",
  "UO::kursk", "UO::kharkov 1", "UO::kharkov 2",
  "FH::not one step back", "FH::the flag must fall", "FH::dead in her sights", "FH::defend the factory",
  "FH::breakdown", "FH::into red square", "FH::operation little saturn", "FH::airfield ambush",
  "FH::mission: matmata", "FH::depot saboteurs", "FH::a desert ride", "FH::raiding the fortress",
  "FH::first city to fall", "FH::underground passage", "FH::surrender at aachen", "FH::come out fighting",
  "FH::road to remagen", "FH::last bridge standing", "FH::into the heartland",
  "COD2::red army training", "COD2::demolition", "COD2::repairing the wire", "COD2::the pipeline",
  "COD2::downtown assault", "COD2::city hall", "COD2::comrade sniper", "COD2::the diversionary raid",
  "COD2::holding the line", "COD2::operation supercharge", "COD2::the end of the beginning",
  "COD2::crusader charge", "COD2::88 ridge", "COD2::outnumbered and outgunned",
  "COD2::retaking lost ground", "COD2::assault on matmata", "COD2::the battle of pointe du hoc",
  "COD2::defending the pointe", "COD2::the silo", "COD2::prisoners of war", "COD2::the crossroads",
  "COD2::the tiger", "COD2::the brigade box", "COD2::rangers lead the way",
  "COD2::the battle for hill 400", "COD2::crossing the rhine", "COD2::the battle of el alamein",
  "BR1::we've been through worse", "BR1::baptism by fire", "BR1::tankers", "BR1::the desert fox",
  "BR1::counterattack", "BR1::liberators", "BR1::operation husky", "BR1::piano lupo",
  "BR1::farewell to friends", "BR1::the great crusade", "BR1::an easy detail",
  "BR1::crucifix hill", "BR1::the last train", "BR1::the dragon's teeth",
  "COD3::saint-lô", "COD3::the island", "COD3::night drop", "COD3::mayenne bridge",
  "COD3::falaise road", "COD3::fuel plant", "COD3::the black baron", "COD3::the forest",
  "COD3::laison river", "COD3::the crossroads", "COD3::hostage!", "COD3::the corridor of death",
  "COD3::the mace", "COD3::chambois",
  "RTV::scavenger hunt", "RTV::glider crash", "RTV::reichswald", "RTV::rhine crossing",
  "RTV::altavilla", "RTV::lucky thirteen", "RTV::nijmegen", "RTV::hunner park",
  "RTV::river crossing", "RTV::woensdrecht", "RTV::sloedam", "RTV::walcheren",
  "RTV::arnhem fire", "RTV::arnhem assault",
  "WAW::semper fi", "WAW::little resistance", "WAW::hard landing", "WAW::burn 'em out",
  "WAW::relentless", "WAW::black cats", "WAW::blowtorch & corkscrew", "WAW::breaking point",
  "WAW::vendetta", "WAW::their land, their blood", "WAW::blood and iron", "WAW::ring of steel",
  "WAW::eviction", "WAW::heart of the reich", "WAW::downfall",
  "WAW:FF::basic training", "WAW:FF::betio assault", "WAW:FF::betio airfield",
  "WAW:FF::codename: forager", "WAW:FF::mount tapochau", "WAW:FF::ettelbruck",
  "WAW:FF::the race to bastogne", "WAW:FF::the relief of bastogne", "WAW:FF::the battle of bure",
  "WAW:FF::the rhine", "WAW:FF::braunau am inn", "WAW:FF::typhoon of steel", "WAW:FF::shuri castle",
  "COD4::f.n.g.", "COD4::crew expendable", "COD4::the coup", "COD4::blackout", "COD4::charlie don't surf",
  "COD4::the bog", "COD4::hunted", "COD4::death from above", "COD4::war pig",
  "COD4::shock and awe", "COD4::aftermath", "COD4::safehouse", "COD4::all ghillied up",
  "COD4::one shot, one kill", "COD4::heat", "COD4::the sins of the father", "COD4::ultimatum",
  "COD4::all in", "COD4::no fighting in the war room", "COD4::game over", "COD4::mile high club",
  "MW2::s.s.d.d.", "MW2::team player", "MW2::cliffhanger", "MW2::no russian", "MW2::takedown",
  "MW2::wolverines!", "MW2::the hornet's nest", "MW2::exodus", "MW2::the only easy day... was yesterday",
  "MW2::the gulag", "MW2::of their own accord", "MW2::contingency", "MW2::second sun",
  "MW2::whiskey hotel", "MW2::loose ends", "MW2::the enemy of my enemy", "MW2::just like old times", "MW2::endgame",
  "MW3::prologue", "MW3::black tuesday", "MW3::hunter killer", "MW3::persona non grata", "MW3::turbulence",
  "MW3::back on the grid", "MW3::mind the gap", "MW3::goalpost", "MW3::return to sender",
  "MW3::bag and drag", "MW3::iron lady", "MW3::eye of the storm", "MW3::blood brothers",
  "MW3::stronghold", "MW3::scorched earth", "MW3::down the rabbit hole", "MW3::dust to dust",
  "MW3::davis family vacation",
  "MW3:D::in the wild", "MW3:D::isolation", "MW3:D::overwatch", "MW3:D::oil, fire, and ice",
  "MW3:D::running for cover", "MW3:D::clearing out", "MW3:D::through the mountains",
  "MW3:D::dam approach", "MW3:D::lights out", "MW3:D::fire from the sky", "MW3:D::clean up",
  "MW3:D::heavy metal", "MW3:D::dangerous cargo", "MW3:D::hurricane ivan",
  "BO::operation 40", "BO::vorkuta", "BO::u.s.d.d.", "BO::executive order", "BO::s.o.g.",
  "BO::the defector", "BO::numbers", "BO::project nova", "BO::victor charlie", "BO::crash site",
  "BO::wmd", "BO::payback", "BO::rebirth", "BO::revelations", "BO::redemption",
  "BO2::pyrrhic victory", "BO2::celerium", "BO2::old wounds", "BO2::time and fate",
  "BO2::fallen angel", "BO2::karma", "BO2::suffer with me", "BO2::achilles' veil",
  "BO2::odysseus", "BO2::cordis die", "BO2::judgment day", "BO2::strikeforce tutorial",
  "BO2::fob", "BO2::fob spectre",
  "BO2::shipwreck", "BO2::i.e.d.", "BO2::second chance", "BO2::dispatch",
  "BO3::black ops", "BO3::new world", "BO3::in darkness", "BO3::provocation", "BO3::hypocenter",
  "BO3::vengeance", "BO3::rise and fall", "BO3::rise & fall", "BO3::demon within", "BO3::sand castle", "BO3::lotus towers", "BO3::life",
  "BO:D::escort service", "BO:D::active measures", "BO:D::got your back", "BO:D::ops m.i.a.",
  "BO:D::hostile takeover", "BO:D::three point landing", "BO:D::rocket's red glare",
  "BO:D::self destructive", "BO:D::checking out", "BO:D::air traffic control",
  "BOCW::nowhere left to run", "BOCW::fracture jaw", "BOCW::brick in the wall", "BOCW::redlight, greenlight",
  "BOCW::echoes of a cold war", "BOCW::desperate measures", "BOCW::end of the line", "BOCW::break on through",
  "BOCW::identity crisis", "BOCW::the final countdown", "BOCW::ashes to ashes", "BOCW::operation chaos", "BOCW::operation red circus",
  "BOCW::cia",
  "G::ghost stories", "G::brave new world", "G::no man's land", "G::struck down", "G::homecoming",
  "G::legends never die", "G::federation day", "G::birds of prey", "G::the hunted", "G::clockwork",
  "G::atlas falls", "G::into the deep", "G::end of the line", "G::sin city", "G::all or nothing",
  "G::severed ties", "G::loki", "G::the ghost killer",
  "AW::induction", "AW::atlas", "AW::traffic", "AW::fission", "AW::aftermath", "AW::manhunt",
  "AW::utopia", "AW::sentinel", "AW::crash", "AW::bio lab", "AW::collapse", "AW::armada",
  "AW::throttle", "AW::captured", "AW::terminus",
  "IW::rising threat", "IW::black sky", "IW::operation port armor", "IW::operation burn water",
  "IW::operation dark quarry", "IW::operation black flag", "IW::operation blood storm",
  "IW::operation taken dagger", "IW::operation phoenix", "IW::operation d-con",
  "IW::operation deep execute", "IW::operation safe harbor", "IW::operation pure threat",
  "IW::operation grave robber", "IW::operation sudden death", "IW::operation trace kill",
  "WWII::d-day", "WWII::operation cobra", "WWII::stronghold", "WWII::s.o.e.", "WWII::liberation",
  "WWII::collateral damage", "WWII::death factory", "WWII::hill 493", "WWII::battle of the bulge",
  "WWII::ambush", "WWII::the rhine", "WWII::epilogue",
  "V::phoenix", "V::operation tonga", "V::stalingrad", "V::the battle of midway", "V::numa numa trail",
  "V::lady nightingale", "V::the rats of tobruk", "V::the battle of el alamein", "V::the fourth reich",
  "MW19::fog of war", "MW19::piccadilly", "MW19::embedded", "MW19::proxy war", "MW19::clean house",
  "MW19::hunting party", "MW19::the embassy", "MW19::highway of death", "MW19::hometown",
  "MW19::the wolf's den", "MW19::captive", "MW19::old comrades", "MW19::going dark", "MW19::into the furnace",
  "MWII::strike", "MWII::kill or capture", "MWII::wetwork", "MWII::tradecraft", "MWII::trade craft", "MWII::borderline",
  "MWII::cartel protection", "MWII::close air", "MWII::hardpoint", "MWII::recon by fire",
  "MWII::violence and timing", "MWII::el sin nombre", "MWII::dark water", "MWII::alone",
  "MWII::prison break", "MWII::hindsight", "MWII::ghost team", "MWII::countdown",
]);

function modesFor(entry: { title: string; game: string; wiki: string }): Mode[] {
  const wiki = decodeURIComponent(entry.wiki).toLowerCase();
  const gameCodes = entry.game.split(" / ");
  const isWarzone = gameCodes.some((game) => game === "MW19-WZ" || game === "MWII-WZ");
  const isExplicitMap = /(?:\([^)]*(?:map|multiplayer)[^)]*\)|#multiplayer)/.test(wiki)
    || /(?:\s|\()mp\)?$/i.test(entry.title);
  if (isWarzone || isExplicitMap) {
    return ["multiplayer"];
  }

  const isKnownMission = gameCodes
    .some((game) => singleplayerEntries.has(`${game}::${entry.title.toLowerCase()}`));
  if (isKnownMission) return ["singleplayer"];
  if (/\((?:mission|level|campaign)\)/.test(wiki)) return ["singleplayer"];
  return ["multiplayer"];
}

const aliases: Record<string, string> = {
  "czech republic (czechia)": "Czechia",
  "gibraltar (uk)": "Gibraltar",
  "myanmar (burma)": "Myanmar",
  "scotland (uk)": "United Kingdom",
  "okinawa (japan)": "Japan",
  "midway atoll (u.s.a)": "United States",
  "northern mariana islands (u.s.a)": "Northern Mariana Islands",
  "south korea": "South Korea",
  "taiwan": "Taiwan",
};

const specialCoordinates: Record<string, [number, number]> = {
  "adriatic sea": [42.7, 16.1],
  "arctic circle": [66.5, 24],
  "atlantic ocean": [26, -38],
  "baltic sea": [57.3, 19.2],
  "bering strait": [65.8, -168.8],
  "caribbean sea": [15.2, -75],
  "cayman islands": [19.31, -81.25],
  "dead sea": [31.5, 35.5],
  "english channel": [50.2, -1.2],
  "gulf of mexico": [24.5, -89],
  "indian ocean": [-20, 78],
  "midway atoll (u.s.a)": [28.21, -177.38],
  "pacific ocean": [3, -150],
  "philippine sea": [18, 132],
  "polynesia": [-17.6, -149.4],
  "alaska": [64.2, -152],
  "arizona": [34.3, -111.7],
  "california": [36.8, -119.4],
  "colorado": [39, -105.5],
  "florida": [27.8, -81.7],
  "hawaii": [20.8, -157.5],
  "illinois": [40, -89.2],
  "kansas": [38.5, -98.2],
  "louisiana": [31, -92],
  "maryland": [39, -76.7],
  "michigan": [44.3, -85.6],
  "nebraska": [41.5, -99.8],
  "nevada": [39.3, -116.6],
  "new jersey": [40.1, -74.5],
  "new mexico": [34.5, -106],
  "new york": [42.9, -75.5],
  "north carolina": [35.5, -79.4],
  "south dakota": [44.4, -100.2],
  "texas": [31, -99],
  "virginia": [37.5, -78.8],
  "washington": [47.4, -120.7],
  "washington d.c.": [38.907, -77.037],
  "wyoming": [43, -107.5],
};

const offWorld = new Set([
  "cygnus x-3's orbit",
  "earth’s orbit",
  "europa (jupiter moon)",
  "mars",
  "moon",
  "neptune’s orbit",
  "pluto’s orbit",
  "sun’s orbit",
  "titan (saturn moon)",
  "uranus’ orbit",
  "venus’ orbit",
]);

function coordinatesFor(name: string, georgiaOccurrence: number) {
  const key = name.toLowerCase();
  if (offWorld.has(key)) return null;
  if (key === "georgia" && georgiaOccurrence > 0) return [32.7, -83.3] as [number, number];
  if (specialCoordinates[key]) return specialCoordinates[key];

  const target = aliases[key] ?? name;
  const country = countries.find((item) =>
    [item.name.common, item.name.official].some(
      (candidate) => candidate.toLowerCase() === target.toLowerCase(),
    ),
  );
  return country?.latlng?.length === 2
    ? ([country.latlng[0], country.latlng[1]] as [number, number])
    : null;
}

export async function GET() {
  const cityLookup = new Map(
    (cityData.records as CityRecord[]).map((record) => [record.key, record]),
  );
  let georgiaOccurrence = 0;
  const groups = locationData.groups.map((group) => {
    const occurrence = group.name.toLowerCase() === "georgia" ? georgiaOccurrence++ : 0;
    const countryCoordinates = coordinatesFor(group.name, occurrence);
    return {
      ...group,
      name: group.name.toLowerCase() === "georgia" && occurrence > 0 ? "Georgia, USA" : group.name,
      coordinates: countryCoordinates,
      kind: offWorld.has(group.name.toLowerCase()) ? "off-world" : "terrestrial",
      entries: group.entries.map((entry) => {
        const enrichment = cityLookup.get(`${group.name}::${entry.game}::${entry.wiki}`);
        return {
          ...entry,
          modes: modesFor(entry),
          city: enrichment?.city ?? null,
          coordinates: enrichment?.coordinates ?? countryCoordinates,
          precision: enrichment?.precision ?? "country",
          confidence: enrichment?.confidence ?? "fallback",
          method: enrichment?.method ?? "country-fallback",
        };
      }),
    };
  });

  const entries = groups.flatMap((group) => group.entries);

  return Response.json({
    source: locationData.source,
    updatedAt: locationData.updatedAt,
    groups,
    totals: {
      groups: groups.length,
      entries: entries.length,
      mapped: entries.filter((entry) => entry.coordinates).length,
      cityMatched: entries.filter((entry) => entry.precision === "city").length,
      countryFallback: entries.filter((entry) => entry.precision === "country").length,
    },
    research: cityData.stats,
  });
}
