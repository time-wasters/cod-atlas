export function parseProgressCommandOptions(argv) {
  const unknownArgument = argv.find((argument) => argument !== "--check");
  if (unknownArgument) throw new Error(`Unknown argument: ${unknownArgument}`);
  return { checkOnly: argv.includes("--check") };
}
