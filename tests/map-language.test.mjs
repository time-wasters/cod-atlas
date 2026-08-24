import assert from "node:assert/strict";
import test from "node:test";
import { applyEnglishMapLabels, preferEnglishTextField } from "../app/map-language.js";

const englishFallback = [
  "coalesce",
  ["get", "name:en"],
  ["get", "name_en"],
  ["get", "name:latin"],
  ["get", "name"],
];

test("English map labels retain local names as their final fallback", () => {
  assert.deepEqual(preferEnglishTextField(["get", "name"]).value, englishFallback);
  assert.deepEqual(preferEnglishTextField("{name:latin}").value, englishFallback);
});

test("English map labels preserve formatting and non-name fields", () => {
  const textField = ["format", ["get", "name:latin"], { "font-scale": 1 }, " / ", {}, ["get", "ref"], {}];
  assert.deepEqual(preferEnglishTextField(textField), {
    changed: true,
    value: ["format", englishFallback, { "font-scale": 1 }, " / ", {}, ["get", "ref"], {}],
  });
  assert.deepEqual(preferEnglishTextField(["get", "ref"]), {
    changed: false,
    value: ["get", "ref"],
  });
});

test("English label application updates only named symbol layers", () => {
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

  applyEnglishMapLabels(map);
  assert.deepEqual(updates, [{ id: "places", property: "text-field", value: englishFallback }]);
});
