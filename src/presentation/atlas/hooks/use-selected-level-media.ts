"use client";

import { useCallback, useState } from "react";
import { selectLevelMedia } from "../../../application/atlas/use-cases/select-level-media.js";
import type { AtlasDataDto } from "../../../infrastructure/atlas-data/dto/atlas-data.dto.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { LevelMediaViewModel } from "../components/level-media.js";
import { buildLevelMediaViewModel } from "../view-models/build-level-media-view-model.js";

export function useSelectedLevelMedia({
  data,
  entry,
  selectedGameId,
}: {
  data: Pick<AtlasDataDto, "levelBanners" | "wikiMedia">;
  entry: AtlasEntryDto;
  selectedGameId: string | null;
}) {
  const [failedLevelBanners, setFailedLevelBanners] = useState<Set<string>>(() => new Set());
  const [loadedImageKey, setLoadedImageKey] = useState<string | null>(null);
  const [failedImageKey, setFailedImageKey] = useState<string | null>(null);
  const {
    selectedAppearance,
    selectedImage,
    selectedImageIsLocal,
    selectedImageKey,
  } = selectLevelMedia({
    entryId: entry.id,
    appearances: entry.appearances,
    selectedGameId,
    levelBanners: data.levelBanners,
    wikiMedia: data.wikiMedia,
    failedLevelBanners,
  });
  const loaded = selectedImageKey !== null && loadedImageKey === selectedImageKey;
  const failed = selectedImageKey !== null && failedImageKey === selectedImageKey;
  const viewModel = buildLevelMediaViewModel({
    appearance: selectedAppearance,
    failed,
    image: selectedImage,
    imageKey: selectedImageKey,
    isLocal: selectedImageIsLocal,
    loaded,
  });
  const handleFailure = useCallback((failedMedia: LevelMediaViewModel) => {
    setFailedImageKey(failedMedia.imageKey);
    if (failedMedia.isLocal || failedMedia.image.mediaType === "video") {
      setFailedLevelBanners((failedBanners) => new Set(failedBanners).add(failedMedia.bannerKey));
    }
  }, []);

  return {
    appearance: selectedAppearance,
    handleFailure,
    handleLoaded: setLoadedImageKey,
    viewModel,
  };
}
