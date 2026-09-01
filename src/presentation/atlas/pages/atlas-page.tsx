"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { filterAtlasGroups } from "../../../application/atlas/use-cases/filter-atlas-groups.js";
import { findRelatedLevels } from "../../../application/atlas/use-cases/find-related-levels.js";
import { selectLevelMedia } from "../../../application/atlas/use-cases/select-level-media.js";
import {
  buildCampaignOptions,
  type CampaignOption,
} from "../../../application/campaigns/use-cases/build-campaign-options.js";
import { buildAtlasKml } from "../../../application/export/use-cases/build-atlas-kml.js";
import type { AtlasDataDto } from "../../../infrastructure/atlas-data/dto/atlas-data.dto.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";
import type { HistoryOverlayDto } from "../../../infrastructure/atlas-data/dto/history-overlay.dto.js";
import type { MapOverlayDto } from "../../../infrastructure/atlas-data/dto/map-overlay.dto.js";
import { downloadKmlFile } from "../../../infrastructure/browser/downloads/kml-file.downloader.js";
import { AtlasHeader } from "../components/atlas-header.js";
import { AtlasMapStage } from "../components/atlas-map-stage.js";
import {
  AtlasSidebar,
  type AtlasSidebarViewModel,
} from "../components/atlas-sidebar.js";
import { LevelDetailsPanel } from "../components/level-details-panel.js";
import {
  LevelMedia,
  LevelMediaDialog,
  type LevelMediaViewModel,
} from "../components/level-media.js";
import { ProjectInfoDialog } from "../components/project-info-dialog.js";
import {
  RelatedLevelsPanel,
  type RelatedLevelsViewModel,
} from "../components/related-levels-panel.js";
import { useAtlasSelection } from "../hooks/use-atlas-selection.js";
import {
  useAtlasUrlSync,
  type AppliedAtlasUrlState,
} from "../hooks/use-atlas-url-sync.js";
import type {
  FilterHoverDetail,
  FilterOption,
} from "../../filters/components/advanced-filter-dropdown.js";
import { useAtlasFilters } from "../../filters/state/use-atlas-filters.js";
import { GameCatalogDialog } from "../../game-catalog/components/game-catalog-dialog.js";
import { LevelBriefingPane } from "../../level-briefing/components/level-briefing-pane.js";
import { useLevelBriefing } from "../../level-briefing/hooks/use-level-briefing.js";
import { useCampaignRouteLayer } from "../../map/hooks/use-campaign-route-layer.js";
import { useHistoryOverlayLayer } from "../../map/hooks/use-history-overlay-layer.js";
import { useLeafletMap } from "../../map/hooks/use-leaflet-map.js";
import { useLeafletMarkers } from "../../map/hooks/use-leaflet-markers.js";
import { useMapOverlayLayer } from "../../map/hooks/use-map-overlay-layer.js";
import { useMapViewport } from "../../map/hooks/use-map-viewport.js";
import { SettingsDialog } from "../../settings/components/settings-dialog.js";
import { useExternalGameIcons } from "../../settings/hooks/use-external-game-icons.js";
import { useMapOverlayOpacityPreference } from "../../settings/hooks/use-map-overlay-opacity-preference.js";
import { SolarSystemOverlay } from "../../solar-system/components/solar-system-overlay.js";

function locationUrl(entry: AtlasEntryDto, provider: "googleMaps" | "wikipedia" | "callOfDutyMaps") {
  return entry.urls?.find((item) => item[provider])?.[provider] ?? null;
}

function googleMapsUrl(entry: AtlasEntryDto) {
  if (entry.precision === "country") {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entry.country)}`;
  }
  if (!entry.coordinates) return null;
  const [latitude, longitude] = entry.coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${latitude}%2C${longitude}`;
}

function locationName(entry: AtlasEntryDto) {
  return entry.landmark ?? entry.city ?? entry.region ?? entry.country;
}

type Selection = { group: AtlasGroupDto; entry: AtlasEntryDto };

export type AtlasPageDataIndex = {
  findGameById: (gameId: string) => GameDto | undefined;
  findGameByCode: (gameCode: string) => GameDto | undefined;
  hasCountry: (country: string) => boolean;
  resolveLevelId: (levelId: string) => string;
  findSelectionByEntryId: (entryId: string | null) => Selection | undefined;
  findSelectionByLevelId: (levelId: string, locationId: string | null) => Selection | undefined;
};

export type AtlasPageProps = {
  data: AtlasDataDto;
  dataIndex: AtlasPageDataIndex;
  historyOverlays: Record<string, HistoryOverlayDto[]>;
  mapOverlays: Record<string, MapOverlayDto>;
};

