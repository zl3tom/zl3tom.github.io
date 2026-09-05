import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");
const files = [path.join(publicRoot, "index.html")];

const signup = `<section class="inner-section light newsletter-signup" aria-labelledby="newsletter-title"><div class="site-container"><div class="prose-card" style="text-align:center;max-width:900px;margin-inline:auto"><p class="section-kicker">ZL3TOM newsletter</p><h2 id="newsletter-title">Get amateur radio updates by email</h2><p>Subscribe for ZL3TOM station updates, new amateur radio guides, website updates, operating news and other ham radio content from Christchurch, New Zealand.</p><div style="max-width:480px;margin:1rem auto 0"><iframe src="https://zl3tom.substack.com/embed?transparent=1" title="Subscribe to the ZL3TOM amateur radio newsletter on Substack" width="480" height="320" style="border:0;background:transparent;width:100%;max-width:480px" frameborder="0" scrolling="no" loading="lazy"></iframe></div><p><a class="text-link" href="https://zl3tom.substack.com/" target="_blank" rel="noopener noreferrer">Read the ZL3TOM newsletter on Substack ↗</a></p></div></div></section>`;

for (const file of files) {
  let html = await readFile(file, "utf8");
  if (html.includes("zl3tom.substack.com/embed")) continue;
  const marker = "</main>";
  if (!html.includes(marker)) throw new Error(`Could not find </main> in ${file}`);
  html = html.replace(marker, signup + marker);
  await writeFile(file, html);
}
console.log("Added responsive ZL3TOM Substack newsletter signup to homepage.");
