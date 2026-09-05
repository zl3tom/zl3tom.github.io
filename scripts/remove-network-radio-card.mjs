import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");

for (const relative of ["radio-fun.html", path.join("radio-fun", "index.html")]) {
  const file = path.join(publicRoot, relative);
  let html = await readFile(file, "utf8");
  html = html.replace(/<div class="activity-chip"><strong>Network Radios<\/strong><span><a href="https:\/\/networkradios\.weebly\.com\/"[^>]*>Internet-linked radio community ↗<\/a><\/span><\/div>/g, "");
  await writeFile(file, html);
}

console.log("Removed the standalone Network Radios card from Radio Fun; the Network Radios link remains under Zello and in the full guide.");
