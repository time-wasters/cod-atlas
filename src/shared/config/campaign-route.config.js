export const CAMPAIGN_ROUTE_CONFIG = {
  projectionZoom: {
    // Lowest zoom used to project route points when calculating arc shapes.
    minimum: 2,
    // Highest zoom used to project route points when calculating arc shapes.
    maximum: 8,
  },
  arc: {
    // Maximum arc control-point offset in pixels at the route's projection zoom.
    maximumHeightPixels: 64,
    // Arc control-point offset as a fraction of the projected distance between stops.
    heightRatio: .12,
    // Minimum number of segments used to approximate each curved connection.
    minimumSamples: 8,
    // Maximum number of segments per connection, limiting work at high zoom.
    maximumSamples: 512,
  },
  line: {
    // Stroke color of campaign route connections.
    color: "#741c27",
    // Route stroke width in pixels.
    weight: 3,
    // Route stroke opacity from 0 (transparent) to 1 (opaque).
    opacity: .92,
    // Leaflet line simplification factor; lower values preserve more curve detail.
    smoothFactor: .25,
  },
  animation: {
    // Maximum refresh rate for moving route dashes.
    framesPerSecond: 30,
    // Alternating dash and gap lengths in pixels.
    dashArray: [7, 10],
    // Dash offset distance in pixels before the animation wraps.
    cyclePixels: 34,
    // Milliseconds for the dash offset to travel one cycle.
    cycleMs: 1150,
  },
  marker: {
    // Campaign stop badge width in pixels.
    width: 22,
    // Campaign stop badge height in pixels.
    height: 18,
    // Horizontal anchor in pixels from the badge's left edge to its map coordinate.
    anchorX: -5,
    // Vertical anchor in pixels from the badge's top edge to its map coordinate.
    anchorY: 23,
    // Horizontal tooltip offset in pixels; positive moves right.
    tooltipX: 8,
    // Vertical tooltip offset in pixels; negative moves up.
    tooltipY: -22,
    // Duration in milliseconds of the stop badge's entrance animation.
    appearMs: 180,
  },
  initialFit: {
    // Closest zoom allowed when first fitting the whole campaign route.
    maximumZoom: 8,
    // Minimum camera travel time in seconds for the initial campaign fit.
    minimumTravelSeconds: .65,
  },
  reveal: {
    // Maximum retries to expose the first campaign marker from its cluster.
    maximumRetries: 6,
    // Milliseconds between attempts to expose the first marker.
    retryMs: 160,
    // Milliseconds to let map or cluster movement settle before exposing the first marker.
    settleMs: 180,
    // Extra milliseconds after expected camera arrival before the fallback reveal attempt.
    arrivalBufferMs: 250,
  },
};
