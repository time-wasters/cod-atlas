import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export async function readGameIconFile(outputRoot, relativePath) {
  const filename = path.join(outputRoot, ...relativePath.split("/"));
  try {
    return await readFile(filename);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

export async function writeGameIconFile(outputRoot, relativePath, buffer) {
  const filename = path.join(outputRoot, ...relativePath.split("/"));
  await mkdir(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.tmp-${process.pid}`;
  await writeFile(temporary, buffer);
  await rename(temporary, filename);
}
