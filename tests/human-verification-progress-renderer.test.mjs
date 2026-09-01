import assert from "node:assert/strict";
import test from "node:test";
import { renderHumanVerificationProgress } from "../src/infrastructure/reporting/markdown/human-verification-progress.renderer.mjs";

test("human verification counts marker locations separately from level research", () => {
  const generated = renderHumanVerificationProgress({
    games: new Map([["game", { id: "game", label: "Test Game", released: "2000-01-01" }]]),
    levels: [
      {
        gameId: "game",
        mode: "singleplayer",
        verified: {
          locations: { byHuman: true, user: "github/location-reviewer" },
          research: { byHuman: false, user: null },
        },
        locations: [{ precision: "exact" }, { precision: "approximate" }],
      },
      {
        gameId: "game",
        mode: "multiplayer",
        verified: {
          locations: { byHuman: false, user: null },
          research: { byHuman: true, user: "github/research-reviewer" },
        },
        locations: [{ precision: "country" }],
      },
    ],
  });

  assert.match(generated, /All currently catalogued records \| 2 \/ 3 \(67%\) \| 1 \/ 2 \(50%\)/);
  assert.match(generated, /Campaign records \| 2 \/ 2 \(100%\) \| 0 \/ 1 \(0%\)/);
  assert.match(generated, /Multiplayer records \| 0 \/ 1 \(0%\) \| 1 \/ 1 \(100%\)/);
  assert.match(generated, /\| Test Game \| 2 \/ 3 \(67%\) \| 1 \/ 2 \(50%\) \|/);
});
