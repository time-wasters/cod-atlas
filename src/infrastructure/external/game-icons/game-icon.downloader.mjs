import path from "node:path";
import {
  readGameIconFile,
  writeGameIconFile,
} from "../../media/game-icons/game-icon-file.repository.mjs";
import {
  isReusableGameIcon,
  MAX_GAME_ICON_BYTES,
  validateDownloadedGameIcon,
} from "../../media/game-icons/game-icon-image.policy.mjs";

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

export async function downloadGameIcon(request, outputRoot, fetchImplementation) {
  const expectedExtension = path.extname(request.relativePath).slice(1).replace("jpeg", "jpg");
  const cached = await readGameIconFile(outputRoot, request.relativePath);
  if (cached && isReusableGameIcon(cached, expectedExtension)) {
    return { publicPath: `/images/games_external/${request.relativePath}`, cached: true };
  }

  const response = await fetchImplementation(request.url, { redirect: "follow" });
  const description = `${request.gameId}: ${request.provider} ${request.kind}`;
  requireValue(response.ok, `${description} returned HTTP ${response.status}`);
  const declaredLength = Number(response.headers.get("content-length"));
  requireValue(
    !Number.isFinite(declaredLength) || declaredLength <= MAX_GAME_ICON_BYTES,
    `${request.gameId}: downloaded icon exceeds 5 MiB`,
  );
  const buffer = Buffer.from(await response.arrayBuffer());
  validateDownloadedGameIcon(buffer, expectedExtension, request.gameId);
  await writeGameIconFile(outputRoot, request.relativePath, buffer);
  return { publicPath: `/images/games_external/${request.relativePath}`, cached: false };
}
