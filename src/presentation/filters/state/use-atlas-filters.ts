"use client";

import { useCallback, useState } from "react";

export type AdvancedFilterGroupId =
  | "game-series"
  | "game-subseries"
  | "developer"
  | "continent"
  | "precision"
  | "confidence"
  | "method";

export type AtlasFilterUrlState = {
  query: string;
  game: string;
  country: string;
  gameSeries: string[];
  gameSubseries: string[];
  developers: string[];
  continents: string[];
  precisions: string[];
  confidences: string[];
  methods: string[];
  showSingleplayer: boolean;
  showMultiplayer: boolean;
  showZombies: boolean;
  showOther: boolean;
};

type UseAtlasFiltersOptions = {
  gameSeriesValues: ReadonlySet<string>;
  gameSubseriesValues: ReadonlySet<string>;
  developerValues: ReadonlySet<string>;
  continentValues: ReadonlySet<string>;
  precisionValues: ReadonlySet<string>;
  confidenceValues: ReadonlySet<string>;
  methodValues: ReadonlySet<string>;
};

function toggledValue(current: Set<string>, value: string) {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function useAtlasFilters(options: UseAtlasFiltersOptions) {
  const [query, setQuery] = useState("");
  const [game, setGame] = useState("all");
  const [country, setCountry] = useState("all");
  const [gameSeries, setGameSeries] = useState<Set<string>>(() => new Set());
  const [gameSubseries, setGameSubseries] = useState<Set<string>>(() => new Set());
  const [developers, setDevelopers] = useState<Set<string>>(() => new Set());
  const [continents, setContinents] = useState<Set<string>>(() => new Set());
  const [precisions, setPrecisions] = useState<Set<string>>(() => new Set());
  const [confidences, setConfidences] = useState<Set<string>>(() => new Set());
  const [methods, setMethods] = useState<Set<string>>(() => new Set());
  const [showSingleplayer, setShowSingleplayer] = useState(true);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [showZombies, setShowZombies] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [openAdvancedFilterDropdown, setOpenAdvancedFilterDropdown] = useState<AdvancedFilterGroupId | null>(null);

  const applyUrlState = useCallback((state: AtlasFilterUrlState) => {
    setQuery(state.query);
    setGame(state.game);
    setCountry(state.country);
    setGameSeries(new Set(state.gameSeries.filter((value) => options.gameSeriesValues.has(value))));
    setGameSubseries(new Set(state.gameSubseries.filter((value) => options.gameSubseriesValues.has(value))));
    setDevelopers(new Set(state.developers.filter((value) => options.developerValues.has(value))));
    setContinents(new Set(state.continents.filter((value) => options.continentValues.has(value))));
    setPrecisions(new Set(state.precisions.filter((value) => options.precisionValues.has(value))));
    setConfidences(new Set(state.confidences.filter((value) => options.confidenceValues.has(value))));
    setMethods(new Set(state.methods.filter((value) => options.methodValues.has(value))));
    setShowSingleplayer(state.showSingleplayer);
    setShowMultiplayer(state.showMultiplayer);
    setShowZombies(state.showZombies);
    setShowOther(state.showOther);
  }, [options]);

  const setAdvancedFilterDropdownOpen = useCallback((id: AdvancedFilterGroupId, open: boolean) => {
    setOpenAdvancedFilterDropdown((current) => open ? id : current === id ? null : current);
  }, []);
  const openAdvancedFilters = useCallback(() => setAdvancedFiltersOpen(true), []);
  const closeAdvancedFilters = useCallback(() => {
    setAdvancedFiltersOpen(false);
    setOpenAdvancedFilterDropdown(null);
  }, []);
  const resetAdvancedFilters = useCallback(() => {
    setGameSeries(new Set());
    setGameSubseries(new Set());
    setDevelopers(new Set());
    setContinents(new Set());
    setPrecisions(new Set());
    setConfidences(new Set());
    setMethods(new Set());
  }, []);

  return {
    query,
    game,
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
    advancedFiltersOpen,
    openAdvancedFilterDropdown,
    advancedFilterCount: gameSeries.size
      + gameSubseries.size
      + developers.size
      + continents.size
      + precisions.size
      + confidences.size
      + methods.size,
    setQuery,
    setGame,
    setCountry,
    setShowSingleplayer,
    setShowMultiplayer,
    setShowZombies,
    setShowOther,
    applyUrlState,
    setAdvancedFilterDropdownOpen,
    openAdvancedFilters,
    closeAdvancedFilters,
    resetAdvancedFilters,
    toggleGameSeries: (value: string) => setGameSeries((current) => toggledValue(current, value)),
    clearGameSeries: () => setGameSeries(new Set()),
    toggleGameSubseries: (value: string) => setGameSubseries((current) => toggledValue(current, value)),
    clearGameSubseries: () => setGameSubseries(new Set()),
    toggleDeveloper: (value: string) => setDevelopers((current) => toggledValue(current, value)),
    clearDevelopers: () => setDevelopers(new Set()),
    toggleContinent: (value: string) => setContinents((current) => toggledValue(current, value)),
    clearContinents: () => setContinents(new Set()),
    togglePrecision: (value: string) => setPrecisions((current) => toggledValue(current, value)),
    clearPrecisions: () => setPrecisions(new Set()),
    toggleConfidence: (value: string) => setConfidences((current) => toggledValue(current, value)),
    clearConfidences: () => setConfidences(new Set()),
    toggleMethod: (value: string) => setMethods((current) => toggledValue(current, value)),
    clearMethods: () => setMethods(new Set()),
  };
}
