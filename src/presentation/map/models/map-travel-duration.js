/**
 * Keep local adjustments responsive while giving distant journeys time to read.
 * @param {number} distanceMeters
 * @param {number} minimumSeconds
 * @param {number} maximumSeconds
 */
export function mapTravelDuration(distanceMeters, minimumSeconds = .55, maximumSeconds = 8) {
  const distanceKm = Math.max(0, distanceMeters) / 1000;
  if (distanceKm <= 50) return minimumSeconds;
  return Math.min(maximumSeconds, minimumSeconds + 1.5 * Math.log2(1 + (distanceKm - 50) / 200));
}
