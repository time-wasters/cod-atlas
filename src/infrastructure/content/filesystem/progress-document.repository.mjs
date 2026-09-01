import { readFile, writeFile } from "node:fs/promises";

export function readProgressDocument(filename) {
  return readFile(filename, "utf8");
}

export function writeProgressDocument(filename, document) {
  return writeFile(filename, document);
}
