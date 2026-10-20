import { LOCATION_ZOOM_CONFIG, VERIFIED_LANDMARK_ZOOM_CONFIG } from "./location-zoom.config.js";

/** @type {[number, number]} */
const initialCenter = [27, 8];

export const MAP_CAMERA_CONFIG = {
  initialView: {
    center: initialCenter,
    zoom: 2,
  },
  minimumZoom: 2,
  maximumZoom: 18,
  padding: {
    minimumPixels: 32,
    maximumPixels: 56,
    edgeRatio: .055,
    panelWidthRatio: .68,
    minimumVisiblePixels: 64,
  },
  filterFit: { singleLocationZoom: 6, multipleLocationsZoom: 7, durationSeconds: .45 },
  sidebar: { transitionMs: 300, settleBufferMs: 40 },
  travel: {
    minimumSeconds: .55,
    maximumSeconds: 8,
    localDistanceMeters: 50_000,
    curveSeconds: 1.5,
    distanceScaleMeters: 200_000,
  },
  overviewPollMs: 50,
};

// Higher zoom values show closer views. Infinity defers to map/location limits.
export const MARKER_FOCUS_PRESET = {
  minimumZoom: 6,
  maximumZoom: Infinity,
  minimumTravelSeconds: MAP_CAMERA_CONFIG.travel.minimumSeconds,
  maximumTravelSeconds: MAP_CAMERA_CONFIG.travel.maximumSeconds,
};

export const CAMPAIGN_FOCUS_PRESET = {
  maximumZoom: MAP_CAMERA_CONFIG.maximumZoom,
  minimumTravelSeconds: MAP_CAMERA_CONFIG.travel.minimumSeconds,
  maximumTravelSeconds: MAP_CAMERA_CONFIG.travel.maximumSeconds,
  secondsPerZoomLevel: .25,
  overview: {
    zoom: 11,
    minimumZoomChange: 4,
    minimumTravelMeters: MAP_CAMERA_CONFIG.travel.localDistanceMeters,
    minimumHoldSeconds: .8,
    maximumWaitSeconds: 3,
  },
  zoomByPrecision: LOCATION_ZOOM_CONFIG,
  verifiedLandmarkZoomByPrecision: VERIFIED_LANDMARK_ZOOM_CONFIG,
};

export const OVERLAY_FIT_PRESET = {
  maximumZoom: Infinity,
  minimumTravelSeconds: MAP_CAMERA_CONFIG.travel.minimumSeconds,
  maximumTravelSeconds: MAP_CAMERA_CONFIG.travel.maximumSeconds,
};
