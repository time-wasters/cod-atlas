import type { AtlasDataDto } from "../../../infrastructure/atlas-data/dto/atlas-data.dto.js";
import type { GameDto } from "../../../infrastructure/atlas-data/dto/game.dto.js";
import type {
  FilterHoverDetail,
  FilterOption,
} from "../components/advanced-filter-dropdown.js";

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

function valuesFor(options: FilterOption[]) {
  return new Set(options.map((option) => option.value));
}

function gameDetails(
  options: FilterOption[],
  games: GameDto[],
  descriptionFor: (value: string) => string,
  matches: (game: GameDto, value: string) => boolean,
) {
  return new Map<string, FilterHoverDetail>(options.map((option) => {
    const matchingGames = games
      .filter((game) => matches(game, option.value))
      .sort((left, right) => left.released.localeCompare(right.released));
    const firstYear = matchingGames[0]?.released.slice(0, 4) ?? "Unknown";
    const lastYear = matchingGames.at(-1)?.released.slice(0, 4) ?? firstYear;
    return [option.value, {
      label: option.label,
      description: descriptionFor(option.value),
      years: firstYear === lastYear ? firstYear : `${firstYear}\u2013${lastYear}`,
      games: matchingGames.map((game) => ({ label: game.label, year: game.released.slice(0, 4) })),
    }];
  }));
}

export function buildAtlasFilterCatalog(data: AtlasDataDto) {
  const continentOptions: FilterOption[] = [...new Set(data.groups.map((group) => group.continent))]
    .sort((left, right) => continentOrder.indexOf(left) - continentOrder.indexOf(right) || left.localeCompare(right))
    .map((value) => ({ value, label: value }));
  const gameSeriesDetails = gameDetails(
    gameSeriesOptions,
    data.games,
    (value) => gameSeriesDescriptions[value as GameDto["series"]],
    (game, value) => game.series === value,
  );
  const gameSubseriesDetails = gameDetails(
    gameSubseriesOptions,
    data.games,
    (value) => gameSubseriesDescriptions[value as Exclude<GameDto["subseries"], null>],
    (game, value) => game.subseries === value,
  );

  return {
    atlasFilterValueSets: {
      gameSeriesValues: valuesFor(gameSeriesOptions),
      gameSubseriesValues: valuesFor(gameSubseriesOptions),
      continentValues: valuesFor(continentOptions),
      precisionValues: valuesFor(precisionOptions),
      confidenceValues: valuesFor(confidenceOptions),
      methodValues: valuesFor(methodOptions),
    },
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

export type AtlasFilterCatalog = ReturnType<typeof buildAtlasFilterCatalog>;
