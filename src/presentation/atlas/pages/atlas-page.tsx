"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { APP_DEFAULTS_CONFIG } from "../../../shared/config/app-defaults.config.js";
import { MAP_CAMERA_CONFIG } from "../../../shared/config/map-camera.config.js";
import { MAP_MARKERS_CONFIG } from "../../../shared/config/map-markers.config.js";
import { CAMPAIGN_ROUTE_CONFIG } from "../../../shared/config/campaign-route.config.js";
import { LOCATION_ZOOM_CONFIG } from "../../../shared/config/location-zoom.config.js";
import { findRelatedLevels } from "../../../application/atlas/use-cases/find-related-levels.js";
import { getGameModeAvailability } from "../../../application/atlas/use-cases/get-game-mode-availability.js";
import {
  type CampaignOption,
} from "../../../application/campaigns/use-cases/build-campaign-options.js";
import type { ContentUpdateOption } from "../../../application/content-updates/use-cases/build-content-update-options.js";
import { buildAtlasKml } from "../../../application/export/use-cases/build-atlas-kml.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { HistoryOverlayDto } from "../../../infrastructure/atlas-data/dto/history-overlay.dto.js";
import { AtlasHeader } from "../components/atlas-header.js";
import { AtlasMapStage } from "../components/atlas-map-stage.js";
import {
  AtlasSidebar,
} from "../components/atlas-sidebar.js";
import { LevelDetailsPanel } from "../components/level-details-panel.js";
import {
  LevelMedia,
  LevelMediaDialog,
} from "../components/level-media.js";
import { ProjectInfoDialog } from "../components/project-info-dialog.js";
import {
  RelatedLevelsPanel,
} from "../components/related-levels-panel.js";
import { formatAtlasLocationName } from "../formatters/atlas-location-name.formatter.js";
import { useAtlasSelection } from "../hooks/use-atlas-selection.js";
import { useAtlasSidebarViewModel } from "../hooks/use-atlas-sidebar-view-model.js";
import { useFilteredAtlasData } from "../hooks/use-filtered-atlas-data.js";
import { useSelectedLevelMedia } from "../hooks/use-selected-level-media.js";
import {
  useAtlasUrlSync,
  type AppliedAtlasUrlState,
} from "../hooks/use-atlas-url-sync.js";
import { initialAtlasSelection, type AtlasSelection } from "../models/initial-atlas-selection.js";
import { buildAtlasEntryLinks } from "../view-models/build-atlas-entry-links.js";
import { buildLevelGamesViewModel } from "../view-models/build-level-games-view-model.js";
import { buildRelatedLevelsViewModel } from "../view-models/build-related-levels-view-model.js";
import type { AtlasPageProps } from "./atlas-page.props.js";
import { buildAtlasFilterCatalog } from "../../filters/models/build-atlas-filter-catalog.js";
import { useAtlasFilters } from "../../filters/state/use-atlas-filters.js";
import { useAtlasCampaignSelection } from "../../campaigns/hooks/use-atlas-campaign-selection.js";
import { useCampaignPlayback } from "../../campaigns/hooks/use-campaign-playback.js";
import { CampaignPlaybackControls } from "../../campaigns/components/campaign-playback-controls.js";
import { GameCatalogDialog } from "../../game-catalog/components/game-catalog-dialog.js";
import { LevelBriefingPane } from "../../level-briefing/components/level-briefing-pane.js";
import { useLevelBriefing } from "../../level-briefing/hooks/use-level-briefing.js";
import { useCampaignRouteLayer } from "../../map/hooks/use-campaign-route-layer.js";
import { useCountryBoundaryLayer } from "../../map/hooks/use-country-boundary-layer.js";
import { useHistoryOverlayLayer } from "../../map/hooks/use-history-overlay-layer.js";
import { useLeafletMap } from "../../map/hooks/use-leaflet-map.js";
import { useLeafletMarkers } from "../../map/hooks/use-leaflet-markers.js";
import { useMapOverlayLayer } from "../../map/hooks/use-map-overlay-layer.js";
import { useMapOverlayPreloading } from "../../map/hooks/use-map-overlay-preloading.js";
import { useMapViewport } from "../../map/hooks/use-map-viewport.js";
import { useSelectedMapOverlay } from "../../map/hooks/use-selected-map-overlay.js";
import { SettingsDialog } from "../../settings/components/settings-dialog.js";
import { useCampaignRouteAnimationPreference } from "../../settings/hooks/use-campaign-route-animation-preference.js";
import { useExternalGameIcons } from "../../settings/hooks/use-external-game-icons.js";
import { useMapOverlayOpacityPreference } from "../../settings/hooks/use-map-overlay-opacity-preference.js";
import { SolarSystemOverlay } from "../../solar-system/components/solar-system-overlay.js";

