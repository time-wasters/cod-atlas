// Default camera zoom by location precision. Higher values show a closer view.
// Off-world locations have no Earth camera target.
/** @type {Record<string, number>} */
export const LOCATION_ZOOM_CONFIG = {
  // Zoom for country-level locations, showing broad national context.
  country: 5,
  // Zoom for region-level locations, showing surrounding regional context.
  region: 6,
  // Fixed city-level zoom showing the city and surroundings, independent of city boundaries.
  city: 12,
  // Zoom for approximate locations, retaining context around the estimated site.
  approximate: 14,
  // Zoom for exact locations, showing detail around the mapped site.
  exact: 17,
};

// Campaign close-ups require a named landmark, high confidence, and human location verification.
/** @type {Record<string, number>} */
export const VERIFIED_LANDMARK_ZOOM_CONFIG = {
  // Campaign zoom for verified approximate landmarks, retaining some surrounding context.
  approximate: 16,
  // Campaign zoom for verified exact landmarks, showing the closest configured detail.
  exact: 18,
};
