export function classifyLevelImagePath(filename) {
  const relative = filename.replaceAll("\\", "/").toLowerCase();
  const basename = relative.split("/").at(-1) ?? relative;
  if (/^main\.(?:jpe?g|png|webp)$/.test(basename)) return "main";
  if (relative.endsWith("/maps/overlay.png") || relative === "maps/overlay.png") return "overlay";
  return "other";
}
