import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { loadProgressData } from "../src/infrastructure/content/filesystem/progress-data.loader.mjs";

const completedBody = [
  "## The Map in the Game",
  "## The Real Place & Differences",
  "## The Real Mission & Differences",
  "## Marker Position Explanation",
  "## Sources",
]
  .map((heading) => `${heading}\n\nSection text.`)
  .join("\n\n");

test("canonical level loading excludes appearance references", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cod-atlas-research-"));
  const gamesRoot = path.join(root, "games");
  const levelsRoot = path.join(root, "levels");
  await mkdir(gamesRoot);
  await mkdir(path.join(levelsRoot, "game"), { recursive: true });
  await writeFile(
    path.join(gamesRoot, "game.yaml"),
    "id: game\nlabel: Test Game\nreleased: 2003-01-01\n",
  );
  await writeFile(
    path.join(levelsRoot, "game/level.md"),
    `---\nid: game-level\ngames:\n  - game\nmode: multiplayer\nlocations:\n  - precision: exact\nverified:\n  locations:\n    byHuman: true\n    user: github/test-reviewer\n  research:\n    byHuman: false\n    user: null\n---\n\n${completedBody}\n`,
  );
  await writeFile(
    path.join(levelsRoot, "game/level.ref.md"),
    "---\nlevel: game-level\n---\n",
  );

  try {
    const data = await loadProgressData({ gamesRoot, levelsRoot });
    assert.equal(data.levels.length, 1);
    assert.deepEqual(data.levels[0], {
      gameId: "game",
      mode: "multiplayer",
      researched: true,
      verified: {
        locations: { byHuman: true, user: "github/test-reviewer" },
        research: { byHuman: false, user: null },
      },
      locations: [{ precision: "exact" }],
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
