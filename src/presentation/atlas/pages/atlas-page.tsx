"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { findRelatedLevels } from "../../../application/atlas/use-cases/find-related-levels.js";
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
import { GameCatalogDialog } from "../../game-catalog/components/game-catalog-dialog.js";
import { LevelBriefingPane } from "../../level-briefing/components/level-briefing-pane.js";
import { useLevelBriefing } from "../../level-briefing/hooks/use-level-briefing.js";
import { useCampaignRouteLayer } from "../../map/hooks/use-campaign-route-layer.js";
import { useHistoryOverlayLayer } from "../../map/hooks/use-history-overlay-layer.js";
import { useLeafletMap } from "../../map/hooks/use-leaflet-map.js";
import { useLeafletMarkers } from "../../map/hooks/use-leaflet-markers.js";
import { useMapOverlayLayer } from "../../map/hooks/use-map-overlay-layer.js";
import { useMapViewport } from "../../map/hooks/use-map-viewport.js";
import { useSelectedMapOverlay } from "../../map/hooks/use-selected-map-overlay.js";
import { SettingsDialog } from "../../settings/components/settings-dialog.js";
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
}: AtlasPageProps) {
  const { group: initialGroup, entry: initialEntry } = initialAtlasSelection(data);
  const filterCatalog = useMemo(() => buildAtlasFilterCatalog(data), [data]);
  const filters = useAtlasFilters(filterCatalog.atlasFilterValueSets);
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
    showSpecialOps,
    showZombies,
    applyUrlState: applyFilterUrlState,
    resetAdvancedFilters: resetAdvancedFilterState,
  } = filters;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
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
  const [solarSystemDisplay, setSolarSystemDisplay] = useState({
    hasSpaceLocations: true,
    expanded: true,
  });
  const [expandedRegionEntryId, setExpandedRegionEntryId] = useState<string | null>(null);
  const [relatedLevelsOpen, setRelatedLevelsOpen] = useState(true);
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
  const openGameCatalog = useCallback(() => gameCatalogDialog.current?.showModal(), []);

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
      showSpecialOps,
      showZombies,
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
  const hasSpaceLocations = spaceLocations.length > 0;
  // Re-open the schematic when changed filters make off-world results available again.
  const solarSystemExpanded = solarSystemDisplay.hasSpaceLocations === hasSpaceLocations
    ? solarSystemDisplay.expanded
    : hasSpaceLocations;
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
    collapse: collapseLevelBriefing,
  } = useLevelBriefing({
    levelId: selectedAppearance.notesId,
    available: selectedAppearance.hasLevelNotes,
    port: levelBriefingPort,
  });

  /**
   * Restores shareable URL state and clears transient UI tied to the previous selection.
   */
  const applyAtlasUrlState = useCallback((urlState: AppliedAtlasUrlState<AtlasSelection>) => {
    applyFilterUrlState(urlState.filters);
    applyUrlSelection(urlState.selection);
    setSidebarListMode(urlState.sidebarListMode);
    setUrlCampaignLevelId(urlState.campaignLevelId);
    setUrlContentUpdateLevelId(urlState.contentUpdateLevelId);
    setSelectedCampaignKey(null);
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
      showSpecialOps,
      showZombies,
    },
    selected,
    selectionInUrl,
    sidebarListMode,
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
  const relatedLevelsExpansionKey = selectedCampaign
    ? `campaign:${selectedCampaign.key}`
    : selectedContentUpdate
      ? `update:${selectedContentUpdate.key}`
      : selected.entry.id;
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
    setNextHistoryMode("push");
    selectAtlasEntry(group, entry);
    setExpandedRegionEntryId(null);
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

  useLeafletMarkers({
    focusedLevelIds,
    filteredGroups: filtered,
    locationLabel: formatAtlasLocationName,
    onSelect: selectMapMarker,
    ready: mapReady,
    runtime: leafletMap,
    selected,
  });

  // These hooks share one Leaflet runtime while owning independent map layers.
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
    const coordinates = group.entries.flatMap((candidate) => candidate.coordinates ? [candidate.coordinates] : []);
    const fallbackCoordinate = group.coordinates ?? entry.coordinates ?? null;
    const bounds = coordinates.length ? coordinates : fallbackCoordinate ? [fallbackCoordinate] : [];
    // Do not zoom past the least precise location represented by the group.
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
      prepareMarkerReveal(campaign.levels[0].entry.id);
      selectEntry(campaign.levels[0].group, campaign.levels[0].entry);
    } else {
      prepareMarkerReveal(null);
    }
    setExpandedRegionEntryId(null);
    setRelatedLevelsOpen(true);
    setDetailsOpen(true);
  }

  /**
   * Toggles a Multiplayer/Zombies content update and selects its first level.
   */
  function selectContentUpdate(contentUpdate: ContentUpdateOption<AtlasGroupDto, AtlasEntryDto>) {
    const contentUpdateIsActive = activeContentUpdateKey === contentUpdate.key;
    setSelectedCampaignKey(null);
    setUrlCampaignLevelId(null);
    setUrlContentUpdateLevelId(null);
    setSelectedContentUpdateKey(contentUpdateIsActive ? null : contentUpdate.key);
    prepareMarkerReveal(null);
    if (!contentUpdateIsActive && contentUpdate.levels[0]) {
      queueRelatedLevelFocus(contentUpdate.levels[0].entry.id);
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
    kmlFileDownloaderPort.download(buildAtlasKml(filtered));
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
    games,
    handlers: {
      finishSearchUpdate,
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
