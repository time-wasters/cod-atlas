import assert from "node:assert/strict";
import test from "node:test";
import { buildAtlasFilterCatalog } from "../src/presentation/filters/models/build-atlas-filter-catalog.ts";

test("developer filters expose included games in hover details", () => {
  const data = {
    groups: [],
    games: [
      {
        id: "bo6",
        code: "BO6",
        label: "Black Ops 6",
        labelLong: "Call of Duty: Black Ops 6",
        released: "2024-10-25",
        series: "black-ops",
        subseries: ["main", "reboot"],
        remasterOf: null,
        developer: [
          { id: "treyarch", name: "Treyarch" },
          { id: "raven", name: "Raven Software" },
        ],
      },
      {
        id: "bocw",
        code: "BOCW",
        label: "Black Ops Cold War",
        labelLong: "Call of Duty: Black Ops Cold War",
        released: "2020-11-13",
        series: "black-ops",
        subseries: ["main"],
        remasterOf: null,
        developer: [
          { id: "treyarch", name: "Treyarch" },
          { id: "raven", name: "Raven Software" },
        ],
      },
    ],
  };

  const catalog = buildAtlasFilterCatalog(data);
  assert.deepEqual(
    catalog.developerOptions.map(({ value, label }) => ({ value, label })),
    [
      { value: "raven", label: "Raven Software" },
      { value: "treyarch", label: "Treyarch" },
    ],
  );
  assert.deepEqual(catalog.developerDetails.get("treyarch")?.games, [
    { label: "Black Ops Cold War", year: "2020" },
    { label: "Black Ops 6", year: "2024" },
  ]);
  assert.deepEqual(catalog.gameSubseriesDetails.get("reboot")?.games, [
    { label: "Black Ops 6", year: "2024" },
  ]);
});
