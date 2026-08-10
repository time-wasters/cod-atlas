import assert from "node:assert/strict";
import test from "node:test";
import {
  extractInfobox,
  formatWikiConfigurationError,
  hasSequenceMetadata,
  hasCompleteAttribution,
  imageRecord,
  loadWikiArticleIdsForGames,
  parseArguments,
  parseWikiLink,
  parseWikiReferences,
  parseWikiValue,
  resolveWikiConfiguration,
  WikiConfigurationError,
  wikiArticleIdsForGames,
} from "../scripts/import-wiki-articles.mjs";

const wikiOrigin = "https://wiki.example.test";

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
  assert.deepEqual(parseWikiLink("[[Paris|Paris, France]]", wikiOrigin), {
    raw: "[[Paris|Paris, France]]",
    label: "Paris, France",
    url: "https://wiki.example.test/wiki/Paris",
  });
});

test("parseWikiReferences preserves display evidence and every linked target", () => {
  assert.deepEqual(parseWikiReferences("[[Crew Expendable]] / [[Blackout (Call of Duty 4)|Blackout]]", wikiOrigin), {
    raw: "[[Crew Expendable]] / [[Blackout (Call of Duty 4)|Blackout]]",
    label: "Crew Expendable / Blackout",
    links: [
      {
        wikiTitle: "Crew Expendable",
        label: "Crew Expendable",
        url: "https://wiki.example.test/wiki/Crew_Expendable",
      },
      {
        wikiTitle: "Blackout (Call of Duty 4)",
        label: "Blackout",
        url: "https://wiki.example.test/wiki/Blackout_(Call_of_Duty_4)",
      },
    ],
  });
  assert.deepEqual(parseWikiReferences(null, wikiOrigin), { raw: null, label: null, links: [] });
});

test("parseWikiValue preserves raw date evidence and a display value", () => {
  assert.deepEqual(parseWikiValue("[[2011]]-10-6"), { raw: "[[2011]]-10-6", label: "2011-10-6" });
  assert.deepEqual(parseWikiValue(null), { raw: null, label: null });
});

test("existing snapshots are refreshed until sequence metadata has been imported", () => {
  assert.equal(hasSequenceMetadata({ latestRevisionId: 123 }), false);
  assert.equal(hasSequenceMetadata({ previousLevels: {}, nextLevels: {}, games: {}, date: {} }), true);
});

test("imageRecord maps attribution and source links", () => {
  assert.deepEqual(imageRecord({
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

test("imageRecord preserves the Wiki notice for copyrighted game media", () => {
  const image = imageRecord({
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
  assert.equal(hasCompleteAttribution(image), true);
});

test("Wiki configuration is opt-in and accepts an explicit origin", () => {
  let error;
  try {
    resolveWikiConfiguration({});
  } catch (caught) {
    error = caught;
  }
  assert.ok(error instanceof WikiConfigurationError);
  const output = formatWikiConfigurationError(error);
  assert.match(output, /Wiki import configuration required/);
  assert.match(output, /COD_ATLAS_WIKI_ORIGIN=https:\/\/callofduty\.fandom\.com/);
  assert.doesNotMatch(output, /\n\s+at /);
  assert.throws(() => resolveWikiConfiguration({
    COD_ATLAS_WIKI_ORIGIN: "not a URL",
    COD_ATLAS_WIKI_USER_AGENT: "Atlas importer (maintainer@example.test)",
  }), WikiConfigurationError);
  assert.deepEqual(resolveWikiConfiguration({
    COD_ATLAS_WIKI_ORIGIN: wikiOrigin,
    COD_ATLAS_WIKI_USER_AGENT: "Atlas importer (maintainer@example.test)",
  }), {
    origin: wikiOrigin,
    apiUrl: new URL("https://wiki.example.test/api.php"),
    userAgent: "Atlas importer (maintainer@example.test)",
  });
});

test("media requires complete attribution before import", () => {
  assert.equal(hasCompleteAttribution({
    sourceUrl: "https://example.test/image.png",
    thumbnailUrl: "https://example.test/image-thumbnail.png",
    detailPageUrl: "https://example.test/file",
    author: { name: "Editor", userUrl: "https://example.test/user" },
    license: { name: "CC BY-SA", url: "https://example.test/license" },
  }), true);
  assert.equal(hasCompleteAttribution({
    sourceUrl: "https://example.test/image.png",
    thumbnailUrl: "https://example.test/image-thumbnail.png",
    detailPageUrl: "https://example.test/file",
    author: { name: null, userUrl: null },
    license: { name: null, url: null },
  }), false);
});

test("arguments require explicit scope and enforce a polite delay", () => {
  assert.throws(() => parseArguments([]), /Select records/);
  assert.throws(() => parseArguments(["--all", "--delay-ms", "100"]), /at least 2000/);
  assert.throws(() => parseArguments(["--game", "--dry-run"]), /--game requires a value/);
  assert.equal(parseArguments(["--id", "codwiki-example"]).ids[0], "codwiki-example");
  assert.deepEqual(parseArguments(["--game", "cod3", "--game", "cod4"]).gameIds, ["cod3", "cod4"]);
});

test("game selection includes every matching level and deduplicates Wiki articles", () => {
  const levels = [
    { games: ["cod3"], wikiArticle: "codwiki-one" },
    { games: ["cod3", "cod4-r"], wikiArticle: "codwiki-shared" },
    { games: ["cod4-r"], wikiArticle: "codwiki-shared" },
    { games: ["cod4"], wikiArticle: "codwiki-other" },
  ];
  assert.deepEqual(wikiArticleIdsForGames(levels, ["cod3"]), ["codwiki-one", "codwiki-shared"]);
  assert.deepEqual(wikiArticleIdsForGames(levels, ["cod3", "cod4-r"]), ["codwiki-one", "codwiki-shared"]);
});

test("game selection resolves curated levels and rejects unknown game IDs", async () => {
  const ids = await loadWikiArticleIdsForGames(["cod3"]);
  assert.ok(ids.includes("codwiki-the-corridor-of-death"));
  assert.equal(ids.length, new Set(ids).size);
  await assert.rejects(loadWikiArticleIdsForGames(["not-a-game"]), /Unknown game IDs: not-a-game/);
});
