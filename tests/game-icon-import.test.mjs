import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { importGameIcons } from "../src/application/media/use-cases/import-game-icons.mjs";

async function gameIconFixture() {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cod-atlas-icons-"));
  const contentRoot = path.join(temporaryRoot, "games");
  const outputRoot = path.join(temporaryRoot, "public/images/games_external");
  await mkdir(contentRoot, { recursive: true });
  await writeFile(
    path.join(contentRoot, "cod.yaml"),
    `id: cod\nimages:\n  steam:\n    app: 2620\n    icon: ${"a".repeat(40)}\n    clienticon: null\n`,
  );
  return { temporaryRoot, contentRoot, outputRoot };
}

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

test("enabled import rejects images that do not match their output extension", async () => {
  const fixture = await gameIconFixture();
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  try {
    await assert.rejects(importGameIcons({
      contentRoot: fixture.contentRoot,
      outputRoot: fixture.outputRoot,
      environment: { STEAM_ICON_URL: "https://steam.example.test/%app%/%icon%.%extension%" },
      fetchImplementation: async () => new Response(png, { status: 200 }),
      strict: true,
    }), /does not match \.jpg output/);
  } finally {
    await rm(fixture.temporaryRoot, { recursive: true, force: true });
  }
});

test("image signatures matching the configured output are persisted", async () => {
  const fixture = await gameIconFixture();
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
  try {
    const result = await importGameIcons({
      contentRoot: fixture.contentRoot,
      outputRoot: fixture.outputRoot,
      environment: { STEAM_ICON_URL: "https://steam.example.test/%app%/%icon%.%extension%" },
      fetchImplementation: async () => new Response(jpeg, { status: 200 }),
    });
    assert.equal(result.imported, 1);
    assert.equal(result.cached, 0);
    assert.deepEqual(JSON.parse(await readFile(path.join(fixture.outputRoot, "manifest.json"), "utf8")), {
      cod: { icon: { provider: "steam", path: "/images/games_external/steam/cod/icon.jpg" } },
    });
  } finally {
    await rm(fixture.temporaryRoot, { recursive: true, force: true });
  }
});

test("valid cached icons are reused without a network request", async () => {
  const fixture = await gameIconFixture();
  await mkdir(path.join(fixture.outputRoot, "steam/cod"), { recursive: true });
  await writeFile(
    path.join(fixture.outputRoot, "steam/cod/icon.jpg"),
    Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
  );
  let fetched = false;
  try {
    const result = await importGameIcons({
      contentRoot: fixture.contentRoot,
      outputRoot: fixture.outputRoot,
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
    await rm(fixture.temporaryRoot, { recursive: true, force: true });
  }
});
