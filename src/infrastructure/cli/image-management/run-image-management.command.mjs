import process from "node:process";
import { checkLevelImages } from "../../../application/media/use-cases/check-level-images.mjs";
import { prepareLevelImages } from "../../../application/media/use-cases/prepare-level-images.mjs";
import { formatBytes } from "../../../shared/utils/format-bytes.mjs";
import { resolveImageScopes } from "../../content/filesystem/image-scope.resolver.mjs";
import { displayRepositoryPath } from "../../content/filesystem/level-image-paths.mjs";
import { collectRasterImageFiles } from "../../content/filesystem/raster-image.collector.mjs";
import { loadSharp } from "../../media/sharp/sharp.loader.mjs";
import { parseImageCommandOptions } from "./image-command-options.mjs";

export async function runImageManagementCommand(argv) {
  const options = parseImageCommandOptions(argv);
  const scopes = await resolveImageScopes(options.targets);
  const files = await collectRasterImageFiles(scopes);
  if (files.length === 0) {
    throw new Error("No supported PNG, JPEG, or WebP images were found in the selected scope.");
  }
  const sharp = await loadSharp();

  if (options.command === "prepare") {
    const results = await prepareLevelImages(files, { sharp, dryRun: options.dryRun });
    let changed = 0;
    let savedBytes = 0;
    for (const result of results) {
      if (!result.changed) continue;
      changed += 1;
      savedBytes += result.beforeBytes - result.afterBytes;
      const action = result.dryRun ? "would optimize" : "optimized";
      const destination = result.destination === result.source
        ? ""
        : ` -> ${displayRepositoryPath(result.destination)}`;
      console.log(
        `${action}: ${displayRepositoryPath(result.source)}${destination} (${formatBytes(result.beforeBytes)} -> ${formatBytes(result.afterBytes)})`,
      );
    }
    const sizeSummary = savedBytes >= 0
      ? `${formatBytes(savedBytes)} saved`
      : `${formatBytes(Math.abs(savedBytes))} added after resizing`;
    console.log(
      `${options.dryRun ? "Dry run: " : ""}${changed} of ${results.length} image(s) ${options.dryRun ? "would change" : "changed"}; ${sizeSummary}.`,
    );
    return;
  }

  const results = await checkLevelImages(files, { sharp });
  let errorCount = 0;
  let warningCount = 0;
  for (const result of results) {
    for (const message of result.errors) {
      errorCount += 1;
      console.error(`error: ${displayRepositoryPath(result.filename)}: ${message}`);
    }
    for (const message of result.warnings) {
      warningCount += 1;
      console.warn(`warning: ${displayRepositoryPath(result.filename)}: ${message}`);
    }
  }
  console.log(`Checked ${results.length} image(s): ${errorCount} error(s), ${warningCount} recommendation(s).`);
  if (errorCount > 0 || (options.strict && warningCount > 0)) process.exitCode = 1;
}
