import assert from "node:assert/strict";
import test from "node:test";
import { renderLocalizationProgress } from "../src/infrastructure/reporting/markdown/localization-progress.renderer.mjs";

test("localization table includes region precision and reports precision changes", () => {
  const generated = renderLocalizationProgress({
    games: new Map([["game", { id: "game", label: "Test Game", released: "2000-01-01" }]]),
    levels: [{
      gameId: "game",
      mode: "singleplayer",
      researched: false,
      verified: {
        locations: { byHuman: false, user: null },
        research: { byHuman: false, user: null },
      },
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
  assert.match(generated, /\| Test Game \| 2 \/ 3 \(67%\) \| — \| — \| 2 \/ 3 \(67%\) \|/);
});
