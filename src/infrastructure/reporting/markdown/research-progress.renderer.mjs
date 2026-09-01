import { calculateResearchCoverage } from "../../../application/progress-report/use-cases/calculate-research-coverage.mjs";
import { calculatePercentage } from "../../../shared/utils/calculate-percentage.mjs";
import { escapeMarkdownTableCell } from "./markdown-table-cell.formatter.mjs";
import {
  researchProgressEnd,
  researchProgressStart,
} from "./progress-report-markers.constants.mjs";

function coverageCell({ researched, total }) {
  if (total === 0) return "—";
  return `${researched} / ${total} (${calculatePercentage(researched, total)}%)`;
}

function remainingCell({ remaining, total }) {
  if (total === 0) return "—";
  return `${remaining} / ${total} (${calculatePercentage(remaining, total)}%)`;
}

export function renderResearchProgress({ games, levels }) {
  const singleplayer = levels.filter((level) => level.mode === "singleplayer");
  const multiplayer = levels.filter((level) => level.mode === "multiplayer");
  const zombies = levels.filter((level) => level.mode === "zombies");
  const summaries = [
    ["All currently catalogued levels", calculateResearchCoverage(levels)],
    ["Campaign levels", calculateResearchCoverage(singleplayer)],
    ["Multiplayer maps", calculateResearchCoverage(multiplayer)],
    ["Zombies maps", calculateResearchCoverage(zombies)],
  ];

  const lines = [
    researchProgressStart,
    "| Scope | Researched | Remaining |",
    "| --- | ---: | ---: |",
    ...summaries.map(([label, result]) => (
      `| ${label} | ${coverageCell(result)} | ${remainingCell(result)} |`
    )),
    "",
    "| Game | Campaign | Multiplayer | Zombies | Overall |",
    "| --- | ---: | ---: | ---: | ---: |",
  ];

  const gameRows = [...games.values()]
    .filter((game) => levels.some((level) => level.gameId === game.id))
    .sort((a, b) => a.released.localeCompare(b.released) || a.label.localeCompare(b.label));

  for (const game of gameRows) {
    const gameLevels = levels.filter((level) => level.gameId === game.id);
    const campaignCoverage = calculateResearchCoverage(
      gameLevels.filter((level) => level.mode === "singleplayer"),
    );
    const multiplayerCoverage = calculateResearchCoverage(
      gameLevels.filter((level) => level.mode === "multiplayer"),
    );
    const zombiesCoverage = calculateResearchCoverage(
      gameLevels.filter((level) => level.mode === "zombies"),
    );
    lines.push([
      `| ${escapeMarkdownTableCell(game.label)}`,
      coverageCell(campaignCoverage),
      coverageCell(multiplayerCoverage),
      coverageCell(zombiesCoverage),
      `${coverageCell(calculateResearchCoverage(gameLevels))} |`,
    ].join(" | "));
  }

  lines.push(researchProgressEnd);
  return lines.join("\n");
}
