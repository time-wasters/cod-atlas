import path from "node:path";
import { readFile, readdir } from "node:fs/promises";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import YAML from "yaml";

const levelsRoot = path.resolve("content/levels");

async function filesBelow(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(target) : entry.name.endsWith(".md") ? [target] : [];
  }))).flat();
}

function markdownDocument(source: string, filename: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: missing YAML frontmatter`);
  const data = YAML.parse(match[1]);
  return { data, source: match[2].trim() };
}

async function levelRouteEntries() {
  const documents = await Promise.all((await filesBelow(levelsRoot)).map(async (filename) => ({
    filename,
    ...markdownDocument(await readFile(filename, "utf8"), filename),
  })));
  const canonicalById = new Map(documents
    .filter((document) => !document.filename.endsWith(".ref.md"))
    .map((document) => [document.data?.id, document]));
  const mediaBaseForDocument = (document: { filename: string }) => path
    .relative(levelsRoot, document.filename)
    .replaceAll("\\", "/")
    .replace(/\.md$/, "");
  const notesSource = (source: string, mediaBase: string) => source.replace(
    /(!\[[^\]]*\]\()([^)/][^)]*)(\))/g,
    (_match, opening, target, closing) => `${opening}/images/levels/${mediaBase}/extra/${target}${closing}`,
  );
  return documents.flatMap((document) => {
    if (!document.filename.endsWith(".ref.md")) {
      if (typeof document.data?.id !== "string" || !document.data.id) {
        throw new Error(`${document.filename}: level id is required`);
      }
      const gameId = document.data.games?.[0];
      if (typeof gameId !== "string" || !document.data.id.startsWith(`${gameId}-`)) {
        throw new Error(`${document.filename}: owner game is required`);
      }
      return [{
        filename: document.filename,
        levelId: document.data.id,
        source: notesSource(document.source, mediaBaseForDocument(document)),
      }];
    }
    if (!document.source) return [];
    if (typeof document.data?.level !== "string" || !document.data.level) {
      throw new Error(`${document.filename}: canonical level reference is required`);
    }
    const appearanceGameId = path.relative(levelsRoot, document.filename).split(path.sep)[0];
    const canonical = canonicalById.get(document.data.level);
    if (!canonical) throw new Error(`${document.filename}: unknown canonical level ${document.data.level}`);
    const ownerGameId = canonical.data.games?.[0];
    if (typeof ownerGameId !== "string") throw new Error(`${canonical.filename}: owner game is required`);
    const appearanceNotes = notesSource(document.source, mediaBaseForDocument(document));
    const canonicalNotes = notesSource(canonical.source, mediaBaseForDocument(canonical));
    return [{
      filename: document.filename,
      levelId: `${document.data.level}--${appearanceGameId}`,
      source: [appearanceNotes, canonicalNotes].filter(Boolean).join("\n\n"),
    }];
  });
}

function levelMarkdownRoutes() {
  return {
    name: "level-markdown-routes",
    configureServer(server: { middlewares: { use: (handler: (request: { url?: string }, response: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body?: string) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use(async (request, response, next) => {
        const match = request.url?.split("?", 1)[0].match(/^\/level-notes\/([a-z0-9-]+)\.md$/);
        if (!match) return next();
        try {
          const level = (await levelRouteEntries()).find((entry) => entry.levelId === match[1]);
          if (!level) throw new Error("Unknown level");
          response.setHeader("Content-Type", "text/markdown; charset=utf-8");
          response.end(level.source);
        } catch {
          response.statusCode = 404;
          response.end("Level notes not found");
        }
      });
    },
    async generateBundle(this: { emitFile: (file: { type: "asset"; fileName: string; source: string }) => void }) {
      for (const level of await levelRouteEntries()) {
        this.emitFile({
          type: "asset",
          fileName: `level-notes/${level.levelId}.md`,
          source: level.source,
        });
      }
    },
  };
}

export default defineConfig({
  root: path.resolve("static"),
  base: "./",
  publicDir: path.resolve("public"),
  plugins: [react(), levelMarkdownRoutes()],
  build: {
    outDir: path.resolve("dist-static"),
    emptyOutDir: true,
  },
});
