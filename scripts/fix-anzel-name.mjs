import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");

const files = [
  "radio-fun.html",
  path.join("radio-fun", "index.html"),
  "guides-internet-linked-radio-networks.html",
  path.join("guides", "internet-linked-radio-networks", "index.html"),
  "guides.html",
  path.join("guides", "index.html")
];

for (const relative of files) {
  const file = path.join(publicRoot, relative);
  let html = await readFile(file, "utf8");
  html = html
    .replaceAll("ANZ3L NETWORK", "ANZEL RADIO")
    .replaceAll("ANZEL / ANZ3L Multimode Network", "ANZEL Radio Multimode Network")
    .replaceAll("ANZEL / ANZ3L network", "ANZEL Radio network")
    .replaceAll("ANZEL / ANZ3L", "ANZEL Radio")
    .replaceAll("ANZ3L network", "ANZEL Radio");
  await writeFile(file, html);
}

console.log("Corrected all displayed ANZEL network naming to ANZEL RADIO.");
