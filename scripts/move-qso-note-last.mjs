import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  path.join(root, "public", "tools.html"),
  path.join(root, "public", "tools", "index.html")
];

for (const file of files) {
  let html = await readFile(file, "utf8");
  const start = html.indexOf('<section class="tool-card tool-wide"><h2>QSO Note Generator</h2>');
  if (start === -1) throw new Error(`QSO Note Generator not found in ${file}`);

  const end = html.indexOf('</section>', start);
  if (end === -1) throw new Error(`Could not find end of QSO Note Generator in ${file}`);

  const section = html.slice(start, end + '</section>'.length);
  html = html.slice(0, start) + html.slice(end + '</section>'.length);

  const marker = '</div><p class="tool-note" style="margin-top:1.5rem">';
  if (!html.includes(marker)) throw new Error(`Could not find tools-grid closing marker in ${file}`);

  html = html.replace(marker, section + marker);
  await writeFile(file, html);
}

console.log("Moved QSO Note Generator to the end of the Radio Tools grid.");
