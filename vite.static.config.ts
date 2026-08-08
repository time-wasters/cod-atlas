import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: path.resolve("static"),
  base: "./",
  publicDir: path.resolve("public"),
  plugins: [react()],
  build: {
    outDir: path.resolve("dist-static"),
    emptyOutDir: true,
  },
});
