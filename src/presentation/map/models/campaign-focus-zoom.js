/**
 * Frame a campaign stop at its recorded accuracy, independent of the previous stop.
 * @param {Pick<import("../../../infrastructure/atlas-data/dto/atlas-entry.dto.js").AtlasEntryDto,
 *   "precision" | "confidence" | "landmark" | "verified">} entry
 * @param {{ maximumZoom: number, zoomByPrecision: Record<string, number>,
 *   verifiedLandmarkZoomByPrecision: Record<string, number> }} preset
 * @param {number} maximumMapZoom
 */
export function campaignFocusZoom(entry, preset, maximumMapZoom = Infinity) {
  if (entry.precision === "off-world") return null;
  const verifiedLandmark = (entry.precision === "exact" || entry.precision === "approximate")
    && Boolean(entry.landmark?.trim())
    && entry.confidence === "high"
    && entry.verified?.locations?.byHuman === true;
  const zoom = verifiedLandmark
    ? preset.verifiedLandmarkZoomByPrecision[entry.precision] ?? preset.zoomByPrecision[entry.precision]
    : preset.zoomByPrecision[entry.precision];
  return Math.min(zoom, preset.maximumZoom, maximumMapZoom);
}
