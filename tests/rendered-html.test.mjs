import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

test("catalogues the complete Modern Warfare 3 Special Ops roster", async () => {
  const specialOpsRoot = new URL("../content/levels/mw3/special-ops/", import.meta.url);
  assert.deepEqual((await readdir(specialOpsRoot)).sort(), [
    "arctic-recon.md",
    "arkaden-survival.md",
    "bakaara-survival.md",
    "black-box-survival.md",
    "black-ice.md",
    "boardwalk-survival.md",
    "bootleg-survival.md",
    "carbon-survival.md",
    "charges-set.md",
    "decommission-survival.md",
    "dome-survival.md",
    "downturn-survival.md",
    "fallen-survival.md",
    "fatal-extraction.md",
    "fire-mission.md",
    "firewall.md",
    "flood-the-market.md",
    "foundation-survival.md",
    "gulch-survival.md",
    "hardhat-survival.md",
    "hit-and-run.md",
    "hostage-taker.md",
    "interchange-survival.md",
    "invisible-threat.md",
    "iron-clad.md",
    "kill-switch.md",
    "liberation-survival.md",
    "light-em-up.md",
    "little-bros.md",
    "lockdown-survival.md",
    "milehigh-jack.md",
    "mission-survival.md",
    "negotiator.md",
    "oasis-survival.md",
    "off-shore-survival.md",
    "outpost-survival.md",
    "over-reactor.md",
    "overwatch-survival.md",
    "parish-survival.md",
    "piazza-survival.md",
    "resistance-movement.md",
    "resistance-survival.md",
    "sanctuary-survival.md",
    "seatown-survival.md",
    "server-crash.md",
    "smack-town.md",
    "special-delivery.md",
    "stay-sharp.md",
    "terminal-survival.md",
    "toxic-paradise.md",
    "underground-survival.md",
    "vertigo.md",
    "village-survival.md",
  ]);
  for (const filename of await readdir(specialOpsRoot)) {
    assert.match(await readFile(new URL(filename, specialOpsRoot), "utf8"), /mode: special-ops/);
  }
});

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
  assert.match(html, /<button(?=[^>]*aria-pressed="false")[^>]*>\s*<svg(?=[^>]*class="mission-mode-icon")(?=[^>]*aria-label="Special Ops")/);
  assert.match(html, /<button(?=[^>]*aria-pressed="false")[^>]*>\s*<svg(?=[^>]*class="mission-mode-icon")(?=[^>]*aria-label="Zombies")/);
  assert.doesNotMatch(html, /class="precision-filter"/);
  assert.match(html, /role="tab"[^>]*aria-selected="true"[^>]*aria-controls="sidebar-locations"/);
  assert.match(html, /<button(?=[^>]*role="tab")(?=[^>]*aria-controls="sidebar-campaigns")(?=[^>]*disabled="")[^>]*>/);
  assert.match(html, /<button(?=[^>]*role="tab")(?=[^>]*aria-controls="sidebar-content-updates")(?=[^>]*disabled="")[^>]*>/);
  assert.match(html, />Adriatic Sea<\/span>/);
  assert.doesNotMatch(html, /Selected location/);
  assert.doesNotMatch(html, />Level<\/span>/);
  assert.match(html, /aria-label="(Campaign|Multiplayer|Special Ops|Zombies)"/);
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

