import { importGameIcons } from "../../../application/media/use-cases/import-game-icons.mjs";

export async function runGameIconImportCommand() {
  const result = await importGameIcons();
  if (!result.enabled) {
    console.log("External game icon import skipped; STEAM_ICON_URL and STEAMGRIDDB_ICON_URL are not configured.");
    return;
  }
  for (const failure of result.failures) {
    console.warn(`External icon unavailable: ${failure.gameId} ${failure.provider} ${failure.kind}: ${failure.message}`);
  }
  console.log(
    `Imported ${result.imported} external game icons; reused ${result.cached} cached${result.failed ? `; ${result.failed} unavailable` : ""}.`,
  );
}
