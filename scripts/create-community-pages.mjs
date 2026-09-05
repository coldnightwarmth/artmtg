import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { COMMUNITY_COLLECTIONS } from "./community-collections.mjs";

const root = process.cwd();
const sourcePath = path.join(root, "cardnft1", "index.html");
const source = await readFile(sourcePath, "utf8");
const dataRevisions = Object.freeze({
  cloudcastle: "community-3",
  badhand: "community-2",
  badhand2: "community-1",
  jpegs: "community-7",
  nolegs: "community-5",
  playcards: "community-2",
  kardmane: "community-2",
  cloudcastles: "community-5",
  sweetcurse: "community-5",
  winloop: "community-5",
  mtgnft: "community-5",
  igorsquest: "community-5",
  limited: "community-8",
});
const requiredTemplateValues = [
  'data-collection-id="cardnft1"',
  "<title>cards.art</title>",
  "../cardnft.png",
  "../cardnft-data.js?v=cardnft1-1",
  "Card NFT",
];
for (const value of requiredTemplateValues) {
  if (!source.includes(value)) {
    throw new Error(`Community page template is missing ${JSON.stringify(value)}`);
  }
}

for (const collection of COMMUNITY_COLLECTIONS) {
  const outputDir = path.join(root, collection.route);
  const outputPath = path.join(outputDir, "index.html");
  const dataUrl = `../${collection.id}-data.js?v=${dataRevisions[collection.id]}`;
  const page = source
    .replace('data-collection-id="cardnft1"', `data-collection-id="${collection.id}"`)
    .replace("../cardnft-data.js?v=cardnft1-1", dataUrl)
    .replaceAll("Card NFT", collection.label);

  const expectedValues = [
    `data-collection-id="${collection.id}"`,
    "<title>cards.art</title>",
    'type="image/png" href="../cardnft.png"',
    'rel="apple-touch-icon" href="../cardnft.png"',
    `rel="modulepreload" href="${dataUrl}"`,
    `aria-label="3D ${collection.label} viewer"`,
    `aria-label="Rotatable ${collection.label}"`,
    `aria-label="${collection.label} gallery"`,
    `aria-label="3D ${collection.label} binder"`,
  ];
  for (const value of expectedValues) {
    if (!page.includes(value)) {
      throw new Error(
        `Generated ${collection.route}/index.html is missing ${JSON.stringify(value)}`,
      );
    }
  }
  if (
    page.includes('data-collection-id="cardnft1"')
    || page.includes("<title>card nft binder</title>")
    || page.includes("../cardnft-data.js?v=cardnft1-1")
    || page.includes("Card NFT")
  ) {
    throw new Error(`Generated ${collection.route}/index.html retained template values`);
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, page);
  console.log(`Created ${path.relative(root, outputPath)}.`);
}
