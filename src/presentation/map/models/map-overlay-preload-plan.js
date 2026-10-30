/**
 * @param {{
 *   selectedEntry: { id: string, levelId: string },
 *   campaign: { levels: { entry: { id: string, levelId: string } }[] } | null,
 *   overlays: Record<string, { image: string }>,
 * }} options
 */
export function mapOverlayPreloadPlan({ selectedEntry, campaign, overlays }) {
  const levels = campaign?.levels ?? [];
  const index = levels.findIndex(({ entry }) => entry.id === selectedEntry.id);
  const next = levels[index + 1]?.entry;
  const candidates = [selectedEntry, levels[0]?.entry, levels[index - 1]?.entry, next];
  const images = [...new Set(candidates.flatMap((entry) => {
    const image = entry && overlays[entry.levelId]?.image;
    return image ? [image] : [];
  }))];
  return { images, nextImage: next ? overlays[next.levelId]?.image ?? null : null };
}
