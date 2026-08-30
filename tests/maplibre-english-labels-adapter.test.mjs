import assert from "node:assert/strict";
import test from "node:test";
import { applyEnglishMapLibreLabels } from "../src/infrastructure/mapping/maplibre/maplibre-english-labels.adapter.js";

const englishNameExpression = [
  "coalesce",
  ["get", "name:en"],
  ["get", "name_en"],
  ["get", "name:latin"],
  ["get", "name"],
];

test("MapLibre English-label adapter updates only named symbol layers", () => {
  const updates = [];
  const fields = new Map([
    ["places", ["get", "name"]],
    ["road-shields", ["get", "ref"]],
  ]);
  const map = {
    getStyle: () => ({
      layers: [
        { id: "background", type: "background" },
        { id: "places", type: "symbol" },
        { id: "road-shields", type: "symbol" },
      ],
    }),
    getLayoutProperty: (id) => fields.get(id),
    setLayoutProperty: (id, property, value) => updates.push({ id, property, value }),
  };

  applyEnglishMapLibreLabels(map);
  assert.deepEqual(updates, [{
    id: "places",
    property: "text-field",
    value: englishNameExpression,
  }]);
});
