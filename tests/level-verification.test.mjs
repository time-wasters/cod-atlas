import assert from "node:assert/strict";
import test from "node:test";
import { normalizeLevelVerification } from "../src/domain/level/level-verification.value-object.mjs";

test("missing level verification defaults both review tracks to unverified", () => {
  assert.deepEqual(normalizeLevelVerification(undefined, "fixture.verified"), {
    locations: { byHuman: false, user: null },
    research: { byHuman: false, user: null },
  });
});

test("human verification requires a reviewer and unverified records may retain review notes", () => {
  assert.throws(
    () => normalizeLevelVerification({
      locations: { byHuman: true, user: null },
    }, "fixture.verified"),
    /user is required/,
  );
  assert.deepEqual(normalizeLevelVerification({
    research: {
      byHuman: false,
      user: "github/reviewer",
      reason: "Reviewed, but the available evidence was inconclusive.",
    },
  }, "fixture.verified").research, {
    byHuman: false,
    user: "github/reviewer",
    reason: "Reviewed, but the available evidence was inconclusive.",
  });
});
