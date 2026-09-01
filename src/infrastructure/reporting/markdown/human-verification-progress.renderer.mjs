import { calculateVerificationCoverage } from "../../../application/progress-report/use-cases/calculate-verification-coverage.mjs";
import { calculatePercentage } from "../../../shared/utils/calculate-percentage.mjs";
import { escapeMarkdownTableCell } from "./markdown-table-cell.formatter.mjs";
import {
  humanVerificationProgressEnd,
  humanVerificationProgressStart,
} from "./progress-report-markers.constants.mjs";

function coverageCell({ verified, total }) {
  if (total === 0) return "—";
  return `${verified} / ${total} (${calculatePercentage(verified, total)}%)`;
}

export function renderHumanVerificationProgress({ games, levels }) {
  const summaries = [
    ["All currently catalogued records", levels],
    ["Campaign records", levels.filter((level) => level.mode === "singleplayer")],
    ["Multiplayer records", levels.filter((level) => level.mode === "multiplayer")],
    ["Zombies records", levels.filter((level) => level.mode === "zombies")],
  ];
  const lines = [
    humanVerificationProgressStart,
    "| Scope | Marker locations verified | Research notes verified |",
    "| --- | ---: | ---: |",
    ...summaries.map(([label, scopedLevels]) => {
      const coverage = calculateVerificationCoverage(scopedLevels);
      return `| ${label} | ${coverageCell(coverage.locations)} | ${coverageCell(coverage.research)} |`;
    }),
    "",
    "| Game | Marker locations verified | Research notes verified |",
    "| --- | ---: | ---: |",
  ];

  const gameRows = [...games.values()]
    .filter((game) => levels.some((level) => level.gameId === game.id))
    .sort((a, b) => a.released.localeCompare(b.released) || a.label.localeCompare(b.label));

  for (const game of gameRows) {
    const coverage = calculateVerificationCoverage(
      levels.filter((level) => level.gameId === game.id),
    );
    lines.push(
      `| ${escapeMarkdownTableCell(game.label)} | ${coverageCell(coverage.locations)} | ${coverageCell(coverage.research)} |`,
    );
  }

  lines.push(humanVerificationProgressEnd);
  return lines.join("\n");
}
