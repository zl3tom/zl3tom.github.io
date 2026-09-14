import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const updated = "2026-09-14";
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/></svg>`;

const guides = [
  {
    slug: "what-is-amateur-radio",
    title: "What Is Amateur Radio? A Beginner's Guide to Ham Radio",
    cardTitle: "What Is Amateur Radio?",
    desc: "A worldwide beginner introduction to amateur radio: what it is, licensing, callsigns, bands, repeaters, antennas and making a first contact.",
    sections: [
      ["What amateur radio is", `<p><strong>Amateur radio</strong>, often called <strong>ham radio</strong>, is a technical and communications hobby where licensed operators communicate by radio, experiment with equipment and antennas, use analogue and digital modes, join nets and make contacts locally or around the world.</p>`],
      ["How this differs from the New Zealand guide", `<p>This page is the general worldwide introduction. If you are in New Zealand and want country-specific information about the licence framework, callsigns and getting started locally, use <a href="/guides/amateur-radio-new-zealand">Amateur Radio in New Zealand</a>.</p>`],
      ["Do you need a licence?", `<p>Transmitting on amateur-radio frequencies normally requires the appropriate licence or authorisation for your country. Rules and permitted frequencies vary internationally, so check your national regulator or recognised amateur-radio organisation.</p>`],
      ["What can you do?", `<p>Amateur radio includes local VHF/UHF contacts, repeaters, HF long-distance communication, Morse code, digital data, digital voice, APRS, satellites, portable operation and internet-linked radio systems.</p>`],
      ["What is a callsign?", `<p>A callsign identifies an amateur station or operator. Learn more in <a href="/guides/amateur-radio-callsigns-explained">Amateur Radio Callsigns Explained</a>.</p>`],
      ["Your first contact", `<p>Listen first, learn basic operating etiquette and keep the first conversation simple. The dedicated <a href="/guides/first-amateur-radio-contact">first amateur radio contact guide</a> gives practical examples of what to say.</p>`]
    ]
  },
  {
    slug: "dmr-vs-echolink-vs-allstarlink",
    title: "DMR vs EchoLink vs AllStarLink: What's the Difference?",
    cardTitle: "DMR vs EchoLink vs AllStarLink",
    desc: "A simple comparison of DMR, EchoLink and AllStarLink so beginners can understand what each system is for and choose the right guide next.",
    sections: [
      ["Three different things", `<p><strong>DMR</strong> is a digital radio mode and network ecosystem. <strong>EchoLink</strong> is an internet-linked amateur-radio system with apps and RF gateways. <strong>AllStarLink</strong> links amateur-radio nodes and repeaters using VoIP technology.</p>`],
      ["Quick comparison", `<div class="guide-table-wrap"><table class="guide-table"><thead><tr><th>System</th><th>Typical access</th><th>Best next guide</th></tr></thead><tbody><tr><td>DMR</td><td>DMR radio through a repeater or hotspot</td><td><a href="/guides/digital-voice-for-beginners">Digital Voice for Beginners</a></td></tr><tr><td>EchoLink</td><td>Validated app/software or an RF EchoLink gateway</td><td><a href="/guides/echolink-getting-started">EchoLink Getting Started</a></td></tr><tr><td>AllStarLink</td><td>Radio through an AllStar node or compatible node/client setup</td><td><a href="/guides/allstarlink-for-beginners">AllStarLink for Beginners</a></td></tr></tbody></table></div>`],
      ["Where DMR details belong", `<p>Rather than duplicate the existing digital-voice, DMR-ID and hotspot guides, this comparison page points to them. For DMR terminology and other digital modes, use <a href="/guides/digital-voice-for-beginners">Digital Voice for Beginners</a>. For registration, use <a href="/guides/getting-a-dmr-id">Getting a DMR ID</a>. For personal gateways, use <a href="/guides/digital-radio-hotspots-pistar-wpsd">Digital Radio Hotspots Explained</a>.</p>`],
      ["Which should a beginner choose?", `<p>Choose based on the equipment you already have and what is active around you. DMR is useful when you have DMR RF access; EchoLink can be convenient for validated software access and RF gateways; AllStarLink is especially useful around linked nodes and repeater networks.</p>`]
    ]
  }
];

function esc(s) { return s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }

function page(g) {
  const url = `https://zl3tom.com/guides/${g.slug}`;
  const sections = g.sections.map(([heading, body], i) => `<section class="guide-section"><span class="section-number">${String(i + 1).padStart(2, "0")}</span><div><h2>${heading}</h2>${body}</div></section>`).join("\n");
  const schema = {"@context":"https://schema.org","@graph":[{"@type":"TechArticle",headline:g.title,description:g.desc,url,mainEntityOfPage:url,inLanguage:"en-NZ",author:{"@type":"Person",name:"Thomas Bernard",alternateName:"ZL3TOM",url:"https://zl3tom.com/about"},datePublished:updated,dateModified:updated},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem",position:1,name:"Home",item:"https://zl3tom.com/"},{"@type":"ListItem",position:2,name:"Guides",item:"https://zl3tom.com/guides"},{"@type":"ListItem",position:3,name:g.title,item:url}]}]};
  return `<!doctype html>\n<html lang="en-NZ">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${esc(g.title)} | ZL3TOM</title>\n<meta name="description" content="${esc(g.desc)}">\n<meta name="author" content="Thomas Bernard — ZL3TOM">\n<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">\n<link rel="canonical" href="${url}">\n<link rel="stylesheet" href="/style.css?v=20260904-fullfix1">\n<link rel="stylesheet" href="/site-extras.css?v=20260904-fullfix1">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<meta property="og:type" content="article"><meta property="og:title" content="${esc(g.title)} | ZL3TOM"><meta property="og:description" content="${esc(g.desc)}"><meta property="og:url" content="${url}">\n</head>\n<body>\n<a class="skip-link" href="#main">Skip to main content</a>\n<header class="site-header"><div class="site-container nav-wrap"><a class="brand" href="/" aria-label="ZL3TOM Amateur Radio home"><span class="brand-icon">${icon}</span><span><strong>ZL3TOM</strong><small>Amateur Radio</small></span></a><button class="menu-button" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="Open navigation"><span aria-hidden="true">☰</span></button><nav id="main-navigation" class="main-nav" aria-label="Main navigation"><a href="/">Home</a><a href="/about">About</a><a href="/radio-fun">Radio Fun</a><a href="/guides" aria-current="page">Guides</a><a href="/tools">Tools</a><a href="/qsl">QSL</a><a href="/contact">Contact</a></nav></div></header>\n<main id="main"><section class="page-hero"><div class="signal-grid" aria-hidden="true"></div><div class="site-container page-hero-inner"><div class="page-icon">${icon}</div><div><p class="section-kicker">ZL3TOM beginner guide</p><h1>${g.title}</h1><p>${g.desc}</p></div></div></section><section class="inner-section light"><div class="site-container article-layout"><article class="article-content"><a class="back-link" href="/guides">← All guides</a>${sections}<section class="related-guides"><h2>Keep learning</h2><div><a href="/guides"><strong>All amateur radio guides</strong><span>Browse the complete ZL3TOM guide library.</span></a><a href="/tools"><strong>Radio tools &amp; calculators</strong><span>Useful calculators and operating tools.</span></a></div></section><footer class="guide-byline"><p><strong>Written by Thomas Bernard — ZL3TOM</strong></p><p>Last updated: <time datetime="${updated}">14 September 2026</time></p></footer></article></div></section><script type="application/ld+json">${JSON.stringify(schema)}</script></main><footer class="site-footer"><div class="site-container footer-grid"><div><strong>ZL3TOM</strong><p>Thomas Bernard · ZL3TOM / ZL3KY<br>Christchurch, New Zealand</p></div><div><strong>Quick links</strong><a href="/guides">Guides</a><a href="/tools">Tools</a><a href="/qsl">QSL</a></div><div><strong>Contact</strong><a href="/contact">Contact</a><a rel="me" href="https://www.facebook.com/zl3tom" target="_blank" rel="noopener noreferrer">ZL3TOM on Facebook ↗</a></div></div></footer><script src="/script.js?v=20260904-fullfix1" defer></script></body></html>\n`;
}

// Remove earlier drafts that overlap with existing guides.
for (const stale of ["dmr-for-beginners", "echolink-for-beginners", "allstarlink-for-beginners-guide"]) {
  await rm(path.join(pub, "guides", stale), { recursive: true, force: true });
  await rm(path.join(pub, `guides-${stale}.html`), { force: true });
}

for (const g of guides) {
  await mkdir(path.join(pub, "guides", g.slug), { recursive: true });
  const html = page(g);
  await writeFile(path.join(pub, "guides", g.slug, "index.html"), html);
  await writeFile(path.join(pub, `guides-${g.slug}.html`), html);
}

function cardMarkup(g) {
  return `<a href="/guides/${g.slug}" class="guide-card"><div class="guide-card-top"><span>00</span>${icon}</div><h2>${g.cardTitle}</h2><p>${g.desc}</p><em>Read guide →</em></a>`;
}

for (const rel of ["guides.html", path.join("guides", "index.html")]) {
  const file = path.join(pub, rel);
  let html = await readFile(file, "utf8");
  for (const stale of ["dmr-for-beginners", "echolink-for-beginners", "allstarlink-for-beginners-guide"]) {
    html = html.replace(new RegExp(`<a href="/guides/${stale}" class="guide-card">[\\s\\S]*?<\\/a>`, "g"), "");
  }
  for (const g of guides) {
    const pattern = new RegExp(`<a href="/guides/${g.slug}" class="guide-card">[\\s\\S]*?<\\/a>`, "g");
    if (pattern.test(html)) html = html.replace(pattern, cardMarkup(g));
    else html = html.replace(/(<div class="guide-card-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/, `$1$2${cardMarkup(g)}$3`);
  }
  let number = 0;
  html = html.replace(/(<a href="\/guides\/[^"]+" class="guide-card"><div class="guide-card-top"><span>)(\d+)(<\/span>)/g, (_, a, _n, b) => `${a}${String(++number).padStart(2, "0")}${b}`);
  await writeFile(file, html);
}

const sitemapFile = path.join(pub, "sitemap.xml");
let sitemap = await readFile(sitemapFile, "utf8");
for (const stale of ["dmr-for-beginners", "echolink-for-beginners", "allstarlink-for-beginners-guide"]) {
  sitemap = sitemap.replace(new RegExp(`\\s*<url>[\\s\\S]*?<loc>https://zl3tom\\.com/guides/${stale}<\\/loc>[\\s\\S]*?<\\/url>`, "g"), "");
}
for (const g of guides) {
  if (!sitemap.includes(`<loc>https://zl3tom.com/guides/${g.slug}</loc>`)) {
    sitemap = sitemap.replace("</urlset>", `  <url><loc>https://zl3tom.com/guides/${g.slug}</loc><lastmod>${updated}</lastmod></url>\n</urlset>`);
  }
}
await writeFile(sitemapFile, sitemap);
console.log("Consolidated overlapping guides: kept 2 distinct new guides and reused the existing DMR, EchoLink and AllStar guides.");