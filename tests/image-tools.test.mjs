import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  checkImages,
  classifyImagePath,
  imagePolicies,
  parseImageArguments,
  resolveImageScopes,
  validateImageRecord,
} from "../scripts/manage-images.mjs";

test("image paths are classified by their repository role", () => {
  assert.equal(classifyImagePath("cod2/campaign/map/main.png"), "main");
  assert.equal(classifyImagePath("cod2/campaign/map/main.jpg"), "main");
  assert.equal(classifyImagePath("cod2/campaign/map/maps/overlay.png"), "overlay");
  assert.equal(classifyImagePath("cod2/campaign/map/extra/research.png"), "other");
});

test("image checks distinguish recommendations from hard limits", () => {
  const recommendation = validateImageRecord({
    filename: "cod2/campaign/map/main.png",
    format: "png",
    width: 1200,
    height: 675,
    size: imagePolicies.main.recommendedBytes + 1,
  });
  assert.deepEqual(recommendation.errors, []);
  assert.equal(recommendation.warnings.length, 1);

  const failure = validateImageRecord({
    filename: "cod2/campaign/map/maps/overlay.png",
    format: "png",
    width: imagePolicies.overlay.maxEdge + 1,
    height: 100,
    size: imagePolicies.overlay.maxBytes + 1,
  });
  assert.equal(failure.errors.length, 2);
  assert.deepEqual(failure.warnings, []);
});

test("image checks compare the decoded format with the file extension", () => {
  const result = validateImageRecord({
    filename: "cod2/campaign/map/main.png",
    format: "jpeg",
    width: 1200,
    height: 675,
    size: 100_000,
  });
  assert.match(result.errors.join("\n"), /extension declares png, but the image is jpeg/);
});

test("main JPEG files use the build-supported .jpg extension", () => {
  const result = validateImageRecord({
    filename: "cod2/campaign/map/main.jpeg",
    format: "jpeg",
    width: 1200,
    height: 675,
    size: 100_000,
  });
  assert.match(result.errors.join("\n"), /must use the \.jpg extension/);
});

test("image checks reject multiple raster main files for one level", async () => {
  const sharp = (input) => ({
    metadata: async () => ({ format: input[0] === 1 ? "png" : "jpeg", width: 256, height: 128 }),
  });
  const fixtures = [
    path.resolve("public/images/levels/example/campaign/map/main.png"),
    path.resolve("public/images/levels/example/campaign/map/main.jpg"),
  ];
  let nextInput = 0;
  const results = await checkImages(fixtures, {
    sharp,
    read: async () => Buffer.from([++nextInput]),
  });
  assert.match(results.flatMap((result) => result.errors).join("\n"), /multiple raster main files/);
});

test("preparation always requires an explicit scope", () => {
  assert.throws(() => parseImageArguments(["prepare"]), /requires at least one explicit file or directory/);
  assert.deepEqual(parseImageArguments(["prepare", "--dry-run", "public/images/levels/cod2"]), {
    command: "prepare",
    dryRun: true,
    strict: false,
    targets: ["public/images/levels/cod2"],
  });
});

test("checks default to all level images and support strict recommendations", () => {
  assert.deepEqual(parseImageArguments(["check", "--strict"]), {
    command: "check",
    dryRun: false,
    strict: true,
    targets: [],
  });
});

test("image scopes cannot escape the configured media root", async () => {
  const mediaRoot = path.resolve("test-fixtures", "level-images");
  await assert.rejects(
    resolveImageScopes(["../outside"], { mediaRoot, cwd: mediaRoot }),
    /must remain below/,
  );
});
