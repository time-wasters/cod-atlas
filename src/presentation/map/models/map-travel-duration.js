import { MAP_CAMERA_CONFIG } from "../../../shared/config/map-camera.config.js";

/**
 * Keep local adjustments responsive while giving distant journeys time to read.
 * @param {number} distanceMeters
 * @param {number} minimumSeconds
 * @param {number} maximumSeconds
 */
export function mapTravelDuration(distanceMeters,
  minimumSeconds = MAP_CAMERA_CONFIG.travel.minimumSeconds,
  maximumSeconds = MAP_CAMERA_CONFIG.travel.maximumSeconds) {
  const { localDistanceMeters, curveSeconds, distanceScaleMeters } = MAP_CAMERA_CONFIG.travel;
  const distance = Math.max(0, distanceMeters);
  if (distance <= localDistanceMeters) return minimumSeconds;
  return Math.min(maximumSeconds,
    minimumSeconds + curveSeconds * Math.log2(1 + (distance - localDistanceMeters) / distanceScaleMeters));
}
