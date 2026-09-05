import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const toolsFiles = [path.join(pub, "tools.html"), path.join(pub, "tools", "index.html")];
const base = await readFile(path.join(pub, "tools.html"), "utf8");
const header = base.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0] || "";
const footer = base.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0] || "";

const pages = [
  {
    slug: "swr-calculator",
    title: "SWR Calculator for Ham Radio | Forward & Reflected Power | ZL3TOM",
    h1: "SWR Calculator",
    desc: "Free ham radio SWR calculator. Enter forward and reflected RF power to calculate standing wave ratio, reflected-power percentage and a simple interpretation.",
    keywords: "SWR calculator, ham radio SWR calculator, standing wave ratio calculator, forward reflected power calculator, antenna SWR",
    intro: "Calculate standing wave ratio from measured forward and reflected RF power. This is useful when checking antennas, feed lines and matching systems.",
    tool: `<label for="fwd">Forward power (W)</label><input id="fwd" type="number" min="0" step="any" placeholder="50"><label for="ref">Reflected power (W)</label><input id="ref" type="number" min="0" step="any" placeholder="2"><button class="button button-primary" id="calc" type="button">Calculate SWR</button><div class="tool-result" id="result" aria-live="polite">Enter forward and reflected power.</div>`,
    script: `calc.onclick=()=>{const f=+fwd.value,r=+ref.value;if(!(f>0)||r<0||r>=f){result.textContent='Enter forward power above 0 W and reflected power lower than forward power.';return}const rho=Math.sqrt(r/f),s=(1+rho)/(1-rho);result.textContent='SWR: '+s.toFixed(2)+':1 · Reflected power: '+(r/f*100).toFixed(1)+'%';};`,
    explanation: `<h2>What SWR means</h2><p>SWR describes how well an RF load is matched to a transmission line. A value close to 1:1 indicates a better match. Higher SWR means more power is being reflected back toward the transmitter.</p><h2>How this calculator works</h2><p>The calculation uses the ratio of reflected power to forward power. Measurements should come from a suitable directional power/SWR meter and should be taken within the meter's intended frequency and power range.</p><h2>Before transmitting</h2><p>Do not use this result as a substitute for safe station setup. If SWR is unexpectedly high, check the antenna, connectors, coax, band and measurement setup before increasing power.</p>`,
    faq: [["Is 1:1 SWR perfect?","It represents an ideal match in the simple model, although real-world measurements and systems have tolerances."],["Can I calculate SWR without reflected power?","Not with this forward/reflected-power method. You need both measurements from a suitable meter."]],
    related: [["/guides/antenna-basics","Antenna basics"],["/tools/coax-loss-calculator","Coax loss calculator"],["/tools/dipole-calculator","Dipole calculator"]]
  },
  {
    slug: "watts-to-dbm",
    title: "Watts to dBm Converter for RF & Ham Radio | ZL3TOM",
    h1: "Watts ↔ dBm Converter",
    desc: "Convert RF power between watts, milliwatts and dBm with this free amateur radio watts-to-dBm calculator.",
    keywords: "watts to dBm calculator, dBm to watts, RF power converter, ham radio power calculator, milliwatts dBm",
    intro: "Quickly convert RF power between watts, milliwatts and dBm for radio, antenna and test-equipment work.",
    tool: `<label for="pval">Power value</label><input id="pval" type="number" step="any" placeholder="5"><label for="unit">Input unit</label><select id="unit"><option value="w">Watts (W)</option><option value="mw">Milliwatts (mW)</option><option value="dbm">dBm</option></select><button class="button button-primary" id="calc" type="button">Convert power</button><div class="tool-result" id="result" aria-live="polite">Enter a power value.</div>`,
    script: `calc.onclick=()=>{const v=+pval.value,u=unit.value;let w;if(u==='dbm'){w=Math.pow(10,(v-30)/10)}else{if(!(v>0)){result.textContent='Enter a positive power value.';return}w=u==='mw'?v/1000:v}if(!(w>0)){result.textContent='Enter a valid value.';return}const dbm=10*Math.log10(w*1000);result.textContent=w.toPrecision(6)+' W · '+(w*1000).toPrecision(6)+' mW · '+dbm.toFixed(2)+' dBm';};`,
    explanation: `<h2>Watts and dBm</h2><p>Watts are an absolute measure of power. dBm expresses absolute power on a logarithmic scale referenced to one milliwatt, which makes large power ratios easier to compare.</p><h2>Why radio operators use dBm</h2><p>Receiver sensitivity, signal generators, attenuators and RF system calculations often use dBm, while transmitter output is commonly quoted in watts.</p>`,
    faq: [["What is 1 watt in dBm?","1 watt equals 30 dBm."],["What is 0 dBm?","0 dBm equals 1 milliwatt."]],
    related: [["/tools/ohms-law-rf-power-calculator","Ohm's Law & RF power"],["/tools/coax-loss-calculator","Coax loss calculator"],["/tools","All radio tools"]]
  },
  {
    slug: "repeater-offset-calculator",
    title: "Repeater Offset Calculator | TX & RX Frequency | Ham Radio | ZL3TOM",
    h1: "Repeater Input / Offset Calculator",
    desc: "Free ham radio repeater offset calculator. Enter repeater output frequency, offset and direction to calculate your radio transmit and receive frequencies.",
    keywords: "repeater offset calculator, repeater input frequency calculator, ham radio repeater frequency, TX RX calculator, radio repeater offset",
    intro: "Work out the transmit/input frequency from a repeater's output frequency and offset.",
    tool: `<label for="out">Repeater output / your RX frequency (MHz)</label><input id="out" type="number" min="0" step="any" placeholder="145.650"><label for="offset">Offset (MHz)</label><input id="offset" type="number" min="0" step="any" placeholder="0.600"><label for="dir">Direction</label><select id="dir"><option value="minus">Minus (−)</option><option value="plus">Plus (+)</option></select><button class="button button-primary" id="calc" type="button">Calculate frequencies</button><div class="tool-result" id="result" aria-live="polite">Enter the repeater output and offset.</div>`,
    script: `calc.onclick=()=>{const o=+out.value,x=+offset.value;if(!(o>0)||x<0){result.textContent='Enter valid frequencies.';return}const tx=dir.value==='plus'?o+x:o-x;result.textContent='RX/listen: '+o.toFixed(6)+' MHz · TX/input: '+tx.toFixed(6)+' MHz · '+(dir.value==='plus'?'+':'−')+x.toFixed(3)+' MHz offset';};`,
    explanation: `<h2>What is a repeater offset?</h2><p>A repeater normally receives on one frequency and transmits on another. Your radio listens to the repeater output and transmits on the repeater input.</p><h2>Check more than the frequency</h2><p>Many repeaters also require a CTCSS tone, DCS code or other access setting. Always check an up-to-date local repeater directory and the band plan that applies where you are operating.</p>`,
    faq: [["Does every repeater use the same offset?","No. Offset conventions and actual repeater frequencies vary by band and country."],["Does this calculator include tones?","No. It calculates frequencies only; confirm tones and access settings separately."]],
    related: [["/guides/repeaters-and-nets","Repeaters and nets guide"],["/tools","All radio tools"],["/guides/operating-basics","Operating basics"]]
  },
  {
    slug: "dipole-calculator",
    title: "Dipole Antenna Length Calculator | Ham Radio Wire Length | ZL3TOM",
    h1: "Dipole Antenna Length Calculator",
    desc: "Free ham radio dipole calculator. Enter frequency to estimate total half-wave dipole wire length and length for each antenna leg in metres and feet.",
    keywords: "dipole calculator, dipole antenna length calculator, ham radio antenna calculator, half wave dipole length, wire antenna calculator",
    intro: "Estimate a practical starting length for a half-wave dipole and each wire leg from your chosen operating frequency.",
    tool: `<label for="freq">Frequency (MHz)</label><input id="freq" type="number" min="0" step="any" value="14.200"><label for="band">Common band preset</label><select id="band"><option value="">Custom</option><option value="3.65">80m</option><option value="7.1">40m</option><option value="14.2">20m</option><option value="21.2">15m</option><option value="28.4">10m</option><option value="50.15">6m</option></select><button class="button button-primary" id="calc" type="button">Calculate dipole</button><div class="tool-result" id="result" aria-live="polite">Enter a frequency.</div>`,
    script: `band.onchange=()=>{if(band.value)freq.value=band.value};calc.onclick=()=>{const f=+freq.value;if(!(f>0)){result.textContent='Enter a frequency above 0 MHz.';return}const total=143/f,leg=total/2;result.textContent='Starting length: '+total.toFixed(3)+' m total ('+(total*3.28084).toFixed(2)+' ft) · Each leg: '+leg.toFixed(3)+' m ('+(leg*3.28084).toFixed(2)+' ft). Trim and tune for your installation.';};`,
    explanation: `<h2>How long should a dipole be?</h2><p>A half-wave dipole consists of two conductive legs fed near the centre. The practical starting-length formula used here is intended to get you close before final tuning.</p><h2>Why you still need to tune it</h2><p>Height above ground, nearby objects, wire insulation, end effects and the feed arrangement can shift resonance. Cut slightly long where practical, then measure and trim carefully.</p>`,
    faq: [["Is the calculated length exact?","No. It is a practical starting point. Real installations usually need final tuning."],["What does each leg mean?","A centre-fed half-wave dipole has two roughly equal wire sections, one on each side of the feed point."]],
    related: [["/guides/antenna-basics","Antenna basics"],["/tools/swr-calculator","SWR calculator"],["/tools/coax-loss-calculator","Coax loss calculator"]]
  },
  {
    slug: "coax-loss-calculator",
    title: "Coax Loss Calculator for Ham Radio | RG-58, RG-8X, RG-213, LMR-400 | ZL3TOM",
    h1: "Coax Loss Calculator",
    desc: "Estimate ham radio coax feed-line loss by cable type, frequency and length for RG-58, RG-8X, RG-213 and LMR-400.",
    keywords: "coax loss calculator, ham radio coax loss, RG58 loss calculator, RG213 loss, LMR400 loss, feedline loss calculator",
    intro: "Estimate feed-line attenuation for several common coax types at your operating frequency and cable length.",
    tool: `<label for="type">Coax type</label><select id="type"><option value="rg58">RG-58</option><option value="rg8x">RG-8X</option><option value="rg213">RG-213</option><option value="lmr400">LMR-400</option></select><label for="freq">Frequency (MHz)</label><input id="freq" type="number" min="0" step="any" value="145"><label for="len">Cable length (m)</label><input id="len" type="number" min="0" step="any" value="20"><button class="button button-primary" id="calc" type="button">Estimate loss</button><div class="tool-result" id="result" aria-live="polite">Choose a cable and enter frequency and length.</div>`,
    script: `const c={rg58:['RG-58',.175,.0009],rg8x:['RG-8X',.115,.00065],rg213:['RG-213',.075,.00042],lmr400:['LMR-400',.039,.00022]};calc.onclick=()=>{const a=c[type.value],f=+freq.value,l=+len.value;if(!(f>0)||l<0){result.textContent='Enter a valid frequency and length.';return}const loss100=a[1]*Math.sqrt(f)+a[2]*f,loss=loss100*(l/30.48),del=Math.pow(10,-loss/10)*100;result.textContent=a[0]+': approx. '+loss.toFixed(2)+' dB loss · about '+del.toFixed(1)+'% of input power reaches the load before mismatch loss.';};`,
    explanation: `<h2>Why coax loss matters</h2><p>Every feed line attenuates RF. Loss generally increases with frequency and cable length, which is why a cable that is acceptable on HF may be less attractive on VHF or UHF.</p><h2>Planning estimate only</h2><p>Actual performance depends on the specific manufacturer's cable, connectors, age, moisture, installation and frequency. Use the cable maker's data sheet when precision matters.</p>`,
    faq: [["Does shorter coax reduce loss?","Generally yes. With the same cable and frequency, a shorter run produces less attenuation."],["Why is loss worse at higher frequency?","Most coaxial cables have increasing attenuation as frequency rises."]],
    related: [["/guides/antenna-basics","Antenna basics"],["/tools/swr-calculator","SWR calculator"],["/tools/dipole-calculator","Dipole calculator"]]
  },
  {
    slug: "maidenhead-grid-calculator",
    title: "Maidenhead Grid Square Calculator | Latitude & Longitude to Locator | ZL3TOM",
    h1: "Maidenhead Grid Square Calculator",
    desc: "Convert latitude and longitude to a 6-character Maidenhead grid locator with this free ham radio grid square calculator.",
    keywords: "Maidenhead grid calculator, grid square calculator, ham radio locator, latitude longitude to Maidenhead, grid locator",
    intro: "Convert geographic latitude and longitude into a 6-character Maidenhead locator for amateur radio logging, awards and station location sharing.",
    tool: `<label for="lat">Latitude</label><input id="lat" type="number" min="-90" max="90" step="any" placeholder="-43.5321"><label for="lon">Longitude</label><input id="lon" type="number" min="-180" max="180" step="any" placeholder="172.6362"><button class="button button-primary" id="calc" type="button">Calculate grid square</button><div class="tool-result" id="result" aria-live="polite">Enter latitude and longitude.</div>`,
    script: `function maiden(lat,lon){if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180)return null;lon+=180;lat+=90;const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';return A[Math.floor(lon/20)]+A[Math.floor(lat/10)]+Math.floor((lon%20)/2)+Math.floor(lat%10)+A[Math.floor(((lon%2)*60)/5)].toLowerCase()+A[Math.floor(((lat%1)*60)/2.5)].toLowerCase()}calc.onclick=()=>{const g=maiden(+lat.value,+lon.value);result.textContent=g?'6-character Maidenhead locator: '+g:'Enter valid latitude and longitude.';};`,
    explanation: `<h2>What is a Maidenhead locator?</h2><p>The Maidenhead Locator System divides the world into progressively smaller grid areas represented by letters and numbers. Amateur operators commonly exchange grid locators for logging, VHF/UHF activity and awards.</p><h2>How precise is a 6-character locator?</h2><p>A 6-character locator identifies a small geographic area rather than an exact street address, so it is useful for station location without implying GPS-level precision.</p>`,
    faq: [["Can I use negative coordinates?","Yes. Use negative latitude for south and negative longitude for west."],["Why do radio operators exchange grids?","Grid locators are useful for location-based awards, VHF/UHF contacts, logging and distance calculations."]],
    related: [["/tools","All radio tools"],["/guides/logging-contacts-on-qrz","Logging contacts on QRZ"],["/guides/operating-basics","Operating basics"]]
  }
];

