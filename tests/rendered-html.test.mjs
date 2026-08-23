import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import { atlasUrlWithState, parseAtlasUrl } from "../app/url-state.js";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("round-trips shareable atlas filters and the selected location", () => {
  const source = new URL("https://example.com/atlas/?utm_source=test#map");
  const state = {
    query: "Safehouse",
    gameId: "cod4",
    country: "Azerbaijan",
    series: ["modern-warfare"],
    subseries: ["main"],
    continents: ["Asia"],
    precisions: ["approximate", "exact"],
    confidences: ["high"],
    methods: ["verified-landmark"],
    showSingleplayer: true,
    showMultiplayer: true,
    levelId: "cod4-safehouse",
    locationId: "main",
  };
  const sharedUrl = atlasUrlWithState(source, state);

  assert.equal(sharedUrl.searchParams.get("utm_source"), "test");
  assert.equal(sharedUrl.hash, "#map");
  assert.deepEqual(parseAtlasUrl(sharedUrl), state);
});

test("uses concise defaults and preserves every mode-filter state", () => {
  const defaults = {
    query: "",
    gameId: "all",
    country: "all",
    series: [],
    subseries: [],
    continents: [],
    precisions: [],
    confidences: [],
    methods: [],
    showSingleplayer: true,
    showMultiplayer: false,
    levelId: null,
    locationId: null,
  };
  const defaultUrl = atlasUrlWithState("https://example.com/?game=old&level=old", defaults);
  assert.equal(defaultUrl.search, "");
  assert.deepEqual(parseAtlasUrl(defaultUrl), defaults);

  assert.deepEqual(
    parseAtlasUrl("https://example.com/?precision=localized").precisions,
    ["exact", "approximate", "city", "region"],
    "legacy precision links remain compatible",
  );

  for (const [mode, showSingleplayer, showMultiplayer] of [
    ["both", true, true],
    ["multiplayer", false, true],
    ["none", false, false],
  ]) {
    const url = atlasUrlWithState(defaultUrl, { ...defaults, showSingleplayer, showMultiplayer });
    assert.equal(url.searchParams.get("mode"), mode);
    assert.equal(parseAtlasUrl(url).showSingleplayer, showSingleplayer);
    assert.equal(parseAtlasUrl(url).showMultiplayer, showMultiplayer);
  }
});

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /<h1><img[^>]*src="images\/banner\.png"[^>]*alt="CoD Atlas"/);
  assert.match(html, /class="intel-country-fallback"/);
  assert.match(html, /class="country-select-trigger"/);
  assert.match(html, /class="sidebar-toggle"[^>]*aria-expanded="true"[^>]*aria-label="Hide map filters"/);
  assert.match(html, /class="details-toggle"[^>]*aria-expanded="true"[^>]*aria-label="Hide level details"/);
  assert.match(html, /class="collapsed-level-title"[^>]*aria-label="Show details for [^"]+"/);
  assert.match(html, /aria-label="Filter by game, ordered by release date"/);
  assert.match(html, /aria-label="Filter by country"/);
  assert.match(html, /class="solar-system-overlay is-expanded"/);
  assert.match(html, /aria-label="Collapse Solar System overlay"/);
  assert.match(html, />Solar System \/\/ Schematic<\/text>/);
  assert.match(html, />Mercury<\/text>/);
  assert.match(html, /class="advanced-filter-trigger"[^>]*aria-expanded="false"/);
  const countryFilterIndex = html.indexOf('aria-label="Filter by country"');
  const modeFilterIndex = html.indexOf('class="mode-filter"');
  const advancedFilterIndex = html.indexOf('class="advanced-filter-trigger"');
  assert.ok(countryFilterIndex < modeFilterIndex && modeFilterIndex < advancedFilterIndex);
  assert.match(html, /class="mode-filter"[^>]*aria-label="Game mode visibility"/);
  assert.match(html, /<button(?=[^>]*disabled="")(?=[^>]*title="Zombies filtering will be added later")[^>]*>/);
  assert.doesNotMatch(html, /class="precision-filter"/);
  assert.match(html, /role="tab"[^>]*aria-selected="true"[^>]*aria-controls="sidebar-locations"/);
  assert.match(html, /<button(?=[^>]*role="tab")(?=[^>]*aria-controls="sidebar-campaigns")(?=[^>]*disabled="")[^>]*>/);
  assert.match(html, />Adriatic Sea<\/span>/);
  assert.doesNotMatch(html, /Selected location/);
  assert.doesNotMatch(html, />Level<\/span>/);
  assert.match(html, /aria-label="(Singleplayer|Multiplayer)"/);
  assert.match(html, /class="mission-title-button"/);
  assert.match(html, /<button(?=[^>]*class="level-briefing-toggle")(?=[^>]*disabled="")[^>]*>/);
  assert.match(html, />No briefing available<\/strong>/);
  assert.match(html, /Made with ♥️ by <a href="https:\/\/github\.com\/plp-gtr"[^>]*>plp-GTR<\/a>/);
  assert.match(html, /class="icon-link footer-info-button"/);
  assert.match(html, /id="project-info-title">About CoD Atlas/);
  assert.match(html, /This website was made by me, <a href="https:\/\/github\.com\/plp-gtr"[^>]*>Philipp Gächter<\/a>/);
  assert.doesNotMatch(html, /> Localized /);
  assert.match(html, /https:\/\/www\.google\.com\/maps\/search\/\?api=1(?:&|&amp;)query=Adriatic%20Sea/);
  assert.match(html, /aria-label="Open in Google Maps"/);
  assert.match(html, /src="webpage_icons\/maps-google-com\.ico"/);
  assert.match(html, /aria-label="Open on Call of Duty Wiki"/);
  assert.match(html, /src="webpage_icons\/callofduty-fandom-com\.webp"/);
  assert.match(html, />Google Maps<\/span>/);
  assert.match(html, />CoD Wiki<\/span>/);
  assert.ok(html.indexOf('class="mission-heading"') < html.indexOf('class="intel-kicker"'));
});

