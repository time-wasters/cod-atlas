export const MAP_MARKERS_CONFIG = {
  icon: {
    // Width and height in pixels of an unselected location marker.
    normalSize: 18,
    // Width and height in pixels of the selected location marker.
    activeSize: 30,
    // Extra stacking priority applied to the selected marker so it appears above nearby markers.
    activeZIndexOffset: 1000,
    // Vertical marker tooltip offset in pixels; negative moves up.
    tooltipOffsetY: -8,
  },
  clustering: {
    // Maximum pixel radius within which nearby markers can form a cluster.
    radiusPixels: 42,
    // Multiplier for spacing markers when an overlapping cluster fans out.
    spiderfyDistanceMultiplier: 1.35,
    // Exclusive marker-count upper bound for small cluster icons.
    smallCountLimit: 10,
    // Exclusive marker-count upper bound for medium cluster icons.
    mediumCountLimit: 100,
    // Width and height in pixels of small cluster icons.
    smallSize: 34,
    // Width and height in pixels of medium cluster icons.
    mediumSize: 40,
    // Width and height in pixels of cluster icons at or above the medium count limit.
    largeSize: 46,
    spiderLeg: {
      // Color of lines connecting fanned-out markers to their cluster position.
      color: "#d8bb65",
      // Width in pixels of the connecting lines for fanned-out markers.
      weight: 1.5,
      // Opacity of the connecting lines from 0 (transparent) to 1 (opaque).
      opacity: .8,
    },
  },
  pulse: {
    // Duration in milliseconds of the selected marker's pulse animation.
    durationMs: 800,
    // Extra milliseconds to retain the pulse element after its animation ends.
    removalBufferMs: 200,
    // Milliseconds to let the marker settle after arrival before starting its pulse.
    settleMs: 100,
  },
};
