#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { imageCommandUsage } from "../src/infrastructure/cli/image-management/image-command-usage.mjs";
import { runImageManagementCommand } from "../src/infrastructure/cli/image-management/run-image-management.command.mjs";

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runImageManagementCommand(process.argv.slice(2)).catch((error) => {
    console.error(`Image command failed: ${error.message}`);
    console.error(imageCommandUsage());
    process.exitCode = 1;
  });
}
