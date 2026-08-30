import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { runWikiImportCommand } from "../src/infrastructure/cli/wiki-import/run-wiki-import.command.mjs";
import {
  formatWikiConfigurationError,
  WikiConfigurationError,
} from "../src/infrastructure/external/call-of-duty-wiki/wiki-configuration.mjs";

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runWikiImportCommand(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof WikiConfigurationError ? formatWikiConfigurationError(error) : error.stack ?? error);
    process.exitCode = 1;
  });
}
