import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import YAML from "yaml";
import { selectWikiArticleIdsForGames } from "../../../application/wiki-import/use-cases/select-wiki-article-ids-for-games.mjs";

async function filesBelow(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesBelow(target, extension);
    return entry.name.endsWith(extension) ? [target] : [];
  }));
  return nested.flat();
}

function frontmatter(text, filename) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${filename}: missing YAML frontmatter`);
  return YAML.parse(match[1]);
}

export async function loadWikiArticleIdsForGames(gameIds) {
  const contentRoot = path.join(process.cwd(), "content");
  const gameFilenames = await filesBelow(path.join(contentRoot, "games"), ".yaml");
  const knownGameIds = new Set(await Promise.all(gameFilenames.map(async (filename) =>
    YAML.parse(await readFile(filename, "utf8")).id)));
  const unknownGameIds = [...new Set(gameIds)].filter((gameId) => !knownGameIds.has(gameId));
  if (unknownGameIds.length) throw new Error(`Unknown game IDs: ${unknownGameIds.join(", ")}`);

  const levelFilenames = await filesBelow(path.join(contentRoot, "levels"), ".md");
  const levels = await Promise.all(levelFilenames.map(async (filename) => ({
    ...frontmatter(await readFile(filename, "utf8"), filename),
    ...(filename.endsWith(".ref.md") ? {
      appearanceGame: path.relative(path.join(contentRoot, "levels"), filename).split(path.sep)[0],
    } : {}),
  })));
  return selectWikiArticleIdsForGames(levels, gameIds);
}
