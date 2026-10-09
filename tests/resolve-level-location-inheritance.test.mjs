import assert from "node:assert/strict";
import test from "node:test";
import { resolveLevelLocationInheritance } from "../src/domain/level/resolve-level-location-inheritance.mjs";

test("inherits locations through metadata.variantOf when locations is omitted", () => {
  const source = {
    id: "game-source",
    locations: [{ id: "main", precision: "exact", urls: [{ wikipedia: "https://example.com" }] }],
  };
  const variant = { id: "game-variant", metadata: { variantOf: source.id } };

  resolveLevelLocationInheritance([variant, source]);

  assert.deepEqual(variant.locations, source.locations);
  assert.notStrictEqual(variant.locations, source.locations);
  assert.notStrictEqual(variant.locations[0], source.locations[0]);
  assert.notStrictEqual(variant.locations[0].urls, source.locations[0].urls);
  variant.locations[0].urls[0].wikipedia = "https://example.com/changed";
  assert.equal(source.locations[0].urls[0].wikipedia, "https://example.com");
});

test("keeps an explicit empty locations array on a variant", () => {
  const source = { id: "game-source", locations: [{ id: "main", precision: "exact" }] };
  const variant = { id: "game-variant", metadata: { variantOf: source.id }, locations: [] };

  resolveLevelLocationInheritance([source, variant]);

  assert.deepEqual(variant.locations, []);
});

test("a Survival variant inherits geography while retaining its identity and classification", () => {
  const source = {
    id: "fixture-multiplayer-map",
    title: "Fixture Multiplayer Map",
    mode: "multiplayer",
    wikiArticle: "fixture-map-article",
    "content-update": { id: "base", label: "Base Release" },
    locations: [{
      id: "main",
      country: "Fixture Country",
      latitude: 10,
      longitude: 20,
      precision: "approximate",
    }],
  };
  const survival = {
    id: "fixture-survival",
    title: "Fixture Survival",
    mode: "other",
    modeSub: "survival",
    wikiArticle: "fixture-survival-article",
    "content-update": { id: "bonus", label: "Bonus Release" },
    metadata: { variantOf: source.id },
  };
  const originalSource = structuredClone(source);
  const originalSurvival = structuredClone(survival);

  resolveLevelLocationInheritance([survival, source]);

  assert.deepEqual(survival, { ...originalSurvival, locations: source.locations });
  assert.deepEqual(source, originalSource);
});

test("an alternate campaign inherits locations while retaining its own campaign and notes", () => {
  const source = {
    id: "fixture-mission",
    mode: "singleplayer",
    campaign: { id: "main", label: "Main Campaign" },
    notes: "Source mission research.",
    locations: [{ id: "main", country: "Fixture Country", latitude: 10, longitude: 20 }],
  };
  const variant = {
    id: "fixture-alternate-mission",
    mode: "singleplayer",
    campaign: { id: "alternate", label: "Alternate Campaign" },
    metadata: { variantOf: source.id, missionNumber: 1 },
    notes: "",
  };
  const originalVariant = structuredClone(variant);

  resolveLevelLocationInheritance([variant, source]);

  assert.deepEqual(variant, { ...originalVariant, locations: source.locations });
});

test("rejects unknown metadata.variantOf targets", () => {
  assert.throws(
    () => resolveLevelLocationInheritance([
      { id: "game-variant", metadata: { variantOf: "game-missing" } },
    ]),
    /unknown metadata\.variantOf level game-missing/,
  );
});

test("rejects circular metadata.variantOf location inheritance", () => {
  assert.throws(
    () => resolveLevelLocationInheritance([
      { id: "game-first", metadata: { variantOf: "game-second" } },
      { id: "game-second", metadata: { variantOf: "game-first" } },
    ]),
    /circular metadata\.variantOf relationship: game-first -> game-second -> game-first/,
  );
});

test("validates metadata.variantOf even when a variant has its own locations", () => {
  assert.throws(
    () => resolveLevelLocationInheritance([
      { id: "game-variant", metadata: { variantOf: "game-missing" }, locations: [] },
    ]),
    /unknown metadata\.variantOf level game-missing/,
  );
});
