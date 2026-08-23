import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  isResearchComplete,
  loadProgressData,
  localizationProgressEnd,
  localizationProgressStart,
  renderLocalizationProgress,
  renderResearchProgress,
  replaceGeneratedBlock,
  requiredResearchHeadings,
  researchProgressEnd,
  researchProgressStart,
} from "../scripts/progress.mjs";

const completedBody = requiredResearchHeadings
  .map((heading) => `${heading}\n\nSection text.`)
  .join("\n\n");

test("research completion requires every standard heading in order", () => {
  assert.equal(isResearchComplete(completedBody), true);
  assert.equal(isResearchComplete(completedBody.replace("## Sources", "## References")), false);
  assert.equal(isResearchComplete([
    requiredResearchHeadings[1],
    requiredResearchHeadings[0],
    ...requiredResearchHeadings.slice(2),
  ].join("\n\nSection text.\n\n")), false);
});

test("AI-assisted research also requires a disclosure", () => {
  assert.equal(isResearchComplete(`Generated with AI assistance.\n\n${completedBody}`), false);
  assert.equal(isResearchComplete(`> **AI-generated research note:** Review this against the cited sources.\n\n${completedBody}`), true);
  assert.equal(isResearchComplete(`> **AI-generated historical note.** Review this against the cited sources.\n\n${completedBody}`), true);
});

test("canonical level loading excludes appearance references", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cod-atlas-research-"));
  const gamesRoot = path.join(root, "games");
  const levelsRoot = path.join(root, "levels");
  await mkdir(gamesRoot);
  await mkdir(path.join(levelsRoot, "game"), { recursive: true });
  await writeFile(path.join(gamesRoot, "game.yaml"), "id: game\nlabel: Test Game\nreleased: 2003-01-01\n");
  await writeFile(path.join(levelsRoot, "game/level.md"), `---\nid: game-level\ngames:\n  - game\nmode: singleplayer\nlocations: []\n---\n\n${completedBody}\n`);
  await writeFile(path.join(levelsRoot, "game/level.ref.md"), "---\nlevel: game-level\n---\n");

  try {
    const data = await loadProgressData({ gamesRoot, levelsRoot });
    assert.equal(data.levels.length, 1);
    assert.deepEqual(data.levels[0], {
      gameId: "game",
      mode: "singleplayer",
      researched: true,
      locations: [],
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("generated tables include raw counts, percentages and release-order game rows", () => {
  const generated = renderResearchProgress({
    games: new Map([
      ["new", { id: "new", label: "New Game", released: "2020-01-01" }],
      ["old", { id: "old", label: "Old Game", released: "2000-01-01" }],
    ]),
    levels: [
      { gameId: "old", mode: "singleplayer", researched: true, locations: [] },
      { gameId: "old", mode: "multiplayer", researched: false, locations: [] },
      { gameId: "new", mode: "multiplayer", researched: true, locations: [] },
    ],
  });

  assert.match(generated, /All currently catalogued levels \| 2 \/ 3 \(67%\) \| 1 \/ 3 \(33%\)/);
  assert.ok(generated.indexOf("| Old Game |") < generated.indexOf("| New Game |"));
  assert.match(generated, /\| Old Game \| 1 \/ 1 \(100%\) \| 0 \/ 1 \(0%\) \| 1 \/ 2 \(50%\) \|/);
});

test("localization progress includes region precision and reports precision changes", () => {
  const generated = renderLocalizationProgress({
    games: new Map([["game", { id: "game", label: "Test Game", released: "2000-01-01" }]]),
    levels: [{
      gameId: "game",
      mode: "singleplayer",
      researched: false,
      locations: [
        { precision: "exact" },
        { precision: "region" },
        { precision: "country" },
        { precision: "off-world" },
      ],
    }],
  });

  assert.match(generated, /All marker locations \| 2 \/ 3 \(67%\) \| 1 \/ 3 \(33%\) \| 1/);
  assert.match(generated, /\| Exact \| 1 \| 25% \|/);
  assert.match(generated, /\| Region \| 1 \| 25% \|/);
  assert.match(generated, /\| Test Game \| 2 \/ 3 \(67%\) \| — \| 2 \/ 3 \(67%\) \|/);
});

test("generated block replacement changes only the delimited block", () => {
  const readme = `Before\n${researchProgressStart}\nold\n${researchProgressEnd}\nAfter\n`;
  const generated = `${researchProgressStart}\nnew\n${researchProgressEnd}`;
  assert.equal(
    replaceGeneratedBlock(readme, researchProgressStart, researchProgressEnd, generated),
    `Before\n${generated}\nAfter\n`,
  );
  assert.throws(
    () => replaceGeneratedBlock("No markers", localizationProgressStart, localizationProgressEnd, generated),
    /marker pair/,
  );
});
