import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "index.html");
const outputPath = path.join(root, "404.html");
const source = await readFile(sourcePath, "utf8");

if (!source.includes('data-collection-id="cardnft2"')) {
  throw new Error("Root page is not the Card NFT 2 binder shell");
}

const page = source
  .replace(
    "  <head>\n",
    "  <head>\n    <base href=\"/\">\n    <meta name=\"robots\" content=\"noindex, nofollow\">\n    <meta name=\"referrer\" content=\"no-referrer\">\n",
  );

if (!page.includes('<base href="/">') || !page.includes('id="walletConnectButton"')) {
  throw new Error("Wallet route shell is missing required routing or wallet controls");
}

await writeFile(outputPath, page);
console.log(`Created ${path.relative(root, outputPath)} from index.html.`);
