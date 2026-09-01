import type { CampaignOption } from "../../../application/campaigns/use-cases/build-campaign-options.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";
import type { RelatedLevelsViewModel } from "../components/related-levels-panel.js";

type RelatedLevel = { group: AtlasGroupDto; entry: AtlasEntryDto };

export function buildRelatedLevelsViewModel({
  campaign,
  expanded,
  game,
  gameIcon,
  gameIconIsExternal,
  items,
  open,
  selectedLevelId,
}: {
  campaign: CampaignOption<AtlasGroupDto, AtlasEntryDto> | null;
  expanded: boolean;
  game: GameDto | null;
  gameIcon: string | null | undefined;
  gameIconIsExternal: boolean;
  items: RelatedLevel[];
  open: boolean;
  selectedLevelId: string;
}): RelatedLevelsViewModel | null {
  if (!items.length) return null;
  const visibleItems = expanded ? items : items.slice(0, 8);
  return {
    ariaLabel: campaign ? `${campaign.label} levels` : "Related levels",
    campaign: campaign !== null,
    expanded,
    gameIcon: gameIcon && game ? {
      external: gameIconIsExternal,
      gameId: game.id,
      src: gameIcon,
    } : null,
    hiddenCount: items.length - visibleItems.length,
    items: visibleItems,
    label: campaign?.label ?? "Related levels",
    open,
    selectedLevelId,
    totalCount: items.length,
  };
}
