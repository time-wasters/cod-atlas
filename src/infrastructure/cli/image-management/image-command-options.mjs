export function parseImageCommandOptions(argv) {
  const [command, ...rawArguments] = argv;
  if (command !== "prepare" && command !== "check") {
    throw new Error("Expected `prepare` or `check` as the first argument.");
  }

  let dryRun = false;
  let strict = false;
  const targets = [];
  for (const argument of rawArguments) {
    if (argument === "--") continue;
    if (argument === "--dry-run") {
      if (command !== "prepare") throw new Error("--dry-run is only available for image preparation.");
      dryRun = true;
      continue;
    }
    if (argument === "--strict") {
      if (command !== "check") throw new Error("--strict is only available for image checks.");
      strict = true;
      continue;
    }
    if (argument.startsWith("--")) throw new Error(`Unknown option: ${argument}`);
    targets.push(argument);
  }

  return { command, dryRun, strict, targets };
}
