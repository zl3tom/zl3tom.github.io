import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const slug = "internet-linked-radio-networks";
const href = `/guides/${slug}`;
const card = `<a href="${href}" class="guide-card"><div class="guide-card-top"><span>19</span><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/></svg></div><h2>IRN, ANZEL, ZMR &amp; Network Radios</h2><p>How internet-linked radio networks, Zello and multimode VoIP/RoIP systems connect, with official links for joining and current connection information.</p><em>Read guide →</em></a>`;

for (const relative of ["guides.html", path.join("guides", "index.html")]) {
  const file = path.join(publicRoot, relative);
  let html = await readFile(file, "utf8");

  if (!html.includes(`href="${href}" class="guide-card"`)) {
    const gridStart = html.indexOf('<div class="guide-card-grid">');
    const sectionEnd = html.indexOf('</div>\n  </div></section>', gridStart);
    if (gridStart === -1 || sectionEnd === -1) {
      throw new Error(`Could not find guide card grid in ${relative}`);
    }
    html = `${html.slice(0, sectionEnd)}\n${card}${html.slice(sectionEnd)}`;
  }

  await writeFile(file, html);
}

console.log("Confirmed the Internet-Linked Radio Networks guide card is present on the Guides page.");
