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

test("classifies campaign and multiplayer locations across the full atlas", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("mode-audit", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/api/locations", { headers: { accept: "application/json" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 200);
  const atlas = await response.json();
  const entries = atlas.groups.flatMap((group) => group.entries);
  const findEntry = (game, title) => entries.find(
    (entry) => entry.title === title && entry.game.split(" / ").includes(game),
  );

  assert.equal(entries.length, 987);
  assert.ok(entries.every((entry) =>
    entry.modes.length === 1 && ["singleplayer", "multiplayer"].includes(entry.modes[0])));

  assert.deepEqual(findEntry("COD2", "The Diversionary Raid").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("COD2", "Holding the Line").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("COD2", "Toujane").modes, ["multiplayer"]);
  assert.deepEqual(findEntry("COD4", "Blackout").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("BO4", "Blackout Map").modes, ["multiplayer"]);
  assert.deepEqual(findEntry("BO2", "FOB").modes, ["singleplayer"]);
  assert.deepEqual(findEntry("BOCW", "CIA").modes, ["singleplayer"]);

  const cod2Entries = entries.filter((entry) => entry.game.split(" / ").includes("COD2"));
  assert.equal(cod2Entries.filter((entry) => entry.modes[0] === "singleplayer").length, 26);
  assert.equal(cod2Entries.filter((entry) => entry.modes[0] === "multiplayer").length, 21);
  assert.equal(entries.filter((entry) => entry.modes[0] === "singleplayer").length, 406);
  assert.equal(entries.filter((entry) => entry.modes[0] === "multiplayer").length, 581);
});
