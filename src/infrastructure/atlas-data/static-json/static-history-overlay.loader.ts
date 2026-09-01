import historyOverlaySource from "../../../../app/data/history-overlays.generated.json";
import type { HistoryOverlayDto } from "../dto/history-overlay.dto.js";

type JsonObject = Record<string, unknown>;

function objectValue(value: unknown, path: string): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }
  return value as JsonObject;
}

function stringValue(value: unknown, path: string): string {
  if (typeof value !== "string") throw new Error(`${path} must be a string`);
  return value;
}

function numberValue(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${path} must be a finite number`);
  }
  return value;
}

function coordinateTuple(value: unknown, path: string): void {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new Error(`${path} must contain exactly two coordinates`);
  }
  numberValue(value[0], `${path}[0]`);
  numberValue(value[1], `${path}[1]`);
}

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
    if (!Array.isArray(candidates)) throw new Error(`history overlays.${levelId} must be an array`);
    candidates.forEach((overlay, index) => assertHistoryOverlay(overlay, levelId, index));
  });
}

assertStaticHistoryOverlays(historyOverlaySource);
const staticHistoryOverlays: Record<string, HistoryOverlayDto[]> = historyOverlaySource;

export function loadStaticHistoryOverlays(): Record<string, HistoryOverlayDto[]> {
  return staticHistoryOverlays;
}
