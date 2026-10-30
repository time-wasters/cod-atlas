"use client";

import { useEffect, useMemo, useState } from "react";
import type { CampaignOption } from "../../../application/campaigns/use-cases/build-campaign-options.js";
import type { OverlayImagePort } from "../../../application/map/ports/overlay-image.port.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { MapOverlayDto } from "../../../infrastructure/atlas-data/dto/map-overlay.dto.js";
import { mapOverlayPreloadPlan } from "../models/map-overlay-preload-plan.js";

export function useMapOverlayPreloading({ selectedEntry, campaign, overlays, images }: {
  selectedEntry: AtlasEntryDto;
  campaign: CampaignOption<AtlasGroupDto, AtlasEntryDto> | null;
  overlays: Record<string, MapOverlayDto>;
  images: OverlayImagePort;
}) {
  const plan = useMemo(() => mapOverlayPreloadPlan({ selectedEntry, campaign, overlays }),
    [selectedEntry, campaign, overlays]);
  const [preparedNextImage, setPreparedNextImage] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    for (const image of plan.images) {
      void images.preload(image).catch(() => false).then(() => {
        // A failed image must not hold the campaign indefinitely.
        if (!cancelled && image === plan.nextImage) setPreparedNextImage(image);
      });
    }
    return () => { cancelled = true; };
  }, [images, plan]);
  return { nextOverlayReady: plan.nextImage === null || preparedNextImage === plan.nextImage };
}
