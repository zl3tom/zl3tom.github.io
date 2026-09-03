import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const radioIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/></svg>`;

const links = [
  ["Home", "/"], ["About", "/about"], ["Radio Fun", "/radio-fun"],
  ["Guides", "/guides"], ["QSL", "/qsl"], ["Contact", "/contact"]
].map(([label, href]) => `<a href="${href}"${label === "Radio Fun" ? ' aria-current="page"' : ""}>${label}</a>`).join("");

const networks = [
  ["BrandMeister DMR", "Worldwide TG 91"],
  ["ZL DMR", "New Zealand channels"],
  ["Zello", "International Radio Network"],
  ["Network Radios", "Internet-linked radio community"],
  ["ZMR Radio", "Zello and network radio"],
  ["RemoteHams", "Remote amateur stations"]
].map(([name, detail]) => `<div class="activity-chip"><strong>${name}</strong><span>${detail}</span></div>`).join("");

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "ZL3TOM Amateur Radio Station, Nodes and Networks",
      description: "Find ZL3TOM on EchoLink node 304602, AllStar node 40452, APRS, BrandMeister DMR TG 91, ZL DMR, Zello, Network Radios, ZMR Radio and RemoteHams.",
      url: "https://zl3tom.com/radio-fun",
      inLanguage: "en-NZ",
      dateModified: "2026-09-03",
      about: { "@type": "Person", name: "Thomas Bernard", alternateName: "ZL3TOM" }
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://zl3tom.com/" },
        { "@type": "ListItem", position: 2, name: "Radio Fun", item: "https://zl3tom.com/radio-fun" }
      ]
    }
  ]
};

const html = `<!doctype html>
<html lang="en-NZ">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ZL3TOM Station, EchoLink, AllStar, DMR and APRS</title>
  <meta name="description" content="Find ZL3TOM on EchoLink node 304602, AllStar node 40452, APRS, BrandMeister DMR TG 91, ZL DMR, Zello, Network Radios, ZMR Radio and RemoteHams.">
  <meta name="keywords" content="ZL3TOM EchoLink 304602, ZL3TOM-L, AllStar node 40452, BrandMeister TG 91, ZL DMR, APRS Christchurch, amateur radio networks New Zealand">
  <meta name="author" content="Thomas Bernard — ZL3TOM">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <link rel="canonical" href="https://zl3tom.com/radio-fun">
  <link rel="stylesheet" href="/style.css?v=20260904-fullfix1">
  <link rel="stylesheet" href="/site-extras.css?v=20260904-fullfix1">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_NZ">
  <meta property="og:site_name" content="ZL3TOM Amateur Radio">
  <meta property="og:title" content="ZL3TOM Station, Nodes and Radio Networks">
  <meta property="og:description" content="EchoLink 304602, AllStar 40452, APRS, DMR and linked networks used by ZL3TOM in Christchurch, New Zealand.">
  <meta property="og:url" content="https://zl3tom.com/radio-fun">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="ZL3TOM Station and Radio Networks">
  <meta name="twitter:description" content="Find Thomas Bernard, ZL3TOM, across EchoLink, AllStar, APRS, DMR and linked amateur radio networks.">
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header"><div class="site-container nav-wrap">
  <a class="brand" href="/" aria-label="ZL3TOM Amateur Radio home"><span class="brand-icon">${radioIcon}</span><span><strong>ZL3TOM</strong><small>Amateur Radio</small></span></a>
  <button class="menu-button" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="Open navigation"><span aria-hidden="true">☰</span></button>
  <nav id="main-navigation" class="main-nav" aria-label="Main navigation">${links}<a class="nav-qrz" href="https://qrz.com/db/ZL3TOM" target="_blank" rel="noreferrer">View on QRZ <span aria-hidden="true">↗</span></a></nav>
