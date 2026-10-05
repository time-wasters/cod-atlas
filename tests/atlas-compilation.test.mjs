import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

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
