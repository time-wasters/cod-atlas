"use client";

import { useMemo, useState } from "react";
import { buildCampaignOptions } from "../../../application/campaigns/use-cases/build-campaign-options.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";

export type AtlasSidebarListMode = "locations" | "campaigns";

export function useAtlasCampaignSelection({
  gameCode,
  games,
  groups,
}: {
  gameCode: string;
  games: GameDto[];
  groups: AtlasGroupDto[];
}) {
  const [sidebarListMode, setSidebarListMode] = useState<AtlasSidebarListMode>("locations");
  const [selectedCampaignKey, setSelectedCampaignKey] = useState<string | null>(null);
  const [urlCampaignLevelId, setUrlCampaignLevelId] = useState<string | null>(null);
  const campaigns = useMemo(
    () => buildCampaignOptions<AtlasEntryDto, AtlasGroupDto>({
      gameCode,
      games,
      groups,
    }),
    [gameCode, games, groups],
  );
  const explicitlySelectedCampaign = campaigns.find(
    (campaign) => campaign.key === selectedCampaignKey,
  ) ?? null;
  const urlSelectedCampaign = sidebarListMode === "campaigns" && urlCampaignLevelId
    ? campaigns.find((campaign) => campaign.levels.some(
      ({ entry }) => entry.levelId === urlCampaignLevelId,
    )) ?? null
    : null;
  const selectedCampaign = explicitlySelectedCampaign ?? urlSelectedCampaign;

  return {
    activeCampaignKey: selectedCampaign?.key ?? null,
    campaigns,
    selectedCampaign,
    selectedCampaignKey,
    setSelectedCampaignKey,
    setSidebarListMode,
    setUrlCampaignLevelId,
    sidebarListMode,
    urlCampaignLevelId,
  };
}
