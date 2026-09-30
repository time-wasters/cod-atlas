import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../content/levels/aw/", import.meta.url);

test("Advanced Warfare keeps its released map rosters in their playable modes", async () => {
  const campaign = await readdir(new URL("campaign/", root));
  const multiplayer = await readdir(new URL("multiplayer/", root));
  const zombies = (await readdir(new URL("zombies/", root))).sort();
  const survival = (await readdir(new URL("survival/", root))).sort();

  assert.equal(campaign.length, 15);
  assert.equal(multiplayer.length, 30);
  assert.ok(multiplayer.includes("chop-shop.md"));
  assert.ok(multiplayer.includes("climate.md"));
  assert.deepEqual(zombies, ["carrier.md", "descent.md", "infection.md", "outbreak.md"]);
  assert.deepEqual(survival, [
    "ascend.md", "bio-lab.md", "comeback.md", "core.md", "defender.md",
    "detroit.md", "drift.md", "greenband.md", "horizon.md", "instinct.md",
    "recovery.md", "retreat.md", "riot.md", "sideshow.md", "solar.md",
    "terrace.md", "urban.md",
  ]);

  for (const filename of survival) {
    const source = await readFile(new URL(`survival/${filename}`, root), "utf8");
    assert.match(source, /^mode: other$/m);
    assert.match(source, /^modeSub: survival$/m);
    assert.match(source, /^  variantOf: aw-/m);
    assert.doesNotMatch(source, /^locations:/m);
  }
});
