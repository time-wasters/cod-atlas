import assert from "node:assert/strict";
import test from "node:test";

import { filterAtlasGroups } from "../src/application/atlas/use-cases/filter-atlas-groups.ts";
import { selectGamesForTemplate } from "../src/application/game-catalog/use-cases/select-games-for-template.ts";

function gameSelectionFixture() {
  const games = [
    { id: "original", code: "ORIGINAL", series: "series-a", subseries: ["main"], developer: [{ id: "studio-a", name: "Studio A" }] },
    { id: "remake", code: "REMAKE", series: "series-b", subseries: ["remaster"], developer: [{ id: "studio-b", name: "Studio B" }] },
    { id: "unselected", code: "UNSELECTED", series: "series-c", subseries: ["main"], developer: [] },
  ];
  const entry = (id, gameIds) => ({
    id, gameIds, game: gameIds.map((id) => games.find((game) => game.id === id).code).join(" / "),
    title: id, precision: "city", modes: ["singleplayer"], appearances: [{ title: id }],
  });
  return {
    games,
    groups: [
      { name: "Shared country", continent: "Continent A", flagCode: null, entries: [entry("shared", ["original", "remake"])] },
      { name: "Original country", continent: "Continent A", flagCode: null, entries: [entry("original-only", ["original"])] },
      { name: "Remake country", continent: "Continent B", flagCode: null, entries: [entry("remake-only", ["remake"])] },
      { name: "Other country", continent: "Continent B", flagCode: null, entries: [entry("other", ["unselected"])] },
    ],
    criteria: {
      query: "", gameCodes: new Set(["ORIGINAL", "REMAKE"]), country: "all",
      continents: new Set(), precisions: new Set(), confidences: new Set(), methods: new Set(),
      showSingleplayer: true, showMultiplayer: false, showZombies: false, showOther: false,
    },
  };
}

const entryIds = (result) => result.groups.flatMap((group) => group.entries.map((entry) => entry.id));

test("multiple game selection matches any selected game and includes shared entries once", () => {
  const result = filterAtlasGroups(gameSelectionFixture());
  assert.deepEqual(entryIds(result), ["shared", "original-only", "remake-only"]);
  assert.equal(result.countries.find((country) => country.name === "Other country").available, false);
});

test("all games and no games have distinct results", () => {
  const input = gameSelectionFixture();
  input.criteria.gameCodes = null;
  assert.deepEqual(entryIds(filterAtlasGroups(input)), ["shared", "original-only", "remake-only", "other"]);
  input.criteria.gameCodes = new Set();
  const result = filterAtlasGroups(input);
  assert.deepEqual(result.groups, []);
  assert.ok(result.countries.every((country) => !country.available));
});

test("a single checked game includes its shared and exclusive entries", () => {
  const input = gameSelectionFixture();
  input.criteria.gameCodes = new Set(["ORIGINAL"]);
  assert.deepEqual(entryIds(filterAtlasGroups(input)), ["shared", "original-only"]);
});

test("game templates seed checkboxes and allow manual choices outside the template", () => {
  const input = gameSelectionFixture();
  input.criteria.gameCodes = selectGamesForTemplate(input.games, {
    series: new Set(["series-a"]), subseries: new Set(), developers: new Set(),
  });
  assert.deepEqual(entryIds(filterAtlasGroups(input)), ["shared", "original-only"]);
  input.criteria.gameCodes.add("UNSELECTED");
  input.criteria.gameCodes.delete("ORIGINAL");
  assert.deepEqual(entryIds(filterAtlasGroups(input)), ["other"]);
});

test("templates with no matching games produce no results", () => {
  const input = gameSelectionFixture();
  input.criteria.gameCodes = selectGamesForTemplate(input.games, {
    series: new Set(["series-a"]), subseries: new Set(["remaster"]), developers: new Set(),
  });
  assert.deepEqual(filterAtlasGroups(input).groups, []);
});

test("selected games still combine with geographic and location filters", () => {
  const input = gameSelectionFixture();
  input.criteria.continents = new Set(["Continent A"]);
  input.criteria.country = "Original country";
  input.criteria.precisions = new Set(["city"]);
  assert.deepEqual(filterAtlasGroups(input).groups.map((group) => group.name), ["Original country"]);
  input.criteria.precisions = new Set(["exact"]);
  assert.deepEqual(filterAtlasGroups(input).groups, []);
});

test("Other modes remain independently selectable within the checked games", () => {
  const input = gameSelectionFixture();
  input.groups[0].entries[0].modes = ["other"];
  input.criteria.showSingleplayer = false;
  input.criteria.showOther = true;
  assert.deepEqual(entryIds(filterAtlasGroups(input)), ["shared"]);
});
