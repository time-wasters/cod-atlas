import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { resolveImageScopes } from "../src/infrastructure/content/filesystem/image-scope.resolver.mjs";

test("image scopes cannot escape the configured media root", async () => {
  const mediaRoot = path.resolve("test-fixtures", "level-images");
  await assert.rejects(
    resolveImageScopes(["../outside"], { mediaRoot, cwd: mediaRoot }),
    /must remain below/,
  );
});