/**
 * Composes the atlas presentation with injected data and browser dependency ports.
 */
export function AtlasPage({
  atlasUrlStatePort,
  clientSettingsPort,
  data,
  dataIndex: atlasDataIndex,
  externalGameIconManifestPort,
  historyOverlays,
  kmlFileDownloaderPort,
  levelBriefingPort,
  mapOverlays,
  overlayImagePort,
}: AtlasPageProps) {
  const { group: initialGroup, entry: initialEntry } = initialAtlasSelection(data);
  const filterCatalog = useMemo(() => buildAtlasFilterCatalog(data), [data]);
  const filters = useAtlasFilters(filterCatalog.atlasFilterValueSets);
  const {
    query,
    game,
    gameSelection,
    selectedGames,
    country,
    gameSeries,
    gameSubseries,
    developers,
    continents,
    precisions,
    confidences,
    methods,
    showSingleplayer,
    showMultiplayer,
    showZombies,
    showOther,
    applyUrlState: applyFilterUrlState,
    resetAdvancedFilters: resetAdvancedFilterState,
  } = filters;
  const [sidebarOpen, setSidebarOpen] = useState(APP_DEFAULTS_CONFIG.panels.sidebarOpen);
  const [detailsOpen, setDetailsOpen] = useState(APP_DEFAULTS_CONFIG.panels.detailsOpen);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [campaignTravelPending, setCampaignTravelPending] = useState(false);
  const {
    enabled: externalIconsEnabled,
    unavailable: externalIconManifestUnavailable,
    iconFor: gameIcon,
    markUnavailable: markExternalGameIconUnavailable,
    setEnabled: setExternalIconsEnabled,
  } = useExternalGameIcons({
    manifestPort: externalGameIconManifestPort,
    clientSettingsPort,
  });
  const [activeHistoryOverlay, setActiveHistoryOverlay] = useState<{ levelId: string; id: string } | null>(null);
  const {
    enabled: mapOverlayZoomOpacityEnabled,
    setEnabled: setMapOverlayZoomOpacityEnabled,
  } = useMapOverlayOpacityPreference(clientSettingsPort);
  const {
    enabled: campaignRouteAnimationEnabled,
    setEnabled: setCampaignRouteAnimationEnabled,
  } = useCampaignRouteAnimationPreference(clientSettingsPort);
  const [solarSystemDisplay, setSolarSystemDisplay] = useState({
    hasSpaceLocations: true,
    expanded: APP_DEFAULTS_CONFIG.panels.solarSystemExpanded,
  });
  const [expandedRegionEntryId, setExpandedRegionEntryId] = useState<string | null>(null);
  const [relatedLevelsOpen, setRelatedLevelsOpen] = useState(APP_DEFAULTS_CONFIG.panels.relatedLevelsOpen);
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
    moving: mapMoving,
    runtime: leafletMap,
    mapNode,
    prepareMarkerSelection,
  } = useLeafletMap();
  const mediaDialog = useRef<HTMLDialogElement>(null);
  const infoDialog = useRef<HTMLDialogElement>(null);
  const gameCatalogDialog = useRef<HTMLDialogElement>(null);
  const intelCard = useRef<HTMLDivElement>(null);
  const getMapDetailsElement = useCallback(() => intelCard.current, []);
  const openGameCatalog = useCallback(() => gameCatalogDialog.current?.showModal(), []);
  const gameModeAvailability = useMemo(() => getGameModeAvailability({
    gameCodes: gameSelection,
    games: data.games,
    groups: data.groups,
  }), [data.games, data.groups, gameSelection]);

  const {
    countries,
    games,
    groups: filtered,
    mapFitCoordinates,
    spaceLocations,
  } = useFilteredAtlasData({
    data,
    criteria: {
      query,
      gameCodes: gameSelection,
      country,
      continents,
      precisions,
      confidences,
      methods,
      showSingleplayer: showSingleplayer && gameModeAvailability.singleplayer,
      showMultiplayer: showMultiplayer && gameModeAvailability.multiplayer,
      showZombies: showZombies && gameModeAvailability.zombies,
      showOther: showOther && gameModeAvailability.other,
    },
  });
  const groups = data.groups;
  const {
    activeCampaignKey,
    activeContentUpdateKey,
    campaigns,
    contentUpdates,
    selectedCampaign,
    selectedContentUpdate,
    setSelectedCampaignKey,
    setSelectedContentUpdateKey,
    setSidebarListMode,
    setUrlCampaignLevelId,
    setUrlContentUpdateLevelId,
    sidebarListMode,
  } = useAtlasCampaignSelection({
    gameCode: game,
    games: data.games,
    groups,
  });
  const selectedLevelCollection = selectedCampaign ?? selectedContentUpdate;
  const selectedCollectionGame = selectedLevelCollection
    ? atlasDataIndex.findGameById(selectedLevelCollection.gameId) ?? null
    : null;
  const selectedCollectionGameIcon = selectedCollectionGame ? gameIcon(selectedCollectionGame) : null;
  const selectedCollectionUsesExternalGameIcon = Boolean(
    selectedCollectionGameIcon
    && selectedCollectionGame
    && selectedCollectionGameIcon !== selectedCollectionGame.icon,
  );
  const selectedEntryLinks = buildAtlasEntryLinks(selected.entry);
  const selectedGameId = atlasDataIndex.findGameByCode(game)?.id ?? null;
  const {
    appearance: selectedAppearance,
    handleFailure: handleMediaFailure,
    handleLoaded: handleMediaLoaded,
    viewModel: levelMediaViewModel,
  } = useSelectedLevelMedia({
    data,
    entry: selected.entry,
    selectedGameId,
  });
  const {
    expanded: levelNotesExpanded,
    briefing: selectedLevelNotes,
    toggle: toggleLevelNotes,
    open: openLevelBriefing,
    collapse: collapseLevelBriefing,
  } = useLevelBriefing({
    levelId: selectedAppearance.notesId,
    available: selectedAppearance.hasLevelNotes,
    port: levelBriefingPort,
  });

  const { nextOverlayReady } = useMapOverlayPreloading({
    selectedEntry: selected.entry,
    campaign: selectedCampaign,
    overlays: mapOverlays,
    images: overlayImagePort,
  });
  const campaignPlayback = useCampaignPlayback({
    campaign: selectedCampaign,
    filterScope: filtered,
    selectionVersion,
    ready: mapReady && !mapMoving && !campaignTravelPending && !settingsOpen
      && selectedLevelNotes?.status !== "loading" && nextOverlayReady,
    onVisit: visitCampaignLevel,
  });
  useEffect(() => {
    const map = leafletMap.getMap();
    if (!mapReady || !map) return;
    const container = map.getContainer();
    map.on("dragstart", campaignPlayback.pause);
    container.addEventListener("wheel", campaignPlayback.pause, { passive: true });
    return () => {
      map.off("dragstart", campaignPlayback.pause);
      container.removeEventListener("wheel", campaignPlayback.pause);
    };
  }, [campaignPlayback.pause, leafletMap, mapReady]);
  // A tour shows its whole campaign; ending it restores the user's filters.
  const mapGroups = useMemo(() => {
    if (!campaignPlayback.active || !selectedCampaign) return filtered;
    const levelIds = new Set(selectedCampaign.levels.map(({ entry }) => entry.levelId));
    return groups.map((group) => ({ ...group,
      entries: group.entries.filter((entry) => levelIds.has(entry.levelId)),
    })).filter((group) => group.entries.length > 0);
  }, [campaignPlayback.active, filtered, groups, selectedCampaign]);
  const displayedSpaceLocations = useMemo(() => campaignPlayback.active
    ? mapGroups.flatMap((group) => group.entries.filter((entry) => entry.precision === "off-world")
      .map((entry) => ({ group, entry })))
    : spaceLocations, [campaignPlayback.active, mapGroups, spaceLocations]);
  const hasSpaceLocations = displayedSpaceLocations.length > 0;
  const solarSystemExpanded = solarSystemDisplay.hasSpaceLocations === hasSpaceLocations
    ? solarSystemDisplay.expanded : hasSpaceLocations && APP_DEFAULTS_CONFIG.panels.solarSystemExpanded;

  /**
   * Restores shareable URL state and clears transient UI tied to the previous selection.
   */
  const applyAtlasUrlState = useCallback((urlState: AppliedAtlasUrlState<AtlasSelection>) => {
    setSelectionVersion((version) => version + 1);
    applyFilterUrlState(urlState.filters);
    applyUrlSelection(urlState.selection);
    setSidebarListMode(urlState.sidebarListMode);
    setUrlCampaignLevelId(urlState.campaignLevelId);
    setUrlContentUpdateLevelId(urlState.contentUpdateLevelId);
    setSelectedCampaignKey(urlState.campaignKey);
    setSelectedContentUpdateKey(null);
    setExpandedRegionEntryId(null);
    collapseLevelBriefing();
    setActiveHistoryOverlay(null);
  }, [
    applyFilterUrlState,
    applyUrlSelection,
    collapseLevelBriefing,
    setSelectedCampaignKey,
    setSelectedContentUpdateKey,
    setSidebarListMode,
    setUrlCampaignLevelId,
    setUrlContentUpdateLevelId,
  ]);
  const {
    setNextHistoryMode,
    prepareSearchUpdate,
    finishSearchUpdate,
  } = useAtlasUrlSync<AtlasSelection>({
    dataIndex: atlasDataIndex,
    games,
    filters: {
      query,
      gameSelection,
      selectedGames,
      country,
      gameSeries,
      gameSubseries,
      developers,
      continents,
      precisions,
      confidences,
      methods,
      showSingleplayer,
      showMultiplayer,
      showZombies,
      showOther,
    },
    selected,
    selectionInUrl,
    sidebarListMode,
    campaignKey: selectedCampaign?.key ?? null,
    urlStatePort: atlasUrlStatePort,
    onApplyUrlState: applyAtlasUrlState,
  });

  /**
   * Records filter clearing as a navigable URL-state change.
   */
  const resetAdvancedFilters = useCallback(() => {
    setNextHistoryMode("push");
    resetAdvancedFilterState();
  }, [resetAdvancedFilterState, setNextHistoryMode]);
  const { otherLevelLocations, relatedLevels } = findRelatedLevels<AtlasEntryDto, AtlasGroupDto>({
    groups,
    selected,
    collectionLevels: selectedLevelCollection?.levels,
  });
  // Keep the expanded list open while selecting levels in the same collection.
  const relatedLevelsExpansionKey = selectedCampaign
    ? `campaign:${selectedCampaign.key}`
    : selectedContentUpdate
      ? `update:${selectedContentUpdate.key}`
      : `region:${selected.group.name}`;
  const relatedLevelsExpanded = expandedRegionEntryId === relatedLevelsExpansionKey;
  const {
    enabled: selectedMapOverlayEnabled,
    overlay: selectedMapOverlay,
    toggle: toggleSelectedMapOverlay,
  } = useSelectedMapOverlay({ levelId: selected.entry.levelId, overlays: mapOverlays });
  const selectedHistoryOverlays = historyOverlays[selected.entry.levelId] ?? [];
  const selectedHistoryOverlay = activeHistoryOverlay?.levelId === selected.entry.levelId
    ? selectedHistoryOverlays.find((overlay) => overlay.id === activeHistoryOverlay.id) ?? null
    : null;

  /**
   * Applies the canonical selection transition and resets level-scoped presentation state.
   */
  const selectEntry = useCallback((group: AtlasGroupDto, entry: AtlasEntryDto) => {
    setSelectionVersion((version) => version + 1);
    setNextHistoryMode("push");
    selectAtlasEntry(group, entry);
    collapseLevelBriefing();
    setActiveHistoryOverlay(null);
  }, [collapseLevelBriefing, selectAtlasEntry, setNextHistoryMode]);

  /**
   * Prepares overlay-aware viewport behavior before selecting a clicked map marker.
   */
  const selectMapMarker = useCallback((group: AtlasGroupDto, entry: AtlasEntryDto) => {
    prepareMarkerSelection(mapOverlays[entry.levelId] ? entry.levelId : null);
    selectEntry(group, entry);
  }, [mapOverlays, prepareMarkerSelection, selectEntry]);

  const focusedLevelIds = useMemo(() => selectedLevelCollection
    ? new Set(selectedLevelCollection.levels.map(({ entry }) => entry.levelId))
    : null, [selectedLevelCollection]);
  const selectedCountryCode = country === "all"
    ? null
    : countries.find((candidate) => candidate.name === country)?.flagCode ?? null;

  const { replaySelectedMarkerPulse } = useLeafletMarkers({
    focusedLevelIds,
    filteredGroups: mapGroups,
    locationLabel: formatAtlasLocationName,
    onSelect: selectMapMarker,
    ready: mapReady,
    runtime: leafletMap,
    selected,
  });
  useCountryBoundaryLayer({
    countryCode: selectedCountryCode,
    ready: mapReady,
    runtime: leafletMap,
  });

  // These hooks share one Leaflet runtime while owning independent map layers.
  const findSelectionByEntryId = useCallback(
    (entryId: string) => atlasDataIndex.findSelectionByEntryId(entryId),
    [atlasDataIndex],
  );
  const { prepareMarkerReveal } = useCampaignRouteLayer({
    animationEnabled: campaignRouteAnimationEnabled,
    findSelectionByEntryId,
    getDetailsElement: getMapDetailsElement,
    onSelect: selectMapMarker,
    ready: mapReady,
    runtime: leafletMap,
    selectedCampaign,
  });
  const {
    campaignOverlayVisible,
    shouldCrossfadeOverlay,
    centerSelectedMarker,
    focusSelectedMarker,
    queueRelatedLevelFocus,
    queueSidebarSelection,
  } = useMapViewport({
    campaignPlaybackActive: campaignPlayback.active,
    filteredGroups: mapGroups,
    getDetailsElement: getMapDetailsElement,
    mapFitCoordinates,
    mapOverlays,
    onCampaignTravelChange: setCampaignTravelPending,
    ready: mapReady,
    runtime: leafletMap,
    selected,
    selectedCampaign,
    sidebarOpen,
  });
  useMapOverlayLayer({
    adaptiveOpacity: mapOverlayZoomOpacityEnabled,
    shouldCrossfadeOverlay,
    campaignPlaybackActive: campaignPlayback.active,
    campaignOverlayVisible,
    enabled: selectedMapOverlayEnabled,
    getDetailsElement: getMapDetailsElement,
    levelId: selected.entry.levelId,
    overlay: selectedMapOverlay,
    images: overlayImagePort,
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

  function visitCampaignLevel(level: { group: AtlasGroupDto; entry: AtlasEntryDto }, reason: "start" | "step") {
    const { group, entry } = level;
    const appearance = entry.appearances.find((item) => item.gameId === selectedCampaign?.gameId)
      ?? entry.appearances[0];
    setNextHistoryMode(reason === "start" ? "push" : "replace");
    queueSidebarSelection(null);
    queueRelatedLevelFocus(entry.id, "campaign-playback");
    prepareMarkerReveal(null);
    selectAtlasEntry(group, entry);
    setActiveHistoryOverlay(null);
    setDetailsOpen(true);
    setRelatedLevelsOpen(true);
    setExpandedRegionEntryId(selectedCampaign ? `campaign:${selectedCampaign.key}` : null);
    openLevelBriefing(appearance?.notesId ?? entry.levelId, appearance?.hasLevelNotes ?? entry.hasLevelNotes);
    replaySelectedMarkerPulse();
    if (entry.precision === "off-world") setSolarSystemDisplay({ hasSpaceLocations: true, expanded: true });
  }

  const focusLevelDetails = useCallback(() => {
    replaySelectedMarkerPulse();
    focusSelectedMarker();
  }, [focusSelectedMarker, replaySelectedMarkerPulse]);

  const centerLevelDetails = useCallback(() => {
    replaySelectedMarkerPulse();
    if (selectedMapOverlayEnabled) focusSelectedMarker();
    else if (selectedHistoryOverlay) focusHistoryOverlay(selectedHistoryOverlay, selected.entry.coordinates);
    else centerSelectedMarker();
  }, [centerSelectedMarker, focusHistoryOverlay, focusSelectedMarker, replaySelectedMarkerPulse,
    selected.entry.coordinates, selectedHistoryOverlay, selectedMapOverlayEnabled]);

  /**
   * Toggles a historical overlay and frames it together with the selected marker.
   */
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

  /**
   * Selects a representative entry while framing every mapped location in its group.
   */
  const selectSidebarGroup = useCallback((group: AtlasGroupDto) => {
    const entry = group.entries[0];
    if (!entry) return;
    if (group.kind === "off-world") {
      setSolarSystemDisplay({ hasSpaceLocations: true, expanded: true });
    }
    const coordinates = group.entries.flatMap((candidate) => {
      if (!candidate.coordinates) return [];
      const overlay = mapOverlays[candidate.levelId];
      return overlay ? [candidate.coordinates, ...Object.values(overlay.corners)] : [candidate.coordinates];
    });
    const fallbackCoordinate = group.coordinates ?? entry.coordinates ?? null;
    const bounds = coordinates.length ? coordinates : fallbackCoordinate ? [fallbackCoordinate] : [];
    // Do not zoom past the least precise location represented by the group.
    const maxZoom = Math.min(...group.entries.map((candidate) =>
      LOCATION_ZOOM_CONFIG[candidate.precision] ?? LOCATION_ZOOM_CONFIG.country));

    queueSidebarSelection(bounds.length ? { bounds, maxZoom } : null);
    selectEntry(group, entry);
  }, [mapOverlays, queueSidebarSelection, selectEntry]);

  /**
   * Toggles campaign browsing and reveals its first marker when activated.
   */
  function selectCampaign(campaign: CampaignOption<AtlasGroupDto, AtlasEntryDto>) {
    const campaignIsActive = activeCampaignKey === campaign.key;
    setSelectedContentUpdateKey(null);
    setUrlContentUpdateLevelId(null);
    setUrlCampaignLevelId(null);
    setSelectedCampaignKey(campaignIsActive ? null : campaign.key);
    if (!campaignIsActive && campaign.levels[0]) {
      const { group, entry } = campaign.levels[0];
      prepareMarkerReveal(entry.id);
      selectEntry(group, entry);
      // Keep an open briefing mounted as the campaign controls slide in above it.
      if (levelNotesExpanded) {
        const appearance = entry.appearances.find((item) => item.gameId === campaign.gameId)
          ?? entry.appearances[0];
        openLevelBriefing(appearance?.notesId ?? entry.levelId, appearance?.hasLevelNotes ?? entry.hasLevelNotes);
      }
    } else {
      prepareMarkerReveal(null);
    }
    setExpandedRegionEntryId(null);
    setRelatedLevelsOpen(true);
    setDetailsOpen(true);
  }

  /**
   * Toggles a content update and frames all its mapped locations when needed.
   */
  function selectContentUpdate(contentUpdate: ContentUpdateOption<AtlasGroupDto, AtlasEntryDto>) {
    const contentUpdateIsActive = activeContentUpdateKey === contentUpdate.key;
    setSelectedCampaignKey(null);
    setUrlCampaignLevelId(null);
    setUrlContentUpdateLevelId(null);
    setSelectedContentUpdateKey(contentUpdateIsActive ? null : contentUpdate.key);
    prepareMarkerReveal(null);
    if (!contentUpdateIsActive && contentUpdate.levels[0]) {
      const levelIds = new Set(contentUpdate.levels.map(({ entry }) => entry.levelId));
      const bounds = groups.flatMap((group) => group.entries.flatMap((entry) =>
        levelIds.has(entry.levelId) && entry.coordinates ? [entry.coordinates] : []));
      queueRelatedLevelFocus(null);
      queueSidebarSelection(bounds.length ? { bounds, fitOnlyWhenOutside: true } : null);
      selectEntry(contentUpdate.levels[0].group, contentUpdate.levels[0].entry);
    }
    setExpandedRegionEntryId(null);
    setRelatedLevelsOpen(true);
    setDetailsOpen(true);
  }

  // Prevent an open attribution dialog from retaining media from the previous level.
  useEffect(() => {
    mediaDialog.current?.close();
  }, [selected.entry.id]);

  /**
   * Downloads a KML document containing only the currently filtered atlas entries.
   */
  function exportKml() {
    kmlFileDownloaderPort.download(buildAtlasKml(filtered, {
      platformUrl: window.location.origin,
      sourceUrl: window.location.href,
    }));
  }

  // View models keep component props focused on display data and user actions.
  const selectedLevelGames = buildLevelGamesViewModel(
    selected.entry,
    atlasDataIndex,
    gameIcon,
  );
  const relatedLevelsViewModel = buildRelatedLevelsViewModel({
    campaign: selectedCampaign,
    contentUpdate: selectedContentUpdate,
    expanded: relatedLevelsExpanded,
    game: selectedCollectionGame,
    gameIcon: selectedCollectionGameIcon,
    gameIconIsExternal: selectedCollectionUsesExternalGameIcon,
    group: selected.group,
    items: relatedLevels,
    open: relatedLevelsOpen,
    selectedLevelId: selected.entry.levelId,
  });
  const sidebarViewModel = useAtlasSidebarViewModel({
    activeCampaignKey,
    activeContentUpdateKey,
    campaigns,
    contentUpdates,
    catalog: filterCatalog,
    countries,
    filteredGroups: filtered,
    filters,
    gameModeAvailability,
    games,
    handlers: {
      finishSearchUpdate,
      gameIconFor: gameIcon,
      markExternalGameIconUnavailable,
      onCampaignSelect: selectCampaign,
      onContentUpdateSelect: selectContentUpdate,
      onExport: exportKml,
      onGroupSelect: selectSidebarGroup,
      onOpenGameCatalog: openGameCatalog,
      onResetAdvancedFilters: resetAdvancedFilters,
      prepareSearchUpdate,
      setExpandedRegionEntryId,
      setNextHistoryMode,
      setSelectedCampaignKey,
      setSelectedContentUpdateKey,
      setSidebarListMode,
      setUrlCampaignLevelId,
      setUrlContentUpdateLevelId,
    },
    mode: sidebarListMode,
    open: sidebarOpen,
    selectedGroupName: selected.group.name,
  });
  return (
    <main className={`atlas-shell${sidebarOpen ? "" : " is-sidebar-collapsed"}`}
      style={{
        "--sidebar-transition-duration": `${MAP_CAMERA_CONFIG.sidebar.transitionMs}ms`,
        "--marker-spider-leg-color": MAP_MARKERS_CONFIG.clustering.spiderLeg.color,
        "--marker-spider-leg-weight": MAP_MARKERS_CONFIG.clustering.spiderLeg.weight,
        "--marker-spider-leg-opacity": MAP_MARKERS_CONFIG.clustering.spiderLeg.opacity,
        "--campaign-stop-width": `${CAMPAIGN_ROUTE_CONFIG.marker.width}px`,
        "--campaign-stop-height": `${CAMPAIGN_ROUTE_CONFIG.marker.height}px`,
        "--campaign-stop-appear-duration": `${CAMPAIGN_ROUTE_CONFIG.marker.appearMs}ms`,
      } as CSSProperties}>
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
          myrmecophobiaMode={{
            enabled: !campaignRouteAnimationEnabled,
            onToggle: () => setCampaignRouteAnimationEnabled(!campaignRouteAnimationEnabled),
          }}
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
        mapReady={mapReady}
        playbackActive={campaignPlayback.active}
        solarSystem={(
          <SolarSystemOverlay
            locations={displayedSpaceLocations}
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
            onClose={() => { campaignPlayback.pause(); collapseLevelBriefing(); }}
            onToggleHistoryOverlay={toggleHistoryOverlay}
            title={selectedAppearance.title}
          />
        ) : null}
        details={(
          <LevelDetailsPanel
            actions={{
              onFocus: focusLevelDetails,
              onCenter: centerLevelDetails,
              onGameIconError: markExternalGameIconUnavailable,
              onToggleBriefing: () => { campaignPlayback.pause(); toggleLevelNotes(); },
              onToggleDetails: () => { campaignPlayback.pause(); setDetailsOpen((open) => !open); },
              onToggleMapOverlay: toggleSelectedMapOverlay,
            }}
            columnRef={intelCard}
            detailsOpen={detailsOpen}
            media={levelMediaViewModel ? (
              <LevelMedia
                dialogRef={mediaDialog}
                media={levelMediaViewModel}
                onFailed={handleMediaFailure}
                onLoaded={handleMediaLoaded}
              />
            ) : null}
            relatedLevels={relatedLevelsViewModel ? (
              <RelatedLevelsPanel
                viewModel={relatedLevelsViewModel}
                playback={selectedCampaign?.levels.length ? (
                  <CampaignPlaybackControls label={selectedCampaign.label} count={selectedCampaign.levels.length} playback={campaignPlayback} />
                ) : null}
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
                callOfDutyMaps: selectedEntryLinks.callOfDutyMaps,
                googleMaps: selectedEntryLinks.googleMaps,
                wikipedia: selectedEntryLinks.wikipedia,
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
