import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { buildCampaignOptions } from "../src/application/campaigns/use-cases/build-campaign-options.ts";

const execFileAsync = promisify(execFile);
const fixtureRoot = fileURLToPath(new URL("../test-fixtures/compiled-atlas/", import.meta.url));
const compilerPath = fileURLToPath(new URL("../scripts/build-atlas-data.mjs", import.meta.url));

async function withFixture(callback) {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "cod-atlas-compilation-"));
  const workspace = path.join(temporaryRoot, "workspace");
  try {
    await cp(fixtureRoot, workspace, { recursive: true });
    await callback({
      read: (filename) => readFile(path.join(workspace, filename), "utf8"),
      write: (filename, contents) => writeFile(path.join(workspace, filename), contents),
      compile: (...args) => execFileAsync(process.execPath, [compilerPath, ...args], { cwd: workspace }),
    });
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

const referencePath = "content/levels/fixture-remaster/returning-map.ref.md";
const zombieReferencePath = "content/levels/fixture-remaster/returning-zombies.ref.md";
const reference = (level, label) => `---
level: ${level}
content-update:
  id: "1"
  label: ${label}
---
`;

test("compilation derives chronological appearance order from Wiki links for campaign browsing", async () => {
  await withFixture(async ({ read, write, compile }) => {
    for (const [order, name, wikiArticle] of [
      [2, "second", "fixture-wiki-bravo"],
      [3, "third", "fixture-wiki-cosmos"],
    ]) {
      await write(`content/levels/fixture-classic/campaign/${order}-${name}.md`, `---
id: fixture-${name}
title: Fixture ${name}
games: [fixture-classic]
mode: singleplayer
wikiArticle: ${wikiArticle}
locations:
  - id: main
    country: France
    latitude: 48
    longitude: 2
    precision: approximate
    confidence: medium
    method: manual-approximate
    primary: true
---
`);
    }
    const sequence = ["fixture-wiki-bravo", "fixture-wiki-cosmos", "fixture-wiki-alpha"];
    for (const [index, id] of sequence.entries()) {
      const filename = `content/wiki-import/articles/${id}.json`;
      const article = JSON.parse(await read(filename));
      article.nextLevels = { links: index + 1 < sequence.length
        ? [{ sequence: "chronological", article: sequence[index + 1] }] : [] };
      await write(filename, JSON.stringify(article));
    }
    await compile();
    const atlas = JSON.parse(await read("app/data/atlas.generated.json"));
    const campaigns = buildCampaignOptions({
      gameCode: atlas.games.find(({ id }) => id === "fixture-classic").code,
      games: atlas.games,
      groups: atlas.groups,
    });
    assert.deepEqual(campaigns.map(({ label }) => label), ["In-Game Order", "Chronological", "Fixture Campaign"]);
    assert.deepEqual(campaigns[1].levels.map(({ entry }) => entry.levelId),
      ["fixture-second", "fixture-third", "fixture-classic-alpha"]);
    const entries = atlas.groups.flatMap(({ entries }) => entries);
    assert.equal(entries.find(({ levelId }) => levelId === "fixture-classic-alpha")
      .appearances[0].chronologicalOrder, 3);
    assert.equal(entries.find(({ levelId }) => levelId === "fixture-classic-bravo")
      .appearances[0].chronologicalOrder, undefined);
  });
});

test("references share canonical markers and modes with independent appearance release groups", async () => {
  await withFixture(async ({ read, write, compile }) => {
    await write(referencePath, reference("fixture-classic-bravo", "Fixture Rerelease Pack"));
    await write(zombieReferencePath, reference("fixture-classic-cosmos", "Fixture Rerelease Pack"));
    await compile();

    const atlas = JSON.parse(await read("app/data/atlas.generated.json"));
    const entries = atlas.groups.flatMap((group) => group.entries);
    for (const [id, mode, coordinates] of [
      ["fixture-classic-bravo", "multiplayer", [34.0522, -118.2437]],
      ["fixture-classic-cosmos", "zombies", null],
    ]) {
      const markers = entries.filter((entry) => entry.levelId === id);
      assert.equal(markers.length, 1, "a reference must not create another canonical marker");
      const [entry] = markers;
      assert.deepEqual(entry.modes, [mode]);
      assert.deepEqual(entry.coordinates, coordinates);
      assert.deepEqual(entry.gameIds, ["fixture-classic", "fixture-remaster"]);
      assert.deepEqual(entry.appearances.find(({ gameId }) => gameId === "fixture-remaster").contentUpdate,
        { id: "1", label: "Fixture Rerelease Pack" });
    }
    const bravo = entries.find((entry) => entry.levelId === "fixture-classic-bravo");
    assert.deepEqual(bravo.appearances.find(({ gameId }) => gameId === "fixture-classic").contentUpdate,
      { id: "1", label: "Fixture Pack" });
  });
});

test("rejects conflicting release labels between canonical records in one game", async () => {
  await withFixture(async ({ read, write, compile }) => {
    const filename = "content/levels/fixture-classic/multiplayer/factory-floor.md";
    await write(filename, (await read(filename)).replace("label: Fixture Pack", "label: Conflicting Pack"));
    await assert.rejects(compile("--check"),
      /content-update 1 must use the same label throughout fixture-classic/);
  });
});

test("rejects conflicting release labels between references in one appearance game", async () => {
  await withFixture(async ({ write, compile }) => {
    await write(referencePath, reference("fixture-classic-bravo", "Fixture Rerelease Pack"));
    await write(zombieReferencePath, reference("fixture-classic-cosmos", "Conflicting Pack"));
    await assert.rejects(compile("--check"),
      /content-update 1 must use the same label throughout fixture-remaster/);
  });
});

test("references cannot override canonical mode or geography", async () => {
  for (const field of ["mode: zombies", "locations: []"]) {
    await withFixture(async ({ write, compile }) => {
      await write(referencePath, `---\nlevel: fixture-classic-bravo\n${field}\n---\n`);
      await assert.rejects(compile("--check"),
        /appearance references cannot set (mode|locations)/);
    });
  }
});

test("multiplayer references inherit their canonical subtype without adding markers", async () => {
  for (const modeSub of ["battle-royale", "dmz"]) {
    await withFixture(async ({ read, write, compile }) => {
      const filename = "content/levels/fixture-classic/multiplayer/factory-floor.md";
      await write(filename, (await read(filename)).replace("mode: multiplayer", `mode: multiplayer\nmodeSub: ${modeSub}`));
      await write(referencePath, reference("fixture-classic-bravo", "Fixture Rerelease Pack"));
      await compile();
      const atlas = JSON.parse(await read("app/data/atlas.generated.json"));
      const entries = atlas.groups.flatMap((group) => group.entries)
        .filter((entry) => entry.levelId === "fixture-classic-bravo");
      assert.equal(entries.length, 1);
      assert.equal(entries[0].modeSub, modeSub);
      assert.equal(entries[0].appearances.find(({ gameId }) => gameId === "fixture-remaster").modeSub, modeSub);
      assert.deepEqual(entries[0].gameIds, ["fixture-classic", "fixture-remaster"]);
    });
  }
});

test("a multiplayer appearance can add a second subtype without changing canonical data or markers", async () => {
  await withFixture(async ({ read, write, compile }) => {
    const filename = "content/levels/fixture-classic/multiplayer/factory-floor.md";
    await write(filename, (await read(filename)).replace("mode: multiplayer", "mode: multiplayer\nmodeSub: battle-royale"));
    await write(referencePath, "---\nlevel: fixture-classic-bravo\nmodeSub: [battle-royale, dmz]\n---\n");
    await compile();
    const atlas = JSON.parse(await read("app/data/atlas.generated.json"));
    const entries = atlas.groups.flatMap((group) => group.entries)
      .filter((entry) => entry.levelId === "fixture-classic-bravo");
    assert.equal(entries.length, 1);
    assert.equal(entries[0].modeSub, "battle-royale");
    assert.deepEqual(entries[0].coordinates, [34.0522, -118.2437]);
    assert.equal(entries[0].appearances[0].modeSub, "battle-royale");
    assert.deepEqual(entries[0].appearances[1].modeSub, ["battle-royale", "dmz"]);
  });
});

test("a canonical multiplayer map can declare multiple subtypes", async () => {
  await withFixture(async ({ read, write, compile }) => {
    const filename = "content/levels/fixture-classic/multiplayer/factory-floor.md";
    await write(filename, (await read(filename)).replace("mode: multiplayer", "mode: multiplayer\nmodeSub: [battle-royale, dmz]"));
    await compile();
    const atlas = JSON.parse(await read("app/data/atlas.generated.json"));
    const entry = atlas.groups.flatMap((group) => group.entries)
      .find((entry) => entry.levelId === "fixture-classic-bravo");
    assert.deepEqual(entry.modeSub, ["battle-royale", "dmz"]);
    assert.deepEqual(entry.appearances[0].modeSub, ["battle-royale", "dmz"]);
  });
});

test("appearance subtype overrides reject non-multiplayer levels and invalid lists", async () => {
  await withFixture(async ({ write, compile }) => {
    await write(zombieReferencePath, "---\nlevel: fixture-classic-cosmos\nmodeSub: dmz\n---\n");
    await assert.rejects(compile("--check"), /appearance modeSub is only valid for multiplayer/);
  });
  for (const value of ["challenge", "[]", "[dmz, dmz]", "[dmz, challenge]"]) {
    await withFixture(async ({ write, compile }) => {
      await write(referencePath, `---\nlevel: fixture-classic-bravo\nmodeSub: ${value}\n---\n`);
      await assert.rejects(compile("--check"), /invalid modeSub/);
    });
  }
});

test("compiler rejects subtypes from another parent mode", async () => {
  for (const [mode, modeSub] of [["multiplayer", "challenge"], ["other", "dmz"], ["zombies", "battle-royale"]]) {
    await withFixture(async ({ read, write, compile }) => {
      const filename = "content/levels/fixture-classic/multiplayer/factory-floor.md";
      await write(filename, (await read(filename)).replace("mode: multiplayer", `mode: ${mode}\nmodeSub: ${modeSub}`));
      await assert.rejects(compile("--check"), /invalid modeSub/);
    });
  }
});
