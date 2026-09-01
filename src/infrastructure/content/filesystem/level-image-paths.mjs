import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
export const levelImagesRoot = path.join(repositoryRoot, "public/images/levels");

export function displayRepositoryPath(filename) {
  return path.relative(repositoryRoot, filename).replaceAll("\\", "/");
}
