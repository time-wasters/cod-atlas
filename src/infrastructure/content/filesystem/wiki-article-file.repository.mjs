import { readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export async function loadWikiArticleFileRecords(directory) {
  const filenames = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
  return Promise.all(filenames.map(async (name) => {
    const filename = path.join(directory, name);
    return { filename, article: JSON.parse(await readFile(filename, "utf8")) };
  }));
}

export async function writeWikiArticleFile(filename, value) {
  const temporary = `${filename}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, filename);
}
