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

const footer = `<footer class="site-footer"><div class="site-container footer-grid"><div><strong>ZL3TOM</strong><p>Thomas Bernard · ZL3TOM / ZL3KY<br>Christchurch, New Zealand</p></div><div><strong>Quick links</strong><a href="/guides">Guides</a><a href="/tools">Tools</a><a href="/qsl">QSL</a></div><div><strong>Contact</strong><a href="/contact">Contact</a><a href="https://www.qrz.com/db/ZL3TOM" target="_blank" rel="noopener noreferrer">QRZ ↗</a><a href="https://www.facebook.com/zl3tom" target="_blank" rel="me noopener noreferrer">ZL3TOM on Facebook ↗</a></div></div><p class="accessibility-footer-link"><a href="/guides/accessible-amateur-radio#using-this-website">Accessibility and website feedback</a></p></footer>`;

await walk(publicRoot);
let updated = 0;
for (const file of htmlFiles) {
  let html = await readFile(file, "utf8");

  // Standardise the shared site footer wherever this page has one.
  const siteFooterPattern = /<footer\s+class=["']site-footer["'][^>]*>[\s\S]*?<\/footer>/i;
  if (siteFooterPattern.test(html)) html = html.replace(siteFooterPattern, footer);

  // Every HTML page must load the same navigation script. Do not require a
  // footer: some landing pages and generated pages use a different layout.
  const hasSharedScript = /<script\b[^>]*\bsrc=["'][^"']*\/script\.js(?:[?#][^"']*)?["']/i.test(html);
  if (!hasSharedScript) {
    const sharedScript = '<script src="/script.js?v=20261031-global-nav" defer></script>';
    if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, `${sharedScript}\n</body>`);
    else html += `\n${sharedScript}\n`;
  }

  const original = await readFile(file, "utf8");
  if (html !== original) {
    await writeFile(file, html);
    updated += 1;
  }
}
console.log(`Standardized ${updated} site pages with the shared footer and global navigation script.`);
