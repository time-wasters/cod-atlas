"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AtlasUrlState } from "../../../infrastructure/browser/url/atlas-url-state.dto.js";
import { parseAtlasUrlState } from "../../../infrastructure/browser/url/atlas-url-state.parser.js";
import { serializeAtlasUrlState } from "../../../infrastructure/browser/url/atlas-url-state.serializer.js";
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
  sidebarListMode: "locations" | "campaigns";
  campaignLevelId: string | null;
};

type UseAtlasUrlSyncInput<TSelection extends UrlSelection> = {
  dataIndex: AtlasUrlDataIndex<TSelection>;
  filters: {
    query: string;
    game: string;
    country: string;
    gameSeries: ReadonlySet<string>;
    gameSubseries: ReadonlySet<string>;
    continents: ReadonlySet<string>;
    precisions: ReadonlySet<string>;
    confidences: ReadonlySet<string>;
    methods: ReadonlySet<string>;
    showSingleplayer: boolean;
    showMultiplayer: boolean;
    showZombies: boolean;
  };
  selected: TSelection;
  selectionInUrl: boolean;
  sidebarListMode: "locations" | "campaigns";
  onApplyUrlState: (state: AppliedAtlasUrlState<TSelection>) => void;
};

export function useAtlasUrlSync<TSelection extends UrlSelection>({
  dataIndex,
  filters,
  selected,
  selectionInUrl,
  sidebarListMode,
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
      const urlState: AtlasUrlState = parseAtlasUrlState(window.location.href);
      const requestedGame = dataIndex.findGameById(urlState.gameId);
      const requestedLevelId = urlState.levelId ? dataIndex.resolveLevelId(urlState.levelId) : null;
      const requestedSelection = requestedLevelId
        ? dataIndex.findSelectionByLevelId(requestedLevelId, urlState.locationId) ?? null
        : null;

      nextHistoryMode.current = "replace";
      searchEditActive.current = false;
      onApplyUrlState({
        filters: {
          query: urlState.query,
          game: requestedGame?.code ?? "all",
          country: dataIndex.hasCountry(urlState.country) ? urlState.country : "all",
          gameSeries: urlState.series,
          gameSubseries: urlState.subseries,
          continents: urlState.continents,
          precisions: urlState.precisions,
          confidences: urlState.confidences,
          methods: urlState.methods,
          showSingleplayer: urlState.showSingleplayer,
          showMultiplayer: urlState.showMultiplayer,
          showZombies: urlState.showZombies,
        },
        selection: requestedSelection,
        sidebarListMode: urlState.sidebarListMode === "campaigns" && requestedGame
          ? "campaigns"
          : "locations",
        campaignLevelId: urlState.sidebarListMode === "campaigns" && requestedGame && requestedSelection
          ? requestedSelection.entry.levelId
          : null,
      });
      setReady(true);
    };

    applyUrl();
    window.addEventListener("popstate", applyUrl);
    return () => window.removeEventListener("popstate", applyUrl);
  }, [dataIndex, onApplyUrlState]);

  useEffect(() => {
    if (!ready) return;
    const nextUrl = serializeAtlasUrlState(window.location.href, {
      query: filters.query,
      gameId: dataIndex.findGameByCode(filters.game)?.id ?? "all",
      country: filters.country,
      series: [...filters.gameSeries],
      subseries: [...filters.gameSubseries],
      continents: [...filters.continents],
      precisions: [...filters.precisions],
      confidences: [...filters.confidences],
      methods: [...filters.methods],
      showSingleplayer: filters.showSingleplayer,
      showMultiplayer: filters.showMultiplayer,
      showZombies: filters.showZombies,
      sidebarListMode,
      levelId: selectionInUrl ? selected.entry.levelId : null,
      locationId: selectionInUrl ? selected.entry.locationId : null,
    });
    const currentRelativeUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const nextRelativeUrl = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
    if (nextRelativeUrl !== currentRelativeUrl) {
      const method = nextHistoryMode.current === "replace" ? "replaceState" : "pushState";
      window.history[method](window.history.state, "", nextRelativeUrl);
    }
    nextHistoryMode.current = "push";
  }, [
    dataIndex,
    filters.confidences,
    filters.continents,
    filters.country,
    filters.game,
    filters.gameSeries,
    filters.gameSubseries,
    filters.methods,
    filters.precisions,
    filters.query,
    filters.showMultiplayer,
    filters.showSingleplayer,
    filters.showZombies,
    ready,
    selected.entry.levelId,
    selected.entry.locationId,
    selectionInUrl,
    sidebarListMode,
  ]);

  return { setNextHistoryMode, prepareSearchUpdate, finishSearchUpdate };
}
