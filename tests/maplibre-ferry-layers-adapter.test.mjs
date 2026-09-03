import assert from "node:assert/strict";
import test from "node:test";
import { hideMapLibreFerryLines } from "../src/infrastructure/mapping/maplibre/maplibre-ferry-layers.adapter.js";

test("hides ferry line layers without hiding roads that exclude ferries", () => {
  const hiddenLayers = [];
  const map = {
    getStyle: () => ({
      layers: [
        { id: "ferry", type: "line", filter: ["all", ["in", "class", "ferry"]] },
        { id: "roads", type: "line", filter: ["all", ["!in", "class", "ferry", "rail"]] },
        { id: "ferry-terminal", type: "symbol", filter: ["==", "class", "ferry"] },
      ],
    }),
    setLayoutProperty: (id, property, value) => hiddenLayers.push([id, property, value]),
  };

  hideMapLibreFerryLines(map);

  assert.deepEqual(hiddenLayers, [["ferry", "visibility", "none"]]);
});

test("recognizes a ferry route by its positive class filter", () => {
  const hiddenLayers = [];
  const map = {
    getStyle: () => ({
      layers: [{ id: "transport-route", type: "line", filter: ["==", "class", "ferry"] }],
    }),
    setLayoutProperty: (id, property, value) => hiddenLayers.push([id, property, value]),
  };

  hideMapLibreFerryLines(map);

  assert.deepEqual(hiddenLayers, [["transport-route", "visibility", "none"]]);
});
