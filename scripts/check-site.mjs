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
  const candidates = [
    path.join(publicRoot, relativePath),
    path.join(publicRoot, relativePath, "index.html"),
    path.join(publicRoot, `${relativePath}.html`)
  ];
  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) return true;
    } catch {
      // Try the next friendly-URL candidate.
    }
  }
  return false;
}

await walk(publicRoot);
let jsonLdBlocks = 0;

for (const filePath of htmlFiles) {
  const relativeFile = path.relative(publicRoot, filePath);
  const html = await readFile(filePath, "utf8");
  const requiredMarkup = [
    ["<title>", "a title"],
    ["name=\"description\"", "a meta description"],
    ["rel=\"canonical\"", "a canonical URL"],
    ["<h1", "an H1"],
    ["/script.js", "the site script"],
    ["site-extras.css", "the enhancement stylesheet"]
  ];
  for (const [needle, description] of requiredMarkup) {
    if (!html.includes(needle)) problems.push(`${relativeFile} is missing ${description}.`);
  }

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]);
      jsonLdBlocks += 1;
    } catch {
      problems.push(`${relativeFile} contains invalid JSON-LD.`);
    }
  }

  for (const match of html.matchAll(/href="(\/[^"?#]*)/g)) {
    if (!(await internalPathExists(match[1]))) {
      problems.push(`${relativeFile} contains a broken internal link to ${match[1]}.`);
    }
  }
}

const sitemap = await readFile(path.join(publicRoot, "sitemap.xml"), "utf8");
const sitemapUrlCount = [...sitemap.matchAll(/<loc>https:\/\/zl3tom\.com[^<]*<\/loc>/g)].length;
if (sitemapUrlCount !== 24) problems.push(`sitemap.xml has ${sitemapUrlCount} site URLs; expected 24.`);

const guidesIndex = await readFile(path.join(publicRoot, "guides.html"), "utf8");
const guideCardCount = (guidesIndex.match(/class="guide-card"/g) || []).length;
if (guideCardCount !== 18) problems.push(`The guide index has ${guideCardCount} cards; expected 18.`);

try {
  const searchIndex = JSON.parse(await readFile(path.join(publicRoot, "search-index.json"), "utf8"));
  if (searchIndex.length !== sitemapUrlCount) {
    problems.push(`The full-content search index has ${searchIndex.length} pages; expected ${sitemapUrlCount}.`);
  }
  for (const page of searchIndex) {
    if (!page.title || !page.url || !page.content || page.content.length < 40) {
      problems.push(`The search entry for ${page.url || "an unknown page"} is incomplete.`);
    }
  }
} catch {
  problems.push("search-index.json is missing or invalid.");
}

const radioPage = await readFile(path.join(publicRoot, "radio-fun.html"), "utf8");
if (!radioPage.includes("https://logbook.qrz.com/lbstat/ZL3TOM/")) {
  problems.push("The Radio Fun page is missing the QRZ Logbook widget.");
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} HTML files, ${jsonLdBlocks} JSON-LD blocks, ${guideCardCount} guide cards and ${sitemapUrlCount} sitemap URLs.`);
}
