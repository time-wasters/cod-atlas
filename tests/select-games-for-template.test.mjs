import assert from "node:assert/strict";
import test from "node:test";
import { selectGamesForTemplate } from "../src/application/game-catalog/use-cases/select-games-for-template.ts";

const games = [
  { code: "A", series: "series-a", subseries: ["main", "reboot"], developer: [{ id: "studio-a" }, { id: "studio-b" }] },
  { code: "B", series: "series-a", subseries: ["remaster"], developer: [{ id: "studio-b" }] },
  { code: "C", series: "series-b", subseries: ["main"], developer: [{ id: "studio-c" }] },
];
const template = (values = {}) => ({ series: new Set(), subseries: new Set(), developers: new Set(), ...values });

test("a template with no constraints checks every available game", () => {
  assert.deepEqual([...selectGamesForTemplate(games, template())], ["A", "B", "C"]);
});

test("multiple values within a template group select their union", () => {
  assert.deepEqual([...selectGamesForTemplate(games, template({ series: new Set(["series-a", "series-b"]) }))], ["A", "B", "C"]);
  assert.deepEqual([...selectGamesForTemplate(games, template({ developers: new Set(["studio-a", "studio-c"]) }))], ["A", "C"]);
});

test("all template groups must match the same game", () => {
  assert.deepEqual([...selectGamesForTemplate(games, template({
    series: new Set(["series-a"]), subseries: new Set(["main"]), developers: new Set(["studio-b"]),
  }))], ["A"]);
  assert.deepEqual([...selectGamesForTemplate(games, template({
    series: new Set(["series-b"]), developers: new Set(["studio-b"]),
  }))], []);
});

test("every sub-series membership and credited developer can select a game", () => {
  assert.deepEqual([...selectGamesForTemplate(games, template({ subseries: new Set(["reboot"]) }))], ["A"]);
  assert.deepEqual([...selectGamesForTemplate(games, template({ developers: new Set(["studio-b"]) }))], ["A", "B"]);
});

test("reapplying a template replaces manual changes and leaves source games intact", () => {
  const preset = template({ series: new Set(["series-a"]) });
  const selection = selectGamesForTemplate(games, preset);
  selection.delete("A");
  selection.add("C");
  assert.deepEqual([...selection], ["B", "C"]);
  assert.deepEqual([...selectGamesForTemplate(games, preset)], ["A", "B"]);
  assert.deepEqual(games.map((game) => game.code), ["A", "B", "C"]);
});
