import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const slug = "internet-linked-radio-networks";
const canonical = `https://zl3tom.com/guides/${slug}`;

const networkCards = `<div class="activity-chip-grid"><div class="activity-chip"><strong>Zello</strong><span>Find me on Zello and these linked radio communities:</span><span><a href="https://irn.radio/" target="_blank" rel="noopener noreferrer">International Radio Network ↗</a> · <a href="https://zmr.godaddysites.com/" target="_blank" rel="noopener noreferrer">ZMR Radio ↗</a> · <a href="https://networkradios.weebly.com/" target="_blank" rel="noopener noreferrer">Network Radios ↗</a></span></div><a class="activity-chip" href="https://anzel.radio/" target="_blank" rel="noopener noreferrer"><strong>ANZ3L NETWORK</strong><span>ANZEL Multimode VoIP / RoIP Network</span><span><em>My nodes are generally connected to this for almost 24/7 activity.</em></span></a><div class="activity-chip"><strong>BrandMeister DMR</strong><span>Worldwide TG 91</span></div><div class="activity-chip"><strong>ZL DMR</strong><span>New Zealand channels</span></div><div class="activity-chip"><strong>Network Radios</strong><span><a href="https://networkradios.weebly.com/" target="_blank" rel="noopener noreferrer">Internet-linked radio community ↗</a></span></div><div class="activity-chip"><strong>RemoteHams</strong><span>Remote amateur stations</span></div></div>`;

for (const relative of ["radio-fun.html", path.join("radio-fun", "index.html")]) {
  const file = path.join(publicRoot, relative);
  let html = await readFile(file, "utf8");
  html = html.replace(/<div class="activity-chip-grid">[\s\S]*?<\/div><\/div><\/section>/, `${networkCards}</div></section>`);
  await writeFile(file, html);
}