test("bundles the details-panel website icons", async () => {
  for (const filename of [
    "maps-google-com.ico",
    "wikipedia-com.ico",
    "callofdutymaps-com.webp",
    "callofduty-fandom-com.webp",
  ]) {
    await access(new URL(`../public/webpage_icons/${filename}`, import.meta.url));
  }
});

test("preserves the complete statically compiled atlas", async () => {
  const { default: atlas } = await import("../app/data/atlas.generated.json", {
    with: { type: "json" },
  });
  const entries = atlas.groups.flatMap((group) => group.entries);
  const findGroup = (name) => atlas.groups.find((group) => group.name === name);
  const findEntry = (game, title) => entries.find(
    (entry) => entry.title === title && entry.game.split(" / ").includes(game),
  );

  assert.equal(entries.length, 993);
  assert.equal(atlas.totals.levels, 973);
  assert.equal(findGroup("France").flagCode, "FR");
  assert.equal(findGroup("Turkey").flagCode, "TR");
  assert.equal(findGroup("United States").flagCode, "US");
  assert.equal(findGroup("Adriatic Sea").flagCode, null);
  assert.equal(findGroup("France").continent, "Europe");
  assert.equal(findGroup("United States").continent, "North America");
  assert.equal(findGroup("Brazil").continent, "South America");
  assert.equal(findGroup("Antarctica").continent, "Antarctica");
  assert.equal(findGroup("Adriatic Sea").continent, "Oceans");
  assert.equal(findGroup("Mars").continent, "Off-world");
  assert.ok(atlas.groups.every((group) => [
    "Africa",
    "Antarctica",
    "Arctic",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Oceania",
    "Oceans",
    "Off-world",
  ].includes(group.continent)));
  assert.ok(atlas.groups.every((group) => group.entries.every((entry) => entry.country === group.name)));
  assert.ok(entries.every((entry) => !Object.hasOwn(entry, "label")));
  assert.ok(findGroup("United States").entries.some((entry) => entry.region === "California"));
  assert.deepEqual(
    atlas.games.map((game) => game.released),
    atlas.games.map((game) => game.released).toSorted(),
    "games stay in chronological release order",
  );
  const codGame = atlas.games.find((game) => game.id === "cod");
  assert.equal(codGame.icon, "/images/games/cod.png");
  assert.equal(codGame.series, "world-war-ii");
  assert.equal(codGame.subseries, "main");
  assert.equal(codGame.remasterOf, null);
  assert.equal(atlas.games.find((game) => game.id === "cod-uo").subseries, "add-on");
  assert.equal(atlas.games.find((game) => game.id === "cod-fh").subseries, "spin-off");
  assert.equal(atlas.games.find((game) => game.id === "mw19").subseries, "reboot");
  assert.equal(atlas.games.find((game) => game.id === "mwii").subseries, "reboot");
  assert.equal(atlas.games.find((game) => game.id === "mwiii").subseries, "reboot");
  assert.equal(atlas.games.find((game) => game.id === "mw4").subseries, "reboot");
  const cod4Remastered = atlas.games.find((game) => game.id === "cod4-r");
  assert.equal(cod4Remastered.subseries, "remaster");
  assert.equal(cod4Remastered.remasterOf, "cod4");
  assert.equal(atlas.games.find((game) => game.id === "ghosts").subseries, null);
  assert.equal(atlas.games.find((game) => game.id === "wz").code, "WZ");
  assert.equal(atlas.games.find((game) => game.id === "wz2").code, "WZ2");
  assert.ok(atlas.games.every((game) => [
    "world-war-ii",
    "modern-warfare",
    "black-ops",
    "standalone",
  ].includes(game.series)));
  assert.ok(atlas.games.every((game) => game.subseries === null
    || ["main", "reboot", "remaster", "add-on", "spin-off"].includes(game.subseries)));
  assert.ok(atlas.games.every((game) => game.subseries === "remaster"
    ? atlas.games.some((original) => original.id === game.remasterOf)
    : game.remasterOf === null));
  assert.ok(atlas.games.every((game) => !Object.hasOwn(game, "era")));
  for (const game of atlas.games.filter((item) => item.icon)) {
    assert.equal(game.icon, `/images/games/${game.id}.png`);
    await access(new URL(`../public${game.icon}`, import.meta.url));
  }
  assert.ok(atlas.games.some((game) => !game.icon), "game labels remain available as the icon fallback");
  assert.ok(entries.every((entry) => Array.isArray(entry.gameIds) && entry.gameIds.length > 0));
  const rtvBannerKeys = Object.keys(atlas.levelBanners)
    .filter((key) => key.startsWith("rtv-"))
    .sort();

  assert.ok(rtvBannerKeys.length >= 5, "at least 5 RTV level banners exist");

  for (const key of rtvBannerKeys.slice(0, 5)) {
    const banner = atlas.levelBanners[key];

    assert.ok(banner.thumbnailUrl, `${key} has a thumbnail URL`);
    assert.ok(banner.author, `${key} has author information`);
  }
  assert.equal(atlas.levelBanners["rtv-altavilla@rtv"].thumbnailUrl, "/images/levels/rtv/altavilla/main.png");
  assert.equal(atlas.levelBanners["rtv-altavilla@rtv"].author.userUrl, "https://github.com/plp-gtr");
  assert.equal(atlas.levelIdAliases["cod-cod2-wwii-carentan"], "cod-carentan");
  const carentanAppearanceEntry = entries.find((entry) => entry.levelId === "cod-carentan");
  assert.deepEqual(carentanAppearanceEntry.gameIds, ["cod", "cod2", "wwii"]);
  assert.deepEqual(carentanAppearanceEntry.appearances.map((appearance) => appearance.gameId), ["cod", "cod2", "wwii"]);
  assert.ok(carentanAppearanceEntry.appearances.every((appearance) => appearance.wikiArticle === carentanAppearanceEntry.wikiArticle));
  assert.ok(carentanAppearanceEntry.appearances.every((appearance) => appearance.notesId === "cod-carentan"));
  const ashikaIslandEntry = entries.find((entry) => entry.levelId === "wz2-ashika-island");
  assert.deepEqual(ashikaIslandEntry.gameIds.toSorted(), ["mwii", "wz2"]);
  const vondelEntry = entries.find((entry) => entry.levelId === "wz2-vondel");
  assert.deepEqual(vondelEntry.gameIds.toSorted(), ["mwii", "mwiii", "wz2"]);
  assert.equal(vondelEntry.appearances.find((appearance) => appearance.gameId === "mwiii").title, "Vondel Night");
  assert.ok(entries.every((entry) =>
    entry.modes.length === 1 && ["singleplayer", "multiplayer"].includes(entry.modes[0])));
  assert.ok(entries.every((entry) => typeof entry.hasLevelNotes === "boolean"));
  assert.equal(entries.find((entry) => entry.levelId === "wz-fortune-s-keep").hasLevelNotes, false);
  assert.equal(entries.find((entry) => entry.levelId === "cod-pavlov").hasLevelNotes, true);

  const expectedCod1MapLinks = new Map([
    ["cod-bocage", "bocage-2"],
    ["cod-brecourt", "brecourt"],
    ["cod-carentan", "Carentan-2"],
    ["cod-chateau", "chateau"],
    ["cod-dawnville", "dawnville"],
    ["cod-depot", "depot"],
    ["cod-harbor", "harbor"],
    ["cod-hurtgen", "hurtgen"],
    ["cod-neuville", "neuville"],
    ["cod-pavlov", "pavlov"],
    ["cod-pow-camp", "pow-camp"],
    ["cod-railyard", "railyard"],
    ["cod-rocket", "rocket"],
    ["cod-ship", "ship"],
    ["cod-stalingrad-mp", "stalingrad"],
    ["cod-tigertown", "tigertown"],
  ]);
  const cod1MapEntries = entries.filter((entry) =>
    entry.gameIds.includes("cod")
    && entry.urls?.some((url) => url.callOfDutyMaps?.startsWith("https://callofdutymaps.com/call-of-duty-1/")));
  assert.deepEqual(
    cod1MapEntries.map((entry) => entry.levelId).sort(),
    [...expectedCod1MapLinks.keys()].sort(),
  );
  for (const entry of cod1MapEntries) {
    const slug = expectedCod1MapLinks.get(entry.levelId);
    const url = entry.urls.find((item) => item.callOfDutyMaps).callOfDutyMaps;
    assert.equal(url, `https://callofdutymaps.com/call-of-duty-1/${slug}/`);
    assert.ok(entry.gameIds.includes("cod"));
    assert.deepEqual(entry.modes, ["multiplayer"]);
  }

  const expectedCod4MapLinks = new Map([
    ["cod4-ambush", "ambush/"],
    ["cod4-backlot", "backlot/"],
    ["cod4-bloc", "bloc"],
    ["cod4-bog", "bog"],
    ["cod4-broadcast", "broadcast"],
    ["cod4-chinatown", "chinatown"],
    ["cod4-countdown", "countdown/"],
    ["cod4-creek", "creek"],
    ["cod4-crossfire", "crossfire"],
    ["cod4-district", "district/"],
    ["cod4-downpour", "downpour"],
    ["cod4-killhouse", "killhouse"],
    ["cod4-crash", "crash"],
    ["cod4-vacant", "vacant"],
    ["cod4-overgrown", "overgrown"],
    ["cod4-strike", "strike"],
    ["cod4-pipeline", "pipeline"],
    ["cod4-shipment", "shipment"],
    ["cod4-showdown", "showdown"],
    ["cod4-wet-work", "wet-work"],
  ]);
  const cod4MapEntries = entries.filter((entry) =>
    entry.urls?.some((url) => url.callOfDutyMaps?.startsWith("https://callofdutymaps.com/cod-4-modern-warfare/")));
  assert.deepEqual(
    cod4MapEntries.map((entry) => entry.levelId).sort(),
    [...expectedCod4MapLinks.keys()].sort(),
  );
  for (const entry of cod4MapEntries) {
    const slug = expectedCod4MapLinks.get(entry.levelId);
    const url = entry.urls.find((item) => item.callOfDutyMaps).callOfDutyMaps;
    assert.equal(url, `https://callofdutymaps.com/cod-4-modern-warfare/${slug}`);
    assert.ok(entry.gameIds.includes("cod4"));
    assert.deepEqual(entry.modes, ["multiplayer"]);
  }

  const expectedMw2MapLinks = new Map([
    ["mw2-afgan", "afghan"],
    ["mw2-bailout", "bailout"],
    ["mw2-carnival", "carnival"],
    ["mw2-derail", "derail"],
    ["mw2-estate", "estate"],
    ["mw2-favela", "favela"],
    ["mw2-highrise", "highrise"],
    ["mw2-invasion", "invasion"],
    ["mw2-karachi", "karachi"],
    ["mw2-terminal", "terminal"],
    ["mw2-quarry", "quarry"],
    ["mw2-rundown", "rundown"],
    ["mw2-rust", "rust"],
    ["mw2-salvage", "salvage"],
    ["mw2-scrapyard", "scrapyard"],
    ["mw2-skidrow", "skidrow"],
    ["mw2-sub-base", "sub-base"],
    ["mw2-trailer-park", "trailer-park"],
    ["mw2-underpass", "underpass"],
    ["mw2-wasteland", "wasteland"],
  ]);
  const mw2MapEntries = entries.filter((entry) =>
    entry.urls?.some((url) => url.callOfDutyMaps?.startsWith("https://callofdutymaps.com/modern-warfare-2/")));
  assert.deepEqual(
    mw2MapEntries.map((entry) => entry.levelId).sort(),
    [...expectedMw2MapLinks.keys()].sort(),
  );
  for (const entry of mw2MapEntries) {
    const slug = expectedMw2MapLinks.get(entry.levelId);
    const url = entry.urls.find((item) => item.callOfDutyMaps).callOfDutyMaps;
    assert.equal(url, `https://callofdutymaps.com/modern-warfare-2/${slug}`);
    assert.ok(entry.gameIds.includes("mw2"));
    assert.deepEqual(entry.modes, ["multiplayer"]);
  }

  const codCampaigns = new Map([
    ["1", {
      label: "American Campaign",
      levels: ["Camp Toccoa", "Pathfinder", "Ste. Mere-Eglise", "Ste. Mere Eglise-Day", "Normandy Route N13", "Brecourt Manor", "Alps Chateau", "Dulag IIIA"],
    }],
    ["2", {
      label: "British Campaign",
      levels: ["Pegasus Bridge", "Pegasus Bridge-Day", "The Eder Dam", "Eder Dam Getaway", "Airfield Escape", "Battleship Tirpitz"],
    }],
    ["3", {
      label: "Soviet Campaign",
      levels: ["Stalingrad", "Red Square", "Train Station", "Stalingrad Sewers", "Pavlov's House", "Warsaw Factory", "Warsaw Railyard", "Oder River Country", "Oder River Town"],
    }],
    ["4", {
      label: "Epilogue",
      levels: ["Festung Recogne", "V-2 Rocket Site", "The Reichstag"],
    }],
  ]);
  const uniqueCodCampaignLevels = new Map(entries
    .filter((entry) => entry.gameIds.includes("cod") && entry.modes[0] === "singleplayer")
    .map((entry) => [entry.levelId, entry]));
  assert.equal(uniqueCodCampaignLevels.size, 26);
  for (const [campaignId, campaign] of codCampaigns) {
    for (const title of campaign.levels) {
      assert.deepEqual(findEntry("COD", title).campaign, {
        id: campaignId,
        label: campaign.label,
      });
    }
  }
  assert.ok([...uniqueCodCampaignLevels.values()].every((entry) => codCampaigns.has(entry.campaign?.id)));
  assert.deepEqual(
    [...uniqueCodCampaignLevels.values()]
      .sort((a, b) => a.campaignOrder - b.campaignOrder)
      .map((entry) => entry.title),
    [...codCampaigns.values()].flatMap((campaign) => campaign.levels),
  );

  assert.deepEqual(findEntry("COD2", "The Diversionary Raid").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("COD2", "Holding the Line").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("COD2", "Toujane").modes, ["multiplayer"]);
  assert.deepEqual(findEntry("COD4", "Blackout").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("BO4", "Blackout Map").modes, ["multiplayer"]);
  assert.deepEqual(findEntry("BO2", "FOB").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("BOCW", "CIA").modes, ["singleplayer"]);

  const laisonRiver = findEntry("COD3", "Laison River");
  assert.deepEqual(laisonRiver.coordinates, [48.944742, -0.229523]);
  assert.equal(laisonRiver.country, "France");
  assert.equal(laisonRiver.city, "Falaise");
  assert.equal(laisonRiver.region, "Normandy");
  assert.equal(laisonRiver.landmark, "Laizon River");
  assert.equal(laisonRiver.precision, "approximate");
  assert.equal(laisonRiver.confidence, "medium");
  assert.equal(laisonRiver.method, "manual-approximate");

  const corridorOfDeath = findEntry("COD3", "The Corridor of Death");
  assert.equal(corridorOfDeath.country, "France");
  assert.equal(corridorOfDeath.region, "Saint-Lambert-sur-Dive");
  assert.equal(corridorOfDeath.city, null);
  assert.equal(corridorOfDeath.landmark, null);
  assert.deepEqual(corridorOfDeath.coordinates, [48.819557910469904, 0.07593786425682185]);
  assert.equal(corridorOfDeath.precision, "approximate");
  assert.equal(corridorOfDeath.confidence, "medium");
  assert.equal(corridorOfDeath.method, "manual-approximate");
  assert.deepEqual(corridorOfDeath.urls, [
    { googleMaps: "https://maps.app.goo.gl/Wjtis8unFE4KVvgL9" },
    { wikipedia: "https://en.wikipedia.org/wiki/Saint-Lambert-sur-Dive" },
  ]);

  const blowtorchAndCorkscrew = findEntry("WAW", "Blowtorch & Corkscrew");
  assert.deepEqual(blowtorchAndCorkscrew.coordinates, [26.22882, 127.71437]);
  assert.equal(blowtorchAndCorkscrew.country, "Japan");
  assert.equal(blowtorchAndCorkscrew.city, "Naha");
  assert.equal(blowtorchAndCorkscrew.region, "Okinawa");
  assert.equal(blowtorchAndCorkscrew.landmark, "Wana Ridge, Sueyoshi Park");
  assert.equal(blowtorchAndCorkscrew.precision, "approximate");
  assert.equal(blowtorchAndCorkscrew.confidence, "high");
  assert.equal(blowtorchAndCorkscrew.method, "manual-approximate");

  const aDesertRide = findEntry("FH", "A Desert Ride");
  assert.deepEqual(aDesertRide.coordinates, [33.216131, 9.800375]);
  assert.equal(aDesertRide.country, "Tunisia");
  assert.equal(aDesertRide.region, "Kebili Governorate");
  assert.equal(aDesertRide.landmark, "Centenarium Tibubuci (Ksar Tarcine)");
  assert.equal(aDesertRide.precision, "exact");
  assert.equal(aDesertRide.confidence, "high");
  assert.equal(aDesertRide.method, "verified-landmark");
  assert.deepEqual(aDesertRide.urls, [
    {
      googleMaps:
        "https://www.google.com/maps/search/?api=1&query=Ksar+Tarcine%2C+Kebili+Governorate%2C+Tunisia",
    },
    { wikipedia: "https://fr.wikipedia.org/wiki/Centenarium_de_Tibubuci" },
  ]);

  const shuriCastle = findEntry("WAW:FF", "Shuri Castle");
  assert.equal(shuriCastle.country, "Japan");
  assert.equal(shuriCastle.region, "Okinawa");
  assert.equal(shuriCastle.city, "Naha");
  assert.equal(shuriCastle.landmark, "Shuri Castle");

  const intoTheFurnace = findEntry("MW19", "Into the Furnace");
  assert.equal(intoTheFurnace.country, "Georgia");
  assert.equal(intoTheFurnace.region, null);

  const casino = findEntry("BO4", "Casino");
  assert.equal(casino.country, "Monaco");
  assert.equal(casino.region, "Monte Carlo");
  assert.equal(casino.city, null);
  assert.equal(casino.landmark, "Casino de Monte-Carlo");
  assert.deepEqual(casino.coordinates, [43.739444, 7.428889]);
  assert.equal(casino.precision, "exact");
  assert.equal(casino.confidence, "high");
  assert.equal(casino.method, "real-world-inspiration");
  assert.deepEqual(casino.urls, [
    { googleMaps: "https://maps.app.goo.gl/c4AA1ZP8rtzM7unH9" },
    { wikipedia: "https://en.wikipedia.org/wiki/Monte_Carlo_Casino" },
  ]);

  const bocageMedia = atlas.wikiMedia["codwiki-bocage"].main;
  assert.match(bocageMedia.thumbnailUrl, /scale-to-width-down\/800/);
  assert.equal(bocageMedia.author.name, "Thumps4DaZomb");
  assert.equal(bocageMedia.author.role, "uploader");
  assert.equal(bocageMedia.license.name, null);
  assert.equal(bocageMedia.rights.status, "non-free");
  assert.match(bocageMedia.rights.notice, /identification and critical commentary/);

  const cod2Entries = entries.filter((entry) => entry.game.split(" / ").includes("COD2"));
  assert.equal(cod2Entries.filter((entry) => entry.modes[0] === "singleplayer").length, 27);
  assert.equal(cod2Entries.filter((entry) => entry.modes[0] === "multiplayer").length, 20);
  assert.equal(entries.filter((entry) => entry.modes[0] === "singleplayer").length, 407);
  assert.equal(entries.filter((entry) => entry.modes[0] === "multiplayer").length, 586);
});

