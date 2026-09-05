import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const files = [
  "guides-network-radios-explained.html",
  path.join("guides", "network-radios-explained", "index.html")
];

const heading = "<h2>Good operating</h2>";
const addition = `<h2>Using QSO One with internet-linked radio</h2><p>If you want to explore amateur-radio systems from a phone or other supported device, also see my <a href="/guides/qso-one-guide"><strong>QSO One Guide</strong></a>. It explains how to get started with QSO One and use its supported linked-radio features.</p>`;

for (const relative of files) {
  const file = path.join(pub, relative);
  let html = await readFile(file, "utf8");
  if (!html.includes('/guides/qso-one-guide')) {
    html = html.replace(heading, `${addition}${heading}`);
  }
  await writeFile(file, html);
}

console.log("Linked the Network Radios guide to the ZL3TOM QSO One guide.");
