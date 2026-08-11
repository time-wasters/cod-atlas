import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  iconRequestsForGame,
  importGameIcons,
  resolveIconConfiguration,
  validateGameImageSource,
} from "../scripts/import-game-icons.mjs";

const configuration = {
  steamTemplate: "https://steam.example.test/%app%/%icon%.%extension%",
  steamGridDbTemplate: "https://steamgriddb.example.test/%game%/%icon%/%file%",
};

test("external icon configuration is opt-in and validates templates", () => {
  assert.deepEqual(resolveIconConfiguration({}), { steamTemplate: null, steamGridDbTemplate: null });
  assert.throws(() => resolveIconConfiguration({ STEAM_ICON_URL: "http://example.test/%app%/%icon%.jpg" }), /HTTPS/);
  assert.throws(() => resolveIconConfiguration({ STEAM_ICON_URL: "https://example.test/%app%/%icon%.jpg" }), /%extension%/);
  assert.throws(() => resolveIconConfiguration({ STEAMGRIDDB_ICON_URL: "https://example.test/icon.png" }), /%file%/);
});

test("Steam icon is preferred and client icon is imported when present", () => {
  const requests = iconRequestsForGame({
    id: "cod",
    images: { steam: { app: 2620, icon: "a".repeat(40), clienticon: "b".repeat(40) } },
  }, configuration);
  assert.deepEqual(requests.map(({ kind, relativePath }) => ({ kind, relativePath })), [
    { kind: "icon", relativePath: "steam/cod/icon.jpg" },
    { kind: "clienticon", relativePath: "steam/cod/clienticon.ico" },
  ]);
});

test("SteamGridDB identifiers produce a local icon request", () => {
  const [request] = iconRequestsForGame({
    id: "cod3",
    images: { steamgriddb: { game: 12, icon: 34, file: `${"a".repeat(32)}.png` } },
  }, configuration);
  assert.equal(request.url, `https://steamgriddb.example.test/12/34/${"a".repeat(32)}.png`);
  assert.equal(request.relativePath, "steamgriddb/cod3/icon.png");
});

test("provider metadata rejects incomplete and ambiguous records", () => {
  assert.throws(() => validateGameImageSource({ id: "bad", images: { steam: { app: 1, icon: "short" } } }), /40-character/);
  assert.throws(() => validateGameImageSource({ id: "bad", images: { steam: {}, steamgriddb: {} } }), /exactly one provider/);
});

test("disabled import performs no filesystem or network work", async () => {
  let fetched = false;
  const result = await importGameIcons({
    environment: {},
    fetchImplementation: async () => { fetched = true; },
    contentRoot: "not-used",
    outputRoot: "not-used",
  });
  assert.equal(result.enabled, false);
  assert.equal(fetched, false);
});

test("enabled import writes validated images and a manifest", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cod-atlas-icons-"));
  const contentRoot = path.join(temporaryRoot, "games");
  const outputRoot = path.join(temporaryRoot, "public/images/games_external");
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(contentRoot, { recursive: true });
  await writeFile(path.join(contentRoot, "cod.yaml"), `id: cod\nimages:\n  steam:\n    app: 2620\n    icon: ${"a".repeat(40)}\n    clienticon: null\n`);
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  try {
    await assert.rejects(importGameIcons({
      contentRoot,
      outputRoot,
      environment: { STEAM_ICON_URL: "https://steam.example.test/%app%/%icon%.%extension%" },
      fetchImplementation: async () => new Response(png, { status: 200 }),
      strict: true,
    }), /does not match \.jpg output/);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("image signatures matching the configured output are persisted", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cod-atlas-icons-"));
  const contentRoot = path.join(temporaryRoot, "games");
  const outputRoot = path.join(temporaryRoot, "public/images/games_external");
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(contentRoot, { recursive: true });
  await writeFile(path.join(contentRoot, "cod.yaml"), `id: cod\nimages:\n  steam:\n    app: 2620\n    icon: ${"a".repeat(40)}\n    clienticon: null\n`);
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
  try {
    const result = await importGameIcons({
      contentRoot,
      outputRoot,
      environment: { STEAM_ICON_URL: "https://steam.example.test/%app%/%icon%.%extension%" },
      fetchImplementation: async () => new Response(jpeg, { status: 200 }),
    });
    assert.equal(result.imported, 1);
    assert.equal(result.cached, 0);
    assert.deepEqual(JSON.parse(await readFile(path.join(outputRoot, "manifest.json"), "utf8")), {
      cod: { icon: { provider: "steam", path: "/images/games_external/steam/cod/icon.jpg" } },
    });
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("valid cached icons are reused without a network request", async () => {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cod-atlas-icons-"));
  const contentRoot = path.join(temporaryRoot, "games");
  const outputRoot = path.join(temporaryRoot, "public/images/games_external");
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(contentRoot, { recursive: true });
  await mkdir(path.join(outputRoot, "steam/cod"), { recursive: true });
  await writeFile(path.join(contentRoot, "cod.yaml"), `id: cod\nimages:\n  steam:\n    app: 2620\n    icon: ${"a".repeat(40)}\n    clienticon: null\n`);
  await writeFile(path.join(outputRoot, "steam/cod/icon.jpg"), Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  let fetched = false;
  try {
    const result = await importGameIcons({
      contentRoot,
      outputRoot,
      environment: { STEAM_ICON_URL: "https://steam.example.test/%app%/%icon%.%extension%" },
      fetchImplementation: async () => {
        fetched = true;
        throw new Error("cache should prevent this request");
      },
    });
    assert.equal(fetched, false);
    assert.equal(result.imported, 0);
    assert.equal(result.cached, 1);
    assert.equal(result.failed, 0);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
