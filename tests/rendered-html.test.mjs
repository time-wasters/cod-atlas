import assert from "node:assert/strict";
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
  assert.match(await response.text(), developmentPreviewMeta);
});

test("preserves the complete statically compiled atlas", async () => {
  const { default: atlas } = await import("../app/data/atlas.generated.json", {
    with: { type: "json" },
  });
  const entries = atlas.groups.flatMap((group) => group.entries);
  const findEntry = (game, title) => entries.find(
    (entry) => entry.title === title && entry.game.split(" / ").includes(game),
  );

  assert.equal(entries.length, 987);
  assert.deepEqual(
    atlas.groups.filter((group) => group.name.startsWith("USA: ")).map((group) => group.name),
    [
      "USA: Alaska",
      "USA: Arizona",
      "USA: California",
      "USA: Colorado",
      "USA: Florida",
      "USA: Georgia",
      "USA: Hawaii",
      "USA: Illinois",
      "USA: Kansas",
      "USA: Louisiana",
      "USA: Maryland",
      "USA: Michigan",
      "USA: Nebraska",
      "USA: Nevada",
      "USA: New Jersey",
      "USA: New Mexico",
      "USA: New York",
      "USA: North Carolina",
      "USA: South Dakota",
      "USA: Texas",
      "USA: Virginia",
      "USA: Washington",
      "USA: Wyoming",
    ],
  );
  assert.deepEqual(
    atlas.games.map((game) => game.released),
    atlas.games.map((game) => game.released).toSorted(),
    "games stay in chronological release order",
  );
  assert.ok(entries.every((entry) =>
    entry.modes.length === 1 && ["singleplayer", "multiplayer"].includes(entry.modes[0])));

  assert.deepEqual(findEntry("COD2", "The Diversionary Raid").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("COD2", "Holding the Line").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("COD2", "Toujane").modes, ["multiplayer"]);
  assert.deepEqual(findEntry("COD4", "Blackout").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("BO4", "Blackout Map").modes, ["multiplayer"]);
  assert.deepEqual(findEntry("BO2", "FOB").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("BOCW", "CIA").modes, ["singleplayer"]);

  const laisonRiver = findEntry("COD3", "Laison River");
  assert.deepEqual(laisonRiver.coordinates, [48.944742, -0.229523]);
  assert.equal(laisonRiver.city, "Falaise");
  assert.equal(laisonRiver.region, "Normandy");
  assert.equal(laisonRiver.label, "Laizon River near Falaise");
  assert.equal(laisonRiver.precision, "approximate");
  assert.equal(laisonRiver.confidence, "medium");
  assert.equal(laisonRiver.method, "manual-approximate");

  const blowtorchAndCorkscrew = findEntry("WAW", "Blowtorch & Corkscrew");
  assert.deepEqual(blowtorchAndCorkscrew.coordinates, [26.22882, 127.71437]);
  assert.equal(blowtorchAndCorkscrew.city, "Naha");
  assert.equal(blowtorchAndCorkscrew.region, "Okinawa Prefecture");
  assert.equal(blowtorchAndCorkscrew.label, "Wana Ridge, Sueyoshi Park");
  assert.equal(blowtorchAndCorkscrew.precision, "approximate");
  assert.equal(blowtorchAndCorkscrew.confidence, "high");
  assert.equal(blowtorchAndCorkscrew.method, "manual-approximate");

  const cod2Entries = entries.filter((entry) => entry.game.split(" / ").includes("COD2"));
  assert.equal(cod2Entries.filter((entry) => entry.modes[0] === "singleplayer").length, 26);
  assert.equal(cod2Entries.filter((entry) => entry.modes[0] === "multiplayer").length, 21);
  assert.equal(entries.filter((entry) => entry.modes[0] === "singleplayer").length, 406);
  assert.equal(entries.filter((entry) => entry.modes[0] === "multiplayer").length, 581);
});