function jsonLd(p){
  return JSON.stringify({"@context":"https://schema.org","@type":"WebApplication",name:p.h1,url:`https://zl3tom.com/tools/${p.slug}`,applicationCategory:"UtilitiesApplication",operatingSystem:"Any",isAccessibleForFree:true,author:{"@type":"Person",name:"Thomas Bernard",alternateName:"ZL3TOM"}});
}
function faqJson(items){return JSON.stringify({"@context":"https://schema.org","@type":"FAQPage",mainEntity:items.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))});}
function pageHtml(p){
  const faq=p.faq.map(([q,a])=>`<h3>${q}</h3><p>${a}</p>`).join("");
  const related=p.related.map(([u,t])=>`<a class="button button-secondary" href="${u}">${t} →</a>`).join("");
  return `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${p.title}</title><meta name="description" content="${p.desc}"><meta name="keywords" content="${p.keywords}"><meta name="author" content="Thomas Bernard — ZL3TOM"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><link rel="canonical" href="https://zl3tom.com/tools/${p.slug}"><link rel="stylesheet" href="/style.css?v=20260904-fullfix1"><link rel="stylesheet" href="/site-extras.css?v=20260904-fullfix1"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta property="og:type" content="website"><meta property="og:title" content="${p.h1} | ZL3TOM"><meta property="og:description" content="${p.desc}"><meta property="og:url" content="https://zl3tom.com/tools/${p.slug}"><meta property="og:site_name" content="ZL3TOM Amateur Radio"><meta property="og:locale" content="en_NZ"><meta property="og:image" content="https://zl3tom.com/social-preview.png"><meta property="og:image:secure_url" content="https://zl3tom.com/social-preview.png"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${p.h1} — ZL3TOM Amateur Radio"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${p.h1} | ZL3TOM"><meta name="twitter:description" content="${p.desc}"><meta name="twitter:image" content="https://zl3tom.com/social-preview.png"><meta name="twitter:image:alt" content="${p.h1} — ZL3TOM Amateur Radio"><link rel="me" href="https://www.facebook.com/zl3tom"><style>.calculator-wrap{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.75fr);gap:1.4rem;align-items:start}.calculator-card,.seo-copy{background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:18px;padding:1.3rem;box-shadow:0 12px 30px rgba(15,23,42,.06)}.calculator-card label{display:block;font-weight:700;margin:.8rem 0 .3rem}.calculator-card input,.calculator-card select{width:100%;padding:.75rem;border:1px solid #cbd5e1;border-radius:10px;font:inherit}.calculator-card button{margin-top:1rem}.tool-result{margin-top:1rem;padding:.9rem 1rem;background:#f1f5f9;border-radius:12px;min-height:2.7rem}.related-tools{display:flex;gap:.6rem;flex-wrap:wrap}.breadcrumb{margin-bottom:1rem;font-size:.95rem}.breadcrumb a{text-decoration:none}@media(max-width:800px){.calculator-wrap{grid-template-columns:1fr}}</style><script type="application/ld+json">${jsonLd(p)}</script><script type="application/ld+json">${faqJson(p.faq)}</script></head><body><a class="skip-link" href="#main">Skip to main content</a>${header}<main id="main"><section class="page-hero"><div class="signal-grid" aria-hidden="true"></div><div class="site-container page-hero-inner"><div><p class="section-kicker">Free amateur radio calculator</p><h1>${p.h1}</h1><p>${p.intro}</p></div></div></section><section class="inner-section light"><div class="site-container"><p class="breadcrumb"><a href="/">Home</a> → <a href="/tools">Radio Tools</a> → ${p.h1}</p><div class="calculator-wrap"><div class="calculator-card"><h2>Calculator</h2>${p.tool}<p class="tool-note">For learning and station planning. Always follow the regulations, equipment limits and operating practices that apply where you are located.</p></div><article class="seo-copy">${p.explanation}</article></div><article class="seo-copy" style="margin-top:1.4rem"><h2>Frequently asked questions</h2>${faq}<h2>Related amateur radio tools & guides</h2><div class="related-tools">${related}<a class="button button-secondary" href="/tools">Back to Radio Tools →</a></div></article></div></section></main>${footer}<script src="/script.js?v=20260904-fullfix1" defer></script><script>${p.script}</script></body></html>`;
}

