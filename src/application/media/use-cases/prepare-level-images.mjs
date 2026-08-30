import { validateLevelImage } from "../../../domain/level/level-image.policy.mjs";
import {
  rasterImageFileExists,
  readRasterImageFile,
  writeOptimizedImageCandidate,
} from "../../../infrastructure/content/filesystem/raster-image-file.repository.mjs";
import { optimizeLevelImageCandidate } from "../../../infrastructure/media/sharp/level-image-candidate.optimizer.mjs";

export async function prepareLevelImages(files, { sharp, dryRun = false }) {
  const results = [];
  for (const filename of files) {
    const input = await readRasterImageFile(filename);
    const metadata = await sharp(input, { failOn: "error" }).metadata();
    const sourceValidation = validateLevelImage({
      filename,
      size: input.length,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
    });
    const formatErrors = sourceValidation.errors.filter((message) =>
      message.includes("must use") || message.includes("extension declares"));
    if (formatErrors.length > 0) throw new Error(`${filename}: ${formatErrors.join("; ")}`);

    const candidate = await optimizeLevelImageCandidate(filename, input, metadata, sharp);
    const changed = candidate.filename !== filename || !candidate.buffer.equals(input);
    if (changed && candidate.filename !== filename && (await rasterImageFileExists(candidate.filename))) {
      throw new Error(`Refusing to replace existing conversion target: ${candidate.filename}`);
    }
    if (changed && !dryRun) await writeOptimizedImageCandidate(filename, candidate);
    results.push({
      source: filename,
      destination: candidate.filename,
      beforeBytes: input.length,
      afterBytes: candidate.buffer.length,
      changed,
      dryRun,
    });
  }
  return results;
}
