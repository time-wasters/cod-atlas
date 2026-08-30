import assert from "node:assert/strict";
import test from "node:test";
import {
  hasUsableWikiImage,
  mapWikiImage,
} from "../src/infrastructure/external/call-of-duty-wiki/wiki-image.mapper.mjs";

const wikiOrigin = "https://wiki.example.test";

test("mapWikiImage maps attribution and source links", () => {
  assert.deepEqual(mapWikiImage({
    canonicalurl: "https://wiki.example.test/wiki/File:Example.jpg",
    imageinfo: [{
      url: "https://static.wikia.nocookie.net/example.jpg",
      thumburl: "https://static.wikia.nocookie.net/example-thumbnail.jpg",
      extmetadata: {
        Artist: { value: '<a href="/wiki/User:Editor">Editor</a>' },
        LicenseShortName: { value: "CC BY-SA 3.0" },
        LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/3.0/" },
      },
    }],
  }, wikiOrigin), {
    sourceUrl: "https://static.wikia.nocookie.net/example.jpg",
    thumbnailUrl: "https://static.wikia.nocookie.net/example-thumbnail.jpg",
    detailPageUrl: "https://wiki.example.test/wiki/File:Example.jpg",
    author: { name: "Editor", userUrl: "https://wiki.example.test/wiki/User:Editor", role: "author" },
    license: { name: "CC BY-SA 3.0", url: "https://creativecommons.org/licenses/by-sa/3.0/" },
    rights: {
      status: "licensed",
      notice: null,
      noticeUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    },
  });
});

test("mapWikiImage preserves the Wiki notice for copyrighted game media", () => {
  const image = mapWikiImage({
    canonicalurl: "https://wiki.example.test/wiki/File:Bocage_3_CoD.png",
    imageinfo: [{
      user: "Uploader",
      url: "https://static.wikia.nocookie.net/bocage.png",
      thumburl: "https://static.wikia.nocookie.net/bocage-thumbnail.png",
      extmetadata: {},
    }],
    revisions: [{ slots: { main: { content: "{{Copyrighted Media}}\n[[Category:Bocage images]]" } } }],
  }, wikiOrigin);
  assert.equal(image.author.role, "uploader");
  assert.equal(image.author.userUrl, "https://wiki.example.test/wiki/User:Uploader");
  assert.equal(image.license.name, null);
  assert.equal(image.rights.status, "non-free");
  assert.match(image.rights.notice, /identification and critical commentary/);
  assert.equal(image.rights.noticeUrl, "https://wiki.example.test/wiki/Template:Copyrighted_Media");
  assert.equal(hasUsableWikiImage(image), true);
});

test("Wiki media only requires usable source URLs", () => {
  assert.equal(hasUsableWikiImage({
    sourceUrl: "https://example.test/image.png",
    thumbnailUrl: "https://example.test/image-thumbnail.png",
    detailPageUrl: "https://example.test/file",
    author: { name: "Editor", userUrl: "https://example.test/user" },
    license: { name: "CC BY-SA", url: "https://example.test/license" },
  }), true);
  assert.equal(hasUsableWikiImage({
    sourceUrl: "https://example.test/image.png",
    thumbnailUrl: "https://example.test/image-thumbnail.png",
    detailPageUrl: "https://example.test/file",
    author: { name: null, userUrl: null },
    license: { name: null, url: null },
  }), true);
  assert.equal(hasUsableWikiImage({ sourceUrl: "https://example.test/image.png" }), false);
});
