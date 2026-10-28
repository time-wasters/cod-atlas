import { LOCATION_ZOOM_CONFIG, VERIFIED_LANDMARK_ZOOM_CONFIG } from "./location-zoom.config.js";

/** @type {[number, number]} */
const initialCenter = [27, 8];

export const MAP_CAMERA_CONFIG = {
  initialView: {
    // Initial map center as [latitude, longitude] in degrees.
    center: initialCenter,
    // Initial world-view zoom; higher values show a closer view.
    zoom: 2,
  },
  // Lowest map zoom available to automatic camera movements and manual browsing.
  minimumZoom: 2,
  // Highest map zoom available to automatic camera movements and manual browsing.
  maximumZoom: 18,
  padding: {
    // Minimum edge padding in pixels when fitting locations or overlays.
    minimumPixels: 32,
    // Maximum base edge padding in pixels, before accounting for open panels.
    maximumPixels: 56,
    // Base edge padding as a fraction of the map viewport's shorter side.
    edgeRatio: .055,
    // Minimum fraction of map width a details or briefing panel must span to count as a top or bottom obstruction.
    panelWidthRatio: .68,
    // Minimum map width or height in pixels to leave visible when accounting for panels.
    minimumVisiblePixels: 64,
  },
  filterFit: {
    // Closest zoom allowed when fitting a single filtered location.
    singleLocationZoom: 6,
    // Closest zoom allowed when fitting multiple filtered locations.
    multipleLocationsZoom: 7,
    // Duration in seconds of the camera animation when fitting filtered results.
    durationSeconds: .45,
  },
  sidebar: {
    // Multiply location-list flight durations by this factor; .8 is 20% shorter.
    locationSelectionDurationScale: .8,
    // Duration in milliseconds of the sidebar's opening or closing transition.
    transitionMs: 300,
    // Extra milliseconds to wait after the sidebar transition before recalculating the map viewport.
    settleBufferMs: 40,
  },
  travel: {
    // Minimum camera flight time in seconds, also used for local moves.
    minimumSeconds: .55,
    // Maximum camera flight time in seconds for distance-based travel.
    maximumSeconds: 8,
    // Distance in meters up to which travel uses the minimum flight time.
    localDistanceMeters: 50_000,
    // Seconds added per doubling of the scaled distance term in the flight-duration curve.
    curveSeconds: 1.5,
    // Distance scale in meters for the flight-duration curve; larger values slow duration growth.
    distanceScaleMeters: 200_000,
  },
  // Milliseconds between checks for overview tiles and map readiness during campaign travel.
  overviewPollMs: 50,
};

// Higher zoom values show closer views. Infinity defers to map/location limits.
export const MARKER_FOCUS_PRESET = {
  // Minimum target zoom when manually focusing a marker without a precision-specific zoom.
  minimumZoom: 6,
  // Closest manual marker focus; Infinity leaves the limit to map and location constraints.
  maximumZoom: Infinity,
  // Minimum manual marker flight time in seconds, inherited from shared travel settings.
  minimumTravelSeconds: MAP_CAMERA_CONFIG.travel.minimumSeconds,
  // Maximum manual marker flight time in seconds, inherited from shared travel settings.
  maximumTravelSeconds: MAP_CAMERA_CONFIG.travel.maximumSeconds,
};

export const CAMPAIGN_FOCUS_PRESET = {
  // Closest campaign stop zoom, using the map's configured maximum.
  maximumZoom: MAP_CAMERA_CONFIG.maximumZoom,
  // Minimum campaign flight time in seconds, inherited from shared travel settings.
  minimumTravelSeconds: MAP_CAMERA_CONFIG.travel.minimumSeconds,
  // Maximum campaign flight time in seconds, inherited from shared travel settings.
  maximumTravelSeconds: MAP_CAMERA_CONFIG.travel.maximumSeconds,
  // Seconds added to the minimum flight time per zoom level changed, capped by the maximum travel time.
  secondsPerZoomLevel: .25,
  overview: {
    // Intermediate city overview zoom before approaching a precise campaign stop.
    zoom: 11,
    // Required zoom increase beyond the overview; also identifies large zoom jumps from the current view.
    minimumZoomChange: 4,
    // Distance in meters that triggers an overview for detailed stops; large zoom jumps can also trigger it.
    minimumTravelMeters: MAP_CAMERA_CONFIG.travel.localDistanceMeters,
    // Minimum seconds to hold the overview while destination tiles load.
    minimumHoldSeconds: .8,
    // Maximum seconds to wait at the overview before continuing despite unfinished tile loading.
    maximumWaitSeconds: 3,
  },
  // Default target zooms for campaign stops, keyed by location precision.
  zoomByPrecision: LOCATION_ZOOM_CONFIG,
  // Closer campaign zooms for named, high-confidence landmarks with human-verified locations.
  verifiedLandmarkZoomByPrecision: VERIFIED_LANDMARK_ZOOM_CONFIG,
};

export const OVERLAY_FIT_PRESET = {
  // Closest overlay fit zoom; Infinity leaves the limit to the map and fitted bounds.
  maximumZoom: Infinity,
  // Minimum overlay fit flight time in seconds, inherited from shared travel settings.
  minimumTravelSeconds: MAP_CAMERA_CONFIG.travel.minimumSeconds,
  // Maximum overlay fit flight time in seconds, inherited from shared travel settings.
  maximumTravelSeconds: MAP_CAMERA_CONFIG.travel.maximumSeconds,
};
