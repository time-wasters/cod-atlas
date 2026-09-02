"use client";

import { useEffect, useMemo, useState } from "react";
import { buildCampaignOptions } from "../../../application/campaigns/use-cases/build-campaign-options.js";
import { buildContentUpdateOptions } from "../../../application/content-updates/use-cases/build-content-update-options.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";

export type AtlasSidebarListMode = "locations" | "campaigns" | "updates";

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
  const [selectedContentUpdateKey, setSelectedContentUpdateKey] = useState<string | null>(null);
  const [urlCampaignLevelId, setUrlCampaignLevelId] = useState<string | null>(null);
  const [urlContentUpdateLevelId, setUrlContentUpdateLevelId] = useState<string | null>(null);
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
  const contentUpdates = useMemo(
    () => buildContentUpdateOptions<AtlasEntryDto, AtlasGroupDto>({
      gameCode,
      games,
      groups,
    }),
    [gameCode, games, groups],
  );
  const explicitlySelectedContentUpdate = contentUpdates.find(
    (contentUpdate) => contentUpdate.key === selectedContentUpdateKey,
  ) ?? null;
  const urlSelectedContentUpdate = sidebarListMode === "updates" && urlContentUpdateLevelId
    ? contentUpdates.find((contentUpdate) => contentUpdate.levels.some(
      ({ entry }) => entry.levelId === urlContentUpdateLevelId,
    )) ?? null
    : null;
  const selectedContentUpdate = explicitlySelectedContentUpdate ?? urlSelectedContentUpdate;

  useEffect(() => {
    if (sidebarListMode !== "updates" || contentUpdates.length > 0) return;
    setSidebarListMode("locations");
    setSelectedContentUpdateKey(null);
    setUrlContentUpdateLevelId(null);
  }, [contentUpdates.length, sidebarListMode]);

  return {
    activeCampaignKey: selectedCampaign?.key ?? null,
    activeContentUpdateKey: selectedContentUpdate?.key ?? null,
    campaigns,
    contentUpdates,
    selectedCampaign,
    selectedContentUpdate,
    selectedCampaignKey,
    selectedContentUpdateKey,
    setSelectedCampaignKey,
    setSelectedContentUpdateKey,
    setSidebarListMode,
    setUrlCampaignLevelId,
    setUrlContentUpdateLevelId,
    sidebarListMode,
    urlCampaignLevelId,
    urlContentUpdateLevelId,
  };
}
