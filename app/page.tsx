"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { filterAtlasGroups } from "../src/application/atlas/use-cases/filter-atlas-groups.js";
import { findRelatedLevels } from "../src/application/atlas/use-cases/find-related-levels.js";
import { selectLevelMedia } from "../src/application/atlas/use-cases/select-level-media.js";
import {
  buildCampaignOptions,
  type CampaignOption,
} from "../src/application/campaigns/use-cases/build-campaign-options.js";
import { buildAtlasKml } from "../src/application/export/use-cases/build-atlas-kml.js";
import type { AtlasEntryDto } from "../src/infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../src/infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { GameDto } from "../src/infrastructure/atlas-data/dto/game.dto.js";
import type { HistoryOverlayDto } from "../src/infrastructure/atlas-data/dto/history-overlay.dto.js";
import { AtlasDataIndex } from "../src/infrastructure/atlas-data/static-json/atlas-data.index.js";
import { loadStaticAtlasData } from "../src/infrastructure/atlas-data/static-json/static-atlas-data.loader.js";
import { loadStaticHistoryOverlays } from "../src/infrastructure/atlas-data/static-json/static-history-overlay.loader.js";
import { loadStaticMapOverlays } from "../src/infrastructure/atlas-data/static-json/static-map-overlay.loader.js";
import { downloadKmlFile } from "../src/infrastructure/browser/downloads/kml-file.downloader.js";
import { FittedLevelTitle } from "../src/presentation/atlas/components/fitted-level-title.js";
import { LevelModeIcon } from "../src/presentation/atlas/components/level-mode-icon.js";
import { useAtlasSelection } from "../src/presentation/atlas/hooks/use-atlas-selection.js";
import {
  useAtlasUrlSync,
  type AppliedAtlasUrlState,
} from "../src/presentation/atlas/hooks/use-atlas-url-sync.js";
import {
  AdvancedFilterDropdown,
  type FilterHoverDetail,
  type FilterOption,
} from "../src/presentation/filters/components/advanced-filter-dropdown.js";
import { CountrySelect } from "../src/presentation/filters/components/country-select.js";
import { useAtlasFilters } from "../src/presentation/filters/state/use-atlas-filters.js";
import { GameCatalogDialog } from "../src/presentation/game-catalog/components/game-catalog-dialog.js";
import { GameIcon } from "../src/presentation/game-catalog/components/game-icon.js";
import { GameSelect } from "../src/presentation/game-catalog/components/game-select.js";
import { useLevelBriefing } from "../src/presentation/level-briefing/hooks/use-level-briefing.js";
import { useCampaignRouteLayer } from "../src/presentation/map/hooks/use-campaign-route-layer.js";
import { useHistoryOverlayLayer } from "../src/presentation/map/hooks/use-history-overlay-layer.js";
import { useLeafletMap } from "../src/presentation/map/hooks/use-leaflet-map.js";
import { useLeafletMarkers } from "../src/presentation/map/hooks/use-leaflet-markers.js";
import { useMapOverlayLayer } from "../src/presentation/map/hooks/use-map-overlay-layer.js";
import { useMapViewport } from "../src/presentation/map/hooks/use-map-viewport.js";
import { useExternalGameIcons } from "../src/presentation/settings/hooks/use-external-game-icons.js";
import { useMapOverlayOpacityPreference } from "../src/presentation/settings/hooks/use-map-overlay-opacity-preference.js";
import { SolarSystemOverlay } from "../src/presentation/solar-system/components/solar-system-overlay.js";
import { ExternalLinkIcon } from "../src/presentation/shared/components/external-link-icon.js";

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

