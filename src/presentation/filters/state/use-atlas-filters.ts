"use client";

import { useCallback, useMemo, useState } from "react";
import { APP_DEFAULTS_CONFIG } from "../../../shared/config/app-defaults.config.js";
import { selectGamesForTemplate, type GameTemplate } from "../../../application/game-catalog/use-cases/select-games-for-template.js";

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
  games: string[] | "all" | null;
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
  games: Parameters<typeof selectGamesForTemplate>[0];
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
  const defaultGames = useMemo(() => selectGamesForTemplate(options.games, {
    series: new Set(), subseries: new Set(APP_DEFAULTS_CONFIG.gameTemplate.subseries), developers: new Set(),
  }), [options.games]);
  // null selects every available game; an empty set deliberately selects none.
  const [gameSelection, setGameSelection] = useState<Set<string> | null>(() => new Set(defaultGames));
  const allGames = useMemo(() => new Set(options.games.map((game) => game.code)), [options.games]);
  const selectedGames = gameSelection ?? allGames;
  const game = gameSelection?.size === 1 ? [...gameSelection][0] : "all";
  const [country, setCountry] = useState("all");
  const [gameSeries, setGameSeries] = useState<Set<string>>(() => new Set());
  const [gameSubseries, setGameSubseries] = useState<Set<string>>(() => new Set(APP_DEFAULTS_CONFIG.gameTemplate.subseries));
  const [developers, setDevelopers] = useState<Set<string>>(() => new Set());
  const [continents, setContinents] = useState<Set<string>>(() => new Set());
  const [precisions, setPrecisions] = useState<Set<string>>(() => new Set());
  const [confidences, setConfidences] = useState<Set<string>>(() => new Set());
  const [methods, setMethods] = useState<Set<string>>(() => new Set());
  const [showSingleplayer, setShowSingleplayer] = useState(APP_DEFAULTS_CONFIG.filters.showSingleplayer);
  const [showMultiplayer, setShowMultiplayer] = useState(APP_DEFAULTS_CONFIG.filters.showMultiplayer);
  const [showZombies, setShowZombies] = useState(APP_DEFAULTS_CONFIG.filters.showZombies);
  const [showOther, setShowOther] = useState(APP_DEFAULTS_CONFIG.filters.showOther);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(APP_DEFAULTS_CONFIG.panels.advancedFiltersOpen);
  const [openAdvancedFilterDropdown, setOpenAdvancedFilterDropdown] = useState<AdvancedFilterGroupId | null>(null);

  const applyUrlState = useCallback((state: AtlasFilterUrlState) => {
    setQuery(state.query);
    const template = {
      series: new Set(state.gameSeries.filter((value) => options.gameSeriesValues.has(value))),
      subseries: new Set(state.gameSubseries.filter((value) => options.gameSubseriesValues.has(value))),
      developers: new Set(state.developers.filter((value) => options.developerValues.has(value))),
    };
    if (state.games === null && template.series.size + template.subseries.size + template.developers.size === 0) {
      template.subseries = new Set(APP_DEFAULTS_CONFIG.gameTemplate.subseries);
    }
    const hasTemplate = template.series.size + template.subseries.size + template.developers.size > 0;
    setGameSelection(state.games === "all" ? null : state.games !== null ? new Set(state.games)
      : hasTemplate ? selectGamesForTemplate(options.games, template) : new Set(defaultGames));
    setCountry(state.country);
    setGameSeries(template.series);
    setGameSubseries(template.subseries);
    setDevelopers(template.developers);
    setContinents(new Set(state.continents.filter((value) => options.continentValues.has(value))));
    setPrecisions(new Set(state.precisions.filter((value) => options.precisionValues.has(value))));
    setConfidences(new Set(state.confidences.filter((value) => options.confidenceValues.has(value))));
    setMethods(new Set(state.methods.filter((value) => options.methodValues.has(value))));
    setShowSingleplayer(state.showSingleplayer);
    setShowMultiplayer(state.showMultiplayer);
    setShowZombies(state.showZombies);
    setShowOther(state.showOther);
  }, [defaultGames, options]);

  const applyGameTemplate = (template: GameTemplate) => {
    setGameSeries(new Set(template.series));
    setGameSubseries(new Set(template.subseries));
    setDevelopers(new Set(template.developers));
    setGameSelection(selectGamesForTemplate(options.games, template));
  };

  const setAdvancedFilterDropdownOpen = useCallback((id: AdvancedFilterGroupId, open: boolean) => {
    setOpenAdvancedFilterDropdown((current) => open ? id : current === id ? null : current);
  }, []);
  const openAdvancedFilters = useCallback(() => setAdvancedFiltersOpen(true), []);
  const closeAdvancedFilters = useCallback(() => {
    setAdvancedFiltersOpen(false);
    setOpenAdvancedFilterDropdown(null);
  }, []);
  const selectAllGames = useCallback(() => {
    setGameSelection(null);
    setGameSeries(new Set());
    setGameSubseries(new Set());
    setDevelopers(new Set());
  }, []);
  const resetGameFilters = useCallback(() => {
    setGameSelection(new Set(defaultGames));
    setGameSeries(new Set());
    setGameSubseries(new Set(APP_DEFAULTS_CONFIG.gameTemplate.subseries));
    setDevelopers(new Set());
  }, [defaultGames]);
  const resetAdvancedFilters = useCallback(() => {
    setContinents(new Set());
    setPrecisions(new Set());
    setConfidences(new Set());
    setMethods(new Set());
  }, []);

  return {
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
    advancedFiltersOpen,
    openAdvancedFilterDropdown,
    gameTemplateActive: gameSeries.size + gameSubseries.size + developers.size > 0,
    canResetGameFilters: gameSeries.size > 0 || developers.size > 0
      || gameSubseries.size !== APP_DEFAULTS_CONFIG.gameTemplate.subseries.length
      || !APP_DEFAULTS_CONFIG.gameTemplate.subseries.every((value) => gameSubseries.has(value))
      || selectedGames.size !== defaultGames.size || [...selectedGames].some((value) => !defaultGames.has(value)),
    gameFilterCount: selectedGames.size,
    advancedFilterCount: continents.size
      + precisions.size
      + confidences.size
      + methods.size,
    setQuery,
    setGame: (value: string) => {
      if (value === "all") selectAllGames();
      else setGameSelection(new Set([value]));
    },
    toggleGame: (value: string) => setGameSelection((current) => toggledValue(current ?? allGames, value)),
    resetGameFilters,
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
    toggleGameSeries: (value: string) => applyGameTemplate({ series: toggledValue(gameSeries, value), subseries: gameSubseries, developers }),
    clearGameSeries: () => applyGameTemplate({ series: new Set(), subseries: gameSubseries, developers }),
    toggleGameSubseries: (value: string) => applyGameTemplate({ series: gameSeries, subseries: toggledValue(gameSubseries, value), developers }),
    clearGameSubseries: () => applyGameTemplate({ series: gameSeries, subseries: new Set(), developers }),
    toggleDeveloper: (value: string) => applyGameTemplate({ series: gameSeries, subseries: gameSubseries, developers: toggledValue(developers, value) }),
    clearDevelopers: () => applyGameTemplate({ series: gameSeries, subseries: gameSubseries, developers: new Set() }),
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
