import historyOverlaySource from "../../../../app/data/history-overlays.generated.json";
import type { HistoryOverlayDto } from "../dto/history-overlay.dto.js";
import {
  arrayValue,
  coordinateTuple,
  numberValue,
  objectValue,
  stringValue,
} from "./shared/json-value.validator.js";

function assertHistoryOverlay(value: unknown, levelId: string, index: number): void {
  const path = `history overlays.${levelId}[${index}]`;
  const overlay = objectValue(value, path);
  if (stringValue(overlay.levelId, `${path}.levelId`) !== levelId) {
    throw new Error(`${path}.levelId must match its record key`);
  }
  stringValue(overlay.id, `${path}.id`);
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
  stringValue(attribution.author, `${path}.attribution.author`);
  stringValue(attribution.copyrightHolder, `${path}.attribution.copyrightHolder`);
  if (stringValue(attribution.rights, `${path}.attribution.rights`) !== "non-free") {
    throw new Error(`${path}.attribution.rights must be non-free`);
  }
  stringValue(attribution.rightsNotice, `${path}.attribution.rightsNotice`);
  stringValue(attribution.rightsNoticeUrl, `${path}.attribution.rightsNoticeUrl`);
}

function assertStaticHistoryOverlays(value: unknown): asserts value is Record<string, HistoryOverlayDto[]> {
  const overlays = objectValue(value, "history overlays");
  Object.entries(overlays).forEach(([levelId, candidates]) => {
    arrayValue(candidates, `history overlays.${levelId}`).forEach((overlay, index) => {
      assertHistoryOverlay(overlay, levelId, index);
    });
  });
}

assertStaticHistoryOverlays(historyOverlaySource);
const staticHistoryOverlays: Record<string, HistoryOverlayDto[]> = historyOverlaySource;

export function loadStaticHistoryOverlays(): Record<string, HistoryOverlayDto[]> {
  return staticHistoryOverlays;
}
