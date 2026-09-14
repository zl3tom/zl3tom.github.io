import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const pub=path.join(root,"public");
const problems=[];
const expected=[
 ["what-is-amateur-radio","What Is Amateur Radio? A Beginner's Guide to Ham Radio"],
 ["dmr-vs-echolink-vs-allstarlink","DMR vs EchoLink vs AllStarLink: What's the Difference?"]
];
const sitemap=await readFile(path.join(pub,"sitemap.xml"),"utf8");
const guidesIndex=await readFile(path.join(pub,"guides.html"),"utf8");
for(const [slug,title] of expected){
 try{const html=await readFile(path.join(pub,"guides",slug,"index.html"),"utf8");if(!html.includes(title))problems.push(`${slug} is missing its expected title.`);if(!html.includes(`rel="canonical" href="https://zl3tom.com/guides/${slug}"`))problems.push(`${slug} is missing its canonical URL.`);if(!html.includes('"@type":"BreadcrumbList"'))problems.push(`${slug} is missing breadcrumb structured data.`);if(!html.includes('"@type":"TechArticle"'))problems.push(`${slug} is missing TechArticle structured data.`);}catch{problems.push(`${slug} guide is missing.`)}
 if(!guidesIndex.includes(`/guides/${slug}`))problems.push(`Guides index is missing ${slug}.`);
 if(!sitemap.includes(`<loc>https://zl3tom.com/guides/${slug}</loc>`))problems.push(`Sitemap is missing ${slug}.`);
}
for(const required of ["digital-voice-for-beginners","getting-a-dmr-id","digital-radio-hotspots-pistar-wpsd","echolink-getting-started","allstarlink-for-beginners"]){if(!guidesIndex.includes(`/guides/${required}`))problems.push(`Existing specialist guide ${required} is missing from the Guides page.`)}
for(const stale of ["dmr-for-beginners","echolink-for-beginners","allstarlink-for-beginners-guide"]){
 try{await stat(path.join(pub,"guides",stale));problems.push(`Overlapping guide /guides/${stale} still exists.`)}catch{}
 if(guidesIndex.includes(`/guides/${stale}`))problems.push(`Guides page still contains overlapping ${stale}.`);
 if(sitemap.includes(`/guides/${stale}`))problems.push(`Sitemap still contains overlapping ${stale}.`);
}
const css=await readFile(path.join(pub,"site-extras.css"),"utf8");
if(!css.includes("ZL3TOM guide card responsive layout")||!css.includes("repeat(3,minmax(0,1fr))")||!css.includes("max-width:620px"))problems.push("Guide card responsive desktop/mobile CSS is missing.");
if(problems.length){console.error(problems.join("\n"));process.exitCode=1}else console.log("Guide validation passed: no overlapping DMR/EchoLink/AllStar draft pages, 2 distinct new guides, responsive cards enabled.");