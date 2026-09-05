import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "cardnft1", "index.html");
const outputDir = path.join(root, "poncho");
const outputPath = path.join(outputDir, "index.html");

const source = await readFile(sourcePath, "utf8");
const page = source
  .replace('data-collection-id="cardnft1"', 'data-collection-id="poncho"')
  .replace(
    "../cardnft-data.js?v=cardnft1-1",
    "../poncho-data.js?v=poncho-4",
  )
  .replaceAll("Card NFT viewer", "Poncho Drifella viewer")
  .replaceAll("Rotatable Card NFT", "Rotatable Poncho Drifella card")
  .replaceAll("Card NFT gallery", "Poncho Drifella gallery")
  .replaceAll("3D Card NFT binder", "3D Poncho Drifella binder");

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, page);
console.log(`Created ${path.relative(root, outputPath)} from cardnft1/index.html.`);
