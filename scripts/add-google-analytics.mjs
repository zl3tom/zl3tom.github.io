import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");
const htmlFiles = [];
const measurementId = "G-B4BJQE9ET1";

const googleTag = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>`;

async function walk(dir) {
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    const info = await stat(full);
    if (info.isDirectory()) await walk(full);
    else if (name.endsWith(".html")) htmlFiles.push(full);
  }
}

await walk(publicRoot);
let updated = 0;
for (const file of htmlFiles) {
  let html = await readFile(file, "utf8");
  if (html.includes(measurementId)) continue;
  if (!/<head\b[^>]*>/i.test(html)) continue;
  html = html.replace(/<head\b[^>]*>/i, match => `${match}\n${googleTag}`);
  await writeFile(file, html);
  updated += 1;
}

console.log(`Added Google Analytics ${measurementId} to ${updated} HTML pages.`);
