/**
 * @typedef {object} CampaignRouteLevel
 * @property {string | null} entryId
 * @property {string} levelId
 * @property {string} title
 * @property {number | null} order
 * @property {[number, number] | null} coordinates
 */

/**
 * @typedef {object} CampaignRouteStop
 * @property {string} entryId
 * @property {string} levelId
 * @property {string} title
 * @property {number} order
 * @property {[number, number]} coordinates
 */

function haveSameCoordinates(left, right) {
  return left[0] === right[0] && left[1] === right[1];
}

/**
 * Converts ordered campaign levels into route segments and waypoint groups.
 * Unmapped levels break the route so unrelated locations are not connected
 * across an unknown or off-world mission.
 *
 * @param {CampaignRouteLevel[]} levels
 */
export function buildCampaignRoute(levels) {
  /** @type {[number, number][][]} */
  const segments = [];
  /** @type {[number, number][]} */
  let currentSegment = [];
  /** @type {Map<string, { coordinates: [number, number], stops: CampaignRouteStop[] }>} */
  const waypointGroups = new Map();

  levels.forEach((level, index) => {
    if (!level.coordinates || !level.entryId) {
      if (currentSegment.length > 1) segments.push(currentSegment);
      currentSegment = [];
      return;
    }

    const order = level.order ?? index + 1;
    const stop = {
      entryId: level.entryId,
      levelId: level.levelId,
      title: level.title,
      order,
      coordinates: level.coordinates,
    };
    const coordinateKey = level.coordinates.join(",");
    const waypoint = waypointGroups.get(coordinateKey) ?? {
      coordinates: level.coordinates,
      stops: [],
    };
    waypoint.stops.push(stop);
    waypointGroups.set(coordinateKey, waypoint);

    const previousCoordinates = currentSegment.at(-1);
    if (!previousCoordinates || !haveSameCoordinates(previousCoordinates, level.coordinates)) {
      currentSegment.push(level.coordinates);
    }
  });

  if (currentSegment.length > 1) segments.push(currentSegment);
  return { segments, waypoints: [...waypointGroups.values()] };
}
