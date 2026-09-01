"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { findRelatedLevels } from "../../../application/atlas/use-cases/find-related-levels.js";
import {
  type CampaignOption,
} from "../../../application/campaigns/use-cases/build-campaign-options.js";
import { buildAtlasKml } from "../../../application/export/use-cases/build-atlas-kml.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import type { HistoryOverlayDto } from "../../../infrastructure/atlas-data/dto/history-overlay.dto.js";
import { downloadKmlFile } from "../../../infrastructure/browser/downloads/kml-file.downloader.js";
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

export function AtlasPage({
  data,
  dataIndex: atlasDataIndex,
  historyOverlays,
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
  } = useExternalGameIcons();
  const [activeHistoryOverlay, setActiveHistoryOverlay] = useState<{ levelId: string; id: string } | null>(null);
  const {
    enabled: mapOverlayZoomOpacityEnabled,
    setEnabled: setMapOverlayZoomOpacityEnabled,
  } = useMapOverlayOpacityPreference();
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
      showZombies,
    },
  });
  const groups = data.groups;
  const {
    activeCampaignKey,
    campaigns,
    selectedCampaign,
    setSelectedCampaignKey,
    setSidebarListMode,
    setUrlCampaignLevelId,
    sidebarListMode,
  } = useAtlasCampaignSelection({
    gameCode: game,
    games: data.games,
    groups,
  });
  const selectedCampaignGame = selectedCampaign
    ? atlasDataIndex.findGameById(selectedCampaign.gameId) ?? null
    : null;
  const selectedCampaignGameIcon = selectedCampaignGame ? gameIcon(selectedCampaignGame) : null;
  const selectedCampaignUsesExternalGameIcon = Boolean(
    selectedCampaignGameIcon
    && selectedCampaignGame
    && selectedCampaignGameIcon !== selectedCampaignGame.icon,
  );
  const hasSpaceLocations = spaceLocations.length > 0;
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
  });
  const applyAtlasUrlState = useCallback((urlState: AppliedAtlasUrlState<AtlasSelection>) => {
    applyFilterUrlState(urlState.filters);
    applyUrlSelection(urlState.selection);
    setSidebarListMode(urlState.sidebarListMode);
    setUrlCampaignLevelId(urlState.campaignLevelId);
    setSelectedCampaignKey(null);
    setExpandedRegionEntryId(null);
    collapseLevelBriefing();
    setActiveHistoryOverlay(null);
  }, [
    applyFilterUrlState,
    applyUrlSelection,
    collapseLevelBriefing,
    setSelectedCampaignKey,
    setSidebarListMode,
    setUrlCampaignLevelId,
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
  const { otherLevelLocations, relatedLevels } = findRelatedLevels<AtlasEntryDto, AtlasGroupDto>({
    groups,
    selected,
    campaignLevels: selectedCampaign?.levels,
  });
  const relatedLevelsExpansionKey = selectedCampaign ? `campaign:${selectedCampaign.key}` : selected.entry.id;
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
    locationLabel: formatAtlasLocationName,
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

  const selectedLevelGames = buildLevelGamesViewModel(
    selected.entry,
    atlasDataIndex,
    gameIcon,
  );
  const relatedLevelsViewModel = buildRelatedLevelsViewModel({
    campaign: selectedCampaign,
    expanded: relatedLevelsExpanded,
    game: selectedCampaignGame,
    gameIcon: selectedCampaignGameIcon,
    gameIconIsExternal: selectedCampaignUsesExternalGameIcon,
    items: relatedLevels,
    open: relatedLevelsOpen,
    selectedLevelId: selected.entry.levelId,
  });
  const sidebarViewModel = useAtlasSidebarViewModel({
    activeCampaignKey,
    campaigns,
    catalog: filterCatalog,
    countries,
    filteredGroups: filtered,
    filters,
    games,
    handlers: {
      finishSearchUpdate,
      onCampaignSelect: selectCampaign,
      onExport: exportKml,
      onGroupSelect: selectSidebarGroup,
      onOpenGameCatalog: openGameCatalog,
      onResetAdvancedFilters: resetAdvancedFilters,
      prepareSearchUpdate,
      setExpandedRegionEntryId,
      setNextHistoryMode,
      setSelectedCampaignKey,
      setSidebarListMode,
      setUrlCampaignLevelId,
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
