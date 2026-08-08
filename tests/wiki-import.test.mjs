import assert from "node:assert/strict";
import test from "node:test";
import { extractInfobox, hasCompleteAttribution, imageRecord, parseArguments, parseWikiLink } from "../scripts/import-wiki-articles.mjs";

test("extractInfobox keeps nested values intact", () => {
  const box = extractInfobox(`{{Infobox level
| image = [[File:Example.jpg|thumb]]
| location = [[Paris]], {{Flag|France}}
| map_image = Example map.png
}}
Body`);
  assert.equal(box.image, "[[File:Example.jpg|thumb]]");
  assert.equal(box.location, "[[Paris]], {{Flag|France}}");
  assert.equal(box.map_image, "Example map.png");
});

test("parseWikiLink preserves raw evidence and resolves its first link", () => {
  assert.deepEqual(parseWikiLink("[[Paris|Paris, France]]"), {
    raw: "[[Paris|Paris, France]]",
    label: "Paris, France",
    url: "https://callofduty.fandom.com/wiki/Paris",
  });
});

test("imageRecord maps attribution and source links", () => {
  assert.deepEqual(imageRecord({
    canonicalurl: "https://callofduty.fandom.com/wiki/File:Example.jpg",
    imageinfo: [{ url: "https://static.wikia.nocookie.net/example.jpg", extmetadata: {
      Artist: { value: '<a href="/wiki/User:Editor">Editor</a>' },
      LicenseShortName: { value: "CC BY-SA 3.0" },
      LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/3.0/" },
    } }],
  }), {
    sourceUrl: "https://static.wikia.nocookie.net/example.jpg",
    detailPageUrl: "https://callofduty.fandom.com/wiki/File:Example.jpg",
    author: { name: "Editor", userUrl: "https://callofduty.fandom.com/wiki/User:Editor" },
    license: { name: "CC BY-SA 3.0", url: "https://creativecommons.org/licenses/by-sa/3.0/" },
  });
});

test("media requires complete attribution before import", () => {
  assert.equal(hasCompleteAttribution({
    sourceUrl: "https://example.test/image.png",
    detailPageUrl: "https://example.test/file",
    author: { name: "Editor", userUrl: "https://example.test/user" },
    license: { name: "CC BY-SA", url: "https://example.test/license" },
  }), true);
  assert.equal(hasCompleteAttribution({
    sourceUrl: "https://example.test/image.png",
    detailPageUrl: "https://example.test/file",
    author: { name: null, userUrl: null },
    license: { name: null, url: null },
  }), false);
});

test("arguments require explicit scope and enforce a polite delay", () => {
  assert.throws(() => parseArguments([]), /Select records/);
  assert.throws(() => parseArguments(["--all", "--delay-ms", "100"]), /at least 2000/);
  assert.equal(parseArguments(["--id", "codwiki-example"]).ids[0], "codwiki-example");
});
