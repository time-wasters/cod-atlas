import type { CountryAvailability } from "../../../application/atlas/use-cases/filter-atlas-groups.js";
import type { CampaignOption } from "../../../application/campaigns/use-cases/build-campaign-options.js";
import type { ContentUpdateOption } from "../../../application/content-updates/use-cases/build-content-update-options.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";
import type { AtlasSidebarViewModel } from "../components/atlas-sidebar.js";
import type { AtlasFilterCatalog } from "../../filters/models/build-atlas-filter-catalog.js";
import type { useAtlasFilters } from "../../filters/state/use-atlas-filters.js";

type AtlasFilters = ReturnType<typeof useAtlasFilters>;
type BrowseMode = "locations" | "campaigns" | "updates";

export function useAtlasSidebarViewModel({
  activeCampaignKey,
  activeContentUpdateKey,
  campaigns,
  contentUpdates,
  catalog,
  countries,
  filteredGroups,
  filters,
  games,
  handlers,
  mode,
  open,
  selectedGroupName,
}: {
  activeCampaignKey: string | null;
  activeContentUpdateKey: string | null;
  campaigns: CampaignOption<AtlasGroupDto, AtlasEntryDto>[];
  contentUpdates: ContentUpdateOption<AtlasGroupDto, AtlasEntryDto>[];
  catalog: AtlasFilterCatalog;
  countries: CountryAvailability[];
  filteredGroups: AtlasGroupDto[];
  filters: AtlasFilters;
  games: GameDto[];
  handlers: {
    finishSearchUpdate: () => void;
    onCampaignSelect: (campaign: CampaignOption<AtlasGroupDto, AtlasEntryDto>) => void;
    onContentUpdateSelect: (contentUpdate: ContentUpdateOption<AtlasGroupDto, AtlasEntryDto>) => void;
    onExport: () => void;
    onGroupSelect: (group: AtlasGroupDto) => void;
    onOpenGameCatalog: () => void;
    onResetAdvancedFilters: () => void;
    prepareSearchUpdate: () => void;
    setExpandedRegionEntryId: (entryId: string | null) => void;
    setNextHistoryMode: (mode: "push" | "replace") => void;
    setSelectedCampaignKey: (campaignKey: string | null) => void;
    setSelectedContentUpdateKey: (contentUpdateKey: string | null) => void;
    setSidebarListMode: (mode: BrowseMode) => void;
    setUrlCampaignLevelId: (levelId: string | null) => void;
    setUrlContentUpdateLevelId: (levelId: string | null) => void;
  };
  mode: BrowseMode;
  open: boolean;
  selectedGroupName: string;
}): AtlasSidebarViewModel {
  const filteredEntries = filteredGroups.flatMap((group) => group.entries);
  const pushHistory = () => handlers.setNextHistoryMode("push");
  const advancedFilter = (
    id: Parameters<AtlasFilters["setAdvancedFilterDropdownOpen"]>[0],
    title: string,
    options: AtlasFilterCatalog["precisionOptions"],
    selected: Set<string>,
    onToggle: (value: string) => void,
    onClear: () => void,
    hoverDetails?: AtlasFilterCatalog["gameSeriesDetails"],
  ) => ({
    id,
    title,
    options,
    selected,
    open: filters.openAdvancedFilterDropdown === id,
    hoverDetails,
    onOpenChange: (isOpen: boolean) => filters.setAdvancedFilterDropdownOpen(id, isOpen),
    onToggle: (value: string) => {
      pushHistory();
      onToggle(value);
    },
    onClear: () => {
      pushHistory();
      onClear();
    },
  });

  return {
    open,
    search: {
      value: filters.query,
      onChange: (value) => {
        handlers.prepareSearchUpdate();
        filters.setQuery(value);
      },
      onBlur: handlers.finishSearchUpdate,
    },
    game: {
      games,
      value: filters.game,
      onOpenCatalog: handlers.onOpenGameCatalog,
      onChange: (value) => {
        pushHistory();
        filters.setGame(value);
        handlers.setSelectedCampaignKey(null);
        handlers.setSelectedContentUpdateKey(null);
        handlers.setUrlCampaignLevelId(null);
        handlers.setUrlContentUpdateLevelId(null);
        handlers.setExpandedRegionEntryId(null);
        if (value === "all") handlers.setSidebarListMode("locations");
      },
    },
    country: {
      countries,
      value: filters.country,
      onChange: (value) => {
        pushHistory();
        filters.setCountry(value);
      },
    },
    modes: [
      {
        mode: "singleplayer" as const,
        label: "Campaign",
        visible: filters.showSingleplayer,
        onToggle: () => {
          pushHistory();
          filters.setShowSingleplayer((visible) => !visible);
        },
      },
      {
        mode: "multiplayer" as const,
        label: "Multiplayer",
        visible: filters.showMultiplayer,
        onToggle: () => {
          pushHistory();
          filters.setShowMultiplayer((visible) => !visible);
        },
      },
      {
        mode: "special-ops" as const,
        label: "Special Ops",
        visible: filters.showSpecialOps,
        onToggle: () => {
          pushHistory();
          filters.setShowSpecialOps((visible) => !visible);
        },
      },
      {
        mode: "zombies" as const,
        label: "Zombies",
        visible: filters.showZombies,
        onToggle: () => {
          pushHistory();
          filters.setShowZombies((visible) => !visible);
        },
      },
    ],
    advanced: {
      count: filters.advancedFilterCount,
      open: filters.advancedFiltersOpen,
      onClose: filters.closeAdvancedFilters,
      onOpen: filters.openAdvancedFilters,
      onReset: handlers.onResetAdvancedFilters,
      filters: [
        advancedFilter(
          "game-series",
          "Series",
          catalog.gameSeriesOptions,
          filters.gameSeries,
          filters.toggleGameSeries,
          filters.clearGameSeries,
          catalog.gameSeriesDetails,
        ),
        advancedFilter(
          "game-subseries",
          "Sub-series",
          catalog.gameSubseriesOptions,
          filters.gameSubseries,
          filters.toggleGameSubseries,
          filters.clearGameSubseries,
          catalog.gameSubseriesDetails,
        ),
        advancedFilter("continent", "Continent", catalog.continentOptions, filters.continents, filters.toggleContinent, filters.clearContinents),
        advancedFilter("precision", "Precision", catalog.precisionOptions, filters.precisions, filters.togglePrecision, filters.clearPrecisions),
        advancedFilter("confidence", "Confidence", catalog.confidenceOptions, filters.confidences, filters.toggleConfidence, filters.clearConfidences),
        advancedFilter("method", "Method", catalog.methodOptions, filters.methods, filters.toggleMethod, filters.clearMethods),
      ],
    },
    results: {
      total: filteredEntries.length,
      localized: filteredEntries.filter((entry) => !["country", "off-world"].includes(entry.precision)).length,
      fallback: filteredEntries.filter((entry) => entry.precision === "country").length,
      regions: filteredGroups.length,
      onExport: handlers.onExport,
    },
    browse: {
      mode,
      groups: filteredGroups,
      campaigns,
      contentUpdates,
      selectedGroupName,
      activeCampaignKey,
      activeContentUpdateKey,
      onGroupSelect: handlers.onGroupSelect,
      onCampaignSelect: handlers.onCampaignSelect,
      onContentUpdateSelect: handlers.onContentUpdateSelect,
      onModeChange: (nextMode) => {
        pushHistory();
        handlers.setSidebarListMode(nextMode);
        if (nextMode !== "campaigns") {
          handlers.setSelectedCampaignKey(null);
          handlers.setUrlCampaignLevelId(null);
        }
        if (nextMode !== "updates") {
          handlers.setSelectedContentUpdateKey(null);
          handlers.setUrlContentUpdateLevelId(null);
        }
        if (nextMode === "locations") {
          handlers.setExpandedRegionEntryId(null);
        }
      },
    },
  };
}
