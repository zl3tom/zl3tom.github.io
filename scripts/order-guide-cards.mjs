import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const files = [path.join(pub, "guides.html"), path.join(pub, "guides", "index.html")];
const newSlugs = [
  "amateur-radio-slang-73-88-qth-qso-qsl",
  "amateur-radio-callsigns-explained",
  "digital-radio-hotspots-pistar-wpsd"
];

for (const file of files) {
  let html = await readFile(file, "utf8");
  const moved = [];

  for (const slug of newSlugs) {
    const re = new RegExp(`<a href="/guides/${slug}" class="guide-card">[\\s\\S]*?<\\/a>`, "g");
    const match = html.match(re)?.[0];
    if (!match) throw new Error(`Could not find guide card for ${slug} in ${file}`);
    moved.push(match);
    html = html.replace(re, "");
  }

  const anchorRe = /<a href="\/guides\/peanut-amateur-radio-app" class="guide-card">[\s\S]*?<\/a>/;
  const anchor = html.match(anchorRe)?.[0];
  if (!anchor) throw new Error(`Could not find guide 23 (Peanut) in ${file}`);

  html = html.replace(anchorRe, `${anchor}\n${moved.join("\n")}`);
  await writeFile(file, html);
}

console.log("Guide cards 24, 25 and 26 are now directly after guide 23 in the main guide grid.");