function createAtlasFilterCatalog(data: AtlasDataDto) {
  const gameSeriesOptions: FilterOption[] = [
    { value: "world-war-ii", label: "World War II" },
    { value: "modern-warfare", label: "Modern Warfare" },
    { value: "black-ops", label: "Black Ops" },
    { value: "standalone", label: "Standalone" },
  ];
  const gameSeriesDescriptions: Record<GameDto["series"], string> = {
    "world-war-ii": "Games centered on World War II and related releases.",
    "modern-warfare": "Games and spin-offs connected to the Modern Warfare series and its reimagined continuity.",
    "black-ops": "Games in the Black Ops series, including its Cold War stories and related spin-offs.",
    standalone: "Games outside the World War, Modern Warfare, and Black Ops branches, with their own settings and continuities.",
  };
  const gameSeriesDetails = new Map<string, FilterHoverDetail>(gameSeriesOptions.map((option) => {
    const series = option.value as GameDto["series"];
    const games = data.games
      .filter((game) => game.series === series)
      .sort((left, right) => left.released.localeCompare(right.released));
    const firstYear = games[0]?.released.slice(0, 4) ?? "Unknown";
    const lastYear = games.at(-1)?.released.slice(0, 4) ?? firstYear;
    return [option.value, {
      label: option.label,
      description: gameSeriesDescriptions[series],
      years: firstYear === lastYear ? firstYear : `${firstYear}\u2013${lastYear}`,
      games: games.map((game) => ({ label: game.label, year: game.released.slice(0, 4) })),
    }];
  }));
  const gameSubseriesOptions: FilterOption[] = [
    { value: "main", label: "Main" },
    { value: "reboot", label: "Reboot" },
    { value: "remaster", label: "Remaster" },
    { value: "add-on", label: "Add-on" },
    { value: "spin-off", label: "Spin-off" },
  ];
  const gameSubseriesDescriptions: Record<Exclude<GameDto["subseries"], null>, string> = {
    main: "Core releases within a named Call of Duty series.",
    reboot: "Reboot-continuity releases within a named Call of Duty series.",
    remaster: "Remastered editions linked to the original game by ID.",
    "add-on": "Expansion releases that extend an existing main-series game.",
    "spin-off": "Platform-specific editions and other related releases within a named series.",
  };
  const gameSubseriesDetails = new Map<string, FilterHoverDetail>(gameSubseriesOptions.map((option) => {
    const subseries = option.value as Exclude<GameDto["subseries"], null>;
    const games = data.games
      .filter((game) => game.subseries === subseries)
      .sort((left, right) => left.released.localeCompare(right.released));
    const firstYear = games[0]?.released.slice(0, 4) ?? "Unknown";
    const lastYear = games.at(-1)?.released.slice(0, 4) ?? firstYear;
    return [option.value, {
      label: option.label,
      description: gameSubseriesDescriptions[subseries],
      years: firstYear === lastYear ? firstYear : `${firstYear}\u2013${lastYear}`,
      games: games.map((game) => ({ label: game.label, year: game.released.slice(0, 4) })),
    }];
  }));
  const continentOrder = [
    "Africa",
  
    "Antarctica",
    "Arctic",
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Oceania",
    "Oceans",
    "Off-world",
  ];
  const continentOptions: FilterOption[] = [...new Set(data.groups.map((group) => group.continent))]
    .sort((a, b) => continentOrder.indexOf(a) - continentOrder.indexOf(b) || a.localeCompare(b))
    .map((value) => ({ value, label: value }));
  const precisionOptions: FilterOption[] = [
    { value: "exact", label: "Exact" },
    { value: "approximate", label: "Approximate" },
    { value: "city", label: "City" },
    { value: "region", label: "Region" },
    { value: "country", label: "Country" },
    { value: "off-world", label: "Off-world" },
  ];
  const confidenceOptions: FilterOption[] = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "fallback", label: "Fallback" },
  ];
  const methodOptions: FilterOption[] = [
    { value: "verified-landmark", label: "Verified landmark" },
    { value: "real-world-inspiration", label: "Real-world inspiration" },
    { value: "manual-approximate", label: "Manual approximate" },
    { value: "wiki-location", label: "Wiki location" },
    { value: "article-context", label: "Article context" },
    { value: "title", label: "Title" },
    { value: "title-mention", label: "Title mention" },
    { value: "region-fallback", label: "Region fallback" },
    { value: "country-fallback", label: "Country fallback" },
  ];
  const valuesFor = (options: FilterOption[]) => new Set(options.map((option) => option.value));
  const gameSeriesValues = valuesFor(gameSeriesOptions);
  const gameSubseriesValues = valuesFor(gameSubseriesOptions);
  const continentValues = valuesFor(continentOptions);
  const precisionValues = valuesFor(precisionOptions);
  const confidenceValues = valuesFor(confidenceOptions);
  const methodValues = valuesFor(methodOptions);
  const atlasFilterValueSets = {
    gameSeriesValues,
    gameSubseriesValues,
    continentValues,
    precisionValues,
    confidenceValues,
    methodValues,
  };
  return {
    atlasFilterValueSets,
    confidenceOptions,
    continentOptions,
    gameSeriesDetails,
    gameSeriesOptions,
    gameSubseriesDetails,
    gameSubseriesOptions,
    methodOptions,
    precisionOptions,
  };
}
function gameCodes(value: string) {
  return value.split(" / ").filter((code) => code && code !== "MP");
}

