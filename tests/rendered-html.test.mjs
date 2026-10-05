import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

test("serves the hosted atlas with fixture data", async () => {
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
  assert.match(html, /Fixture Game/);
  assert.match(html, /Fixture Alpha/);
  assert.match(html, /Rio de Janeiro/);
  assert.match(html, /https:\/\/www\.google\.com\/maps\/search\/\?api=1(?:&|&amp;)query=-22\.9068%2C-43\.1729/);
});

test("compiles the atlas output contract with filenames independent from level IDs", async () => {
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
          subseries: ["main", "reboot"],
          remasterOf: null,
        },
        {
          id: "fixture-remaster",
          series: "standalone",
          subseries: ["remaster"],
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
    assert.deepEqual(alpha.contentUpdate, { id: "1", label: "Fixture Pack" });
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