test("keeps calibrated game-map overlays in a separate generated store", async () => {
  const { default: overlays } = await import("../app/data/map-overlays.generated.json", {
    with: { type: "json" },
  });
  const altavilla = overlays["rtv-altavilla"];
  assert.equal(altavilla.image, "/images/levels/rtv/altavilla/maps/briefing-map.png");
  assert.deepEqual(altavilla.corners, {
    topLeft: [40.59997, 14.78375],
    topRight: [40.59054, 15.29434],
    bottomLeft: [40.38271, 14.7768],
    bottomRight: [40.37325, 15.28739],
  });
  assert.equal(altavilla.attribution.rights, "non-free");
  await access(new URL(`../public${altavilla.image}`, import.meta.url));
  const scavengerHunt = overlays["rtv-scavenger-hunt"];
  assert.equal(scavengerHunt.image, "/images/levels/rtv/scavenger-hunt/maps/briefing-map.png");
  assert.deepEqual(scavengerHunt.corners, {
    topLeft: [49.41909, -1.36634],
    topRight: [49.42172, -1.26404],
    bottomLeft: [49.37522, -1.36368],
    bottomRight: [49.37785, -1.26138],
  });
  assert.equal(scavengerHunt.attribution.extractedBy, "plp-gtr");
  await access(new URL(`../public${scavengerHunt.image}`, import.meta.url));
});

test("keeps clickable historical overlays in a separate generated store", async () => {
  const { default: overlays } = await import("../app/data/history-overlays.generated.json", {
    with: { type: "json" },
  });
  const factoryOverlay = overlays["cod-fh-defend-the-factory"][0];
  assert.equal(factoryOverlay.id, "the-li-army-corps-assault-14-15-october-1942");
  assert.equal(
    factoryOverlay.image,
    "/images/levels/cod-fh/defend-the-factory/extra/the-li-army-corps-assault-14-15-october-1942.png",
  );
  assert.deepEqual(factoryOverlay.corners, {
    topLeft: [48.82027881, 44.57762708],
    topRight: [48.81103475, 44.63242629],
    bottomLeft: [48.78017725, 44.56203062],
    bottomRight: [48.77092579, 44.61682983],
  });
  assert.equal(factoryOverlay.attribution.author, "David M. Glantz");
  assert.equal(factoryOverlay.attribution.copyrightHolder, "Taylor & Francis Group, LLC");
  assert.equal(factoryOverlay.attribution.rights, "non-free");
  await access(new URL(`../public${factoryOverlay.image}`, import.meta.url));
});
