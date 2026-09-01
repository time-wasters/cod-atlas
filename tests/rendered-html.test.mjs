import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

test("catalogues the complete Black Ops 6 campaign, multiplayer, and Zombies roster", async () => {
  const bo6Root = new URL("../content/levels/bo6/", import.meta.url);
  assert.deepEqual((await readdir(new URL("campaign/", bo6Root))).sort(), [
    "1-bishop-takes-rook.md",
    "10-emergence.md",
    "11-the-rook-recovery.md",
    "12-high-rollers.md",
    "13-the-rook-contact.md",
    "14-ground-control.md",
    "15-under-the-radar.md",
    "16-the-rook-interrogation.md",
    "17-separation-anxiety.md",
    "18-checkmate.md",
    "2-the-rook-arrival.md",
    "3-blood-feud.md",
    "4-the-rook-assemble.md",
    "5-most-wanted.md",
    "6-the-rook-reunion.md",
    "7-hunting-season.md",
    "8-the-cradle.md",
    "9-the-rook-reconciliation.md",
  ]);
  assert.deepEqual((await readdir(new URL("multiplayer/", bo6Root))).sort(), [
    "babylon.md", "barrage.md", "blazetown.md", "blitz.md", "boo-town.md", "bounty.md",
    "bullet.md", "dealership.md", "derelict.md", "eclipse.md", "exchange.md", "extraction.md",
    "firing-range.md", "fringe.md", "fugitive.md", "gala.md", "gravity.md", "grind-ooze.md",
    "grind.ref.md", "hacienda.md", "haven.md", "heirloom.md", "hideout.md", "jackpot.md",
    "lifeline.md", "lowtown.md", "mothball.md", "nomad.md", "nuketown-holiday.md",
    "nuketown.ref.md", "payback.md", "pit.md", "protocol.md", "racket.md", "red-card.md",
    "rewind.md", "rig.md", "runway.md", "scud.md", "shutdown.md", "signal.md", "skyline.md",
    "stakeout.md", "subsonic.md", "vault.md", "vorkuta.md", "warhead.md",
    "world-motor-dynasty.md",
  ]);
  assert.deepEqual((await readdir(new URL("zombies/", bo6Root))).sort(), [
    "citadelle-des-morts.md",
    "liberty-falls.md",
    "reckoning.md",
    "shattered-veil.md",
    "terminus.md",
    "the-tomb.md",
  ]);
  assert.match(await readFile(new URL("multiplayer/nuketown.ref.md", bo6Root), "utf8"), /level: bo-nuketown/);
  assert.match(await readFile(new URL("multiplayer/grind.ref.md", bo6Root), "utf8"), /level: bo2-grind/);
  for (const filename of await readdir(new URL("zombies/", bo6Root))) {
    assert.match(await readFile(new URL(`zombies/${filename}`, bo6Root), "utf8"), /mode: zombies/);
  }
});

test("catalogues the complete sorted Modern Warfare (2007) campaign roster", async () => {
  const cod4Root = new URL("../content/levels/cod4/", import.meta.url);
  assert.deepEqual((await readdir(cod4Root)).sort(), ["campaign", "multiplayer"]);
  assert.deepEqual((await readdir(new URL("campaign/", cod4Root))).sort(), [
    "1-f-n-g.md",
    "10-shock-and-awe.md",
    "11-aftermath.md",
    "12-safehouse.md",
    "13-all-ghillied-up.md",
    "14-one-shot-one-kill.md",
    "15-heat.md",
    "16-the-sins-of-the-father.md",
    "17-ultimatum.md",
    "18-all-in.md",
    "19-no-fighting-in-the-war-room.md",
    "2-crew-expendable.md",
    "20-game-over.md",
    "21-mile-high-club.md",
    "3-the-coup.md",
    "4-blackout.md",
    "5-charlie-don-t-surf.md",
    "6-the-bog.md",
    "7-hunted.md",
    "8-death-from-above.md",
    "9-war-pig.md",
  ]);
});

