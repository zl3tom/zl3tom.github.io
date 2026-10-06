import {readFile, writeFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const pub=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const groups=[
 ['getting-started','Getting started',['what-is-amateur-radio','amateur-radio-new-zealand','new-zealand-amateur-radio-exam-study','amateur-radio-callsigns-explained','amateur-radio-slang-73-88-qth-qso-qsl','q-codes-and-jargon']],
 ['digital-voice','Digital voice and apps',['qso-one-guide','echolink-getting-started','allstarlink-for-beginners','getting-a-dmr-id','digital-voice-for-beginners','dmr-vs-echolink-vs-allstarlink','amateur-radio-apps','amateur-radio-from-your-phone','network-radios-explained','internet-linked-radio-networks','peanut-amateur-radio-app','digital-radio-hotspots-pistar-wpsd','aprs-for-beginners']],
 ['equipment','Antennas and equipment',['antenna-basics','audio-and-levels']],
 ['operating','Operating and band plans',['operating-basics','first-amateur-radio-contact','repeaters-and-nets','hf-cq-and-contacts','emergency-comms-basics','new-zealand-band-plans','usa-amateur-radio-band-plans']],
 ['logging','Logging and QSL',['logging-contacts-on-qrz']],
 ['accessibility','Accessibility and inclusion',['accessible-amateur-radio']]
];
for(const relative of ['guides.html','guides/index.html']) {
 const file=path.join(pub,relative);let html=await readFile(file,'utf8');
 if(!html.includes('id="guide-categories"')) {
  const cards=[...html.matchAll(/<a href="\/guides\/([^\"]+)" class="guide-card">[\s\S]*?<\/a>/g)];
  const bySlug=new Map(cards.map(m=>[m[1],m[0]]));
  const assigned=groups.flatMap(g=>g[2]);
  if(cards.some(m=>!assigned.includes(m[1])))throw new Error('Uncategorised guide');
  const options=groups.map(([id,title])=>`<option value="${id}">${title}</option>`).join('');
  const jumpLinks=groups.map(([id,title])=>`<a href="#category-${id}">${title}</a>`).join('');
  const controls=`<section id="guide-categories" aria-labelledby="guide-categories-title"><h2 id="guide-categories-title">Browse guides by topic</h2><p>Choose a topic below, or narrow the guide list by category and title. Website search above searches the full content of all pages.</p><nav class="guide-topic-links" aria-label="Guide topics">${jumpLinks}</nav><div id="guide-filter-controls" class="guide-filter-controls" hidden><div><label for="guide-category">Category</label><select id="guide-category"><option value="all">All categories</option>${options}</select></div><div><label for="guide-query">Filter guide titles</label><input id="guide-query" type="search" placeholder="For example, EchoLink" autocomplete="off"></div><button id="guide-reset" type="button">Clear filters</button></div><p id="guide-filter-status" role="status" aria-live="polite" aria-atomic="true"></p><p id="guide-no-results" hidden>No guides match these filters. Try a different title or clear the filters.</p></section>`;
  const sections=groups.map(([id,title,slugs])=>`<section class="guide-category-section" data-category="${id}" aria-labelledby="category-${id}"><h2 id="category-${id}">${title}</h2><div class="guide-card-grid">${slugs.filter(slug=>bySlug.has(slug)).map(slug=>bySlug.get(slug).replace(/<h2>([\s\S]*?)<\/h2>/,'<h3>$1</h3>')).join('\n')}</div></section>`).join('\n');
  const first=cards[0].index;const last=cards.at(-1);const end=last.index+last[0].length;
  const gridStart=html.lastIndexOf('<div class="guide-card-grid">',first);
  html=html.slice(0,gridStart)+controls+sections+html.slice(end).replace(/^\s*<\/div>/,'');
  // Match structured ordering to the categorised visual and reading order.
  html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(whole,json)=>{
   const data=JSON.parse(json);if(data['@type']!=='ItemList')return whole;
   const entries=new Map(data.itemListElement.map(item=>[item.url,item]));
   data.itemListElement=assigned.filter(slug=>entries.has('https://zl3tom.com/guides/'+slug)).map((slug,i)=>({...entries.get('https://zl3tom.com/guides/'+slug),position:i+1}));
   data.numberOfItems=data.itemListElement.length;return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
  });
 }
 await writeFile(file,html);
}
let files=0;
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);if(entry.isDirectory()){await walk(file);continue;}if(!entry.name.endsWith('.html'))continue;
 let html=await readFile(file,'utf8');
 html=html.replace(/>View on QRZ(?=\s|<)/g,'>View ZL3TOM on QRZ').replace(/>Read the newsletter</g,'>Read the ZL3TOM newsletter<');
 // Use the visible brand text as its accessible name for voice control.
 html=html.replace(/<a\b([^>]*class="brand"[^>]*)>/g,(_,attrs)=>`<a${attrs.replace(/\saria-label="[^"]*"/g,'')}>`);
 html=html.replace(/src="\/script\.js\?v=[^"]*"/g,'src="/script.js?v=20261006-accessibility"');
 if(!html.includes('href="/accessibility.css'))html=html.replace('</head>','<link rel="stylesheet" href="/accessibility.css?v=20261006">\n</head>');
 if(!html.includes('src="/accessibility.js'))html=html.replace('</body>','<script src="/accessibility.js?v=20261006" defer></script>\n</body>');
 html=html.replace(/<main\b([^>]*)>/,(_,attrs)=>`<main${attrs.includes('id=')?'':' id="main"'}${attrs}${attrs.includes('tabindex=')?'':' tabindex="-1"'}>`);
 if(!html.includes('class="skip-link"'))html=html.replace(/<body[^>]*>/,'$&\n<a class="skip-link" href="#main">Skip to main content</a>');
 html=html.replace(/<section class="guide-section"><h2>Related ZL3TOM calculators<\/h2>([\s\S]*?)<\/section>/g,'<section class="inner-section light"><div class="site-container"><h2>Related ZL3TOM calculators</h2>$1</div></section>');
 html=html.replace(/<span class="section-number">/g,'<span class="section-number" aria-hidden="true">');
 html=html.replace(/<(div|p)\b([^>]*class="[^"]*\btool-result\b[^>]*"[^>]*)>/g,(_,tag,attrs)=>`<${tag}${attrs.replace(/\s(?:aria-live|aria-atomic|role)="[^"]*"/g,'')} role="status" aria-live="polite" aria-atomic="true">`);
 html=html.replace(/<div class="guide-table-wrap"([^>]*)>([\s\S]*?<\/table>)<\/div>/g,(_,attrs,table)=>{
  if(attrs.includes('tabindex='))return `<div class="guide-table-wrap"${attrs}>${table}</div>`;
  const columns=[...table.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map(m=>m[1].replace(/<[^>]*>/g,'').replaceAll('&amp;','&')).join(', ');
  const label=('Scrollable table: '+columns).replaceAll('&','&amp;').replaceAll('"','&quot;');
  return `<div class="guide-table-wrap"${attrs} tabindex="0" role="region" aria-label="${label}">${table}</div>`;
 });
 html=html.replace(/<th(\s[^>]*|)>/g,(_,attrs)=>`<th${attrs}${attrs.includes('scope=')?'':' scope="col"'}>`);
 html=html.replace(/<a([^>]*class="guide-card"[^>]*)>([\s\S]*?)<\/a>/g,(_,attrs,body)=>`<a${attrs}>${body.replace(/<div class="guide-card-top">/,'<div class="guide-card-top" aria-hidden="true">').replace(/<em>(.*?)<\/em>/,'<em aria-hidden="true">$1</em>')}</a>`);
 if(!html.includes('class="accessibility-footer-link"'))html=html.replace(/<\/footer>/,'<p class="accessibility-footer-link"><a href="/guides/accessible-amateur-radio#using-this-website">Accessibility and website feedback</a></p></footer>');
 await writeFile(file,html.replace(/[ \t]+$/gm,''));files++;
}}
await walk(pub);
console.log(`Added categories and accessibility markup to ${files} HTML pages.`);
