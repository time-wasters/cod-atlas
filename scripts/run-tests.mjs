import { spawn } from "node:child_process";
import { access, copyFile, cp, mkdir, mkdtemp, readdir, rm, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const fixtureRoot = fileURLToPath(new URL("../test-fixtures/compiled-atlas/", import.meta.url));
const compilerPath = fileURLToPath(new URL("./build-atlas-data.mjs", import.meta.url));
const testsRoot = path.join(projectRoot, "tests");
const generatedDataDirectory = path.join(projectRoot, "app/data");
const generatedFilenames = [
  "atlas.generated.json",
  "history-overlays.generated.json",
  "map-overlays.generated.json",
];

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit",
      ...options,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} exited with ${signal ? `signal ${signal}` : `code ${code}`}`));
    });
  });
}

async function exists(filename) {
  try {
    await access(filename);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

const temporaryRoot = await mkdtemp(path.join(tmpdir(), "cod-atlas-tests-"));
const fixtureWorkspace = path.join(temporaryRoot, "fixture");
const fixtureDataDirectory = path.join(fixtureWorkspace, "app/data");
const backupDataDirectory = path.join(temporaryRoot, "generated-data-backup");
const backedUpFilenames = new Set();
let dataSnapshotComplete = false;

async function stageFixtureData() {
  await mkdir(generatedDataDirectory, { recursive: true });
  await mkdir(backupDataDirectory, { recursive: true });
  for (const filename of generatedFilenames) {
    const workspaceFile = path.join(generatedDataDirectory, filename);
    if (await exists(workspaceFile)) {
      await copyFile(workspaceFile, path.join(backupDataDirectory, filename));
      backedUpFilenames.add(filename);
    }
  }
  dataSnapshotComplete = true;
  for (const filename of generatedFilenames) {
    const workspaceFile = path.join(generatedDataDirectory, filename);
    await copyFile(path.join(fixtureDataDirectory, filename), workspaceFile);
  }
}

async function restoreGeneratedData() {
  if (!dataSnapshotComplete) return;
  for (const filename of generatedFilenames) {
    const workspaceFile = path.join(generatedDataDirectory, filename);
    if (backedUpFilenames.has(filename)) {
      await copyFile(path.join(backupDataDirectory, filename), workspaceFile);
    } else {
      try {
        await unlink(workspaceFile);
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
    }
  }
}

try {
  await cp(fixtureRoot, fixtureWorkspace, { recursive: true });
  await run(process.execPath, [compilerPath], { cwd: fixtureWorkspace });
  await stageFixtureData();
  console.log("Building hosted-render test worker from compiled atlas fixtures...");
  await run("bash", [path.join(projectRoot, "scripts/build-verified.sh")]);

  // The hosted worker has embedded the fixture data. Restore production data
  // for the focused source-data regression tests that run in the same suite.
  await restoreGeneratedData();
  await run(process.execPath, [compilerPath]);

  const testFiles = (await readdir(testsRoot))
    .filter((filename) => filename.endsWith(".test.mjs"))
    .sort()
    .map((filename) => path.join(testsRoot, filename));
  await run(process.execPath, ["--test", ...testFiles]);
} finally {
  try {
    await restoreGeneratedData();
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}
