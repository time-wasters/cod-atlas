import assert from "node:assert/strict";
import test from "node:test";
import { renderResearchProgress } from "../src/infrastructure/reporting/markdown/research-progress.renderer.mjs";

test("research table includes counts, percentages and release-order game rows", () => {
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
  assert.match(generated, /Special Ops missions \| — \| —/);
  assert.ok(generated.indexOf("| Old Game |") < generated.indexOf("| New Game |"));
  assert.match(generated, /\| Old Game \| 1 \/ 1 \(100%\) \| 0 \/ 1 \(0%\) \| — \| — \| 1 \/ 2 \(50%\) \|/);
});