for (const p of pages) {
  const dir=path.join(pub,"tools",p.slug); await mkdir(dir,{recursive:true}); await writeFile(path.join(dir,"index.html"),pageHtml(p));
}

const linkMap = [
  ["Maidenhead Grid Locator","maidenhead-grid-calculator","Full calculator & guide"],
  ["Antenna Length Calculator","dipole-calculator","Full dipole calculator & guide"],
  ["SWR Calculator","swr-calculator","Full SWR calculator & guide"],
  ["Watts ↔ dBm Converter","watts-to-dbm","Full watts ↔ dBm converter & guide"],
  ["Repeater Input Calculator","repeater-offset-calculator","Full repeater calculator & guide"],
  ["Coax Loss Calculator","coax-loss-calculator","Full coax loss calculator & guide"]
];
for (const file of toolsFiles) {
  let html=await readFile(file,"utf8");
  for (const [heading,slug,label] of linkMap) {
    if (html.includes(`href="/tools/${slug}"`)) continue;
    const escaped=heading.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    const re=new RegExp(`(<section class="tool-card[^"]*">(?:(?!<section class="tool-card).)*?<h2>${escaped}<\\/h2>(?:(?!<section class="tool-card).)*?)(<\\/section>)`,`s`);
    html=html.replace(re,`$1<p style="margin-top:1rem"><a href="/tools/${slug}">${label} →</a></p>$2`);
  }
  await writeFile(file,html);
}

