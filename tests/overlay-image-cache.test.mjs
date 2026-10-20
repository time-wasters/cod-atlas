import assert from "node:assert/strict";
import test from "node:test";
import { createOverlayImageCache } from "../src/infrastructure/browser/images/overlay-image.cache.js";

function fixture(maximumEntries = 8) {
  const images = [];
  const cache = createOverlayImageCache({
    baseUrl: () => "https://atlas.test/preview/",
    maximumEntries,
    createImage() {
      let resolveDecode;
      let rejectDecode;
      const decoded = new Promise((resolve, reject) => { resolveDecode = resolve; rejectDecode = reject; });
      const image = {
        complete: false,
        naturalWidth: 0,
        decodeCalls: 0,
        decode() { this.decodeCalls += 1; return decoded; },
        load() { this.complete = true; this.naturalWidth = 100; this.onload?.(); },
        succeed() { this.load(); resolveDecode(); },
        fail() { this.onerror?.(); },
        resolveDecode,
        rejectDecode,
      };
      images.push(image);
      return image;
    },
  });
  return { cache, images };
}

test("preloading shares a request and waits for decoding before handing the image to the map", async () => {
  const { cache, images } = fixture();
  const first = cache.preload("/images/overlay.png");
  const second = cache.preload("images/overlay.png");
  assert.equal(images.length, 1);
  assert.equal(images[0].src, "https://atlas.test/preview/images/overlay.png");
  const acquired = cache.acquire("/images/overlay.png");
  assert.equal(images.length, 1);
  let ready = false;
  void acquired.then(() => { ready = true; });
  images[0].load();
  await Promise.resolve();
  assert.equal(images[0].decodeCalls, 1);
  assert.equal(ready, false);
  images[0].resolveDecode();
  assert.deepEqual(await Promise.all([first, second]), [true, true]);
  assert.equal(await acquired, images[0]);
  assert.equal(images[0].onload, null);
  assert.equal(images[0].onerror, null);
});

test("overlapping overlays acquire independent image elements even for the same URL", async () => {
  const { cache, images } = fixture();
  const outgoing = cache.acquire("images/shared.png");
  const incoming = cache.acquire("images/shared.png");
  assert.equal(images.length, 2);
  images.forEach((image) => image.succeed());
  assert.notEqual(await outgoing, await incoming);
});

test("failed downloads can be retried without retaining a failed cache entry", async () => {
  const { cache, images } = fixture();
  const failed = cache.preload("images/overlay.png");
  images[0].fail();
  assert.equal(await failed, false);
  const retry = cache.preload("images/overlay.png");
  assert.equal(images.length, 2);
  images[1].succeed();
  assert.equal(await retry, true);
});

test("decode failures do not provide an unusable overlay or poison later requests", async () => {
  const { cache, images } = fixture();
  const failed = cache.preload("images/overlay.png");
  images[0].load();
  await Promise.resolve();
  images[0].rejectDecode(new Error("Fixture decode failure"));
  assert.equal(await failed, false);
  const retry = cache.acquire("images/overlay.png");
  images[1].succeed();
  assert.equal(await retry, images[1]);
});

test("the decoded image cache evicts the least recently used upcoming image", async () => {
  const { cache, images } = fixture(2);
  const first = cache.preload("images/first.png");
  images[0].succeed();
  await first;
  const second = cache.preload("images/second.png");
  images[1].succeed();
  await second;
  await cache.preload("images/first.png");
  const third = cache.preload("images/third.png");
  images[2].succeed();
  await third;
  assert.equal(await cache.acquire("images/first.png"), images[0]);
  const secondAgain = cache.acquire("images/second.png");
  assert.equal(images.length, 4);
  images[3].succeed();
  assert.equal(await secondAgain, images[3]);
});

test("an invalid image URL fails without throwing into playback", async () => {
  const { cache } = fixture();
  assert.equal(await cache.preload("https://[invalid"), false);
  assert.equal(await cache.acquire("https://[invalid"), null);
});
