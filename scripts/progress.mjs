#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { runProgressCommand } from "../src/infrastructure/cli/progress-report/run-progress.command.mjs";

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await runProgressCommand(process.argv.slice(2));
}
