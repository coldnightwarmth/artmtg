import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "pages-dist");
await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  build({
    entryPoints: [path.join(root, "src", "index.js")],
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    outfile: path.join(outputDirectory, "_worker.js"),
    sourcemap: false,
  }),
  copyFile(
    path.join(root, "pages-static", "index.html"),
    path.join(outputDirectory, "index.html"),
  ),
]);

console.log("Built the Cloudflare Pages wallet service.");
