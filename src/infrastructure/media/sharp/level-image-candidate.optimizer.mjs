import path from "node:path";
import { levelImagePolicies } from "../../../domain/level/level-image.policy.mjs";
import { classifyLevelImagePath } from "../../../domain/level/level-image-role.value-object.mjs";

const jpegMinimumSavingsRatio = 0.1;

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
  return candidates.reduce((smallest, candidate) =>
    (candidate.buffer.length < smallest.buffer.length ? candidate : smallest));
}

export async function optimizeLevelImageCandidate(filename, input, metadata, sharp) {
  const kind = classifyLevelImagePath(filename);
  const policy = levelImagePolicies[kind];
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
