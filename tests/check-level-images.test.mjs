import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { checkLevelImages } from "../src/application/media/use-cases/check-level-images.mjs";

test("image checks reject multiple raster main files for one level", async () => {
  const sharp = (input) => ({
    metadata: async () => ({ format: input[0] === 1 ? "png" : "jpeg", width: 256, height: 128 }),
  });
  const fixtures = [
    path.resolve("public/images/levels/example/campaign/map/main.png"),
    path.resolve("public/images/levels/example/campaign/map/main.jpg"),
  ];
  let nextInput = 0;
  const results = await checkLevelImages(fixtures, {
    sharp,
    read: async () => Buffer.from([++nextInput]),
  });
  assert.match(results.flatMap((result) => result.errors).join("\n"), /multiple raster main files/);
});
