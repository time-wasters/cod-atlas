import assert from "node:assert/strict";
import test from "node:test";
import { parseMarkdownDocument } from "../src/infrastructure/content/markdown/markdown-document.parser.mjs";
import { resolveLevelLocationInheritance } from "../src/domain/level/resolve-level-location-inheritance.mjs";

// Synthetic Markdown fixtures exercise IW-style records without reading content/.
// These tests cover parsing and inheritance, not the production game's roster.
function parseFixture(frontmatter) {
  return parseMarkdownDocument(`---
games:
  - fixture-game
${frontmatter}
---

Synthetic research note.
`, "fixture-level.md").data;
}

test("multiplayer fixtures resolve variants while retaining explicitly unknown geography", () => {
  const source = parseFixture(`id: fixture-gallery
title: Fixture Gallery
mode: multiplayer
wikiArticle: fixture-wiki-gallery
locations:
  - id: main
    country: Fixture Country
    latitude: 10
    longitude: 20
    precision: country
    confidence: fallback
    method: country-fallback
    urls:
      - wikipedia: https://example.test/fixture-country`);
  const seasonal = parseFixture(`id: fixture-seasonal-gallery
title: Fixture Seasonal Gallery
mode: multiplayer
wikiArticle: fixture-wiki-seasonal-gallery
content-update:
  id: seasonal
  label: Fixture Seasonal Update
metadata:
  variantOf: fixture-gallery`);
  const unknown = parseFixture(`id: fixture-unknown-gallery
title: Fixture Unknown Gallery
mode: multiplayer
wikiArticle: fixture-wiki-unknown-gallery
metadata:
  variantOf: fixture-gallery
locations: []`);

  resolveLevelLocationInheritance([seasonal, unknown, source]);

  assert.deepEqual(seasonal.locations, source.locations);
  assert.deepEqual(unknown.locations, []);
  assert.equal(seasonal.mode, "multiplayer");
  assert.equal(seasonal.wikiArticle, "fixture-wiki-seasonal-gallery");
  assert.deepEqual(seasonal["content-update"], {
    id: "seasonal", label: "Fixture Seasonal Update",
  });
  seasonal.locations[0].urls[0].wikipedia = "https://example.test/changed";
  assert.equal(source.locations[0].urls[0].wikipedia, "https://example.test/fixture-country");
});

test("space and virtual multiplayer fixtures remain without terrestrial coordinates", () => {
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

  resolveLevelLocationInheritance(levels);

  assert.deepEqual(levels.map((level) => level.locations[0].country), ["Space", "Virtual"]);
  for (const level of levels) {
    assert.equal(level.locations[0].precision, "off-world");
    assert.equal(Object.hasOwn(level.locations[0], "latitude"), false);
    assert.equal(Object.hasOwn(level.locations[0], "longitude"), false);
  }
});

test("a Zombies fixture parses a country fallback without adding finer geography", () => {
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

test("a VR bonus fixture preserves campaign grouping and platform metadata", () => {
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
