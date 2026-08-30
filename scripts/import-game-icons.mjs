import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { runGameIconImportCommand } from "../src/infrastructure/cli/game-icon-import/run-game-icon-import.command.mjs";

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runGameIconImportCommand().catch((error) => {
    console.error(`Game icon import failed: ${error.message}`);
    process.exitCode = 1;
  });
}
