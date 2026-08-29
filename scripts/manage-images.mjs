#!/usr/bin/env node

import { lstat, readdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const levelImagesRoot = path.join(repositoryRoot, "public/images/levels");

const rasterExtensions = new Set([".jpeg", ".jpg", ".png", ".webp"]);
const jpegMinimumSavingsRatio = 0.1;

export const imagePolicies = Object.freeze({
  main: Object.freeze({
    formats: Object.freeze(["jpeg", "png"]),
    maxBytes: 1 * 1024 * 1024,
    recommendedBytes: 512 * 1024,
    maxEdge: 2560,
  }),
  overlay: Object.freeze({
    formats: Object.freeze(["png"]),
    maxBytes: 3 * 1024 * 1024,
    recommendedBytes: 1 * 1024 * 1024,
    maxEdge: 4096,
  }),
  other: Object.freeze({
    formats: Object.freeze(["jpeg", "png", "webp"]),
    maxBytes: 2 * 1024 * 1024,
    recommendedBytes: 1 * 1024 * 1024,
    maxEdge: 4096,
  }),
});

function normalizedPath(filename) {
  return filename.replaceAll("\\", "/");
}

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function extensionFormat(filename) {
  const extension = path.extname(filename).toLowerCase();
  return extension === ".jpg" || extension === ".jpeg" ? "jpeg" : extension.slice(1);
}

export function classifyImagePath(filename) {
  const relative = normalizedPath(filename).toLowerCase();
  const basename = path.posix.basename(relative);
  if (/^main\.(?:jpe?g|png|webp)$/.test(basename)) {
    return "main";
  }
  if (relative.endsWith("/maps/overlay.png") || relative === "maps/overlay.png") {
    return "overlay";
  }
  return "other";
}

export function validateImageRecord({ filename, size, format, width, height }) {
  const kind = classifyImagePath(filename);
  const policy = imagePolicies[kind];
  const errors = [];
  const warnings = [];
  const normalizedFormat = format === "jpg" ? "jpeg" : format;
  const declaredFormat = extensionFormat(filename);

  if (!policy.formats.includes(normalizedFormat)) {
    errors.push(`${kind} images must use ${policy.formats.join(" or ")}; found ${normalizedFormat || "unknown"}`);
  }
  if (kind === "main" && path.extname(filename).toLowerCase() === ".jpeg") {
    errors.push("main JPEG images must use the .jpg extension so the atlas build can discover them");
  }
  if (declaredFormat !== normalizedFormat) {
    errors.push(`file extension declares ${declaredFormat || "an unknown format"}, but the image is ${normalizedFormat || "unknown"}`);
  }
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    errors.push("image dimensions could not be read");
  } else if (Math.max(width, height) > policy.maxEdge) {
    errors.push(`longest edge is ${Math.max(width, height)} px; maximum is ${policy.maxEdge} px`);
  }
  if (!Number.isInteger(size) || size <= 0) {
    errors.push("file is empty or its size could not be read");
  } else if (size > policy.maxBytes) {
    errors.push(`file is ${formatBytes(size)}; maximum is ${formatBytes(policy.maxBytes)}`);
  } else if (size > policy.recommendedBytes) {
    warnings.push(`file is ${formatBytes(size)}; recommended maximum is ${formatBytes(policy.recommendedBytes)}`);
  }

  return { kind, errors, warnings };
}

export function parseImageArguments(argv) {
  const [command, ...rawArguments] = argv;
  if (command !== "prepare" && command !== "check") {
    throw new Error("Expected `prepare` or `check` as the first argument.");
  }

  let dryRun = false;
  let strict = false;
  const targets = [];
  for (const argument of rawArguments) {
    if (argument === "--") continue;
    if (argument === "--dry-run") {
      if (command !== "prepare") throw new Error("--dry-run is only available for image preparation.");
      dryRun = true;
      continue;
    }
    if (argument === "--strict") {
      if (command !== "check") throw new Error("--strict is only available for image checks.");
      strict = true;
      continue;
    }
    if (argument.startsWith("--")) throw new Error(`Unknown option: ${argument}`);
    targets.push(argument);
  }

  if (command === "prepare" && targets.length === 0) {
    throw new Error("Image preparation requires at least one explicit file or directory below public/images/levels.");
  }

  return { command, dryRun, strict, targets };
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
    if (!stats.isDirectory() && !stats.isFile()) throw new Error(`Image path is neither a file nor a directory: ${target}`);
    resolved.push(candidate);
  }
  return [...new Set(resolved)].sort((left, right) => left.localeCompare(right));
}

