export const CAMPAIGN_ROUTE_CONFIG = {
  projectionZoom: { minimum: 2, maximum: 8 },
  arc: { maximumHeightPixels: 64, heightRatio: .12, minimumSamples: 8, maximumSamples: 512 },
  line: { color: "#741c27", weight: 3, opacity: .92, smoothFactor: .25 },
  animation: { framesPerSecond: 30, dashArray: [7, 10], cyclePixels: 34, cycleMs: 1150 },
  marker: { width: 22, height: 18, anchorX: -5, anchorY: 23, tooltipX: 8, tooltipY: -22, appearMs: 180 },
  initialFit: { maximumZoom: 8, minimumTravelSeconds: .65 },
  reveal: { maximumRetries: 6, retryMs: 160, settleMs: 180, arrivalBufferMs: 250 },
};