</div></header>
<main id="main">
  <section class="page-hero"><div class="signal-grid" aria-hidden="true"></div><div class="site-container page-hero-inner"><div class="page-icon">${radioIcon}</div><div><p class="section-kicker">ZL3TOM on the air</p><h1>My station, nodes and radio networks</h1><p>Station details, linked amateur radio nodes, APRS activity and networks used by ZL3TOM in Christchurch, New Zealand.</p></div></div></section>

  <section class="inner-section light station-overview-section"><div class="site-container">
    <div class="content-title node-section-title"><p class="section-kicker">My multimode system</p><h2>EchoLink and AllStar</h2><p><strong>This is my multimode system:</strong> EchoLink node <strong>304602 (ZL3TOM-L)</strong> and AllStar node <strong>40452</strong>. <a class="inline-aprs-link" href="https://aprs.fi/info/a/ZL3TOM" target="_blank" rel="noreferrer">View my APRS station on APRS.fi ↗</a></p></div>
    <div class="id-card-grid node-card-grid">
      <a href="https://www.echolink.org/" target="_blank" rel="noreferrer" class="id-card"><span aria-hidden="true">🎧</span><span><small>MY ECHOLINK NODE</small><strong>304602</strong><em>ZL3TOM-L · Open EchoLink</em></span><span aria-hidden="true">→</span></a>
      <a href="http://165.22.121.189/link.php?nodes=40452" target="_blank" rel="noreferrer" class="id-card"><span aria-hidden="true">◉</span><span><small>MY ALLSTAR NODE</small><strong>40452</strong><em>Open AllStar Dashboard</em></span><span aria-hidden="true">→</span></a>
    </div>
  </div></section>

  <section class="radio-activity-section" aria-labelledby="active-networks-title"><div class="site-container"><header><p class="section-kicker">Around the airwaves</p><h2 id="active-networks-title">Networks where I am active</h2><p>I enjoy a mix of RF, linked amateur radio and network-radio communities. Availability changes, so call and listen for ZL3TOM.</p></header><div class="activity-chip-grid">${networks}</div></div></section>

  <section class="qrz-logbook-section" aria-labelledby="qrz-logbook-title"><div class="site-container"><header><p class="section-kicker">Recent radio contacts</p><h2 id="qrz-logbook-title">ZL3TOM QRZ Logbook</h2><p id="qrz-logbook-help">The logbook automatically enlarges on wider screens. On a phone, the text stays at a readable size and you can swipe sideways to see every column.</p></header>
    <div class="qrz-display-bar" aria-label="QRZ Logbook display controls"><div><strong>Readable display</strong><span>Choose the view that is most comfortable for you.</span></div><div class="qrz-display-actions" role="group" aria-label="Logbook display size"><button type="button" data-qrz-size="auto" aria-pressed="true">Auto</button><button type="button" data-qrz-size="1" aria-pressed="false">100%</button><button type="button" data-qrz-size="1.25" aria-pressed="false">Larger</button><a href="https://logbook.qrz.com/lbstat/ZL3TOM/" target="_blank" rel="noopener noreferrer">Open full-size ↗</a></div><span id="qrz-view-status" class="sr-only" aria-live="polite"></span></div>
    <div class="qrz-frame-wrap" data-qrz-viewer tabindex="0" role="region" aria-label="Scrollable ZL3TOM QRZ Logbook"><div class="qrz-frame-stage"><iframe title="ZL3TOM QRZ Logbook statistics" aria-describedby="qrz-logbook-help" height="500" scrolling="yes" src="https://logbook.qrz.com/lbstat/ZL3TOM/" width="640" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"><a href="https://logbook.qrz.com/lbstat/ZL3TOM/">Open the ZL3TOM QRZ Logbook</a></iframe></div></div>
    <p class="qrz-scroll-help"><strong>Phone or tablet:</strong> swipe left and right inside the white logbook area. You can also use “Open full-size” for the clearest view.</p><noscript><p><a href="https://logbook.qrz.com/lbstat/ZL3TOM/" target="_blank" rel="noopener noreferrer">Open the ZL3TOM QRZ Logbook in a new tab ↗</a></p></noscript>
  </div></section>

  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</main>
<footer class="site-footer"><div class="site-container footer-grid">
  <div><a class="brand footer-brand" href="/"><span class="brand-icon">${radioIcon}</span><span><strong>ZL3TOM</strong><small>On air from Aotearoa</small></span></a><p>Thomas Bernard · ZL3TOM / ZL3KY<br>Christchurch, New Zealand</p></div>
  <div><strong>Explore</strong><a href="/about">About Thomas</a><a href="/radio-fun">Station &amp; networks</a><a href="/guides">Radio guides</a></div>
  <div><strong>Connect</strong><a href="/qsl">QSL confirmation</a><a href="/contact">Contact ZL3TOM</a><a href="https://www.facebook.com/zl3tom" target="_blank" rel="noopener noreferrer">ZL3TOM on Facebook ↗</a><a href="https://aprs.fi/info/a/ZL3TOM" target="_blank" rel="noreferrer">APRS position ↗</a></div>
</div><div class="site-container footer-bottom"><span>© 2026 Thomas Bernard. 73!</span><span>Built for amateur radio operators everywhere.</span></div></footer>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: "Thomas Bernard", alternateName: ["ZL3TOM", "ZL3KY"], url: "https://zl3tom.com", address: { "@type": "PostalAddress", addressLocality: "Christchurch", addressCountry: "NZ" }, sameAs: ["https://qrz.com/db/ZL3TOM", "https://aprs.fi/info/a/ZL3TOM", "https://www.facebook.com/zl3tom"] })}</script>
<script src="/script.js?v=20260904-fullfix1" defer></script>
</body>
</html>\n`;

await writeFile(path.join(publicRoot, "radio-fun.html"), html);
await mkdir(path.join(publicRoot, "radio-fun"), { recursive: true });
await writeFile(path.join(publicRoot, "radio-fun", "index.html"), html);
console.log("Generated the Radio Fun page with QRZ Logbook and station networks.");
