import assert from "node:assert/strict";
import test from "node:test";
import { tooltipPosition } from "../src/presentation/shared/models/tooltip-position.js";

test("sidebar hints appear to the right when there is room", () => {
  const position = tooltipPosition(
    { left: 16, right: 80, top: 60, bottom: 100 },
    { width: 160, height: 40 }, { width: 800, height: 600 },
  );
  assert.deepEqual(position, { left: 89, top: 60 });
});

test("controls near the right edge put their tooltip on the left", () => {
  const position = tooltipPosition(
    { left: 740, right: 776, top: 60, bottom: 96 },
    { width: 200, height: 60 }, { width: 800, height: 600 },
  );
  assert.deepEqual(position, { left: 531, top: 48 });
});

test("narrow screens place wide hints above their trigger", () => {
  const position = tooltipPosition(
    { left: 240, right: 276, top: 400, bottom: 436 },
    { width: 260, height: 80 }, { width: 320, height: 600 },
  );
  assert.deepEqual(position, { left: 52, top: 311 });
});

test("hints fall below triggers when there is no room above", () => {
  const position = tooltipPosition(
    { left: 120, right: 156, top: 8, bottom: 44 },
    { width: 260, height: 80 }, { width: 320, height: 600 },
  );
  assert.deepEqual(position, { left: 8, top: 53 });
});

test("long tooltips stay inside the top and bottom viewport margins", () => {
  for (const top of [0, 590]) {
    const position = tooltipPosition(
      { left: 16, right: 80, top, bottom: top + 36 },
      { width: 260, height: 160 }, { width: 800, height: 600 },
    );
    assert.ok(position.top >= 8);
    assert.ok(position.top + 160 <= 592);
  }
});
