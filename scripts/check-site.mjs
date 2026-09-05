import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const htmlFiles = [];
const problems = [];

async function walk(directory) {
  for (const name of await readdir(directory)) {
    const fullPath = path.join(directory, name);
    const details = await stat(fullPath);
    if (details.isDirectory()) await walk(fullPath);
    else if (name.endsWith(".html")) htmlFiles.push(fullPath);
  }
}
async function internalPathExists(href) {
  if (href === "/") return true;
  const relativePath = href.replace(/^\//, "");
  const candidates = [path.join(publicRoot, relativePath), path.join(publicRoot, relativePath, "index.html"), path.join(publicRoot, `${relativePath}.html`)];
  for (const candidate of candidates) { try { if ((await stat(candidate)).isFile()) return true; } catch {} }
  return false;
}
await walk(publicRoot);
let jsonLdBlocks = 0;
for (const filePath of htmlFiles) {
  const relativeFile = path.relative(publicRoot, filePath);
  const html = await readFile(filePath, "utf8");
  const requiredMarkup = [["<title>","a title"],["name=\"description\"","a meta description"],["rel=\"canonical\"","a canonical URL"],["<h1","an H1"],["/script.js","the site script"],["/style.css","the shared stylesheet"],["property=\"og:image\" content=\"https://zl3tom.com/social-preview.png\"","an Open Graph preview image"],["name=\"twitter:card\" content=\"summary_large_image\"","a large Twitter/X preview card"],["name=\"twitter:image\" content=\"https://zl3tom.com/social-preview.png\"","a Twitter/X preview image"],["property=\"og:image:width\" content=\"1200\"","the social image width"],["property=\"og:image:height\" content=\"630\"","the social image height"],["property=\"og:image:alt\"","social preview alt text"],["rel=\"me\" href=\"https://www.facebook.com/zl3tom\"","the official Facebook identity link"],[">ZL3TOM on Facebook ↗</a>","the Facebook footer link"]];
  for (const [needle, description] of requiredMarkup) if (!html.includes(needle)) problems.push(`${relativeFile} is missing ${description}.`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(match[1]); jsonLdBlocks += 1; } catch { problems.push(`${relativeFile} contains invalid JSON-LD.`); } }
  for (const match of html.matchAll(/href="(\/[^"?#]*)/g)) if (!(await internalPathExists(match[1]))) problems.push(`${relativeFile} contains a broken internal link to ${match[1]}.`);
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) if (!/\salt=("[^"]*"|'[^']*')/i.test(match[0])) problems.push(`${relativeFile} contains an image without alt text.`);
  for (const match of html.matchAll(/<iframe\b[^>]*>/gi)) if (!/\stitle=("[^"]+"|'[^']+')/i.test(match[0])) problems.push(`${relativeFile} contains an iframe without an accessible title.`);
  if (/tabindex=["'][1-9]\d*["']/i.test(html)) problems.push(`${relativeFile} uses a positive tabindex that can disrupt keyboard navigation.`);
  const canonicalUrl = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i)?.[1];
  const openGraphUrl = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)/i)?.[1];
  if (canonicalUrl && openGraphUrl !== canonicalUrl) problems.push(`${relativeFile} has an Open Graph URL that does not match its canonical URL.`);
}
const sitemap = await readFile(path.join(publicRoot, "sitemap.xml"), "utf8");
const sitemapUrlCount = [...sitemap.matchAll(/<loc>https:\/\/zl3tom\.com[^<]*<\/loc>/g)].length;
if (sitemapUrlCount !== 25) problems.push(`sitemap.xml has ${sitemapUrlCount} site URLs; expected 25.`);
if (!sitemap.includes("<image:loc>https://zl3tom.com/social-preview.png</image:loc>")) problems.push("sitemap.xml is missing the social preview image.");
try { const previewImage = await readFile(path.join(publicRoot,"social-preview.png")); const sig=previewImage.subarray(0,8).toString("hex"); const width=previewImage.readUInt32BE(16); const height=previewImage.readUInt32BE(20); if(sig!=="89504e470d0a1a0a"||width!==1200||height!==630) problems.push(`social-preview.png is ${width}×${height}; expected a 1200×630 PNG.`); } catch { problems.push("social-preview.png is missing or invalid."); }
const guidesIndex = await readFile(path.join(publicRoot,"guides.html"),"utf8");
const guideCardCount=(guidesIndex.match(/class="guide-card"/g)||[]).length;
if(guideCardCount!==19) problems.push(`The guide index has ${guideCardCount} cards; expected 19.`);
try { const searchIndex=JSON.parse(await readFile(path.join(publicRoot,"search-index.json"),"utf8")); if(searchIndex.length!==sitemapUrlCount) problems.push(`The full-content search index has ${searchIndex.length} pages; expected ${sitemapUrlCount}.`); for(const page of searchIndex) if(!page.title||!page.url||!page.content||page.content.length<40) problems.push(`The search entry for ${page.url||"an unknown page"} is incomplete.`); } catch { problems.push("search-index.json is missing or invalid."); }
const radioPage=await readFile(path.join(publicRoot,"radio-fun.html"),"utf8");
if(!radioPage.includes("https://logbook.qrz.com/lbstat/ZL3TOM/")) problems.push("The Radio Fun page is missing the QRZ Logbook widget.");
if(!radioPage.includes("This is my multimode system:")||!radioPage.includes("MY ECHOLINK NODE")||!radioPage.includes("MY ALLSTAR NODE")) problems.push("The Radio Fun page does not clearly identify the EchoLink and AllStar nodes.");
if(!radioPage.includes("http://165.22.121.189/link.php?nodes=40452")) problems.push("The Radio Fun page is missing the correct AllStar Dashboard link.");
if(!radioPage.includes("https://irn.radio/")||!radioPage.includes("https://zmr.godaddysites.com/")||!radioPage.includes("https://networkradios.weebly.com/")||!radioPage.includes("https://anzel.radio/")) problems.push("The Radio Fun page is missing one or more linked radio network links.");
if((radioPage.match(/<strong>ZMR Radio<\/strong>/g)||[]).length>0) problems.push("The old standalone ZMR Radio card is still present on Radio Fun.");
if(!radioPage.includes("data-qrz-viewer")||!radioPage.includes("data-qrz-size=\"auto\"")||!radioPage.includes("Open full-size")) problems.push("The QRZ Logbook is missing its responsive accessible viewing controls.");
const aboutPage=await readFile(path.join(publicRoot,"about.html"),"utf8"); if(!aboutPage.includes("operator-social-link")||!aboutPage.includes(">Visit my Facebook page ↗</a>")) problems.push("The About page is missing its visible Facebook link.");
const usaGuide=await readFile(path.join(publicRoot,"guides-usa-amateur-radio-band-plans.html"),"utf8"); if(!usaGuide.includes("Who this USA band-plan guide is for")||!usaGuide.includes("Working US stations from another country")||usaGuide.includes("Why a New Zealand operator may need the US plan")||usaGuide.includes("Working US stations from New Zealand")) problems.push("The USA band-plan guide is not written for an international audience.");
const networkGuide=await readFile(path.join(publicRoot,"guides-internet-linked-radio-networks.html"),"utf8"); if(!networkGuide.includes("International Radio Network")||!networkGuide.includes("ANZEL Radio")||!networkGuide.includes("ZMR Radio")||!networkGuide.includes("Network Radios")) problems.push("The internet-linked radio networks guide is incomplete.");
const responsiveCss=await readFile(path.join(publicRoot,"style.css"),"utf8"); if(!responsiveCss.includes("body.menu-open")||!responsiveCss.includes("overflow-wrap: anywhere")||!responsiveCss.includes("max-height: calc(100svh - 68px)")) problems.push("The shared mobile overflow and navigation safeguards are incomplete.");
if(problems.length>0){console.error(problems.join("\n"));process.exitCode=1;}else console.log(`Validated ${htmlFiles.length} HTML files, ${jsonLdBlocks} JSON-LD blocks, ${guideCardCount} guide cards and ${sitemapUrlCount} sitemap URLs.`);