test("renders the hosted atlas shell", async () => {
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
  assert.match(html, /<h1><img[^>]*src="images\/banner\.png"[^>]*alt="CoD Atlas"/);
  assert.match(html, /class="intel-country-fallback"/);
  assert.match(html, /class="country-select-trigger"/);
  assert.match(html, /class="sidebar-toggle"[^>]*aria-expanded="true"[^>]*aria-label="Hide map filters"/);
  assert.match(html, /class="details-toggle"[^>]*aria-expanded="true"[^>]*aria-label="Hide level details"/);
  assert.match(html, /class="collapsed-level-title"[^>]*aria-label="Show details for [^"]+"/);
  assert.match(html, /aria-label="Filter by game, ordered by release date"/);
  assert.match(html, /class="game-catalog-trigger"[^>]*aria-haspopup="dialog"/);
  assert.match(html, /id="game-catalog-title">Call of Duty games/);
  assert.match(html, /class="game-catalog-entry"/);
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
  assert.match(html, /class="mode-filter"[^>]*aria-label="Map type visibility"/);
  assert.match(html, /<button(?=[^>]*aria-pressed="false")[^>]*>\s*<span[^>]*>[^<]*<\/span>\s*(?:<!-- -->)?Zombies/);
  assert.doesNotMatch(html, /class="precision-filter"/);
  assert.match(html, /role="tab"[^>]*aria-selected="true"[^>]*aria-controls="sidebar-locations"/);
  assert.match(html, /<button(?=[^>]*role="tab")(?=[^>]*aria-controls="sidebar-campaigns")(?=[^>]*disabled="")[^>]*>/);
  assert.match(html, />Adriatic Sea<\/span>/);
  assert.doesNotMatch(html, /Selected location/);
  assert.doesNotMatch(html, />Level<\/span>/);
  assert.match(html, /aria-label="(Campaign|Multiplayer|Zombies)"/);
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
  assert.ok(entries.every((entry) => typeof entry.primary === "boolean"));
  const findGroup = (name) => atlas.groups.find((group) => group.name === name);
  const findEntry = (game, title) => entries.find(
    (entry) => entry.title === title && entry.game.split(" / ").includes(game),
  );

  assert.equal(entries.length, 1065);
  assert.equal(atlas.totals.levels, 1119);
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
  assert.ok(entries.every((entry) => entry.coordinates === null
    || entry.coordinates === undefined
    || (entry.coordinates.length === 2 && entry.coordinates.every(Number.isFinite))));
  const rtvBannerKeys = Object.keys(atlas.levelBanners)
    .filter((key) => key.startsWith("rtv-"))
    .sort();

  assert.ok(rtvBannerKeys.length >= 5, "at least 5 RTV level banners exist");

  for (const key of rtvBannerKeys.slice(0, 5)) {
    const banner = atlas.levelBanners[key];

    assert.ok(banner.thumbnailUrl, `${key} has a thumbnail URL`);
    assert.ok(banner.author, `${key} has author information`);
  }
  assert.match(
    atlas.levelBanners["rtv-altavilla@rtv"].thumbnailUrl,
    /^\/images\/levels\/rtv\/campaign\/1-altavilla\/main\.(?:jpg|png)$/,
  );
  assert.equal(atlas.levelBanners["rtv-altavilla@rtv"].author.userUrl, "https://github.com/plp-gtr");
  assert.equal(atlas.levelIdAliases["cod-cod2-wwii-carentan"], "cod-carentan");
  const carentanAppearanceEntry = entries.find((entry) => entry.levelId === "cod-carentan");
  assert.deepEqual(carentanAppearanceEntry.gameIds, ["cod", "cod-uo", "cod2", "rtv", "wwii"]);
  assert.deepEqual(carentanAppearanceEntry.appearances.map((appearance) => appearance.gameId), ["cod", "cod-uo", "cod2", "rtv", "wwii"]);
  assert.ok(carentanAppearanceEntry.appearances.every((appearance) => appearance.wikiArticle === carentanAppearanceEntry.wikiArticle));
  assert.ok(carentanAppearanceEntry.appearances.every((appearance) => appearance.notesId === "cod-carentan"));
  const ashikaIslandEntry = entries.find((entry) => entry.levelId === "wz2-ashika-island");
  assert.deepEqual(ashikaIslandEntry.gameIds, ["wz2"]);
  const vondelEntry = entries.find((entry) => entry.levelId === "wz2-vondel");
  assert.deepEqual(vondelEntry.gameIds, ["wz2"]);
  assert.ok(entries.find((entry) => entry.levelId === "mw2-afgan").gameIds.includes("mwiii"));
  assert.ok(entries.find((entry) => entry.levelId === "mwii-shipment").gameIds.includes("mwiii"));
  assert.deepEqual(entries.find((entry) => entry.levelId === "mwiii-meat").gameIds, ["mwiii"]);
  const urzikstanEntry = entries.find((entry) => entry.levelId === "mwiii-urzikstan");
  assert.deepEqual(urzikstanEntry.gameIds, ["mwiii", "wz2"]);
  assert.equal(urzikstanEntry.appearances.find((appearance) => appearance.gameId === "wz2").title, "Urzikstan");
  assert.ok(entries.every((entry) =>
    entry.modes.length === 1 && ["singleplayer", "multiplayer", "zombies"].includes(entry.modes[0])));
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

  const expectedCod3MapLinks = new Map([
    ["cod3-aller-haut", "aller-haut"],
    ["cod3-argentan", "argentan"],
    ["cod3-champs", "champs"],
    ["cod3-crossing", "crossing"],
    ["cod3-eder-dam", "eder-dam"],
    ["cod3-fuel-plant-multiplayer", "fuel-plant"],
    ["cod3-gare-centrale", "gare-centrale"],
    ["cod3-ironclad", "ironclad"],
    ["cod3-la-bourgade", "la-bourgade"],
    ["cod3-les-ormes", "les-ormes"],
    ["cod3-marseilles", "marseilles"],
    ["cod3-mayenne", "mayenne"],
    ["cod3-merville", "merville"],
    ["cod3-poisson", "poisson"],
    ["cod3-rimling", "rimling"],
    ["cod3-rouen", "rouen"],
    ["cod3-seine-river", "seine-river"],
    ["cod3-stalag-23", "stalag-23"],
    ["cod3-verdun", "verdun"],
    ["cod3-wildwood", "wildwood"],
  ]);
  const cod3MapEntries = entries.filter((entry) =>
    entry.gameIds.includes("cod3")
    && entry.urls?.some((url) => url.callOfDutyMaps?.startsWith("https://callofdutymaps.com/call-of-duty-3/")));
  assert.deepEqual(
    cod3MapEntries.map((entry) => entry.levelId).sort(),
    [...expectedCod3MapLinks.keys()].sort(),
  );
  for (const entry of cod3MapEntries) {
    const slug = expectedCod3MapLinks.get(entry.levelId);
    const url = entry.urls.find((item) => item.callOfDutyMaps).callOfDutyMaps;
    assert.equal(url, `https://callofdutymaps.com/call-of-duty-3/${slug}/`);
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
    ["mw2-fuel", "fuel/"],
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
    ["mw2-storm", "storm/"],
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

  const rtvCampaigns = new Map([
    ["1", {
      label: "American Campaign",
      levels: ["Altavilla", "Scavenger Hunt", "Glider Crash", "Lucky Thirteen", "Nijmegen", "Hunner Park", "River Crossing"],
    }],
    ["2", {
      label: "Canadian Campaign",
      levels: ["Woensdrecht", "Sloedam", "Walcheren", "Reichswald"],
    }],
    ["3", {
      label: "British Campaign",
      levels: ["Arnhem Fire", "Arnhem Assault", "Rhine Crossing"],
    }],
  ]);
  const uniqueRtvCampaignLevels = new Map(entries
    .filter((entry) => entry.gameIds.includes("rtv") && entry.modes[0] === "singleplayer")
    .map((entry) => [entry.levelId, entry]));
  assert.equal(uniqueRtvCampaignLevels.size, 14);
  for (const [campaignId, campaign] of rtvCampaigns) {
    for (const title of campaign.levels) {
      assert.deepEqual(findEntry("RTV", title).campaign, {
        id: campaignId,
        label: campaign.label,
      });
    }
  }
  assert.ok([...uniqueRtvCampaignLevels.values()].every((entry) => rtvCampaigns.has(entry.campaign?.id)));
  assert.deepEqual(
    [...uniqueRtvCampaignLevels.values()]
      .sort((a, b) => a.campaignOrder - b.campaignOrder)
      .map((entry) => entry.title),
    [...rtvCampaigns.values()].flatMap((campaign) => campaign.levels),
  );
  const rtvMultiplayerMaps = entries
    .filter((entry) => entry.gameIds.includes("rtv") && entry.modes[0] === "multiplayer")
    .map((entry) => entry.title)
    .sort();
  assert.deepEqual(rtvMultiplayerMaps, [
    "Beltot",
    "Brecourt",
    "Burgundy",
    "Carentan",
    "El Alamein",
    "St. Mere Eglise",
    "Utrecht",
    "Wesel",
  ].sort());

  assert.deepEqual(findEntry("COD2", "The Diversionary Raid").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("COD2", "Holding the Line").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("COD2", "Toujane").modes, ["multiplayer"]);
  assert.deepEqual(findEntry("COD4", "Blackout").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("BO4", "Blackout Map").modes, ["multiplayer"]);
  assert.deepEqual(findEntry("BO2", "FOB").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("BOCW", "CIA").modes, ["singleplayer"]);

  const bocageMedia = atlas.wikiMedia["codwiki-bocage"].main;
  assert.match(bocageMedia.thumbnailUrl, /scale-to-width-down\/800/);
  assert.equal(bocageMedia.author.name, "Thumps4DaZomb");
  assert.equal(bocageMedia.author.role, "uploader");
  assert.equal(bocageMedia.license.name, null);
  assert.equal(bocageMedia.rights.status, "non-free");
  assert.match(bocageMedia.rights.notice, /identification and critical commentary/);

  const cod2Entries = entries.filter((entry) => entry.game.split(" / ").includes("COD2"));
  assert.equal(cod2Entries.filter((entry) => entry.modes[0] === "singleplayer").length, 27);
  assert.equal(cod2Entries.filter((entry) => entry.modes[0] === "multiplayer").length, 23);
  assert.equal(entries.filter((entry) => entry.modes[0] === "singleplayer").length, 422);
  assert.equal(entries.filter((entry) => entry.modes[0] === "multiplayer").length, 633);
  assert.equal(entries.filter((entry) => entry.modes[0] === "zombies").length, 10);
});

test("keeps calibrated game-map overlays in a separate generated store", async () => {
  const { default: overlays } = await import("../app/data/map-overlays.generated.json", {
    with: { type: "json" },
  });
  const altavilla = overlays["rtv-altavilla"];
  assert.equal(altavilla.image, "/images/levels/rtv/campaign/1-altavilla/maps/overlay.png");
  assert.deepEqual(altavilla.corners, {
    topLeft: [40.59997, 14.78375],
    topRight: [40.59054, 15.29434],
    bottomLeft: [40.38271, 14.7768],
    bottomRight: [40.37325, 15.28739],
  });
  assert.equal(altavilla.attribution.rights, "non-free");
  await access(new URL(`../public${altavilla.image}`, import.meta.url));
  const scavengerHunt = overlays["rtv-scavenger-hunt"];
  assert.equal(scavengerHunt.image, "/images/levels/rtv/campaign/2-scavenger-hunt/maps/overlay.png");
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
    "/images/levels/cod-fh/campaign/4-defend-the-factory/extra/the-li-army-corps-assault-14-15-october-1942.png",
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
