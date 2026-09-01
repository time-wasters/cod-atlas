import path from "node:path";
import process from "node:process";
import { updateProgressReport } from "../../../application/progress-report/use-cases/update-progress-report.mjs";
import { calculatePercentage } from "../../../shared/utils/calculate-percentage.mjs";
import { loadProgressData } from "../../content/filesystem/progress-data.loader.mjs";
import {
  readProgressDocument,
  writeProgressDocument,
} from "../../content/filesystem/progress-document.repository.mjs";
import { renderProgressDocument } from "../../reporting/markdown/progress-document.renderer.mjs";

export async function runProgressCommand(argv, root = process.cwd()) {
  if (argv.length > 0) throw new Error(`Unknown argument: ${argv[0]}`);
  const progressPath = path.join(root, "docs/progress.md");
  const result = await updateProgressReport({
    loadProgressData: () => loadProgressData({
      levelsRoot: path.join(root, "content/levels"),
      gamesRoot: path.join(root, "content/games"),
    }),
    readProgressDocument: () => readProgressDocument(progressPath),
    renderProgressDocument,
    writeProgressDocument: (document) => writeProgressDocument(progressPath, document),
  });

  console.log(
    `Research coverage: ${result.research.researched}/${result.research.total} canonical levels (${calculatePercentage(result.research.researched, result.research.total)}%).`,
  );
  console.log(
    `Geographic localization: ${result.localization.localized}/${result.localization.terrestrial} terrestrial marker locations (${calculatePercentage(result.localization.localized, result.localization.terrestrial)}%).`,
  );
  console.log(
    `Human verification: ${result.verification.locations.verified}/${result.verification.locations.total} marker locations and ${result.verification.research.verified}/${result.verification.research.total} canonical level research notes.`,
  );
  return result;
}
