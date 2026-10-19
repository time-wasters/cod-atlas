/**
 * Give large approaches to precise locations a city overview before the close-up.
 * @param {number} distanceMeters
 * @param {number} startZoom
 * @param {number} targetZoom
 * @param {{ overview: { zoom: number, minimumZoomChange: number, minimumTravelMeters: number } }} preset
 * @param {boolean} animate
 */
export function campaignFlightStages(distanceMeters, startZoom, targetZoom, preset, animate = true) {
  const overview = preset.overview;
  const needsDetail = targetZoom - overview.zoom >= overview.minimumZoomChange;
  const largeJump = distanceMeters >= overview.minimumTravelMeters
    || targetZoom - startZoom >= overview.minimumZoomChange;
  return animate && needsDetail && largeJump ? [overview.zoom, targetZoom] : [targetZoom];
}
