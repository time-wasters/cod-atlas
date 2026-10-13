/**
 * Keep local adjustments responsive while giving distant journeys time to read.
 * @param {number} distanceMeters
 * @param {number} minimumSeconds
 */
export function mapTravelDuration(distanceMeters, minimumSeconds = .55) {
  const distanceKm = Math.max(0, distanceMeters) / 1000;
  if (distanceKm <= 50) return minimumSeconds;
  return Math.min(8, minimumSeconds + 1.5 * Math.log2(1 + (distanceKm - 50) / 200));
}
