"use client";

import { useCallback, useState } from "react";
import type { MapOverlayDto } from "../../../infrastructure/atlas-data/dto/map-overlay.dto.js";

export function useSelectedMapOverlay({
  levelId,
  overlays,
}: {
  levelId: string;
  overlays: Record<string, MapOverlayDto>;
}) {
  const [disabledLevelIds, setDisabledLevelIds] = useState<Set<string>>(() => new Set());
  const overlay = overlays[levelId] ?? null;
  const enabled = overlay !== null && !disabledLevelIds.has(levelId);
  const toggle = useCallback(() => {
    setDisabledLevelIds((disabled) => {
      const next = new Set(disabled);
      if (disabled.has(levelId)) next.delete(levelId);
      else next.add(levelId);
      return next;
    });
  }, [levelId]);

  return { enabled, overlay, toggle };
}
