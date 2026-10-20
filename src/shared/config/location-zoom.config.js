// Default camera zoom by location precision. Higher values show a closer view.
// These are fixed scales, not measured city boundaries. City views include
// surrounding context; approximate and exact locations progressively show detail.
// Off-world locations have no Earth camera target.
/** @type {Record<string, number>} */
export const LOCATION_ZOOM_CONFIG = {
  country: 5,
  region: 6,
  city: 12,
  approximate: 14,
  exact: 17,
};

// Campaign close-ups require a named landmark, high confidence, and human
// location verification. Approximate landmarks retain more context.
/** @type {Record<string, number>} */
export const VERIFIED_LANDMARK_ZOOM_CONFIG = {
  approximate: 16,
  exact: 18,
};
