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
});

test("keeps an explicit empty locations array on a variant", () => {
  const source = { id: "game-source", locations: [{ id: "main", precision: "exact" }] };
  const variant = { id: "game-variant", metadata: { variantOf: source.id }, locations: [] };

  resolveLevelLocationInheritance([source, variant]);

  assert.deepEqual(variant.locations, []);
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
