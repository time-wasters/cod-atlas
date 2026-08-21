import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

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
  assert.match(html, /aria-pressed="false"[^>]*>[\s\S]{0,120}Multiplayer/);
  assert.match(html, />Adriatic Sea<\/span>/);
  assert.doesNotMatch(html, /Selected location/);
  assert.doesNotMatch(html, />Level<\/span>/);
  assert.match(html, /aria-label="(Singleplayer|Multiplayer)"/);
  assert.match(html, /class="mission-title-button"/);
  assert.match(html, /Made with ♥️ by <a href="https:\/\/github\.com\/plp-gtr"[^>]*>plp-GTR<\/a>/);
  assert.match(html, /class="icon-link footer-info-button"/);
  assert.match(html, /id="project-info-title">About CoD Atlas/);
  assert.match(html, /This website was made by me, <a href="https:\/\/github\.com\/plp-gtr"[^>]*>Philipp Gächter<\/a>/);
  assert.doesNotMatch(html, /> Localized /);
  assert.match(html, /https:\/\/www\.google\.com\/maps\/search\/\?api=1(?:&|&amp;)query=Adriatic%20Sea/);
  assert.ok(html.indexOf('class="mission-heading"') < html.indexOf('class="intel-kicker"'));
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

  assert.equal(entries.length, 988);
  assert.equal(findGroup("France").flagCode, "FR");
  assert.equal(findGroup("Turkey").flagCode, "TR");
  assert.equal(findGroup("United States").flagCode, "US");
  assert.equal(findGroup("Adriatic Sea").flagCode, null);
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
  assert.equal(atlas.levelBanners["rtv-altavilla"].thumbnailUrl, "/images/levels/rtv/altavilla.png");
  assert.equal(atlas.levelBanners["rtv-altavilla"].author.userUrl, "https://github.com/plp-gtr");
  assert.ok(entries.every((entry) =>
    entry.modes.length === 1 && ["singleplayer", "multiplayer"].includes(entry.modes[0])));

  const expectedCod1MapLinks = new Map([
    ["cod-bocage", "bocage"],
    ["cod-brecourt", "brecourt"],
    ["cod-cod2-wwii-carentan", "carentan"],
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
  const codMapEntries = entries.filter((entry) =>
    entry.urls?.some((url) => url.callOfDutyMaps));
  assert.deepEqual(
    codMapEntries.map((entry) => entry.levelId).sort(),
    [...expectedCod1MapLinks.keys()].sort(),
  );
  for (const entry of codMapEntries) {
    const slug = expectedCod1MapLinks.get(entry.levelId);
    const url = entry.urls.find((item) => item.callOfDutyMaps).callOfDutyMaps;
    assert.equal(url, `https://callofdutymaps.com/call-of-duty-1/${slug}/`);
    assert.ok(entry.gameIds.includes("cod"));
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
  assert.equal(cod2Entries.filter((entry) => entry.modes[0] === "multiplayer").length, 21);
  assert.equal(entries.filter((entry) => entry.modes[0] === "singleplayer").length, 407);
  assert.equal(entries.filter((entry) => entry.modes[0] === "multiplayer").length, 581);
});

test("keeps calibrated game-map overlays in a separate generated store", async () => {
  const { default: overlays } = await import("../app/data/map-overlays.generated.json", {
    with: { type: "json" },
  });
  const altavilla = overlays["rtv-altavilla"];
  assert.equal(altavilla.image, "/images/maps/rtv/altavilla.png");
  assert.deepEqual(altavilla.corners, {
    topLeft: [40.59997, 14.78375],
    topRight: [40.59054, 15.29434],
    bottomLeft: [40.38271, 14.7768],
    bottomRight: [40.37325, 15.28739],
  });
  assert.equal(altavilla.attribution.rights, "non-free");
  await access(new URL(`../public${altavilla.image}`, import.meta.url));
  const scavengerHunt = overlays["rtv-scavenger-hunt"];
  assert.equal(scavengerHunt.image, "/images/maps/rtv/scavenger-hunt.png");
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
    "/images/maps/cod-fh/4-defend-the-factory/the-li-army-corps-assault-14-15-october-1942.png",
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