const guideHtml = `<!doctype html>
<html lang="en-NZ">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Internet-Linked Radio Networks: IRN, ANZEL, ZMR and Network Radios | ZL3TOM</title>
  <meta name="description" content="A practical guide to the International Radio Network, ANZEL multimode network, ZMR Radio, Network Radios and Zello, including how the systems connect and where to get current access information.">
  <meta name="keywords" content="International Radio Network, IRN radio, ANZEL network, ANZ3L network, ZMR Radio, Network Radios, Zello radio, VoIP amateur radio, RoIP amateur radio, ZL3TOM">
  <meta name="author" content="Thomas Bernard — ZL3TOM">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  <link rel="stylesheet" href="/style.css?v=20260904-fullfix1">
  <link rel="stylesheet" href="/site-extras.css?v=20260904-fullfix1">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="article">
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header"><div class="site-container nav-wrap">
  <a class="brand" href="/" aria-label="ZL3TOM Amateur Radio home"><span class="brand-icon"><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0 8.478"/><circle cx="12" cy="12" r="2"/></svg></span><span><strong>ZL3TOM</strong><small>Amateur Radio</small></span></a>
  <button class="menu-button" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="Open navigation"><span aria-hidden="true">☰</span></button>
  <nav id="main-navigation" class="main-nav" aria-label="Main navigation"><a href="/">Home</a><a href="/about">About</a><a href="/radio-fun">Radio Fun</a><a href="/guides" aria-current="page">Guides</a><a href="/qsl">QSL</a><a href="/contact">Contact</a><a class="nav-qrz" href="https://qrz.com/db/ZL3TOM" target="_blank" rel="noreferrer">View on QRZ <span aria-hidden="true">↗</span></a></nav>
</div></header>
<main id="main">
  <section class="page-hero"><div class="signal-grid" aria-hidden="true"></div><div class="site-container page-hero-inner"><div class="page-icon"><svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v16"/><path d="M20 19a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4a5 5 0 0 0-4 2 5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4a5 5 0 0 1 4 2 5 5 0 0 1 4-2z"/></svg></div><div><p class="section-kicker">ZL3TOM linked radio guide</p><h1>Internet-linked radio networks: IRN, ANZEL, ZMR and Network Radios</h1><p>How Zello, network radios and multimode VoIP/RoIP systems fit together, plus the official places to find current connection and registration details.</p></div></div></section>
  <section class="inner-section light"><div class="site-container article-layout">
    <article class="article-content">
      <a class="back-link" href="/guides">← All guides</a>
      <section class="guide-section"><span class="section-number">01</span><div><h2>What internet-linked radio networks are</h2><p>Internet-linked radio networks carry voice between operators, apps, radio-style devices, repeaters, gateways and other linked systems. Depending on the network, you may use a phone app such as Zello, a dedicated network radio, a DMR talkgroup, an EchoLink or AllStar connection, or another supported gateway.</p><p>These systems are useful for keeping radio communities connected across long distances, but each network has its own rules, registration process and connection methods. Always use the current information from the network itself.</p></div></section>
      <section class="guide-section"><span class="section-number">02</span><div><h2>International Radio Network (IRN)</h2><p>The <a href="https://irn.radio/" target="_blank" rel="noopener noreferrer">International Radio Network (IRN) ↗</a> says its mission is to promote the amateur radio hobby and welcomes both licensed and non-licensed people who are interested in radio communications. Its website provides an FAQ, connection information, net schedules, registration and a live dashboard.</p><div class="guide-callout"><strong>Getting connected:</strong> use the official IRN <a href="https://irn.radio/" target="_blank" rel="noopener noreferrer">website ↗</a> and follow its current registration and Connections information. Requirements can change, so do not rely on old connection details copied from another website.</div></div></section>
      <section class="guide-section"><span class="section-number">03</span><div><h2>ZMR Radio</h2><p><a href="https://zmr.godaddysites.com/" target="_blank" rel="noopener noreferrer">ZMR Radio ↗</a> describes itself as a partner of the International Radio Network and as a service that complements rather than replaces amateur radio. Its current site says it provides a welcoming radio environment using Zello and DMR talkgroups on the TGIF network, with channels for licensed amateurs as well as hobby radio enthusiasts.</p><p>For current channel names, talkgroups and joining instructions, use ZMR's own website. That avoids stale channel information and makes sure you see its latest rules and access requirements.</p></div></section>
      <section class="guide-section"><span class="section-number">04</span><div><h2>Network Radios and Zello</h2><p>The <a href="https://networkradios.weebly.com/" target="_blank" rel="noopener noreferrer">Network Radios Channel Suite ↗</a> is built on the Zello push-to-talk platform. Network radios are usually internet-connected Android-style devices designed to feel more like a handheld or mobile radio, often with a physical PTT button, while Zello can also run directly on phones and other supported devices.</p><p>The Network Radios website publishes its channel information, Zello hints and tips, hardware information and accessibility guidance. Start there when setting up a device or looking for the current channel suite.</p></div></section>
      <section class="guide-section"><span class="section-number">05</span><div><h2>ANZEL / ANZ3L Multimode Network</h2><p>The <a href="https://anzel.radio/" target="_blank" rel="noopener noreferrer">ANZEL Multimode VoIP / RoIP Network ↗</a> connects multiple radio-over-IP and digital systems. Its current website lists connections that include EchoLink conferences, AllStar nodes, IRLP, D-Star, DMR, YSF, M17 and other linked systems.</p><div class="guide-callout"><strong>ZL3TOM activity:</strong> my nodes are generally connected to this network for almost 24/7 activity. If you are looking for me, this is one of the best linked-network places to listen and call.</div><p>Because a multimode network can change links and gateways over time, use the ANZEL website for its live network map, current connection numbers, net calendar and operating information.</p></div></section>
      <section class="guide-section"><span class="section-number">06</span><div><h2>How the connections fit together</h2><p>You do not necessarily need the same app or radio as another operator. A network may bridge several technologies so that audio entering through one supported system can be heard on another. For example, one person may arrive through Zello or a network-radio channel while another uses an amateur-radio gateway supported by that particular network.</p><p>Bridging is controlled by the network administrators. Never assume that every channel, talkgroup or reflector is permanently linked. Check the network's dashboard, connection page or map before troubleshooting your own equipment.</p></div></section>
      <section class="guide-section"><span class="section-number">07</span><div><h2>Good operating on linked networks</h2><ul><li>Listen before transmitting and make sure a conversation is not already in progress.</li><li>Leave a short pause between overs so linked gateways have time to switch and another operator can join.</li><li>Use your callsign where amateur-radio rules require it and follow the rules of the network you are using.</li><li>Do not share private node, IAX, administrator or account credentials.</li><li>Remember that some networks also include non-licensed users, so the operating environment may differ from an amateur-only repeater.</li><li>Use the official network website for current access details rather than copying passwords, codes or channel information from unofficial posts.</li></ul></div></section>
      <section class="guide-section"><span class="section-number">08</span><div><h2>Where to start</h2><div class="guide-table-wrap"><table class="guide-table"><thead><tr><th>Network</th><th>Best starting point</th></tr></thead><tbody><tr><td>International Radio Network</td><td><a href="https://irn.radio/" target="_blank" rel="noopener noreferrer">irn.radio ↗</a></td></tr><tr><td>ZMR Radio</td><td><a href="https://zmr.godaddysites.com/" target="_blank" rel="noopener noreferrer">ZMR website ↗</a></td></tr><tr><td>Network Radios</td><td><a href="https://networkradios.weebly.com/" target="_blank" rel="noopener noreferrer">Network Radios Channel Suite ↗</a></td></tr><tr><td>ANZEL / ANZ3L</td><td><a href="https://anzel.radio/" target="_blank" rel="noopener noreferrer">anzel.radio ↗</a></td></tr></tbody></table></div><p>Read the current registration, connections and conduct information on each site before transmitting or linking a node.</p></div></section>
      <section class="guide-sources" aria-labelledby="official-sources"><h2 id="official-sources">Network sources and further information</h2><p>Connection details change, so these network websites are the source of truth for current access information.</p><ul><li><a href="https://irn.radio/" target="_blank" rel="noopener noreferrer">International Radio Network <span aria-hidden="true">↗</span></a></li><li><a href="https://zmr.godaddysites.com/" target="_blank" rel="noopener noreferrer">ZMR Radio <span aria-hidden="true">↗</span></a></li><li><a href="https://networkradios.weebly.com/" target="_blank" rel="noopener noreferrer">Network Radios Channel Suite <span aria-hidden="true">↗</span></a></li><li><a href="https://anzel.radio/" target="_blank" rel="noopener noreferrer">ANZEL Multimode VoIP / RoIP Network <span aria-hidden="true">↗</span></a></li></ul></section>
      <section class="related-guides" aria-labelledby="related-guides"><h2 id="related-guides">Related guides</h2><div><a href="/guides/allstarlink-for-beginners"><strong>AllStarLink for beginners</strong><span>Learn how AllStar nodes and linked amateur radio systems work.</span></a><a href="/guides/echolink-getting-started"><strong>EchoLink setup</strong><span>Get started with EchoLink and internet-linked amateur radio.</span></a><a href="/guides/qso-one-guide"><strong>QSO One setup</strong><span>Use multiple linked amateur radio systems from one app.</span></a></div></section>
      <footer class="guide-byline"><p><strong>Written by Thomas Bernard — ZL3TOM</strong></p><p>Last updated: <time datetime="2026-09-05">5 September 2026</time></p></footer>
    </article>
    <aside class="article-aside"><strong>Where I am active</strong><p>My nodes are generally connected to the ANZEL / ANZ3L network for almost 24/7 activity.</p><a href="/radio-fun">See my Radio Fun page →</a></aside>
  </div></section>
  <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"TechArticle","headline":"Internet-Linked Radio Networks: IRN, ANZEL, ZMR and Network Radios","description":"A practical guide to IRN, ANZEL, ZMR Radio, Network Radios and Zello.","mainEntityOfPage":"${canonical}","url":"${canonical}","inLanguage":"en-NZ","author":{"@type":"Person","name":"Thomas Bernard","alternateName":"ZL3TOM","url":"https://zl3tom.com/about"},"datePublished":"2026-09-05","dateModified":"2026-09-05","about":["Amateur radio","Internet linked radio","VoIP","RoIP","Zello"]},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://zl3tom.com/"},{"@type":"ListItem","position":2,"name":"Guides","item":"https://zl3tom.com/guides"},{"@type":"ListItem","position":3,"name":"Internet-linked radio networks","item":"${canonical}"}]}]}</script>
</main>
<footer class="site-footer"><div class="site-container footer-grid">
  <div><a class="brand footer-brand" href="/"><span class="brand-icon">◉</span><span><strong>ZL3TOM</strong><small>On air from Aotearoa</small></span></a><p>Thomas Bernard · ZL3TOM / ZL3KY<br>Christchurch, New Zealand</p></div>
  <div><strong>Explore</strong><a href="/about">About Thomas</a><a href="/radio-fun">Station &amp; networks</a><a href="/guides">Radio guides</a></div>
  <div><strong>Connect</strong><a href="/qsl">QSL confirmation</a><a href="/contact">Contact ZL3TOM</a><a href="https://www.facebook.com/zl3tom" target="_blank" rel="noopener noreferrer">ZL3TOM on Facebook ↗</a><a href="https://aprs.fi/info/a/ZL3TOM" target="_blank" rel="noreferrer">APRS position ↗</a></div>
</div><div class="site-container footer-bottom"><span>© 2026 Thomas Bernard. 73!</span><span>Built for amateur radio operators everywhere.</span></div></footer>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Person","name":"Thomas Bernard","alternateName":["ZL3TOM","ZL3KY"],"url":"https://zl3tom.com","sameAs":["https://qrz.com/db/ZL3TOM","https://aprs.fi/info/a/ZL3TOM","https://www.facebook.com/zl3tom"]}</script>
<script src="/script.js?v=20260904-fullfix1" defer></script>
</body>
</html>\n`;

