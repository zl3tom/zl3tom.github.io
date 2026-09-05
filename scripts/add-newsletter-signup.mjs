import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");
const files = [path.join(publicRoot, "index.html")];

const signup = `<section class="inner-section light newsletter-signup" aria-labelledby="newsletter-title"><div class="site-container"><div class="prose-card" style="text-align:center;max-width:900px;margin-inline:auto"><p class="section-kicker">ZL3TOM newsletter</p><h2 id="newsletter-title">Get amateur radio updates by email</h2><p>Subscribe for ZL3TOM station updates, new amateur radio guides, website updates, operating news and other ham radio content from Christchurch, New Zealand.</p><div class="qsl-actions" style="justify-content:center;margin-top:1.25rem"><a class="button button-primary" href="https://zl3tom.substack.com/subscribe" target="_blank" rel="noopener noreferrer">Subscribe to the ZL3TOM Newsletter ↗</a><a class="button button-secondary light" href="https://zl3tom.substack.com/" target="_blank" rel="noopener noreferrer">Read the newsletter</a></div><p style="margin-top:1rem"><small>Subscription is handled securely by Substack.</small></p></div></div></section>`;

for (const file of files) {
  let html = await readFile(file, "utf8");

  if (html.includes('class="inner-section light newsletter-signup"')) {
    html = html.replace(/<section class="inner-section light newsletter-signup"[\s\S]*?<\/section>/, signup);
  } else {
    const marker = "</main>";
    if (!html.includes(marker)) throw new Error(`Could not find </main> in ${file}`);
    html = html.replace(marker, signup + marker);
  }

  await writeFile(file, html);
}
console.log("Added working ZL3TOM Substack newsletter subscription section to homepage.");