const guideLinks = [
  ["guides-antenna-basics.html",[["/tools/dipole-calculator","Dipole Antenna Length Calculator"],["/tools/swr-calculator","SWR Calculator"],["/tools/coax-loss-calculator","Coax Loss Calculator"]]],
  [path.join("guides","antenna-basics","index.html"),[["/tools/dipole-calculator","Dipole Antenna Length Calculator"],["/tools/swr-calculator","SWR Calculator"],["/tools/coax-loss-calculator","Coax Loss Calculator"]]],
  ["guides-repeaters-and-nets.html",[["/tools/repeater-offset-calculator","Repeater Offset Calculator"]]],
  [path.join("guides","repeaters-and-nets","index.html"),[["/tools/repeater-offset-calculator","Repeater Offset Calculator"]]],
  ["guides-logging-contacts-on-qrz.html",[["/tools/maidenhead-grid-calculator","Maidenhead Grid Square Calculator"]]],
  [path.join("guides","logging-contacts-on-qrz","index.html"),[["/tools/maidenhead-grid-calculator","Maidenhead Grid Square Calculator"]]]
];
for (const [rel,links] of guideLinks) {
  const file=path.join(pub,rel); let html; try{html=await readFile(file,"utf8")}catch{continue}
  if (html.includes("Related ZL3TOM calculators")) continue;
  const anchors=links.map(([u,t])=>`<a class="button button-secondary" href="${u}">${t} →</a>`).join(" ");
  const box=`<section class="guide-section"><h2>Related ZL3TOM calculators</h2><p>Try these free browser-based tools alongside this guide.</p><p>${anchors}</p></section>`;
  html=html.replace("</main>",box+"</main>"); await writeFile(file,html);
}

let sitemap=await readFile(path.join(pub,"sitemap.xml"),"utf8");
for (const p of pages) if(!sitemap.includes(`https://zl3tom.com/tools/${p.slug}`)) sitemap=sitemap.replace("</urlset>",`  <url><loc>https://zl3tom.com/tools/${p.slug}</loc><lastmod>2026-09-05</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
await writeFile(path.join(pub,"sitemap.xml"),sitemap);
console.log(`Added ${pages.length} dedicated SEO calculator pages, Tools hub links, guide links and sitemap entries.`);