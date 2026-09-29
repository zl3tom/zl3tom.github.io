import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const pages = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(target);
    else if (entry.name.endsWith(".html")) pages.push(target);
  }
}
await walk(root);
const base = await readFile(path.join(root, "about/index.html"), "utf8");
const header = base.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
const footer = base.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0];
if (!header || !footer) throw new Error("Could not find shared page layout");

const title = "Amateur Radio Community in Christchurch & New Zealand | ZL3TOM";
const description = "Explore Christchurch Amateur Radio Club, NZART and New Zealand amateur radio with Thomas ZL3TOM, including ways to get involved and useful local resources.";
const head = `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><meta name="description" content="${description}">
<meta name="keywords" content="Christchurch amateur radio,Christchurch ham radio,Canterbury amateur radio,NZART,Branch 05,ZL3AC,HamCram,ZL3TOM">
<link rel="canonical" href="https://zl3tom.com/community"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/site-extras.css">
<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="https://zl3tom.com/community"><meta property="og:image" content="https://zl3tom.com/social-preview.png">
</head><body><a class="skip-link" href="#main">Skip to main content</a>`;
const content = `<main id="main">
<section class="page-hero"><div class="signal-grid" aria-hidden="true"></div><div class="site-container page-hero-inner"><div class="page-icon" aria-hidden="true">📡</div><div><p class="section-kicker">Christchurch · New Zealand · Worldwide</p><h1>Amateur Radio Community</h1><p>Connecting Christchurch, New Zealand and the world. I’m Thomas, ZL3TOM, and these are the clubs, organisations and networks that help me enjoy amateur radio.</p></div></div></section>
<section class="inner-section light"><div class="site-container community-content"><h2>Amateur radio in Christchurch</h2><p>My local club is <strong>Christchurch Amateur Radio Club</strong>, NZART Branch 05 (ZL3AC). Its official website is the best place to find current club activities, membership details and training, including HamCram.</p><div class="community-grid"><article class="prose-card"><h3>Christchurch Amateur Radio Club</h3><p>Meet local operators and discover the Christchurch amateur radio scene.</p><a href="https://chchhamradio.org.nz/" target="_blank" rel="noopener noreferrer">Visit Branch 05 ↗</a></article><article class="prose-card"><h3>NZART</h3><p>The New Zealand Association of Radio Transmitters connects branches and supports amateur radio across the country.</p><a href="https://nzart.org.nz/" target="_blank" rel="noopener noreferrer">Visit NZART ↗</a><br><a href="https://nzart.org.nz/contacts/branches/" target="_blank" rel="noopener noreferrer">Find an NZART branch ↗</a></article></div>
<h2>New to amateur radio?</h2><p>Wherever you live in New Zealand, start by contacting your local amateur radio club. Ask about learning the theory, getting licensed and arranging an examination and callsign. Check the <a href="https://nzart.org.nz/events/category/ham-cram/" target="_blank" rel="noopener noreferrer">NZART Ham Cram calendar ↗</a> for training events, and contact the organising club for current details and bookings.</p><p><a href="/guides/amateur-radio-new-zealand">Read my getting started guide →</a> · <a href="https://nzart.org.nz/contacts/branches/" target="_blank" rel="noopener noreferrer">Find your local radio club ↗</a></p>
<h2>Visiting Christchurch?</h2><p>Bringing your radio to Canterbury? Start with the Christchurch club for local activity and NZART for New Zealand-wide information. Check current operating rules and local repeater details with the relevant organisations before transmitting.</p>
<h2>Communities I use on air</h2><p>From Christchurch, I connect with operators around the world through digital voice and linked systems including ANZEL, AllStar, EchoLink and DMR. These networks are part of my own station activity and are separate from my local club and NZART.</p><p><a href="/radio-fun">Explore my station and networks →</a> · <a href="/guides">Browse my guides →</a> · <a href="/tools">Try the radio tools →</a> · <a href="/qsl">Confirm a contact →</a></p>
<div class="community-note"><strong>73 from Christchurch!</strong><p>I hope these links help you find people to talk with and ways to get involved. This is Thomas’s independent ZL3TOM website; the linked organisations publish their own official information.</p></div></div></section></main>`;
const community = path.join(root, "community/index.html");
await mkdir(path.dirname(community), { recursive: true });
await writeFile(community, head + header + content + footer + '<script src="/script.js" defer></script></body></html>\n');

for (const file of [...pages, community]) {
  let html = await readFile(file, "utf8");
  html = html.replace(/(<nav\b[^>]*id="main-navigation"[^>]*>)([\s\S]*?)(<\/nav>)/i, (whole, open, links, close) => {
    if (!links.includes('href="/community"')) {
      const current = file === community ? ' aria-current="page"' : "";
      const link = `<a href="/community"${current}>Community</a>`;
      links = links.replace(/<a\b[^>]*href="\/qsl"/i, link + '<a href="/qsl"');
      if (!links.includes('href="/community"')) links += link;
    }
    return open + links + close;
  });
  await writeFile(file, html);
}
const sitemapPath = path.join(root, "sitemap.xml");
let sitemap = await readFile(sitemapPath, "utf8");
if (!sitemap.includes("https://zl3tom.com/community")) sitemap = sitemap.replace("</urlset>", '  <url><loc>https://zl3tom.com/community</loc><lastmod>2026-09-29</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>');
await writeFile(sitemapPath, sitemap);
console.log(`Community page and navigation updated across ${pages.length + 1} HTML files.`);
