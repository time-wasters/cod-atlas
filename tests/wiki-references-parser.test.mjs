import assert from "node:assert/strict";
import test from "node:test";
import { buildWikiArticleLookup } from "../src/domain/wiki-article/wiki-article-lookup.service.mjs";
import { parseWikiReferences } from "../src/infrastructure/external/call-of-duty-wiki/wiki-references.parser.mjs";

const wikiOrigin = "https://wiki.example.test";

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

test("parseWikiReferences distinguishes game order from chronological order and resolves local articles", () => {
  const articleLookup = buildWikiArticleLookup([
    { id: "codwiki-dulag-iiia", sourceUrl: `${wikiOrigin}/wiki/Dulag_IIIA` },
    { id: "codwiki-pathfinder", sourceUrl: `${wikiOrigin}/wiki/Pathfinder` },
    { id: "codwiki-pegasus-bridge-day", sourceUrl: `${wikiOrigin}/wiki/Pegasus_Bridge-Day` },
    { id: "codwiki-ste-mere-eglise", sourceUrl: `${wikiOrigin}/wiki/Ste._Mere-Eglise` },
  ], wikiOrigin);

  assert.deepEqual(
    parseWikiReferences("[[Dulag IIIA]]<br>[[Pathfinder]] (Chronologically)", wikiOrigin, articleLookup).links,
    [
      {
        sequence: "game",
        article: "codwiki-dulag-iiia",
        wikiTitle: "Dulag IIIA",
        label: "Dulag IIIA",
        url: `${wikiOrigin}/wiki/Dulag_IIIA`,
      },
      {
        sequence: "chronological",
        article: "codwiki-pathfinder",
        wikiTitle: "Pathfinder",
        label: "Pathfinder",
        url: `${wikiOrigin}/wiki/Pathfinder`,
      },
    ],
  );
  assert.deepEqual(
    parseWikiReferences("[[Pegasus Bridge-Day]]<br>[[Ste. Mere-Eglise]] <small>(chronologically)</small>", wikiOrigin, articleLookup).links.map(({ sequence, article }) => ({ sequence, article })),
    [
      { sequence: "game", article: "codwiki-pegasus-bridge-day" },
      { sequence: "chronological", article: "codwiki-ste-mere-eglise" },
    ],
  );
  assert.deepEqual(
    parseWikiReferences("[[Uncatalogued Level]]", wikiOrigin, articleLookup).links[0],
    {
      sequence: "game",
      article: null,
      wikiTitle: "Uncatalogued Level",
      label: "Uncatalogued Level",
      url: `${wikiOrigin}/wiki/Uncatalogued_Level`,
    },
  );
});
