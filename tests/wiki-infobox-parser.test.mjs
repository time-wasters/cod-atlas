import assert from "node:assert/strict";
import test from "node:test";
import { extractInfobox } from "../src/infrastructure/external/call-of-duty-wiki/wiki-infobox.parser.mjs";

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
