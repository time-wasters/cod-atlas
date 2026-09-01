import { lstat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { levelImagesRoot } from "./level-image-paths.mjs";

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === ""
    || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

export async function resolveImageScopes(targets, { mediaRoot = levelImagesRoot, cwd = process.cwd() } = {}) {
  const requested = targets.length === 0 ? [mediaRoot] : targets;
  const resolved = [];
  for (const target of requested) {
    const candidate = path.resolve(cwd, target);
    if (!isWithin(mediaRoot, candidate)) {
      throw new Error(`Image path must remain below ${mediaRoot}: ${target}`);
    }
    const stats = await lstat(candidate);
    if (stats.isSymbolicLink()) throw new Error(`Symbolic links are not accepted as image scopes: ${target}`);
    if (!stats.isDirectory() && !stats.isFile()) {
      throw new Error(`Image path is neither a file nor a directory: ${target}`);
    }
    resolved.push(candidate);
  }
  return [...new Set(resolved)].sort((left, right) => left.localeCompare(right));
}