test("compiles the atlas output contract from fixture content", async () => {
  const fixtureRoot = fileURLToPath(new URL("../test-fixtures/compiled-atlas/", import.meta.url));
  const compilerPath = fileURLToPath(new URL("../scripts/build-atlas-data.mjs", import.meta.url));
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "cod-atlas-compiled-fixture-"));
  const workingRoot = path.join(temporaryRoot, "workspace");

  try {
    await cp(fixtureRoot, workingRoot, { recursive: true });
    await execFileAsync(process.execPath, [compilerPath], { cwd: workingRoot });

    const atlas = JSON.parse(await readFile(
      path.join(workingRoot, "app/data/atlas.generated.json"),
      "utf8",
    ));
    const entries = atlas.groups.flatMap((group) => group.entries);
    const findGroup = (name) => atlas.groups.find((group) => group.name === name);
    const findEntry = (levelId, locationId = "main") => entries.find(
      (entry) => entry.levelId === levelId && entry.locationId === locationId,
    );

    assert.deepEqual(atlas.totals, {
      groups: 4,
      levels: 3,
      entries: 4,
      mapped: 3,
      cityMatched: 3,
      countryFallback: 0,
    });
    assert.deepEqual(
      atlas.games.map((game) => game.id),
      ["fixture-classic", "fixture-remaster"],
      "fixture games stay in release order",
    );
    assert.deepEqual(
      atlas.games.map(({ id, series, subseries, remasterOf }) => ({
        id,
        series,
        subseries,
        remasterOf,
      })),
      [
        {
          id: "fixture-classic",
          series: "standalone",
          subseries: "main",
          remasterOf: null,
        },
        {
          id: "fixture-remaster",
          series: "standalone",
          subseries: "remaster",
          remasterOf: "fixture-classic",
        },
      ],
    );
    assert.ok(atlas.games.every((game) => !Object.hasOwn(game, "icon")));

    assert.deepEqual(
      atlas.groups.map(({ name, continent, flagCode }) => ({ name, continent, flagCode })),
      [
        { name: "Brazil", continent: "South America", flagCode: "BR" },
        { name: "France", continent: "Europe", flagCode: "FR" },
        { name: "Mars", continent: "Off-world", flagCode: null },
        { name: "United States", continent: "North America", flagCode: "US" },
      ],
    );
    assert.ok(atlas.groups.every((group) =>
      group.entries.every((entry) => entry.country === group.name)));
    assert.ok(entries.every((entry) => typeof entry.primary === "boolean"));
    assert.ok(entries.every((entry) => !Object.hasOwn(entry, "label")));

    assert.equal(atlas.levelIdAliases["fixture-alpha-old"], "fixture-classic-alpha");

    const alpha = findEntry("fixture-classic-alpha", "landmark");
    assert.deepEqual(alpha.coordinates, [48.8584, 2.2945]);
    assert.deepEqual(alpha.campaign, { id: "1", label: "Fixture Campaign" });
    assert.equal(alpha.campaignOrder, 1);
    assert.equal(alpha.hasLevelNotes, true);
    assert.deepEqual(alpha.verified, {
      locations: { byHuman: true, user: "github/fixture-reviewer" },
      research: { byHuman: false, user: null },
    });
    assert.deepEqual(alpha.modes, ["singleplayer"]);
    assert.deepEqual(alpha.urls, [
      { googleMaps: "https://maps.google.com/?q=48.8584,2.2945" },
      { wikipedia: "https://en.wikipedia.org/wiki/Fixture" },
    ]);

    const secondary = findEntry("fixture-classic-alpha", "secondary");
    assert.equal(secondary.primary, false);
    assert.equal(secondary.precision, "city");

    const bravo = findEntry("fixture-classic-bravo");
    assert.equal(bravo.game, "FIX / FIX-R");
    assert.deepEqual(bravo.gameIds, ["fixture-classic", "fixture-remaster"]);
    assert.deepEqual(
      bravo.appearances.map(({ gameId, title }) => ({ gameId, title })),
      [
        { gameId: "fixture-classic", title: "Fixture Bravo" },
        { gameId: "fixture-remaster", title: "Fixture Bravo Remastered" },
      ],
    );
    assert.deepEqual(bravo.contentUpdate, { id: "1", label: "Fixture Pack" });
    assert.deepEqual(bravo.modes, ["multiplayer"]);
    assert.equal(bravo.hasLevelNotes, false);
    assert.deepEqual(bravo.urls, [
      { callOfDutyMaps: "https://callofdutymaps.com/fixture/bravo/" },
    ]);

    const cosmos = findEntry("fixture-classic-cosmos");
    assert.equal(cosmos.coordinates, null);
    assert.equal(cosmos.precision, "off-world");
    assert.deepEqual(cosmos.modes, ["zombies"]);
    assert.equal(findGroup("Mars").kind, "off-world");

    assert.equal(atlas.wikiMedia["fixture-wiki-alpha"], undefined);
    assert.equal(
      atlas.wikiMedia["fixture-wiki-bravo"].main.author.name,
      "Fixture Author",
    );
    assert.equal(atlas.wikiMedia["fixture-wiki-bravo"].map, null);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
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
  const undergroundPassage = overlays["cod-fh-underground-passage"];
  assert.equal(
    undergroundPassage.image,
    "/images/levels/cod-fh/campaign/14-underground-passage/maps/overlay.jpg",
  );
  await access(new URL(`../public${undergroundPassage.image}`, import.meta.url));
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
