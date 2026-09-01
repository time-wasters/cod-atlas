import { formatBytes } from "../../shared/utils/format-bytes.mjs";
import { classifyLevelImagePath } from "./level-image-role.value-object.mjs";

export const levelImagePolicies = Object.freeze({
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

function extensionFormat(filename) {
  const basename = filename.replaceAll("\\", "/").split("/").at(-1) ?? filename;
  const dot = basename.lastIndexOf(".");
  const extension = dot < 0 ? "" : basename.slice(dot).toLowerCase();
  return extension === ".jpg" || extension === ".jpeg" ? "jpeg" : extension.slice(1);
}

export function validateLevelImage({ filename, size, format, width, height }) {
  const kind = classifyLevelImagePath(filename);
  const policy = levelImagePolicies[kind];
  const errors = [];
  const warnings = [];
  const normalizedFormat = format === "jpg" ? "jpeg" : format;
  const declaredFormat = extensionFormat(filename);

  if (!policy.formats.includes(normalizedFormat)) {
    errors.push(`${kind} images must use ${policy.formats.join(" or ")}; found ${normalizedFormat || "unknown"}`);
  }
  if (kind === "main" && filename.toLowerCase().endsWith(".jpeg")) {
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
