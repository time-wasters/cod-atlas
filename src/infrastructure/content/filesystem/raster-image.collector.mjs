import { lstat, readdir } from "node:fs/promises";
import path from "node:path";

const rasterExtensions = new Set([".jpeg", ".jpg", ".png", ".webp"]);

async function rasterFilesBelow(filename, files) {
  const stats = await lstat(filename);
  if (stats.isSymbolicLink()) {
    throw new Error(`Symbolic links are not accepted below the image root: ${filename}`);
  }
  if (stats.isFile()) {
    if (rasterExtensions.has(path.extname(filename).toLowerCase())) files.add(filename);
    return;
  }

  const entries = await readdir(filename, { withFileTypes: true });
  for (const entry of entries) {
    const child = path.join(filename, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Symbolic links are not accepted below the image root: ${child}`);
    }
    if (entry.isDirectory() || entry.isFile()) await rasterFilesBelow(child, files);
  }
}

export async function collectRasterImageFiles(scopes) {
  const files = new Set();
  for (const scope of scopes) await rasterFilesBelow(scope, files);
  return [...files].sort((left, right) => left.localeCompare(right));
}
