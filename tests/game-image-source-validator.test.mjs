import assert from "node:assert/strict";
import test from "node:test";
import { validateGameImageSource } from "../src/infrastructure/external/game-icons/game-image-source.validator.mjs";

test("provider metadata rejects incomplete and ambiguous records", () => {
  assert.throws(() => validateGameImageSource({
    id: "bad",
    images: { steam: { app: 1, icon: "short" } },
  }), /40-character/);
  assert.throws(() => validateGameImageSource({
    id: "bad",
    images: { steam: {}, steamgriddb: {} },
  }), /exactly one provider/);
});