async function rasterFilesBelow(filename, files) {
  const stats = await lstat(filename);
  if (stats.isSymbolicLink()) throw new Error(`Symbolic links are not accepted below the image root: ${filename}`);
  if (stats.isFile()) {
    if (rasterExtensions.has(path.extname(filename).toLowerCase())) files.add(filename);
    return;
  }

  const entries = await readdir(filename, { withFileTypes: true });
  for (const entry of entries) {
    const child = path.join(filename, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symbolic links are not accepted below the image root: ${child}`);
    if (entry.isDirectory() || entry.isFile()) await rasterFilesBelow(child, files);
  }
}

export async function collectRasterFiles(scopes) {
  const files = new Set();
  for (const scope of scopes) await rasterFilesBelow(scope, files);
  return [...files].sort((left, right) => left.localeCompare(right));
}

async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch (error) {
    throw new Error("The image commands require the Sharp dependency. Run `npm ci` or rebuild the tooling container.", {
      cause: error,
    });
  }
}

export async function checkImages(files, { sharp, read = readFile }) {
  const results = [];
  for (const filename of files) {
    try {
      const input = await read(filename);
      const metadata = await sharp(input, { failOn: "error" }).metadata();
      const validation = validateImageRecord({
        filename,
        size: input.length,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
      });
      results.push({ filename, ...validation });
    } catch (error) {
      results.push({
        filename,
        kind: classifyImagePath(filename),
        errors: [`image could not be decoded: ${error.message}`],
        warnings: [],
      });
    }
  }

  const rasterMainFilesByDirectory = new Map();
  for (const result of results.filter((entry) => entry.kind === "main")) {
    const directory = path.dirname(result.filename);
    const matches = rasterMainFilesByDirectory.get(directory) ?? [];
    matches.push(result);
    rasterMainFilesByDirectory.set(directory, matches);
  }
  for (const matches of rasterMainFilesByDirectory.values()) {
    if (matches.length <= 1) continue;
    const names = matches.map((entry) => path.basename(entry.filename)).join(", ");
    matches[0].errors.push(`level directory has multiple raster main files: ${names}`);
  }
  return results;
}

function resizePipeline(sharp, input, maxEdge, shouldResize) {
  let pipeline = sharp(input, { failOn: "error" }).rotate();
  if (shouldResize) {
    pipeline = pipeline.resize({
      width: maxEdge,
      height: maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  return pipeline;
}

async function pngCandidate(sharp, input, maxEdge, shouldResize, palette) {
  const options = palette
    ? { compressionLevel: 9, adaptiveFiltering: true, palette: true, quality: 92, effort: 10, dither: 0.5 }
    : { compressionLevel: 9, adaptiveFiltering: true, effort: 10 };
  return resizePipeline(sharp, input, maxEdge, shouldResize).png(options).toBuffer();
}

async function jpegCandidate(sharp, input, maxEdge, shouldResize) {
  return resizePipeline(sharp, input, maxEdge, shouldResize)
    .jpeg({ quality: 85, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toBuffer();
}

async function webpCandidate(sharp, input, maxEdge, shouldResize) {
  return resizePipeline(sharp, input, maxEdge, shouldResize).webp({ quality: 85, effort: 6 }).toBuffer();
}

function smallestCandidate(candidates) {
  return candidates.reduce((smallest, candidate) => (candidate.buffer.length < smallest.buffer.length ? candidate : smallest));
}

async function optimizedCandidate(filename, input, metadata, sharp) {
  const kind = classifyImagePath(filename);
  const policy = imagePolicies[kind];
  const inputFormat = metadata.format === "jpg" ? "jpeg" : metadata.format;
  const shouldResize = Math.max(metadata.width ?? 0, metadata.height ?? 0) > policy.maxEdge;
  const original = { filename, buffer: input, format: inputFormat };
  const sameFormatCandidates = shouldResize ? [] : [original];

  if (inputFormat === "png") {
    sameFormatCandidates.push({
      filename,
      buffer: await pngCandidate(sharp, input, policy.maxEdge, shouldResize, kind === "overlay"),
      format: "png",
    });
  } else if (inputFormat === "jpeg") {
    sameFormatCandidates.push({
      filename,
      buffer: await jpegCandidate(sharp, input, policy.maxEdge, shouldResize),
      format: "jpeg",
    });
  } else if (inputFormat === "webp") {
    sameFormatCandidates.push({
      filename,
      buffer: await webpCandidate(sharp, input, policy.maxEdge, shouldResize),
      format: "webp",
    });
  } else {
    throw new Error(`Unsupported source image format: ${inputFormat || "unknown"}`);
  }

  const bestSameFormat = smallestCandidate(sameFormatCandidates);
  if (kind !== "main" || inputFormat !== "png" || metadata.hasAlpha) return bestSameFormat;

  const jpeg = {
    filename: path.join(path.dirname(filename), "main.jpg"),
    buffer: await jpegCandidate(sharp, input, policy.maxEdge, shouldResize),
    format: "jpeg",
  };
  const savingRatio = 1 - jpeg.buffer.length / bestSameFormat.buffer.length;
  return savingRatio >= jpegMinimumSavingsRatio ? jpeg : bestSameFormat;
}

async function pathExists(filename) {
  try {
    await lstat(filename);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function safelyWriteCandidate(source, candidate) {
  const destination = candidate.filename;
  const temporary = path.join(path.dirname(destination), `.${path.basename(destination)}.${process.pid}.${randomUUID()}.tmp`);
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
    if (await pathExists(temporary)) await unlink(temporary);
    throw error;
  }
}

export async function prepareImages(files, { sharp, dryRun = false }) {
  const results = [];
  for (const filename of files) {
    const input = await readFile(filename);
    const metadata = await sharp(input, { failOn: "error" }).metadata();
    const sourceValidation = validateImageRecord({
      filename,
      size: input.length,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
    });
    const formatErrors = sourceValidation.errors.filter((message) => message.includes("must use") || message.includes("extension declares"));
    if (formatErrors.length > 0) throw new Error(`${filename}: ${formatErrors.join("; ")}`);

    const candidate = await optimizedCandidate(filename, input, metadata, sharp);
    const changed = candidate.filename !== filename || !candidate.buffer.equals(input);
    if (changed && candidate.filename !== filename && (await pathExists(candidate.filename))) {
      throw new Error(`Refusing to replace existing conversion target: ${candidate.filename}`);
    }
    if (changed && !dryRun) await safelyWriteCandidate(filename, candidate);
    results.push({
      source: filename,
      destination: candidate.filename,
      beforeBytes: input.length,
      afterBytes: candidate.buffer.length,
      changed,
      dryRun,
    });
  }
  return results;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

function displayPath(filename) {
  return normalizedPath(path.relative(repositoryRoot, filename));
}

function printUsage() {
  console.error("Usage:");
  console.error("  npm run images:prepare -- [--dry-run] <file-or-directory> [...]");
  console.error("  npm run images:check -- [--strict] [file-or-directory ...]");
}

async function main() {
  const options = parseImageArguments(process.argv.slice(2));
  const scopes = await resolveImageScopes(options.targets);
  const files = await collectRasterFiles(scopes);
  if (files.length === 0) throw new Error("No supported PNG, JPEG, or WebP images were found in the selected scope.");
  const sharp = await loadSharp();

  if (options.command === "prepare") {
    const results = await prepareImages(files, { sharp, dryRun: options.dryRun });
    let changed = 0;
    let savedBytes = 0;
    for (const result of results) {
      if (!result.changed) continue;
      changed += 1;
      savedBytes += result.beforeBytes - result.afterBytes;
      const action = result.dryRun ? "would optimize" : "optimized";
      const destination = result.destination === result.source ? "" : ` -> ${displayPath(result.destination)}`;
      console.log(`${action}: ${displayPath(result.source)}${destination} (${formatBytes(result.beforeBytes)} -> ${formatBytes(result.afterBytes)})`);
    }
    const sizeSummary = savedBytes >= 0
      ? `${formatBytes(savedBytes)} saved`
      : `${formatBytes(Math.abs(savedBytes))} added after resizing`;
    console.log(`${options.dryRun ? "Dry run: " : ""}${changed} of ${results.length} image(s) ${options.dryRun ? "would change" : "changed"}; ${sizeSummary}.`);
    return;
  }

  const results = await checkImages(files, { sharp });
  let errorCount = 0;
  let warningCount = 0;
  for (const result of results) {
    for (const message of result.errors) {
      errorCount += 1;
      console.error(`error: ${displayPath(result.filename)}: ${message}`);
    }
    for (const message of result.warnings) {
      warningCount += 1;
      console.warn(`warning: ${displayPath(result.filename)}: ${message}`);
    }
  }
  console.log(`Checked ${results.length} image(s): ${errorCount} error(s), ${warningCount} recommendation(s).`);
  if (errorCount > 0 || (options.strict && warningCount > 0)) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`Image command failed: ${error.message}`);
    printUsage();
    process.exitCode = 1;
  });
}
