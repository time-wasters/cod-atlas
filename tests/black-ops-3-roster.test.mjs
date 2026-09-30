import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { parseMarkdownDocument } from "../src/infrastructure/content/markdown/markdown-document.parser.mjs";
import { resolveLevelLocationInheritance } from "../src/domain/level/resolve-level-location-inheritance.mjs";

const levelsRoot = new URL("../content/levels/", import.meta.url);

async function readLevels(directory, relativePath = "") {
  const records = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = `${relativePath}${entry.name}`;
    if (entry.isDirectory()) {
      records.push(...await readLevels(new URL(`${entry.name}/`, directory), `${relative}/`));
    } else if (entry.name.endsWith(".md")) {
      const { data, body } = parseMarkdownDocument(
        await readFile(new URL(entry.name, directory), "utf8"),
        relative,
      );
      records.push({ data, body, path: relative });
    }
  }
  return records;
}

test("Black Ops III retains all released rosters, references and deliberately limited geography", async () => {
  const records = await readLevels(levelsRoot);
  const canonical = records.filter(({ data }) => data.id).map(({ data }) => data);
  const byId = new Map(canonical.map((level) => [level.id, level]));
  const bo3 = records.filter(({ path }) => path.startsWith("bo3/"));
  const roster = (directory) => bo3
    .filter(({ path }) => path.startsWith(`bo3/${directory}/`));
  const appearance = ({ data }) => data.level ? byId.get(data.level) : data;

  const releases = new Map();
  for (const { data, path } of bo3) {
    const update = data["content-update"];
    assert.ok(update?.id && update.label, `${path}: missing release group`);
    const release = releases.get(update.id) ?? { label: update.label, count: 0 };
    assert.equal(release.label, update.label);
    release.count++;
    releases.set(update.id, release);
  }
  assert.deepEqual(Object.fromEntries(releases), {
    "0": { label: "Included", count: 41 },
    "1": { label: "Bonus", count: 2 },
    "2": { label: "Awakening", count: 5 },
    "3": { label: "Eclipse", count: 5 },
    "4": { label: "Descent", count: 5 },
    "5": { label: "Salvation", count: 5 },
    "6": { label: "Zombies Chronicles", count: 8 },
    "7": { label: "Operation Snowblind", count: 1 },
    "8": { label: "Operation Swarm", count: 1 },
    "9": { label: "Back in Black Maps", count: 4 },
  });

  assert.deepEqual(roster("multiplayer").map(({ path }) => path.split("/").at(-1)).sort(), [
    "aquarium.md", "berserk.md", "breach.md", "citadel.md", "combine.md", "cryogen.md",
    "empire.md", "evac.md", "exodus.md", "firing-range.ref.md", "fringe-nightfall.md",
    "fringe.md", "gauntlet.md", "havoc.md", "hunted.md", "infection.md", "jungle.ref.md",
    "knockout.md", "metro.md", "micro.md", "nuk3town.md", "outlaw.md", "redwood-snow.md",
    "redwood.md", "rift.md", "rise.md", "rumble.md", "rupture.md", "skyjacked.md",
    "slums.ref.md", "spire.md", "splash.md", "stronghold.md", "summit.ref.md", "verge.md",
  ].sort());
  assert.deepEqual(roster("zombies").map(({ path }) => path.split("/").at(-1)).sort(), [
    "ascension.ref.md", "dead-ops-arcade-ii.md", "der-eisendrache.md", "gorod-krovi.md",
    "kino-der-toten.ref.md", "moon.ref.md", "nacht-der-untoten.ref.md", "origins.ref.md",
    "revelations.md", "shangri-la.ref.md", "shadows-of-evil.md", "shi-no-numa.ref.md",
    "the-giant.md", "verruckt.ref.md", "zetsubou-no-shima.md",
  ].sort());
  assert.ok(roster("multiplayer").every((record) => appearance(record).mode === "multiplayer"));
  assert.ok(roster("zombies").every((record) => appearance(record).mode === "zombies"));
  assert.equal(bo3.filter(({ data }) => data.level).length, 12);

  const campaign = roster("campaign");
  const nightmares = campaign.filter(({ data }) => data.metadata?.activity === "nightmares")
    .sort((a, b) => a.data.metadata.missionNumber - b.data.metadata.missionNumber);
  assert.equal(campaign.length, 22);
  assert.equal(campaign.filter(({ data }) => data.campaign.label === "Missions").length, 11);
  assert.deepEqual(nightmares.map(({ data }) => data.metadata.variantOf), [
    "bo3-hypocenter", "bo3-new-world", "bo3-provocation", "bo3-sand-castle", "bo3-black-ops",
    "bo3-vengeance", "bo3-in-darkness", "bo3-rise-and-fall", "bo3-demon-within",
    "bo3-lotus-towers", "bo3-life",
  ]);
  assert.deepEqual(campaign.map(({ path }) => Number(path.split("/").at(-1).split("-")[0]))
    .sort((a, b) => a - b), Array.from({ length: 22 }, (_, index) => index + 1));
  for (const { data, body } of nightmares) {
    assert.equal(data.mode, "singleplayer");
    assert.equal(data.campaign.label, "Nightmares");
    assert.equal(Object.hasOwn(data, "locations"), false);
    assert.equal(body, "");
  }

  assert.deepEqual(roster("challenge").map(({ data }) => data.title).sort(),
    ["Alpha", "Blackout", "Infected", "Sidewinder"]);
  assert.ok(roster("challenge").every(({ data }) => (
    data.mode === "other" && data.modeSub === "challenge"
      && data.metadata.activity === "free-run"
  )));
  assert.equal(roster("survival").length, 1);
  assert.equal(roster("survival")[0].data.id, "bo3-combat-immersion");
  assert.equal(roster("survival")[0].data.modeSub, "survival");

  const cryogen = byId.get("bo3-cryogen");
  assert.deepEqual(cryogen.games, ["bo3"]);
  assert.ok(cryogen.legacyIds.includes("iw-cryogen"));
  assert.equal(byId.has("iw-cryogen"), false);

  resolveLevelLocationInheritance(canonical);
  for (const { data } of nightmares) {
    assert.deepEqual(data.locations, byId.get(data.metadata.variantOf).locations);
  }
  for (const id of ["citadel", "micro", "rupture", "dead-ops-arcade-ii"]) {
    assert.deepEqual(byId.get(`bo3-${id}`).locations, []);
  }
  const locations = bo3.flatMap((record) => appearance(record).locations);
  // BO3 previously had 52 appearance locations. Cryogen moves from IW; 16 new
  // Earth estimates and six new off-world locations add 22 locations globally.
  assert.equal(locations.length, 75);
  assert.equal(locations.filter((location) => Number.isFinite(location.latitude)).length, 68);
  assert.equal(locations.filter((location) => location.precision === "off-world").length, 7);
});
