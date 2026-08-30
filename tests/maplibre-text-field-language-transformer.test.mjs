import assert from "node:assert/strict";
import test from "node:test";
import { preferEnglishMapLibreTextField } from "../src/infrastructure/mapping/maplibre/maplibre-text-field-language.transformer.js";

const englishNameExpression = [
  "coalesce",
  ["get", "name:en"],
  ["get", "name_en"],
  ["get", "name:latin"],
  ["get", "name"],
];

test("MapLibre English text fields retain local names as their final fallback", () => {
  assert.deepEqual(
    preferEnglishMapLibreTextField(["get", "name"]).value,
    englishNameExpression,
  );
  assert.deepEqual(
    preferEnglishMapLibreTextField("{name:latin}").value,
    englishNameExpression,
  );
});

test("MapLibre English text fields preserve formatting and non-name fields", () => {
  const textField = [
    "format",
    ["get", "name:latin"],
    { "font-scale": 1 },
    " / ",
    {},
    ["get", "ref"],
    {},
  ];
  assert.deepEqual(preferEnglishMapLibreTextField(textField), {
    changed: true,
    value: [
      "format",
      englishNameExpression,
      { "font-scale": 1 },
      " / ",
      {},
      ["get", "ref"],
      {},
    ],
  });
  assert.deepEqual(preferEnglishMapLibreTextField(["get", "ref"]), {
    changed: false,
    value: ["get", "ref"],
  });
});