function imageBasename(source: string) {
  return source.split(/[?#]/, 1)[0].split("/").at(-1) ?? source;
}

type Selection = { group: AtlasGroupDto; entry: AtlasEntryDto };

const data = loadStaticAtlasData();
const historyOverlays = loadStaticHistoryOverlays();
const mapOverlays = loadStaticMapOverlays();
const atlasDataIndex = new AtlasDataIndex(data);
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
function gameCodes(value: string) {
  return value.split(" / ").filter((code) => code && code !== "MP");
}

function compareGames(a: GameDto, b: GameDto) {
  return a.released.localeCompare(b.released) || a.label.localeCompare(b.label);
}

const initialGroup = data.groups[0];
if (!initialGroup) throw new Error("Generated atlas contains no groups");

const initialEntry = initialGroup.entries[0];
if (!initialEntry) throw new Error("Generated atlas contains an empty group");

export default function Home() {
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
  }, [groups]);
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
    [game, groups],
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
  }, [prepareMarkerSelection, selectEntry]);

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
    [],
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

  return (
    <main className={`atlas-shell${sidebarOpen ? "" : " is-sidebar-collapsed"}`}>
      <header className="atlas-header">
        <div className="atlas-brand">
          <h1>
            {/* This reviewed local brand asset does not need runtime image optimization. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="images/banner.png" width="790" height="153" alt="CoD Atlas" />
          </h1>
          <p>Real-world geography of the series</p>
        </div>
        <div className="header-stat">
          <strong>{data.totals.entries}</strong>
          <span>locations</span>
        </div>
        <button className="settings-button" type="button" aria-label="Open settings" onClick={() => setSettingsOpen(true)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm8.1 5.1v-3.2l-2.3-.7a7 7 0 0 0-.7-1.6l1.1-2.2-2.2-2.2-2.2 1.1a7 7 0 0 0-1.6-.7L11.5 2H8.4l-.7 2.3a7 7 0 0 0-1.6.7L3.9 3.9 1.7 6.1l1.1 2.2a7 7 0 0 0-.7 1.6L0 10.5v3.1l2.3.7a7 7 0 0 0 .7 1.6l-1.1 2.2 2.2 2.2 2.2-1.1a7 7 0 0 0 1.6.7l.7 2.3h3.1l.7-2.3a7 7 0 0 0 1.6-.7l2.2 1.1 2.2-2.2-1.1-2.2a7 7 0 0 0 .7-1.6l2.2-.7Z" />
          </svg>
        </button>
      </header>

      {settingsOpen && (
        <section className="settings-page" aria-labelledby="settings-title">
          <div className="settings-surface">
            <header>
              <h2 id="settings-title">Settings</h2>
              <button type="button" aria-label="Close settings" onClick={() => setSettingsOpen(false)}>×</button>
            </header>
            <div className="settings-content">
              <section className="settings-group">
                <div className="settings-copy">
                  <h3>External game icons</h3>
                  <p>Use imported icons when available; local icons remain the fallback.</p>
                  {externalIconsEnabled && externalIconManifestUnavailable && <small className="is-warning">External icons are unavailable in this build; local icons are still active.</small>}
                </div>
                <button
                  className={`settings-switch${externalIconsEnabled ? " is-enabled" : ""}`}
                  type="button"
                  role="switch"
                  aria-checked={externalIconsEnabled}
                  onClick={() => setExternalIconsEnabled(!externalIconsEnabled)}
                >
                  <span aria-hidden="true" />
                  <b>{externalIconsEnabled ? "On" : "Off"}</b>
                </button>
              </section>
              <section className="settings-group">
                <div className="settings-copy">
                  <h3>Zoom-based overlay fading</h3>
                  <p>Fade overlays beyond their overview scale and hide them at street-detail zoom.</p>
                </div>
                <button
                  className={`settings-switch${mapOverlayZoomOpacityEnabled ? " is-enabled" : ""}`}
                  type="button"
                  role="switch"
                  aria-label="Zoom-based overlay fading"
                  aria-checked={mapOverlayZoomOpacityEnabled}
                  onClick={() => setMapOverlayZoomOpacityEnabled(!mapOverlayZoomOpacityEnabled)}
                >
                  <span aria-hidden="true" />
                  <b>{mapOverlayZoomOpacityEnabled ? "On" : "Off"}</b>
                </button>
              </section>
              <p className="settings-note">This preference is stored only in this browser.</p>
            </div>
          </div>
        </section>
      )}

      <aside className="atlas-sidebar" aria-label="Map filters">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => {
              prepareSearchUpdate();
              setQuery(event.target.value);
            }}
            onBlur={finishSearchUpdate}
            placeholder="Search missions, maps, countries…"
            aria-label="Search locations"
          />
        </label>

        <div className="filter-grid">
          <div className="filter-field game-filter">
            <span>
              <button
                className="game-catalog-trigger"
                type="button"
                aria-haspopup="dialog"
                onClick={() => gameCatalogDialog.current?.showModal()}
              >
                Game
              </button>
              <small>Oldest to newest</small>
            </span>
            <GameSelect
              games={games}
              value={game}
              onValueChange={(value) => {
                setNextHistoryMode("push");
                setGame(value);
                setSelectedCampaignKey(null);
                setUrlCampaignLevelId(null);
                setExpandedRegionEntryId(null);
                if (value === "all") setSidebarListMode("locations");
              }}
            />
          </div>
          <div className="filter-field">
            <span>Country</span>
            <CountrySelect
              countries={countries}
              value={country}
              onValueChange={(value) => {
                setNextHistoryMode("push");
                setCountry(value);
              }}
            />
          </div>
        </div>

        <div className="mode-filter" aria-label="Map type visibility">
          <button
            className={showSingleplayer ? "is-active" : ""}
            type="button"
            aria-pressed={showSingleplayer}
            onClick={() => {
              setNextHistoryMode("push");
              setShowSingleplayer((visible) => !visible);
            }}
          >
            <span aria-hidden="true">{showSingleplayer ? "✓" : "○"}</span> Campaign
          </button>
          <button
            className={showMultiplayer ? "is-active" : ""}
            type="button"
            aria-pressed={showMultiplayer}
            onClick={() => {
              setNextHistoryMode("push");
              setShowMultiplayer((visible) => !visible);
            }}
          >
            <span aria-hidden="true">{showMultiplayer ? "✓" : "○"}</span> Multiplayer
          </button>
          <button
            className={showZombies ? "is-active" : ""}
            type="button"
            aria-pressed={showZombies}
            onClick={() => {
              setNextHistoryMode("push");
              setShowZombies((visible) => !visible);
            }}
          >
            <span aria-hidden="true">{showZombies ? "✓" : "○"}</span> Zombies
          </button>
        </div>

        {advancedFiltersOpen ? (
          <section className="advanced-filters" aria-labelledby="advanced-filters-title">
            <header className="advanced-filters-header">
              <button
                className="advanced-filters-back"
                type="button"
                aria-label="Close advanced filters"
                onClick={closeAdvancedFilters}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m10 3-5 5 5 5" /></svg>
              </button>
              <div className="advanced-filters-title">
                <span>Filter matrix</span>
                <h2 id="advanced-filters-title">Advanced filters</h2>
              </div>
              <div className="advanced-filters-actions">
                <button
                  className="advanced-filters-reset"
                  type="button"
                  disabled={advancedFilterCount === 0}
                  onClick={resetAdvancedFilters}
                >
                  Reset
                </button>
              </div>
            </header>

            <div className="advanced-filters-scroll">
              <AdvancedFilterDropdown
                id="game-series"
                title="Series"
                options={gameSeriesOptions}
                selected={gameSeries}
                open={openAdvancedFilterDropdown === "game-series"}
                hoverDetails={gameSeriesDetails}
                onOpenChange={(open) => setAdvancedFilterDropdownOpen("game-series", open)}
                onToggle={(value) => {
                  setNextHistoryMode("push");
                  toggleGameSeries(value);
                }}
                onClear={() => {
                  setNextHistoryMode("push");
                  clearGameSeries();
                }}
              />
              <AdvancedFilterDropdown
                id="game-subseries"
                title="Sub-series"
                options={gameSubseriesOptions}
                selected={gameSubseries}
                open={openAdvancedFilterDropdown === "game-subseries"}
                hoverDetails={gameSubseriesDetails}
                onOpenChange={(open) => setAdvancedFilterDropdownOpen("game-subseries", open)}
                onToggle={(value) => {
                  setNextHistoryMode("push");
                  toggleGameSubseries(value);
                }}
                onClear={() => {
                  setNextHistoryMode("push");
                  clearGameSubseries();
                }}
              />
              <AdvancedFilterDropdown
                id="continent"
                title="Continent"
                options={continentOptions}
                selected={continents}
                open={openAdvancedFilterDropdown === "continent"}
                onOpenChange={(open) => setAdvancedFilterDropdownOpen("continent", open)}
                onToggle={(value) => {
                  setNextHistoryMode("push");
                  toggleContinent(value);
                }}
                onClear={() => {
                  setNextHistoryMode("push");
                  clearContinents();
                }}
              />

              <AdvancedFilterDropdown
                id="precision"
                title="Precision"
                options={precisionOptions}
                selected={precisions}
                open={openAdvancedFilterDropdown === "precision"}
                onOpenChange={(open) => setAdvancedFilterDropdownOpen("precision", open)}
                onToggle={(value) => {
                  setNextHistoryMode("push");
                  togglePrecision(value);
                }}
                onClear={() => {
                  setNextHistoryMode("push");
                  clearPrecisions();
                }}
              />
              <AdvancedFilterDropdown
                id="confidence"
                title="Confidence"
                options={confidenceOptions}
                selected={confidences}
                open={openAdvancedFilterDropdown === "confidence"}
                onOpenChange={(open) => setAdvancedFilterDropdownOpen("confidence", open)}
                onToggle={(value) => {
                  setNextHistoryMode("push");
                  toggleConfidence(value);
                }}
                onClear={() => {
                  setNextHistoryMode("push");
                  clearConfidences();
                }}
              />
              <AdvancedFilterDropdown
                id="method"
                title="Method"
                options={methodOptions}
                selected={methods}
                open={openAdvancedFilterDropdown === "method"}
                onOpenChange={(open) => setAdvancedFilterDropdownOpen("method", open)}
                onToggle={(value) => {
                  setNextHistoryMode("push");
                  toggleMethod(value);
                }}
                onClear={() => {
                  setNextHistoryMode("push");
                  clearMethods();
                }}
              />
            </div>

            <button
              className="advanced-filters-results"
              type="button"
              onClick={closeAdvancedFilters}
            >
              Show <strong>{resultCount}</strong> results
            </button>
          </section>
        ) : (
          <>
            <button
              className={`advanced-filter-trigger${advancedFilterCount ? " is-active" : ""}`}
              type="button"
              aria-expanded="false"
              onClick={openAdvancedFilters}
            >
              <span>
                <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 5h12M5 9h8M7 13h4" /></svg>
                Advanced filters
              </span>
              <strong>{advancedFilterCount || "All"}</strong>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
            </button>

            <section className="result-panel" aria-live="polite">
          <div><strong>{resultCount}</strong><span>results</span></div>
          <dl>
            <div><dt>Localized</dt><dd>{filtered.flatMap((item) => item.entries).filter((item) => !["country", "off-world"].includes(item.precision)).length}</dd></div>
            <div><dt>Fallback</dt><dd>{filtered.flatMap((item) => item.entries).filter((item) => item.precision === "country").length}</dd></div>
            <div><dt>Regions</dt><dd>{filtered.length}</dd></div>
          </dl>
        </section>

        <button className="kml-button" onClick={exportKml}>↓ Export filtered KML for Google Maps</button>

        <section className="mission-list">
          <div className="sidebar-list-switch" role="tablist" aria-label="Browse atlas data">
            <button
              className={sidebarListMode === "locations" ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={sidebarListMode === "locations"}
              aria-controls="sidebar-locations"
              onClick={() => {
                setNextHistoryMode("push");
                setSidebarListMode("locations");
                setSelectedCampaignKey(null);
                setUrlCampaignLevelId(null);
                setExpandedRegionEntryId(null);
              }}
            >
              <span>Locations</span><small>{filtered.length}</small>
            </button>
            <button
              className={sidebarListMode === "campaigns" ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={sidebarListMode === "campaigns"}
              aria-controls="sidebar-campaigns"
              disabled={game === "all"}
              title={game === "all" ? "Choose a game to browse campaigns" : undefined}
              onClick={() => {
                setNextHistoryMode("push");
                setSidebarListMode("campaigns");
              }}
            >
              <span>Campaigns</span><small>{campaigns.length}</small>
            </button>
          </div>
          {sidebarListMode === "locations" ? (
            <div className="scroll-list" id="sidebar-locations" role="tabpanel">
              {filtered.map((group, index) => (
                <button
                  key={`${group.name}-${index}`}
                  className={group.name === selected.group.name ? "location-row is-selected" : "location-row"}
                  onClick={() => selectSidebarGroup(group)}
                >
                  <i className="location-marker-icon" aria-hidden="true" />
                  <span><b>{group.name}</b><small>{group.entries.length} appearances</small></span>
                  <em>{group.coordinates ? "MAP" : "ORBIT"}</em>
                </button>
              ))}
            </div>
          ) : (
            <div className="scroll-list" id="sidebar-campaigns" role="tabpanel">
              {campaigns.map((campaign, index) => (
                <button
                  key={campaign.key}
                  className={campaign.key === activeCampaignKey ? "campaign-row is-selected" : "campaign-row"}
                  type="button"
                  onClick={() => selectCampaign(campaign)}
                >
                  <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
                  <span>
                    <b>{campaign.label}</b>
                    <small>{campaign.levels.length} levels</small>
                  </span>
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
                </button>
              ))}
              {campaigns.length === 0 && (
                <p className="campaign-list-empty">No campaign data is available for this game.</p>
              )}
            </div>
          )}
        </section>

        <footer>
          <p className="creator-credit">Made with ♥️ by <a href="https://github.com/plp-gtr" target="_blank" rel="noreferrer">plp-GTR</a></p>
          <p className="source-credit">
            Inspired by <a className="icon-link" href="https://www.reddit.com/r/CallOfDuty/comments/10c3jbd/cod_every_location_visited_in_the_cod_franchise/" target="_blank" rel="noreferrer">
              u/robracer97
              <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                <path fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z" />
              </svg>
            </a>
            &nbsp;·&nbsp;
            <a className="icon-link" href="https://github.com/time-wasters/cod-atlas" target="_blank" rel="noreferrer">
              Source code
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.87c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
            </a>
            &nbsp;·&nbsp;
            <button className="icon-link footer-info-button" type="button" onClick={() => infoDialog.current?.showModal()}>
              Info
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" /><path d="M8 7v4M8 4.5h.01" />
              </svg>
            </button>
          </p>
            </footer>
          </>
        )}
        <button
          className="sidebar-toggle"
          type="button"
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? "Hide map filters" : "Show map filters"}
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <svg viewBox="0 0 12 18" aria-hidden="true">
            <path d={sidebarOpen ? "m8 3-5 6 5 6" : "m4 3 5 6-5 6"} />
          </svg>
        </button>
      </aside>

      <dialog
        ref={infoDialog}
        className="project-info-dialog"
        aria-labelledby="project-info-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="project-info-content">
          <header>
            <h2 id="project-info-title">About CoD Atlas</h2>
            <form method="dialog">
              <button aria-label="Close project information"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
            </form>
          </header>
          <p>This website was made by me, <a href="https://github.com/plp-gtr" target="_blank" rel="noreferrer">Philipp Gächter</a>.</p>
          <p>It is a pure hobby project that resulted from the urge to start the Call of Duty series from the first game and play all major instances, especially the console games I missed when I was young.</p>
          <p>While playing I was scouting the locations on Google Streetview and Maps to see how accurate the game is and out of pure interest.</p>
          <p>When searching for a map of all CoD levels in real life, I stumbled across the map from <a href="https://www.reddit.com/r/CallOfDuty/comments/10c3jbd/cod_every_location_visited_in_the_cod_franchise/" target="_blank" rel="noreferrer">u/robracer97</a>. Unfortunately it is not dynamic or zoomable, so I&apos;ve started this project.</p>
          <p>Have fun!</p>
        </div>
      </dialog>

      <GameCatalogDialog
        dialogRef={gameCatalogDialog}
        games={data.games}
        iconFor={gameIcon}
        onExternalIconError={markExternalGameIconUnavailable}
      />

      <section className="map-stage" aria-label="Interactive world map">
        <div ref={mapNode} className="map-canvas" />
        <div className="map-grid" aria-hidden="true" />
        <div className="map-label" aria-hidden="true">TACTICAL GEOGRAPHY // GLOBAL</div>

        <SolarSystemOverlay
          locations={spaceLocations}
          selectedEntryId={selected.entry.id}
          expanded={solarSystemExpanded}
          onExpandedChange={(expanded) => setSolarSystemDisplay({ hasSpaceLocations, expanded })}
          onSelect={selectEntry}
        />

        {detailsOpen && levelNotesExpanded && (
          <aside id="selected-level-briefing" className="level-briefing-pane" aria-labelledby="level-briefing-title">
            <header>
              <div>
                <span>Level briefing</span>
                <h2 id="level-briefing-title">{selectedAppearance.title}</h2>
              </div>
              <button type="button" aria-label="Close level briefing" onClick={toggleLevelNotes}>×</button>
            </header>
            <div className="level-briefing-content">
              {selectedLevelNotes?.status === "loading" && <p className="level-briefing-state">Loading briefing…</p>}
              {selectedLevelNotes?.status === "missing" && <p className="level-briefing-state">No briefing has been written for this level yet.</p>}
              {selectedLevelNotes?.status === "ready" && selectedLevelNotes.content && (
                <ReactMarkdown
                  components={{
                    a: ({ children, ...props }) => <a {...props} target="_blank" rel="noreferrer">{children}</a>,
                    img: ({ src = "", alt = "" }) => {
                      const historyOverlay = selectedHistoryOverlays.find(
                        (overlay) => imageBasename(overlay.image) === imageBasename(src),
                      );
                      if (!historyOverlay) {
                        // Markdown images are authored content and cannot use the Next image optimizer.
                        // eslint-disable-next-line @next/next/no-img-element
                        return <img src={src} alt={alt} />;
                      }
                      const isActive = selectedHistoryOverlay?.id === historyOverlay.id;
                      const action = isActive ? "Hide from map" : "Show on map";
                      const imageUrl = new URL(historyOverlay.image.replace(/^\/+/, ""), document.baseURI).href;
                      return (
                        <button
                          className={`history-overlay-image${isActive ? " is-active" : ""}`}
                          type="button"
                          aria-pressed={isActive}
                          aria-label={`${action}: ${historyOverlay.attribution.title}`}
                          title={`${action}: ${historyOverlay.attribution.title}`}
                          onClick={() => toggleHistoryOverlay(historyOverlay)}
                        >
                          {/* Repository-hosted research figures do not use the Next image optimizer. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imageUrl} alt={alt || historyOverlay.attribution.title} />
                          <span>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" /></svg>
                            {action}
                          </span>
                        </button>
                      );
                    },
                  }}
                >
                  {selectedLevelNotes.content}
                </ReactMarkdown>
              )}
            </div>
          </aside>
        )}

        <div
          className={`intel-column${detailsOpen ? "" : " is-collapsed"}${detailsOpen && levelNotesExpanded ? " has-open-briefing" : ""}`}
          ref={intelCard}
        >
        <button
          className="details-toggle"
          type="button"
          aria-expanded={detailsOpen}
          aria-controls="selected-level-details"
          aria-label={detailsOpen ? "Hide level details" : "Show level details"}
          onClick={() => setDetailsOpen((open) => !open)}
        >
          <svg viewBox="0 0 12 18" aria-hidden="true">
            <path d={detailsOpen ? "m4 3 5 6-5 6" : "m8 3-5 6 5 6"} />
          </svg>
        </button>
        <button
          className="collapsed-level-title"
          type="button"
          aria-label={`Show details for ${selectedAppearance.title}`}
          onClick={() => setDetailsOpen(true)}
        >
          <span>{selectedAppearance.title}</span>
        </button>
        <article className="intel-card" id="selected-level-details">
          <div className="mission-heading">
            <LevelModeIcon mode={selected.entry.modes[0]} />
            <FittedLevelTitle
              disabled={!selected.entry.coordinates}
              onActivate={focusSelectedMarker}
            >
              {selectedAppearance.title}
            </FittedLevelTitle>
            <div className="mission-games">
              {selected.entry.gameIds.map((gameId) => {
                const selectedGame = atlasDataIndex.findGameById(gameId);
                if (!selectedGame) return null;
                const selectedGameIcon = gameIcon(selectedGame);
                const usesExternalGameIcon = Boolean(selectedGameIcon && selectedGameIcon !== selectedGame.icon);
                return selectedGameIcon ? (
                  <GameIcon
                    key={gameId}
                    game={selectedGame}
                    src={selectedGameIcon}
                    external={usesExternalGameIcon}
                    onError={() => {
                      if (usesExternalGameIcon) {
                        markExternalGameIconUnavailable(gameId);
                      }
                    }}
                  />
                ) : (
                  <span className="mission-game-name" key={gameId}>{selectedGame.label}</span>
                );
              })}
            </div>
          </div>
          {selectedImage && (
            <figure className="intel-media" key={selectedImageKey}>
              {!selectedImageLoaded && (
                <span className="media-load-state" role="status">
                  {selectedImageFailed ? "Image unavailable" : "Loading image…"}
                </span>
              )}
              {/* Local reviewed media take precedence; Wiki thumbnails remain the fallback. */}
              {selectedImage.mediaType === "video" ? (
                <video
                  className={selectedImageLoaded ? "is-loaded" : ""}
                  src={selectedImage.thumbnailUrl}
                  aria-label={`${selectedAppearance.title} level banner`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onLoadedData={() => setLoadedImageKey(selectedImageKey)}
                  onError={() => {
                    setFailedImageKey(selectedImageKey);
                    setFailedLevelBanners((failed) => new Set(failed).add(selectedAppearance.bannerKey));
                  }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={selectedImageLoaded ? "is-loaded" : ""}
                  src={selectedImage.thumbnailUrl}
                  alt={`${selectedAppearance.title} level banner`}
                  referrerPolicy={selectedImageIsLocal ? undefined : "no-referrer"}
                  onLoad={() => setLoadedImageKey(selectedImageKey)}
                  onError={() => {
                    setFailedImageKey(selectedImageKey);
                    if (selectedImageIsLocal) {
                      setFailedLevelBanners((failed) => new Set(failed).add(selectedAppearance.bannerKey));
                    }
                  }}
                />
              )}
              <button
                className="media-info-button"
                type="button"
                aria-label="Show image copyright and attribution information"
                title="Image information"
                onClick={() => mediaDialog.current?.showModal()}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 10.8v6M12 7.2h.01" />
                </svg>
              </button>
            </figure>
          )}
          <div className="intel-location-row">
            <div className="intel-kicker">
              {selected.group.flagCode ? (
                <span
                  className={`flag:${selected.group.flagCode} intel-country-flag`}
                  role="img"
                  aria-label={`${selected.entry.country} flag`}
                />
              ) : (
                <svg className="intel-country-fallback" viewBox="0 0 18 18" aria-hidden="true">
                  <circle cx="9" cy="9" r="6.5" />
                </svg>
              )}
              <span className="intel-country-name">{selected.entry.country}</span>
            </div>
            {selectedMapOverlay && (
              <button
                className={`map-overlay-toggle${selectedMapOverlayEnabled ? " is-enabled" : ""}`}
                type="button"
                aria-pressed={selectedMapOverlayEnabled}
                aria-label={`${selectedMapOverlayEnabled ? "Hide" : "Show"} game map overlay`}
                title={`${selectedMapOverlayEnabled ? "Hide" : "Show"} game map overlay`}
                onClick={() => setDisabledMapOverlays((disabled) => {
                  const next = new Set(disabled);
                  if (selectedMapOverlayEnabled) next.add(selected.entry.levelId);
                  else next.delete(selected.entry.levelId);
                  return next;
                })}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" /></svg>
              </button>
            )}
          </div>
          {(selected.entry.region || selected.entry.city || selected.entry.landmark) && (
            <div className="location-taxonomy" aria-label="Location hierarchy">
              {selected.entry.region && (
                <div className="taxonomy-tier is-region"><span>Region</span><strong>{selected.entry.region}</strong></div>
              )}
              {selected.entry.city && (
                <div className="taxonomy-tier is-city"><span>City</span><strong>{selected.entry.city}</strong></div>
              )}
              {selected.entry.landmark && (
                <div className="taxonomy-tier is-landmark"><span>Landmark</span><strong>{selected.entry.landmark}</strong></div>
              )}
            </div>
          )}
          <div className={`precision-badge ${selected.entry.precision === "approximate" ? "is-approximate" : !["country", "off-world"].includes(selected.entry.precision) ? "is-city" : "is-country"}`}>
            {selected.entry.precision === "approximate" ? "Approximate historical position" : !["country", "off-world"].includes(selected.entry.precision) ? `Localized · ${selected.entry.confidence} confidence` : selected.entry.precision === "off-world" ? "Off-world location" : "No city evidence · country fallback"}
          </div>
          {otherLevelLocations.length > 0 && (
            <div className="related-level-locations" aria-label="Other locations in this level">
              {otherLevelLocations.map(({ group, entry }) => (
                <div className="related-level-location" key={entry.id}>
                  <div className="intel-kicker">
                    {group.flagCode ? (
                      <span
                        className={`flag:${group.flagCode} intel-country-flag`}
                        role="img"
                        aria-label={`${entry.country} flag`}
                      />
                    ) : (
                      <svg
                        className="intel-country-fallback"
                        viewBox="0 0 18 18"
                        aria-hidden="true"
                      >
                        <circle cx="9" cy="9" r="6.5" />
                      </svg>
                    )}
                    <span className="intel-country-name">{entry.country}</span>
                  </div>
                  {(entry.region || entry.city || entry.landmark) && (
                    <div className="location-taxonomy">
                      {entry.region && (
                        <div className="taxonomy-tier is-region"><span>Region</span><strong>{entry.region}</strong></div>
                      )}
                      {entry.city && (
                        <div className="taxonomy-tier is-city"><span>City</span><strong>{entry.city}</strong></div>
                      )}
                      {entry.landmark && (
                        <div className="taxonomy-tier is-landmark"><span>Landmark</span><strong>{entry.landmark}</strong></div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="place-links" aria-label="External place links">
            {selectedGoogleMapsUrl && (
              <a
                href={selectedGoogleMapsUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open in Google Maps"
                title="Google Maps"
              >
                <ExternalLinkIcon name="googleMaps" />
                <span>Google Maps</span>
              </a>
            )}
            {selectedWikipediaUrl && (
              <a
                href={selectedWikipediaUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open on Wikipedia"
                title="Wikipedia"
              >
                <ExternalLinkIcon name="wikipedia" />
                <span>Wikipedia</span>
              </a>
            )}
            {selectedCallOfDutyMapsUrl && (
              <a
                href={selectedCallOfDutyMapsUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open this map on Call of Duty Maps"
                title="Call of Duty Maps"
              >
                <ExternalLinkIcon name="callOfDutyMaps" />
                <span>CoD Maps</span>
              </a>
            )}
            <a
              href={selectedAppearance.wiki}
              target="_blank"
              rel="noreferrer"
              aria-label="Open on Call of Duty Wiki"
              title="Call of Duty Wiki"
            >
              <ExternalLinkIcon name="fandom" />
              <span>CoD Wiki</span>
            </a>
          </div>
          <section className="level-briefing">
            <button
              className="level-briefing-toggle"
              type="button"
              aria-expanded={levelNotesExpanded}
              aria-controls={selectedAppearance.hasLevelNotes ? "selected-level-briefing" : undefined}
              onClick={toggleLevelNotes}
              disabled={!selectedAppearance.hasLevelNotes}
              title={selectedAppearance.hasLevelNotes ? undefined : "No level briefing available"}
            >
              <b aria-hidden="true">{levelNotesExpanded ? "›" : "‹"}</b>
              <span>
                <small>Level briefing</small>
                <strong>{selectedAppearance.hasLevelNotes ? "Research & historical context" : "No briefing available"}</strong>
              </span>
            </button>
          </section>
        </article>
        {relatedLevels.length > 0 && (
          <aside className={`related-levels-panel${relatedLevelsOpen ? "" : " is-collapsed"}`} aria-label={selectedCampaign ? `${selectedCampaign.label} levels` : "Related levels"}>
            <button
              className={`related-levels-toggle${selectedCampaignGameIcon ? " has-game-icon" : ""}`}
              type="button"
              aria-expanded={relatedLevelsOpen}
              aria-controls="related-level-list"
              onClick={() => setRelatedLevelsOpen((open) => !open)}
            >
              {selectedCampaignGameIcon && selectedCampaignGame && (
                // Game icons are reviewed public assets and do not need image optimization.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={`related-levels-game-icon${selectedCampaignUsesExternalGameIcon ? " is-external" : ""}`}
                  src={selectedCampaignGameIcon}
                  alt=""
                  onError={() => {
                    if (selectedCampaignUsesExternalGameIcon) {
                      markExternalGameIconUnavailable(selectedCampaignGame.id);
                    }
                  }}
                />
              )}
              <span>{selectedCampaign?.label ?? "Related levels"}</span>
              <small>{relatedLevels.length}</small>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
            </button>
            {relatedLevelsOpen && (
              <div
                className={`intel-entries${relatedLevelsExpanded ? " is-expanded" : ""}`}
                id="related-level-list"
              >
                {visibleRelatedLevels.map(({ group, entry }) => (
                  <div className={`intel-entry${entry.levelId === selected.entry.levelId ? " is-selected" : ""}`} key={entry.levelId}>
                    <button
                      className={selectedCampaign && entry.campaignOrder != null ? "has-campaign-order" : undefined}
                      onClick={() => {
                        queueRelatedLevelFocus(entry.id);
                        selectEntry(group, entry);
                      }}
                    >
                      {selectedCampaign && entry.campaignOrder != null && (
                        <span
                          className="campaign-route-stop campaign-related-level-number"
                          aria-label={`Campaign mission ${entry.campaignOrder}`}
                        >
                          {String(entry.campaignOrder).padStart(2, "0")}
                        </span>
                      )}
                      <span className="intel-entry-copy">
                        <strong>{entry.title}</strong>
                        <span>{locationName(entry)}{selectedCampaign ? "" : ` · ${entry.game}`}</span>
                      </span>
                    </button>
                  </div>
                ))}
                {hiddenRelatedLevelCount > 0 && (
                  <button
                    className="more-row"
                    type="button"
                    aria-expanded="false"
                    aria-controls="related-level-list"
                    onClick={() => setExpandedRegionEntryId(relatedLevelsExpansionKey)}
                  >
                    + {hiddenRelatedLevelCount} more {hiddenRelatedLevelCount === 1 ? "level" : "levels"} in this {selectedCampaign ? "campaign" : "region"}
                  </button>
                )}
                {relatedLevelsExpanded && relatedLevels.length > 8 && (
                  <button
                    className="more-row is-collapse"
                    type="button"
                    aria-expanded="true"
                    aria-controls="related-level-list"
                    onClick={() => setExpandedRegionEntryId(null)}
                  >
                    Show fewer
                  </button>
                )}
              </div>
            )}
          </aside>
        )}
        </div>

        {selectedImage && (
          <dialog
            ref={mediaDialog}
            className="media-info-dialog"
            aria-labelledby="media-info-title"
            onClick={(event) => {
              if (event.target === event.currentTarget) event.currentTarget.close();
            }}
          >
            <div className="media-info-content">
              <header>
                <div>
                  <span>{selectedImage.rights.status === "non-free" ? "Copyrighted media" : selectedImage.rights.status === "licensed" ? "Licensed media" : "Wiki media"}</span>
                  <h2 id="media-info-title">Image information</h2>
                </div>
                <form method="dialog">
                  <button aria-label="Close image information"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
                </form>
              </header>
              {selectedImage.rights.notice && (
                <div className="media-rights-notice">{selectedImage.rights.notice}</div>
              )}
              <dl>
                {selectedImage.author.name && selectedImage.author.userUrl && (
                  <div>
                    <dt>{selectedImageIsLocal ? "Captured by" : selectedImage.author.role === "uploader" ? "Uploaded by" : "Author"}</dt>
                    <dd><a href={selectedImage.author.userUrl} target="_blank" rel="noreferrer">{selectedImage.author.name}</a></dd>
                  </div>
                )}
                {selectedImage.license.name && selectedImage.license.url && (
                  <div>
                    <dt>License</dt>
                    <dd><a href={selectedImage.license.url} target="_blank" rel="noreferrer">{selectedImage.license.name}</a></dd>
                  </div>
                )}
                {selectedImage.rights.noticeUrl && (
                  <div>
                    <dt>Rights notice</dt>
                    <dd><a href={selectedImage.rights.noticeUrl} target="_blank" rel="noreferrer">{selectedImageIsLocal ? "Rights terms" : "Read on CoD Wiki"}</a></dd>
                  </div>
                )}
                <div>
                  <dt>Source</dt>
                  <dd><a href={selectedImage.detailPageUrl} target="_blank" rel="noreferrer">{selectedImageIsLocal ? "Open repository image" : "Open file page"}</a></dd>
                </div>
              </dl>
              <p className="media-notice-credit">{selectedImageIsLocal
                ? "Image extracted or captured by plp-gtr; the underlying game artwork remains subject to its original copyright."
                : "Notice reproduced from the Call of Duty Wiki; the image remains subject to its original copyright status."}</p>
            </div>
          </dialog>
        )}
      </section>
    </main>
  );
}
