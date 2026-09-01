import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export async function loadGameFileRecords(contentRoot) {
  const filenames = (await readdir(contentRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".yaml"))
    .map((entry) => path.join(contentRoot, entry.name))
    .sort();
  return Promise.all(filenames.map(async (filename) => ({
    filename,
    game: YAML.parse(await readFile(filename, "utf8")),
  })));
}
