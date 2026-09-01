import assert from "node:assert/strict";
import test from "node:test";
import { normalizeLevelVerification } from "../src/domain/level/level-verification.value-object.mjs";

test("missing level verification defaults both review tracks to unverified", () => {
  assert.deepEqual(normalizeLevelVerification(undefined, "fixture.verified"), {
    locations: { byHuman: false, user: null },
    research: { byHuman: false, user: null },
  });
});

test("human verification requires a reviewer and unverified records reject one", () => {
  assert.throws(
    () => normalizeLevelVerification({
      locations: { byHuman: true, user: null },
    }, "fixture.verified"),
    /user is required/,
  );
  assert.throws(
    () => normalizeLevelVerification({
      research: { byHuman: false, user: "github/reviewer" },
    }, "fixture.verified"),
    /user must be null/,
  );
});