await mkdir(path.join(publicRoot, "guides", slug), { recursive: true });
await writeFile(path.join(publicRoot, "guides", slug, "index.html"), guideHtml);
await writeFile(path.join(publicRoot, `guides-${slug}.html`), guideHtml);

const guideCard = `<a href="/guides/${slug}" class="guide-card"><div class="guide-card-top"><span>19</span><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/></svg></div><h2>IRN, ANZEL, ZMR & Network Radios</h2><p>How internet-linked radio networks, Zello and multimode VoIP/RoIP systems connect, with official links for joining and current connection information.</p><em>Read guide →</em></a>`;

for (const relative of ["guides.html", path.join("guides", "index.html")]) {
  const file = path.join(publicRoot, relative);
  let html = await readFile(file, "utf8");
  if (!html.includes(`/guides/${slug}`)) {
    html = html.replace(/(<div class="guide-card-grid">)([\s\S]*?)(<\/div><\/div><\/section>)/, (match, open, cards, close) => `${open}${cards}\n${guideCard}${close}`);
  }
  await writeFile(file, html);
}

const sitemapPath = path.join(publicRoot, "sitemap.xml");
let sitemap = await readFile(sitemapPath, "utf8");
if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
  const entry = `  <url><loc>${canonical}</loc><lastmod>2026-09-05</lastmod><changefreq>monthly</changefreq><priority>0.8</priority><image:image><image:loc>https://zl3tom.com/social-preview.png</image:loc></image:image></url>\n`;
  sitemap = sitemap.replace("</urlset>", `${entry}</urlset>`);
  await writeFile(sitemapPath, sitemap);
}

console.log("Added linked-network cards and the IRN / ANZEL / ZMR / Network Radios guide.");
