import type { AtlasGroupDto } from "./atlas-group.dto.js";
import type { GameDto } from "./game.dto.js";
import type { WikiImageDto } from "./wiki-image.dto.js";
import type { WikiMediaDto } from "./wiki-media.dto.js";

export type AtlasDataDto = {
  games: GameDto[];
  levelIdAliases: Record<string, string>;
  levelBanners: Record<string, WikiImageDto>;
  wikiMedia: Record<string, WikiMediaDto>;
  groups: AtlasGroupDto[];
  totals: {
    groups: number;
    entries: number;
    mapped: number;
    cityMatched: number;
    countryFallback: number;
  };
};
