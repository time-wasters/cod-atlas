import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

export async function writeGameIconManifest(outputRoot, manifest) {
  await mkdir(outputRoot, { recursive: true });
  const filename = path.join(outputRoot, "manifest.json");
  const temporary = `${filename}.tmp-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`);
  await rename(temporary, filename);
}
