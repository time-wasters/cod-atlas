import { readdir } from "node:fs/promises";
import path from "node:path";

export async function collectContentFiles(directory, suffix) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectContentFiles(target, suffix);
    return entry.name.endsWith(suffix) ? [target] : [];
  }));
  return nestedFiles.flat();
}
