import mapOverlaySource from "../../../../app/data/map-overlays.generated.json";
import type { MapOverlayDto } from "../dto/map-overlay.dto.js";
import {
  coordinateTuple,
  numberValue,
  objectValue,
  stringValue,
} from "./shared/json-value.validator.js";

function assertMapOverlay(value: unknown, levelId: string): void {
  const path = `map overlays.${levelId}`;
  const overlay = objectValue(value, path);
  if (stringValue(overlay.levelId, `${path}.levelId`) !== levelId) {
    throw new Error(`${path}.levelId must match its record key`);
  }
  stringValue(overlay.image, `${path}.image`);
  numberValue(overlay.opacity, `${path}.opacity`);
  const corners = objectValue(overlay.corners, `${path}.corners`);
  coordinateTuple(corners.topLeft, `${path}.corners.topLeft`);
  coordinateTuple(corners.topRight, `${path}.corners.topRight`);
  coordinateTuple(corners.bottomLeft, `${path}.corners.bottomLeft`);
  coordinateTuple(corners.bottomRight, `${path}.corners.bottomRight`);
  const attribution = objectValue(overlay.attribution, `${path}.attribution`);
  stringValue(attribution.title, `${path}.attribution.title`);
  stringValue(attribution.source, `${path}.attribution.source`);
  stringValue(attribution.sourceUrl, `${path}.attribution.sourceUrl`);
  stringValue(attribution.extractedBy, `${path}.attribution.extractedBy`);
  stringValue(attribution.extractedByUrl, `${path}.attribution.extractedByUrl`);
  stringValue(attribution.copyrightHolder, `${path}.attribution.copyrightHolder`);
  if (stringValue(attribution.rights, `${path}.attribution.rights`) !== "non-free") {
    throw new Error(`${path}.attribution.rights must be non-free`);
  }
  stringValue(attribution.rightsNotice, `${path}.attribution.rightsNotice`);
  stringValue(attribution.rightsNoticeUrl, `${path}.attribution.rightsNoticeUrl`);
}

function assertStaticMapOverlays(value: unknown): asserts value is Record<string, MapOverlayDto> {
  const overlays = objectValue(value, "map overlays");
  Object.entries(overlays).forEach(([levelId, overlay]) => assertMapOverlay(overlay, levelId));
}

assertStaticMapOverlays(mapOverlaySource);
const staticMapOverlays: Record<string, MapOverlayDto> = mapOverlaySource;

export function loadStaticMapOverlays(): Record<string, MapOverlayDto> {
  return staticMapOverlays;
}
