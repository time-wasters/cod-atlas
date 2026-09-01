import { lstat, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { randomUUID } from "node:crypto";

export async function readRasterImageFile(filename) {
  return readFile(filename);
}

export async function rasterImageFileExists(filename) {
  try {
    await lstat(filename);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

export async function writeOptimizedImageCandidate(source, candidate) {
  const destination = candidate.filename;
  const temporary = path.join(
    path.dirname(destination),
    `.${path.basename(destination)}.${process.pid}.${randomUUID()}.tmp`,
  );
  await writeFile(temporary, candidate.buffer, { flag: "wx" });
  try {
    await rename(temporary, destination);
    if (source !== destination) {
      try {
        await unlink(source);
      } catch (error) {
        await unlink(destination);
        throw error;
      }
    }
  } catch (error) {
    if (await rasterImageFileExists(temporary)) await unlink(temporary);
    throw error;
  }
}
