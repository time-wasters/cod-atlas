export const MAP_MARKERS_CONFIG = {
  icon: { normalSize: 18, activeSize: 30, activeZIndexOffset: 1000, tooltipOffsetY: -8 },
  clustering: {
    radiusPixels: 42,
    spiderfyDistanceMultiplier: 1.35,
    smallCountLimit: 10,
    mediumCountLimit: 100,
    smallSize: 34,
    mediumSize: 40,
    largeSize: 46,
    spiderLeg: { color: "#d8bb65", weight: 1.5, opacity: .8 },
  },
  pulse: { durationMs: 800, removalBufferMs: 200, settleMs: 100 },
};
