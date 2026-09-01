import assert from "node:assert/strict";
import test from "node:test";
import { buildAtlasEntry } from "../src/application/atlas-compilation/use-cases/build-atlas-entry.mjs";

test("builds an atlas entry from fixture level and location data", () => {
  const appearances = [{
    gameId: "fixture-game",
    title: "Fixture appearance",
    wikiArticle: "fixture-wiki",
    wiki: "https://example.com/wiki/fixture",
    notesId: "fixture-level",
    hasLevelNotes: true,
    bannerKey: "fixture-level@fixture-game",
  }];
  const entry = buildAtlasEntry({
    appearances,
    gameCodes: "FIXTURE",
    level: {
      id: "fixture-level",
      title: "Fixture level",
      wikiArticle: "fixture-wiki",
      campaign: { id: "1", label: "Fixture campaign" },
      campaignOrder: 2,
      mode: "singleplayer",
      notes: "Fixture notes",
    },
    location: {
      id: "fixture-location",
      primary: true,
      country: "Fixture country",
      region: "Fixture region",
      city: "Fixture city",
      landmark: "Fixture landmark",
      latitude: 12.345,
      longitude: 67.89,
      precision: "approximate",
      confidence: "high",
      method: "manual-approximate",
      urls: [{ wikipedia: "https://example.com/location" }],
    },
    wikiUrl: "https://example.com/wiki/fixture",
  });

  assert.deepEqual(entry, {
    id: "fixture-level:fixture-location",
    levelId: "fixture-level",
    locationId: "fixture-location",
    primary: true,
    title: "Fixture level",
    game: "FIXTURE",
    gameIds: ["fixture-game"],
    appearances,
    campaign: { id: "1", label: "Fixture campaign" },
    campaignOrder: 2,
    wiki: "https://example.com/wiki/fixture",
    wikiArticle: "fixture-wiki",
    country: "Fixture country",
    city: "Fixture city",
    region: "Fixture region",
    landmark: "Fixture landmark",
    coordinates: [12.345, 67.89],
    precision: "approximate",
    confidence: "high",
    method: "manual-approximate",
    urls: [{ wikipedia: "https://example.com/location" }],
    hasLevelNotes: true,
    modes: ["singleplayer"],
  });
});

test("uses fixture fallbacks for an unlocalized country entry", () => {
  const entry = buildAtlasEntry({
    appearances: [{ gameId: "fixture-game" }],
    gameCodes: "FIXTURE",
    level: {
      id: "fixture-level",
      title: "Fixture level",
      wikiArticle: "fixture-wiki",
      mode: "multiplayer",
      notes: "",
    },
    location: {
      id: "fixture-location",
      country: "Fixture country",
      precision: "country",
    },
    wikiUrl: "https://example.com/wiki/fixture",
  });

  assert.equal(entry.coordinates, null);
  assert.equal(entry.city, null);
  assert.equal(entry.region, null);
  assert.equal(entry.landmark, null);
  assert.equal(entry.confidence, "fallback");
  assert.equal(entry.method, null);
  assert.equal(entry.hasLevelNotes, false);
});
