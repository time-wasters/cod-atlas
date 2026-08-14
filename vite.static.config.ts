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
  if (typeof data?.id !== "string" || !data.id) throw new Error(`${filename}: level id is required`);
  return { levelId: data.id, source: match[2].trim() };
}

async function levelRouteEntries() {
  return Promise.all((await filesBelow(levelsRoot)).map(async (filename) => {
    const level = markdownDocument(await readFile(filename, "utf8"), filename);
    return {
      filename,
      ...level,
    };
  }));
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
