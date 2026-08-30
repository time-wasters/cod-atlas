import path from "node:path";
import { validateLevelImage } from "../../../domain/level/level-image.policy.mjs";
import { classifyLevelImagePath } from "../../../domain/level/level-image-role.value-object.mjs";
import { readRasterImageFile } from "../../../infrastructure/content/filesystem/raster-image-file.repository.mjs";

export async function checkLevelImages(files, { sharp, read = readRasterImageFile }) {
  const results = [];
  for (const filename of files) {
    try {
      const input = await read(filename);
      const metadata = await sharp(input, { failOn: "error" }).metadata();
      const validation = validateLevelImage({
        filename,
        size: input.length,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
      });
      results.push({ filename, ...validation });
    } catch (error) {
      results.push({
        filename,
        kind: classifyLevelImagePath(filename),
        errors: [`image could not be decoded: ${error.message}`],
        warnings: [],
      });
    }
  }

  const rasterMainFilesByDirectory = new Map();
  for (const result of results.filter((entry) => entry.kind === "main")) {
    const directory = path.dirname(result.filename);
    const matches = rasterMainFilesByDirectory.get(directory) ?? [];
    matches.push(result);
    rasterMainFilesByDirectory.set(directory, matches);
  }
  for (const matches of rasterMainFilesByDirectory.values()) {
    if (matches.length <= 1) continue;
    const names = matches.map((entry) => path.basename(entry.filename)).join(", ");
    matches[0].errors.push(`level directory has multiple raster main files: ${names}`);
  }
  return results;
}
