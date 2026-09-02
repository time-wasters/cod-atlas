import { calculateLocalizationCoverage } from "../../../application/progress-report/use-cases/calculate-localization-coverage.mjs";
import { collectLevelLocations } from "../../../application/progress-report/use-cases/collect-level-locations.mjs";
import { levelLocationPrecisionOrder } from "../../../domain/level/level-location-precision.value-object.mjs";
import { calculatePercentage } from "../../../shared/utils/calculate-percentage.mjs";
import { escapeMarkdownTableCell } from "./markdown-table-cell.formatter.mjs";
import {
  localizationProgressEnd,
  localizationProgressStart,
} from "./progress-report-markers.constants.mjs";

function localizationCell({ localized, terrestrial }) {
  if (terrestrial === 0) return "—";
  return `${localized} / ${terrestrial} (${calculatePercentage(localized, terrestrial)}%)`;
}

function fallbackCell({ countryFallback, terrestrial }) {
  if (terrestrial === 0) return "—";
  return `${countryFallback} / ${terrestrial} (${calculatePercentage(countryFallback, terrestrial)}%)`;
}

export function renderLocalizationProgress({ games, levels }) {
  const locations = collectLevelLocations(levels);
  const singleplayer = locations.filter((location) => location.mode === "singleplayer");
  const multiplayer = locations.filter((location) => location.mode === "multiplayer");
  const specialOps = locations.filter((location) => location.mode === "special-ops");
  const zombies = locations.filter((location) => location.mode === "zombies");
  const summaries = [
    ["All marker locations", calculateLocalizationCoverage(locations)],
    ["Campaign marker locations", calculateLocalizationCoverage(singleplayer)],
    ["Multiplayer marker locations", calculateLocalizationCoverage(multiplayer)],
    ["Special Ops marker locations", calculateLocalizationCoverage(specialOps)],
    ["Zombies marker locations", calculateLocalizationCoverage(zombies)],
  ];
  const lines = [
    localizationProgressStart,
    "| Scope | Localized | Country fallback | Off-world |",
    "| --- | ---: | ---: | ---: |",
    ...summaries.map(([label, result]) => (
      `| ${label} | ${localizationCell(result)} | ${fallbackCell(result)} | ${result.offWorld} |`
    )),
    "",
    "| Precision | Marker locations | Share of all markers |",
    "| --- | ---: | ---: |",
    ...levelLocationPrecisionOrder.map((precision) => {
      const count = locations.filter((location) => location.precision === precision).length;
      const label = precision === "off-world"
        ? "Off-world"
        : `${precision[0].toUpperCase()}${precision.slice(1)}`;
      return `| ${label} | ${count} | ${calculatePercentage(count, locations.length)}% |`;
    }),
    "",
    "| Game | Campaign | Multiplayer | Special Ops | Zombies | Overall |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
  ];

  const gameRows = [...games.values()]
    .filter((game) => locations.some((location) => location.gameId === game.id))
    .sort((a, b) => a.released.localeCompare(b.released) || a.label.localeCompare(b.label));
  for (const game of gameRows) {
    const gameLocations = locations.filter((location) => location.gameId === game.id);
    lines.push([
      `| ${escapeMarkdownTableCell(game.label)}`,
      localizationCell(calculateLocalizationCoverage(
        gameLocations.filter((location) => location.mode === "singleplayer"),
      )),
      localizationCell(calculateLocalizationCoverage(
        gameLocations.filter((location) => location.mode === "multiplayer"),
      )),
      localizationCell(calculateLocalizationCoverage(
        gameLocations.filter((location) => location.mode === "special-ops"),
      )),
      localizationCell(calculateLocalizationCoverage(
        gameLocations.filter((location) => location.mode === "zombies"),
      )),
      `${localizationCell(calculateLocalizationCoverage(gameLocations))} |`,
    ].join(" | "));
  }

  lines.push(localizationProgressEnd);
  return lines.join("\n");
}
