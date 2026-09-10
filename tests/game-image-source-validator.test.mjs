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
  assert.throws(() => validateGameImageSource({
    id: "bad",
    images: { mobygames: { game: 70439, icon: "299151", file: "cover.png" } },
  }), /cover-<id>/);
});

test("MobyGames cover metadata is accepted", () => {
  assert.doesNotThrow(() => validateGameImageSource({
    id: "heroes",
    images: {
      mobygames: {
        game: 70439,
        icon: "cover-299151",
        file: "7182140-call-of-duty-heroes-android-front-cover.png",
      },
    },
  }));
});
