"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AtlasUrlStatePort } from "../../../application/atlas/ports/atlas-url-state.port.js";
import type { AtlasFilterUrlState } from "../../filters/state/use-atlas-filters.js";

type UrlGame = { id: string; code: string };
type UrlSelection = { entry: { levelId: string; locationId: string } };

type AtlasUrlDataIndex<TSelection extends UrlSelection> = {
  findGameById(gameId: string): UrlGame | undefined;
  findGameByCode(gameCode: string): UrlGame | undefined;
  hasCountry(country: string): boolean;
  resolveLevelId(levelId: string): string;
  findSelectionByLevelId(levelId: string, locationId: string | null): TSelection | undefined;
};

export type AppliedAtlasUrlState<TSelection> = {
  filters: AtlasFilterUrlState;
  selection: TSelection | null;
  sidebarListMode: "locations" | "campaigns" | "updates";
  campaignKey: string | null;
  campaignLevelId: string | null;
  contentUpdateLevelId: string | null;
};

type UseAtlasUrlSyncInput<TSelection extends UrlSelection> = {
  dataIndex: AtlasUrlDataIndex<TSelection>;
  filters: {
    query: string;
    gameSelection: ReadonlySet<string> | null;
    selectedGames: ReadonlySet<string>;
    country: string;
    gameSeries: ReadonlySet<string>;
    gameSubseries: ReadonlySet<string>;
    developers: ReadonlySet<string>;
    continents: ReadonlySet<string>;
    precisions: ReadonlySet<string>;
    confidences: ReadonlySet<string>;
    methods: ReadonlySet<string>;
    showSingleplayer: boolean;
    showMultiplayer: boolean;
    showZombies: boolean;
    showOther: boolean;
  };
  selected: TSelection;
  selectionInUrl: boolean;
  sidebarListMode: "locations" | "campaigns" | "updates";
  campaignKey: string | null;
  urlStatePort: AtlasUrlStatePort;
  onApplyUrlState: (state: AppliedAtlasUrlState<TSelection>) => void;
};

export function useAtlasUrlSync<TSelection extends UrlSelection>({
  dataIndex,
  filters,
  selected,
  selectionInUrl,
  sidebarListMode,
  campaignKey,
  urlStatePort,
  onApplyUrlState,
}: UseAtlasUrlSyncInput<TSelection>) {
  const [ready, setReady] = useState(false);
  const nextHistoryMode = useRef<"push" | "replace">("replace");
  const searchEditActive = useRef(false);

  const setNextHistoryMode = useCallback((mode: "push" | "replace") => {
    nextHistoryMode.current = mode;
  }, []);
  const prepareSearchUpdate = useCallback(() => {
    nextHistoryMode.current = searchEditActive.current ? "replace" : "push";
    searchEditActive.current = true;
  }, []);
  const finishSearchUpdate = useCallback(() => {
    searchEditActive.current = false;
  }, []);

  useEffect(() => {
    const applyUrl = () => {
      const urlState = urlStatePort.read();
      const requestedGames = (urlState.gameIds ?? []).flatMap((id) => {
        const game = dataIndex.findGameById(id);
        return game ? [game] : [];
      });
      const requestedGame = requestedGames.length === 1 ? requestedGames[0] : null;
      const requestedLevelId = urlState.levelId ? dataIndex.resolveLevelId(urlState.levelId) : null;
      const requestedSelection = requestedLevelId
        ? dataIndex.findSelectionByLevelId(requestedLevelId, urlState.locationId) ?? null
        : null;

      nextHistoryMode.current = "replace";
      searchEditActive.current = false;
      onApplyUrlState({
        filters: {
          query: urlState.query,
          games: urlState.gameIds === null ? null : requestedGames.map((game) => game.code),
          country: dataIndex.hasCountry(urlState.country) ? urlState.country : "all",
          gameSeries: urlState.series,
          gameSubseries: urlState.subseries,
          developers: urlState.developers,
          continents: urlState.continents,
          precisions: urlState.precisions,
          confidences: urlState.confidences,
          methods: urlState.methods,
          showSingleplayer: urlState.showSingleplayer,
          showMultiplayer: urlState.showMultiplayer,
          showZombies: urlState.showZombies,
          showOther: urlState.showOther,
        },
        selection: requestedSelection,
        sidebarListMode: requestedGame ? urlState.sidebarListMode : "locations",
        campaignKey: requestedGame && urlState.sidebarListMode === "campaigns" ? urlState.campaignKey : null,
        campaignLevelId: urlState.sidebarListMode === "campaigns" && requestedGame && requestedSelection
          ? requestedSelection.entry.levelId
          : null,
        contentUpdateLevelId: urlState.sidebarListMode === "updates" && requestedGame && requestedSelection
          ? requestedSelection.entry.levelId
          : null,
      });
      setReady(true);
    };

    applyUrl();
    return urlStatePort.subscribe(applyUrl);
  }, [dataIndex, onApplyUrlState, urlStatePort]);

  useEffect(() => {
    if (!ready) return;
    urlStatePort.write({
      query: filters.query,
      gameIds: filters.gameSelection === null ? null : [...filters.selectedGames].flatMap((code) => {
        const game = dataIndex.findGameByCode(code);
        return game ? [game.id] : [];
      }),
      country: filters.country,
      series: [...filters.gameSeries],
      subseries: [...filters.gameSubseries],
      developers: [...filters.developers],
      continents: [...filters.continents],
      precisions: [...filters.precisions],
      confidences: [...filters.confidences],
      methods: [...filters.methods],
      showSingleplayer: filters.showSingleplayer,
      showMultiplayer: filters.showMultiplayer,
      showZombies: filters.showZombies,
      showOther: filters.showOther,
      sidebarListMode,
      campaignKey,
      levelId: selectionInUrl ? selected.entry.levelId : null,
      locationId: selectionInUrl ? selected.entry.locationId : null,
    }, nextHistoryMode.current);
    nextHistoryMode.current = "push";
  }, [
    dataIndex,
    campaignKey,
    filters.confidences,
    filters.continents,
    filters.country,
    filters.gameSelection,
    filters.selectedGames,
    filters.gameSeries,
    filters.gameSubseries,
    filters.developers,
    filters.methods,
    filters.precisions,
    filters.query,
    filters.showMultiplayer,
    filters.showSingleplayer,
    filters.showZombies,
    filters.showOther,
    ready,
    selected.entry.levelId,
    selected.entry.locationId,
    selectionInUrl,
    sidebarListMode,
    urlStatePort,
  ]);

  return { setNextHistoryMode, prepareSearchUpdate, finishSearchUpdate };
}
