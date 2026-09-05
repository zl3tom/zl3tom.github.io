import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");
const htmlFiles = [];

async function walk(dir) {
  for (const name of await readdir(dir)) {
    const full = path.join(dir, name);
    const info = await stat(full);
    if (info.isDirectory()) await walk(full);
    else if (name.endsWith(".html")) htmlFiles.push(full);
  }
}

const footer = `<footer class="site-footer"><div class="site-container footer-grid"><div><strong>ZL3TOM</strong><p>Thomas Bernard · ZL3TOM / ZL3KY<br>Christchurch, New Zealand</p></div><div><strong>Quick links</strong><a href="/guides">Guides</a><a href="/tools">Tools</a><a href="/qsl">QSL</a><a href="/contact">Contact</a></div><div><strong>Contact</strong><a href="mailto:thomas@zl3tom.com">thomas@zl3tom.com</a><a href="https://www.qrz.com/db/ZL3TOM" target="_blank" rel="noopener noreferrer">QRZ ↗</a><a href="https://www.facebook.com/zl3tom" target="_blank" rel="noopener noreferrer">ZL3TOM on Facebook ↗</a></div></div></footer>`;

await walk(publicRoot);
let updated = 0;
for (const file of htmlFiles) {
  let html = await readFile(file, "utf8");
  if (!/<footer\b/i.test(html)) continue;
  const next = html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/i, footer);
  if (next !== html) {
    await writeFile(file, next);
    updated += 1;
  }
}
console.log(`Standardized ${updated} site footers with the same essential information.`);
