import { mapTravelDuration } from "./map-travel-duration.js";

/**
 * Give large zoom changes time to read, even when the destination is nearby.
 * @param {number} distanceMeters
 * @param {number} startZoom
 * @param {number} targetZoom
 * @param {{ minimumTravelSeconds: number, maximumTravelSeconds: number,
 *   secondsPerZoomLevel: number }} preset
 */
export function campaignTravelDuration(distanceMeters, startZoom, targetZoom, preset) {
  const travelSeconds = mapTravelDuration(
    distanceMeters, preset.minimumTravelSeconds, preset.maximumTravelSeconds,
  );
  const zoomSeconds = preset.minimumTravelSeconds
    + Math.abs(targetZoom - startZoom) * preset.secondsPerZoomLevel;
  return Math.min(preset.maximumTravelSeconds, Math.max(travelSeconds, zoomSeconds));
}
