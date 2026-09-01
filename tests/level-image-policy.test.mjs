import assert from "node:assert/strict";
import test from "node:test";
import {
  levelImagePolicies,
  validateLevelImage,
} from "../src/domain/level/level-image.policy.mjs";

test("image checks distinguish recommendations from hard limits", () => {
  const recommendation = validateLevelImage({
    filename: "cod2/campaign/map/main.png",
    format: "png",
    width: 1200,
    height: 675,
    size: levelImagePolicies.main.recommendedBytes + 1,
  });
  assert.deepEqual(recommendation.errors, []);
  assert.equal(recommendation.warnings.length, 1);

  const failure = validateLevelImage({
    filename: "cod2/campaign/map/maps/overlay.png",
    format: "png",
    width: levelImagePolicies.overlay.maxEdge + 1,
    height: 100,
    size: levelImagePolicies.overlay.maxBytes + 1,
  });
  assert.equal(failure.errors.length, 2);
  assert.deepEqual(failure.warnings, []);
});

test("image checks compare the decoded format with the file extension", () => {
  const result = validateLevelImage({
    filename: "cod2/campaign/map/main.png",
    format: "jpeg",
    width: 1200,
    height: 675,
    size: 100_000,
  });
  assert.match(result.errors.join("\n"), /extension declares png, but the image is jpeg/);
});

test("main JPEG files use the build-supported .jpg extension", () => {
  const result = validateLevelImage({
    filename: "cod2/campaign/map/main.jpeg",
    format: "jpeg",
    width: 1200,
    height: 675,
    size: 100_000,
  });
  assert.match(result.errors.join("\n"), /must use the \.jpg extension/);
});
