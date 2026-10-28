export const COUNTRY_BOUNDARY_CONFIG = {
  // Duration in milliseconds for a newly selected country's outline to fade in.
  fadeInMs: 2_000,
  // Start the fade this many milliseconds before a location-list flight arrives.
  fadeInBeforeArrivalMs: 500,
  // Muted orange stroke, with a soft outward halo supplied by the map stylesheet.
  color: "#e59a4b",
  // Stroke opacity from 0 (transparent) to 1 (opaque).
  opacity: .28,
  // Width of the softly blurred outline glow in screen pixels.
  weight: 10,
  // Lower values retain more coastline detail instead of visibly coarse segments.
  smoothFactor: .2,
};