function compareGames(a: GameDto, b: GameDto) {
  return a.released.localeCompare(b.released) || a.label.localeCompare(b.label);
}

function initialSelection(data: AtlasDataDto): Selection {
  const group = data.groups[0];
  if (!group) throw new Error("Generated atlas contains no groups");
  const entry = group.entries[0];
  if (!entry) throw new Error("Generated atlas contains an empty group");
  return { group, entry };
}

export function AtlasPage({
  data,
  dataIndex: atlasDataIndex,
  historyOverlays,
  mapOverlays,
}: AtlasPageProps) {
  const { group: initialGroup, entry: initialEntry } = initialSelection(data);
  const {
    atlasFilterValueSets,
    confidenceOptions,
    continentOptions,
    gameSeriesDetails,
    gameSeriesOptions,
    gameSubseriesDetails,
    gameSubseriesOptions,
    methodOptions,
    precisionOptions,
  } = useMemo(() => createAtlasFilterCatalog(data), [data]);
  const {
    query,
    game,
    country,
    gameSeries,
    gameSubseries,
    continents,
    precisions,
    confidences,
    methods,
    showSingleplayer,
    showMultiplayer,
    showZombies,
    advancedFiltersOpen,
    openAdvancedFilterDropdown,
    advancedFilterCount,
    setQuery,
    setGame,
    setCountry,
    setShowSingleplayer,
    setShowMultiplayer,
    setShowZombies,
    applyUrlState: applyFilterUrlState,
    setAdvancedFilterDropdownOpen,
    openAdvancedFilters,
    closeAdvancedFilters,
    resetAdvancedFilters: resetAdvancedFilterState,
    toggleGameSeries,
    clearGameSeries,
    toggleGameSubseries,
    clearGameSubseries,
    toggleContinent,
    clearContinents,
    togglePrecision,
    clearPrecisions,
    toggleConfidence,
    clearConfidences,
    toggleMethod,
    clearMethods,
  } = useAtlasFilters(atlasFilterValueSets);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    enabled: externalIconsEnabled,
    unavailable: externalIconManifestUnavailable,
    iconFor: gameIcon,
    markUnavailable: markExternalGameIconUnavailable,
    setEnabled: setExternalIconsEnabled,
  } = useExternalGameIcons();
  const [failedLevelBanners, setFailedLevelBanners] = useState<Set<string>>(() => new Set());
  const [disabledMapOverlays, setDisabledMapOverlays] = useState<Set<string>>(() => new Set());
  const [activeHistoryOverlay, setActiveHistoryOverlay] = useState<{ levelId: string; id: string } | null>(null);
  const {
    enabled: mapOverlayZoomOpacityEnabled,
    setEnabled: setMapOverlayZoomOpacityEnabled,
  } = useMapOverlayOpacityPreference();
  const [solarSystemDisplay, setSolarSystemDisplay] = useState({
    hasSpaceLocations: true,
    expanded: true,
  });
  const [loadedImageKey, setLoadedImageKey] = useState<string | null>(null);
  const [failedImageKey, setFailedImageKey] = useState<string | null>(null);
  const [expandedRegionEntryId, setExpandedRegionEntryId] = useState<string | null>(null);
  const [relatedLevelsOpen, setRelatedLevelsOpen] = useState(true);
  const [sidebarListMode, setSidebarListMode] = useState<"locations" | "campaigns">("locations");
  const [selectedCampaignKey, setSelectedCampaignKey] = useState<string | null>(null);
  const [urlCampaignLevelId, setUrlCampaignLevelId] = useState<string | null>(null);
  const {
    selected,
    selectionInUrl,
    select: selectAtlasEntry,
    applyUrlSelection,

  } = useAtlasSelection<AtlasGroupDto, AtlasEntryDto>({
    group: initialGroup,
    entry: initialEntry,
  });
  const {
    ready: mapReady,
    runtime: leafletMap,
    mapNode,
    prepareMarkerSelection,
  } = useLeafletMap();
  const mediaDialog = useRef<HTMLDialogElement>(null);
  const infoDialog = useRef<HTMLDialogElement>(null);
  const gameCatalogDialog = useRef<HTMLDialogElement>(null);
  const intelCard = useRef<HTMLDivElement>(null);
  const getMapDetailsElement = useCallback(() => intelCard.current, []);

  const groups = data.groups;
  const games = useMemo(() => {
    const representedCodes = new Set(
      groups.flatMap((group) => group.entries.flatMap((entry) => gameCodes(entry.game))),
    );
    return data.games.filter((item) => representedCodes.has(item.code)).sort(compareGames);
  }, [data.games, groups]);
  const { groups: filtered, countries } = useMemo(() => filterAtlasGroups<AtlasEntryDto, AtlasGroupDto>({
    groups,
    games: data.games,
    criteria: {
      query,
      gameCode: game,
      country,
      gameSeries,
      gameSubseries,
      continents,
      precisions,
      confidences,
      methods,
      showSingleplayer,
      showMultiplayer,
      showZombies,
    },
  }), [
    confidences,
    continents,
    country,
    data.games,
    game,
    gameSeries,
    gameSubseries,
    groups,
    methods,
    precisions,
    query,
    showMultiplayer,
    showSingleplayer,
    showZombies,
  ]);
  const campaigns = useMemo(
    () => buildCampaignOptions<AtlasEntryDto, AtlasGroupDto>({
      gameCode: game,
      games: data.games,
      groups,
    }),
    [data.games, game, groups],
  );
  const explicitlySelectedCampaign = campaigns.find((campaign) => campaign.key === selectedCampaignKey) ?? null;
  const urlSelectedCampaign = sidebarListMode === "campaigns" && urlCampaignLevelId
    ? campaigns.find((campaign) =>
      campaign.levels.some(({ entry }) => entry.levelId === urlCampaignLevelId)) ?? null
    : null;
  const selectedCampaign = explicitlySelectedCampaign ?? urlSelectedCampaign;
  const activeCampaignKey = selectedCampaign?.key ?? null;
  const selectedCampaignGame = selectedCampaign
    ? atlasDataIndex.findGameById(selectedCampaign.gameId) ?? null
    : null;
  const selectedCampaignGameIcon = selectedCampaignGame ? gameIcon(selectedCampaignGame) : null;
  const selectedCampaignUsesExternalGameIcon = Boolean(
    selectedCampaignGameIcon
    && selectedCampaignGame
    && selectedCampaignGameIcon !== selectedCampaignGame.icon,
  );
  const mapFitCoordinates = useMemo(() => {
    const seen = new Set<string>();
    return filtered.flatMap((group) => group.entries.flatMap((entry) => {
      if (!entry.coordinates) return [];
      const key = entry.coordinates.join(",");
      if (seen.has(key)) return [];
      seen.add(key);
      return [entry.coordinates];
    }));
  }, [filtered]);
  const resultCount = filtered.reduce((sum, group) => sum + group.entries.length, 0);
  const spaceLocations = useMemo(
    () => filtered.flatMap((group) => group.entries
      .filter((entry) => entry.precision === "off-world")
      .map((entry) => ({ group, entry }))),
    [filtered],
  );
  const hasSpaceLocations = spaceLocations.length > 0;
  const solarSystemExpanded = solarSystemDisplay.hasSpaceLocations === hasSpaceLocations
    ? solarSystemDisplay.expanded
    : hasSpaceLocations;
  const selectedGoogleMapsUrl = googleMapsUrl(selected.entry);
  const selectedWikipediaUrl = locationUrl(selected.entry, "wikipedia");
  const selectedCallOfDutyMapsUrl = locationUrl(selected.entry, "callOfDutyMaps");
  const selectedGameId = atlasDataIndex.findGameByCode(game)?.id ?? null;
  const {
    selectedAppearance,
    selectedImage,
    selectedImageIsLocal,
    selectedImageKey,
  } = selectLevelMedia({
    entryId: selected.entry.id,
    appearances: selected.entry.appearances,
    selectedGameId,
    levelBanners: data.levelBanners,
    wikiMedia: data.wikiMedia,
    failedLevelBanners,
  });
  const selectedImageLoaded = selectedImageKey !== null && loadedImageKey === selectedImageKey;
  const selectedImageFailed = selectedImageKey !== null && failedImageKey === selectedImageKey;
  const {
    expanded: levelNotesExpanded,
    briefing: selectedLevelNotes,
    toggle: toggleLevelNotes,
    collapse: collapseLevelBriefing,
  } = useLevelBriefing({
    levelId: selectedAppearance.notesId,
    available: selectedAppearance.hasLevelNotes,
  });
  const applyAtlasUrlState = useCallback((urlState: AppliedAtlasUrlState<Selection>) => {
    applyFilterUrlState(urlState.filters);
    applyUrlSelection(urlState.selection);
    setSidebarListMode(urlState.sidebarListMode);
    setUrlCampaignLevelId(urlState.campaignLevelId);
    setSelectedCampaignKey(null);
    setExpandedRegionEntryId(null);
    collapseLevelBriefing();
    setActiveHistoryOverlay(null);
  }, [applyFilterUrlState, applyUrlSelection, collapseLevelBriefing]);
  const {
    setNextHistoryMode,

    prepareSearchUpdate,
    finishSearchUpdate,
  } = useAtlasUrlSync<Selection>({
    dataIndex: atlasDataIndex,
    filters: {
      query,
      game,
      country,
      gameSeries,
      gameSubseries,
      continents,
      precisions,
      confidences,
      methods,
      showSingleplayer,
      showMultiplayer,
      showZombies,
    },
    selected,
    selectionInUrl,
    sidebarListMode,
    onApplyUrlState: applyAtlasUrlState,
  });
  const resetAdvancedFilters = useCallback(() => {
    setNextHistoryMode("push");
    resetAdvancedFilterState();
  }, [resetAdvancedFilterState, setNextHistoryMode]);
  const { otherLevelLocations, relatedLevels } = useMemo(
    () => findRelatedLevels<AtlasEntryDto, AtlasGroupDto>({
      groups,
      selected,
      campaignLevels: selectedCampaign?.levels,
    }),
    [groups, selected, selectedCampaign?.levels],
  );
  const relatedLevelsExpansionKey = selectedCampaign ? `campaign:${selectedCampaign.key}` : selected.entry.id;
  const relatedLevelsExpanded = expandedRegionEntryId === relatedLevelsExpansionKey;
  const visibleRelatedLevels = relatedLevelsExpanded ? relatedLevels : relatedLevels.slice(0, 8);
  const hiddenRelatedLevelCount = relatedLevels.length - visibleRelatedLevels.length;
  const selectedMapOverlay = mapOverlays[selected.entry.levelId] ?? null;
  const selectedMapOverlayEnabled = selectedMapOverlay !== null && !disabledMapOverlays.has(selected.entry.levelId);
  const selectedHistoryOverlays = historyOverlays[selected.entry.levelId] ?? [];
  const selectedHistoryOverlay = activeHistoryOverlay?.levelId === selected.entry.levelId
    ? selectedHistoryOverlays.find((overlay) => overlay.id === activeHistoryOverlay.id) ?? null
    : null;

  const selectEntry = useCallback((group: AtlasGroupDto, entry: AtlasEntryDto) => {
    setNextHistoryMode("push");
    selectAtlasEntry(group, entry);
    setExpandedRegionEntryId(null);
    collapseLevelBriefing();
    setActiveHistoryOverlay(null);
  }, [collapseLevelBriefing, selectAtlasEntry, setNextHistoryMode]);

  const selectMapMarker = useCallback((group: AtlasGroupDto, entry: AtlasEntryDto) => {
    prepareMarkerSelection(mapOverlays[entry.levelId] ? entry.levelId : null);
    selectEntry(group, entry);
  }, [mapOverlays, prepareMarkerSelection, selectEntry]);

  useLeafletMarkers({
    filteredGroups: filtered,
    locationLabel: locationName,
    onSelect: selectMapMarker,
    ready: mapReady,
    runtime: leafletMap,
    selected,
    selectedCampaign,
  });

  const findSelectionByEntryId = useCallback(
    (entryId: string) => atlasDataIndex.findSelectionByEntryId(entryId),
    [atlasDataIndex],
  );
  const { prepareMarkerReveal } = useCampaignRouteLayer({
    findSelectionByEntryId,
    getDetailsElement: getMapDetailsElement,
    onSelect: selectMapMarker,
    ready: mapReady,
    runtime: leafletMap,
    selectedCampaign,
  });
  const {
    focusSelectedMarker,
    queueRelatedLevelFocus,
    queueSidebarSelection,
  } = useMapViewport({
    filteredGroups: filtered,
    getDetailsElement: getMapDetailsElement,
    mapFitCoordinates,
    mapOverlays,
    ready: mapReady,
    runtime: leafletMap,
    selected,
    selectedCampaign,
    sidebarOpen,
  });
  useMapOverlayLayer({
    adaptiveOpacity: mapOverlayZoomOpacityEnabled,
    enabled: selectedMapOverlayEnabled,
    getDetailsElement: getMapDetailsElement,
    levelId: selected.entry.levelId,
    overlay: selectedMapOverlay,
    ready: mapReady,
    runtime: leafletMap,
    title: selectedAppearance.title,
  });
  const { focusHistoryOverlay } = useHistoryOverlayLayer({
    getDetailsElement: getMapDetailsElement,
    overlay: selectedHistoryOverlay,
    ready: mapReady,
    runtime: leafletMap,
  });

  const toggleHistoryOverlay = useCallback((overlay: HistoryOverlayDto) => {
    const isActive = activeHistoryOverlay?.levelId === overlay.levelId
      && activeHistoryOverlay.id === overlay.id;
    if (isActive) {
      setActiveHistoryOverlay(null);
      return;
    }
    setActiveHistoryOverlay({ levelId: overlay.levelId, id: overlay.id });
    focusHistoryOverlay(overlay, selected.entry.coordinates);
  }, [activeHistoryOverlay, focusHistoryOverlay, selected.entry.coordinates]);

  const selectSidebarGroup = useCallback((group: AtlasGroupDto) => {
    const entry = group.entries[0];
    if (!entry) return;
    if (group.kind === "off-world") {
      setSolarSystemDisplay({ hasSpaceLocations: true, expanded: true });
    }
    const coordinates = group.entries.flatMap((candidate) => candidate.coordinates ? [candidate.coordinates] : []);
    const fallbackCoordinate = group.coordinates ?? entry.coordinates ?? null;
    const bounds = coordinates.length ? coordinates : fallbackCoordinate ? [fallbackCoordinate] : [];
    const maxZoom = group.entries.some((candidate) => ["country", "off-world"].includes(candidate.precision))
      ? 5
      : group.entries.some((candidate) => candidate.precision === "region")
        ? 6
        : group.entries.some((candidate) => candidate.precision === "city")
          ? 8
          : 10;

    queueSidebarSelection(bounds.length ? { bounds, maxZoom } : null);
    selectEntry(group, entry);
  }, [queueSidebarSelection, selectEntry]);

  function selectCampaign(campaign: CampaignOption<AtlasGroupDto, AtlasEntryDto>) {
    const campaignIsActive = activeCampaignKey === campaign.key;
    setUrlCampaignLevelId(null);
    setSelectedCampaignKey(campaignIsActive ? null : campaign.key);
    if (!campaignIsActive && campaign.levels[0]) {
      prepareMarkerReveal(campaign.levels[0].entry.id);
      selectEntry(campaign.levels[0].group, campaign.levels[0].entry);
    } else {
      prepareMarkerReveal(null);
    }
    setExpandedRegionEntryId(null);
    setRelatedLevelsOpen(true);
    setDetailsOpen(true);
  }

  useEffect(() => {
    mediaDialog.current?.close();
  }, [selected.entry.id]);

  function exportKml() {
    downloadKmlFile(buildAtlasKml(filtered));
  }

  const filteredEntries = filtered.flatMap((group) => group.entries);
  const selectedLevelGames = selected.entry.gameIds.flatMap((gameId) => {
    const selectedGame = atlasDataIndex.findGameById(gameId);
    if (!selectedGame) return [];
    const icon = gameIcon(selectedGame) ?? null;
    return [{
      game: selectedGame,
      icon,
      external: Boolean(icon && icon !== selectedGame.icon),
    }];
  });
  const levelMediaViewModel: LevelMediaViewModel | null = selectedImage && selectedImageKey ? {
    appearanceTitle: selectedAppearance.title,
    bannerKey: selectedAppearance.bannerKey,
    failed: selectedImageFailed,
    image: selectedImage,
    imageKey: selectedImageKey,
    isLocal: selectedImageIsLocal,
    loaded: selectedImageLoaded,
  } : null;
  const relatedLevelsViewModel: RelatedLevelsViewModel | null = relatedLevels.length > 0 ? {
    ariaLabel: selectedCampaign ? `${selectedCampaign.label} levels` : "Related levels",
    campaign: selectedCampaign !== null,
    expanded: relatedLevelsExpanded,
    gameIcon: selectedCampaignGameIcon && selectedCampaignGame ? {
      external: selectedCampaignUsesExternalGameIcon,
      gameId: selectedCampaignGame.id,
      src: selectedCampaignGameIcon,
    } : null,
    hiddenCount: hiddenRelatedLevelCount,
    items: visibleRelatedLevels,
    label: selectedCampaign?.label ?? "Related levels",
    open: relatedLevelsOpen,
    selectedLevelId: selected.entry.levelId,
    totalCount: relatedLevels.length,
  } : null;
  const sidebarViewModel: AtlasSidebarViewModel = {
    open: sidebarOpen,
    search: {
      value: query,
      onChange: (value) => {
        prepareSearchUpdate();
        setQuery(value);
      },
      onBlur: finishSearchUpdate,
    },
    game: {
      games,
      value: game,
      onOpenCatalog: () => gameCatalogDialog.current?.showModal(),
      onChange: (value) => {
        setNextHistoryMode("push");
        setGame(value);
        setSelectedCampaignKey(null);
        setUrlCampaignLevelId(null);
        setExpandedRegionEntryId(null);
        if (value === "all") setSidebarListMode("locations");
      },
    },
    country: {
      countries,
      value: country,
      onChange: (value) => {
        setNextHistoryMode("push");
        setCountry(value);
      },
    },
    modes: [
      {
        label: "Campaign",
        visible: showSingleplayer,
        onToggle: () => {
          setNextHistoryMode("push");
          setShowSingleplayer((visible) => !visible);
        },
      },
      {
        label: "Multiplayer",
        visible: showMultiplayer,
        onToggle: () => {
          setNextHistoryMode("push");
          setShowMultiplayer((visible) => !visible);
        },
      },
      {
        label: "Zombies",
        visible: showZombies,
        onToggle: () => {
          setNextHistoryMode("push");
          setShowZombies((visible) => !visible);
        },
      },
    ],
    advanced: {
      count: advancedFilterCount,
      open: advancedFiltersOpen,
      onClose: closeAdvancedFilters,
      onOpen: openAdvancedFilters,
      onReset: resetAdvancedFilters,
      filters: [
        {
          id: "game-series",
          title: "Series",
          options: gameSeriesOptions,
          selected: gameSeries,
          open: openAdvancedFilterDropdown === "game-series",
          hoverDetails: gameSeriesDetails,
          onOpenChange: (open) => setAdvancedFilterDropdownOpen("game-series", open),
          onToggle: (value) => {
            setNextHistoryMode("push");
            toggleGameSeries(value);
          },
          onClear: () => {

            setNextHistoryMode("push");
            clearGameSeries();
          },
        },
        {
          id: "game-subseries",
          title: "Sub-series",
          options: gameSubseriesOptions,
          selected: gameSubseries,
          open: openAdvancedFilterDropdown === "game-subseries",
          hoverDetails: gameSubseriesDetails,
          onOpenChange: (open) => setAdvancedFilterDropdownOpen("game-subseries", open),
          onToggle: (value) => {
            setNextHistoryMode("push");
            toggleGameSubseries(value);
          },
          onClear: () => {
            setNextHistoryMode("push");
            clearGameSubseries();
          },
        },
        {
          id: "continent",
          title: "Continent",
          options: continentOptions,
          selected: continents,
          open: openAdvancedFilterDropdown === "continent",
          onOpenChange: (open) => setAdvancedFilterDropdownOpen("continent", open),
          onToggle: (value) => {
            setNextHistoryMode("push");
            toggleContinent(value);
          },
          onClear: () => {
            setNextHistoryMode("push");
            clearContinents();
          },
        },
        {
          id: "precision",
          title: "Precision",
          options: precisionOptions,
          selected: precisions,
          open: openAdvancedFilterDropdown === "precision",
          onOpenChange: (open) => setAdvancedFilterDropdownOpen("precision", open),
          onToggle: (value) => {
            setNextHistoryMode("push");
            togglePrecision(value);
          },
          onClear: () => {
            setNextHistoryMode("push");
            clearPrecisions();
          },
        },
        {
          id: "confidence",
          title: "Confidence",
          options: confidenceOptions,
          selected: confidences,
          open: openAdvancedFilterDropdown === "confidence",
          onOpenChange: (open) => setAdvancedFilterDropdownOpen("confidence", open),
          onToggle: (value) => {
            setNextHistoryMode("push");
            toggleConfidence(value);
          },
          onClear: () => {
            setNextHistoryMode("push");
            clearConfidences();
          },
        },
        {
          id: "method",
          title: "Method",
          options: methodOptions,
          selected: methods,
          open: openAdvancedFilterDropdown === "method",
          onOpenChange: (open) => setAdvancedFilterDropdownOpen("method", open),
          onToggle: (value) => {
            setNextHistoryMode("push");
            toggleMethod(value);
          },
          onClear: () => {
            setNextHistoryMode("push");
            clearMethods();
          },
        },
      ],
    },
    results: {
      total: resultCount,
      localized: filteredEntries.filter((entry) => !["country", "off-world"].includes(entry.precision)).length,
      fallback: filteredEntries.filter((entry) => entry.precision === "country").length,
      regions: filtered.length,
      onExport: exportKml,
    },
    browse: {
      mode: sidebarListMode,
      groups: filtered,
      campaigns,
      selectedGroupName: selected.group.name,
      activeCampaignKey,
      onGroupSelect: selectSidebarGroup,
      onCampaignSelect: selectCampaign,
      onModeChange: (mode) => {
        setNextHistoryMode("push");
        setSidebarListMode(mode);
        if (mode === "locations") {
          setSelectedCampaignKey(null);
          setUrlCampaignLevelId(null);
          setExpandedRegionEntryId(null);
        }
      },
    },
  };

  const handleMediaFailure = (failedMedia: LevelMediaViewModel) => {
    setFailedImageKey(failedMedia.imageKey);
    if (failedMedia.isLocal || failedMedia.image.mediaType === "video") {
      setFailedLevelBanners((failed) => new Set(failed).add(failedMedia.bannerKey));
    }
  };

  return (
    <main className={`atlas-shell${sidebarOpen ? "" : " is-sidebar-collapsed"}`}>
      <AtlasHeader
        locationCount={data.totals.entries}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {settingsOpen && (
        <SettingsDialog
          externalIcons={{
            enabled: externalIconsEnabled,
            onToggle: () => setExternalIconsEnabled(!externalIconsEnabled),
          }}
          externalIconsUnavailable={externalIconManifestUnavailable}
          overlayFading={{
            enabled: mapOverlayZoomOpacityEnabled,
            onToggle: () => setMapOverlayZoomOpacityEnabled(!mapOverlayZoomOpacityEnabled),
          }}
          onClose={() => setSettingsOpen(false)}

        />
      )}

      <AtlasSidebar
        viewModel={sidebarViewModel}
        onOpenProjectInfo={() => infoDialog.current?.showModal()}
        onToggle={() => setSidebarOpen((open) => !open)}
      />
      <ProjectInfoDialog dialogRef={infoDialog} />
      <GameCatalogDialog
        dialogRef={gameCatalogDialog}
        games={data.games}
        iconFor={gameIcon}
        onExternalIconError={markExternalGameIconUnavailable}
      />

      <AtlasMapStage
        mapNode={mapNode}
        solarSystem={(
          <SolarSystemOverlay
            locations={spaceLocations}
            selectedEntryId={selected.entry.id}
            expanded={solarSystemExpanded}
            onExpandedChange={(expanded) => setSolarSystemDisplay({ hasSpaceLocations, expanded })}
            onSelect={selectEntry}
          />
        )}
        briefing={detailsOpen && levelNotesExpanded ? (
          <LevelBriefingPane
            activeOverlayId={selectedHistoryOverlay?.id ?? null}
            briefing={selectedLevelNotes}
            historyOverlays={selectedHistoryOverlays}
            onClose={toggleLevelNotes}
            onToggleHistoryOverlay={toggleHistoryOverlay}
            title={selectedAppearance.title}
          />
        ) : null}
        details={(
          <LevelDetailsPanel
            actions={{
              onFocus: focusSelectedMarker,
              onGameIconError: markExternalGameIconUnavailable,
              onToggleBriefing: toggleLevelNotes,
              onToggleDetails: () => setDetailsOpen((open) => !open),
              onToggleMapOverlay: () => setDisabledMapOverlays((disabled) => {
                const next = new Set(disabled);
                if (selectedMapOverlayEnabled) next.add(selected.entry.levelId);
                else next.delete(selected.entry.levelId);
                return next;
              }),
            }}
            columnRef={intelCard}
            detailsOpen={detailsOpen}
            media={levelMediaViewModel ? (
              <LevelMedia
                dialogRef={mediaDialog}
                media={levelMediaViewModel}
                onFailed={handleMediaFailure}
                onLoaded={setLoadedImageKey}
              />
            ) : null}
            relatedLevels={relatedLevelsViewModel ? (
              <RelatedLevelsPanel
                viewModel={relatedLevelsViewModel}
                onToggle={() => setRelatedLevelsOpen((open) => !open)}
                onSelect={(group, entry) => {
                  queueRelatedLevelFocus(entry.id);
                  selectEntry(group, entry);
                }}
                onExpand={() => setExpandedRegionEntryId(relatedLevelsExpansionKey)}
                onCollapse={() => setExpandedRegionEntryId(null)}
                onGameIconError={markExternalGameIconUnavailable}
              />
            ) : null}
            viewModel={{
              appearance: selectedAppearance,
              briefingExpanded: levelNotesExpanded,
              entry: selected.entry,
              games: selectedLevelGames,
              group: selected.group,
              links: {
                callOfDutyMaps: selectedCallOfDutyMapsUrl,
                googleMaps: selectedGoogleMapsUrl,
                wikipedia: selectedWikipediaUrl,
              },
              mapOverlay: {
                available: selectedMapOverlay !== null,
                enabled: selectedMapOverlayEnabled,
              },
              otherLocations: otherLevelLocations,
            }}
          />
        )}
        mediaDialog={levelMediaViewModel ? (
          <LevelMediaDialog
            dialogRef={mediaDialog}
            media={levelMediaViewModel}
          />
        ) : null}
      />
    </main>
  );
}
