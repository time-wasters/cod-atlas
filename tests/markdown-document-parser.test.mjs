import assert from "node:assert/strict";
import test from "node:test";
import { parseMarkdownDocument } from "../src/infrastructure/content/markdown/markdown-document.parser.mjs";

function parseFixture(frontmatter) {
  return parseMarkdownDocument(`---
games:
  - fixture-game
${frontmatter}
---

Synthetic research note.
`, "fixture-level.md").data;
}

test("parses off-world locations without adding terrestrial coordinates", () => {
  const levels = ["Space", "Virtual"].map((country) => parseFixture(`id: fixture-${country.toLowerCase()}
title: Fixture ${country} Arena
mode: multiplayer
wikiArticle: fixture-wiki-${country.toLowerCase()}
locations:
  - id: main
    country: ${country}
    precision: off-world
    confidence: fallback
    method: article-context
    primary: true`));

  assert.deepEqual(levels.map((level) => level.locations[0].country), ["Space", "Virtual"]);
  for (const level of levels) {
    assert.equal(level.locations[0].precision, "off-world");
    assert.equal(Object.hasOwn(level.locations[0], "latitude"), false);
    assert.equal(Object.hasOwn(level.locations[0], "longitude"), false);
  }
});

test("parses country fallbacks without adding finer geography", () => {
  const level = parseFixture(`id: fixture-zombies-park
title: Fixture Zombies Park
mode: zombies
wikiArticle: fixture-wiki-zombies-park
locations:
  - id: main
    country: Fixture Country
    latitude: 10
    longitude: 20
    precision: country
    confidence: fallback
    method: country-fallback`);

  assert.equal(level.mode, "zombies");
  assert.equal(level.locations.length, 1);
  assert.equal(level.locations[0].precision, "country");
  assert.equal(Object.hasOwn(level.locations[0], "region"), false);
  assert.equal(Object.hasOwn(level.locations[0], "city"), false);
});

test("preserves campaign and release grouping with platform metadata", () => {
  const level = parseFixture(`id: fixture-vr-flight
title: Fixture VR Flight
mode: singleplayer
wikiArticle: fixture-wiki-vr-flight
campaign:
  id: fixture-vr-missions
  label: Fixture VR Missions
content-update:
  id: fixture-bonus
  label: Fixture Bonus
metadata:
  platforms:
    - Fixture Console
  requires: Fixture VR Headset
locations:
  - id: main
    country: Space
    precision: off-world
    confidence: fallback
    method: article-context`);

  assert.equal(level.mode, "singleplayer");
  assert.deepEqual(level.campaign, { id: "fixture-vr-missions", label: "Fixture VR Missions" });
  assert.deepEqual(level.metadata, {
    platforms: ["Fixture Console"], requires: "Fixture VR Headset",
  });
  assert.deepEqual(level["content-update"], { id: "fixture-bonus", label: "Fixture Bonus" });
  assert.equal(Object.hasOwn(level.locations[0], "latitude"), false);
  assert.equal(Object.hasOwn(level.locations[0], "longitude"), false);
});
