import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const pub=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const schema={'@context':'https://schema.org','@type':'WebSite',name:'ZL3TOM Amateur Radio',alternateName:'ZL3TOM',url:'https://zl3tom.com/',inLanguage:'en-NZ',publisher:{'@type':'Person',name:'Thomas Bernard',alternateName:['ZL3TOM','ZL3KY'],url:'https://zl3tom.com/about'}};
let home=await readFile(path.join(pub,'index.html'),'utf8');
home=home.replaceAll('ZL3TOM Amateur Radio | Thomas Bernard','ZL3TOM | Amateur Radio Guides &amp; Tools in New Zealand').replaceAll('Thomas Bernard, ZL3TOM and ZL3KY — amateur radio operator in Christchurch, New Zealand. Station details, radio guides and QSL information.','Amateur radio guides and tools from Thomas Bernard, ZL3TOM, in Christchurch: NZ licensing, NZART study resources, digital radio, station details and QSLs.');
const links=`<section class="inner-section light" id="explore-radio-resources"><div class="site-container"><h2>Amateur radio guides, study resources and tools</h2><p>Get started with ham radio in New Zealand, learn practical operating skills and find help from local clubs.</p><div class="guide-card-grid"><a class="guide-card" href="/guides/amateur-radio-new-zealand"><h3>Getting licensed in New Zealand</h3><p>Find a local radio club, Ham Cram training and guidance on your certificate and callsign.</p></a><a class="guide-card" href="/guides/new-zealand-amateur-radio-exam-study"><h3>NZART study guides and practice exams</h3><p>Study books, question banks and an online practice-exam generator.</p></a><a class="guide-card" href="/guides"><h3>Browse amateur radio guides</h3><p>Antennas, repeaters, band plans, digital voice, logging and your first radio contact.</p></a><a class="guide-card" href="/tools"><h3>Radio calculators and tools</h3><p>Try antenna, coax loss, SWR, grid locator and RF power calculators.</p></a><a class="guide-card" href="/community"><h3>Amateur radio clubs and community</h3><p>Explore Christchurch radio activity and find clubs around New Zealand.</p></a></div></div></section>`;
if(!home.includes('id="explore-radio-resources"'))home=home.replace('</main>',links+'</main>');
if(!home.includes('id="website-schema"'))home=home.replace('</head>',`<script id="website-schema" type="application/ld+json">${JSON.stringify(schema)}</script></head>`);
await writeFile(path.join(pub,'index.html'),home);
for(const file of ['guides-amateur-radio-new-zealand.html','guides/amateur-radio-new-zealand/index.html']){
 let html=await readFile(path.join(pub,file),'utf8');html=html.replace('Software and network details change. Check these official pages before installing or entering account information.','Check these official NZART and RSM resources for current learning materials, examination arrangements and licensing requirements.');await writeFile(path.join(pub,file),html);
}
const changed=['/','/guides','/community','/guides/amateur-radio-new-zealand','/guides/new-zealand-amateur-radio-exam-study'];
let sitemap=await readFile(path.join(pub,'sitemap.xml'),'utf8');
sitemap=sitemap.replace(/<url>[\s\S]*?<\/url>/g,block=>{const loc=block.match(/<loc>([^<]+)<\/loc>/)?.[1];if(!changed.some(url=>'https://zl3tom.com'+url===loc))return block;return block.replace(/<lastmod>[^<]+<\/lastmod>/,'<lastmod>2026-09-30</lastmod>');});
await writeFile(path.join(pub,'sitemap.xml'),sitemap);
console.log('Homepage discovery links, website schema, licensing source text and sitemap dates updated.');
