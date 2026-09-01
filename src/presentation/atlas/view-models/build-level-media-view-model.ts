import type { LevelAppearanceDto } from "../../../infrastructure/atlas-data/dto/level-appearance.dto.js";
import type { WikiImageDto } from "../../../infrastructure/atlas-data/dto/wiki-image.dto.js";
import type { LevelMediaViewModel } from "../components/level-media.js";

export function buildLevelMediaViewModel({
  appearance,
  failed,
  image,
  imageKey,
  isLocal,
  loaded,
}: {
  appearance: LevelAppearanceDto;
  failed: boolean;
  image: WikiImageDto | null;
  imageKey: string | null;
  isLocal: boolean;
  loaded: boolean;
}): LevelMediaViewModel | null {
  if (!image || !imageKey) return null;
  return {
    appearanceTitle: appearance.title,
    bannerKey: appearance.bannerKey,
    failed,
    image,
    imageKey,
    isLocal,
    loaded,
  };
}
