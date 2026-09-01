import assert from "node:assert/strict";
import test from "node:test";
import { parseImageCommandOptions } from "../src/infrastructure/cli/image-management/image-command-options.mjs";

test("preparation defaults to all level images and accepts a narrower scope", () => {
  assert.deepEqual(parseImageCommandOptions(["prepare"]), {
    command: "prepare",
    dryRun: false,
    strict: false,
    targets: [],
  });
  assert.deepEqual(parseImageCommandOptions(["prepare", "--dry-run", "public/images/levels/cod2"]), {
    command: "prepare",
    dryRun: true,
    strict: false,
    targets: ["public/images/levels/cod2"],
  });
});

test("checks default to all level images and support strict recommendations", () => {
  assert.deepEqual(parseImageCommandOptions(["check", "--strict"]), {
    command: "check",
    dryRun: false,
    strict: true,
    targets: [],
  });
});
