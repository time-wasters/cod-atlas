export const MAX_GAME_ICON_BYTES = 5 * 1024 * 1024;

export function detectGameIconImageType(buffer) {
  if (buffer.length >= 4 && buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") return "png";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length >= 4
    && buffer[0] === 0x00
    && buffer[1] === 0x00
    && buffer[2] === 0x01
    && buffer[3] === 0x00) return "ico";
  if (buffer.length >= 12
    && buffer.toString("ascii", 0, 4) === "RIFF"
    && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

export function isReusableGameIcon(buffer, expectedExtension) {
  return buffer.length > 0
    && buffer.length <= MAX_GAME_ICON_BYTES
    && detectGameIconImageType(buffer) === expectedExtension;
}

export function validateDownloadedGameIcon(buffer, expectedExtension, description) {
  if (buffer.length === 0 || buffer.length > MAX_GAME_ICON_BYTES) {
    throw new Error(`${description}: downloaded icon is empty or exceeds 5 MiB`);
  }
  const imageType = detectGameIconImageType(buffer);
  if (!imageType) throw new Error(`${description}: downloaded image is not supported`);
  if (imageType !== expectedExtension) {
    throw new Error(`${description}: downloaded ${imageType} does not match .${expectedExtension} output`);
  }
}
