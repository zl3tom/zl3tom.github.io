import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");

function decodeEntities(value) {
  const named = {
    amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: '"',
    ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", hellip: "…"
  };
  return value.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const hexadecimal = entity[1]?.toLowerCase() === "x";
      const number = Number.parseInt(entity.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : match;
    }
    return named[entity.toLowerCase()] ?? match;
  });
}

function plainText(html) {
  return decodeEntities(html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function matchValue(html, expression, fallback = "") {
  return decodeEntities(html.match(expression)?.[1] ?? fallback).replace(/\s+/g, " ").trim();
}

// Discover public pages directly so a missing sitemap entry cannot hide content.
async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(full));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}
const pages = new Map();
for (const file of (await htmlFiles(publicRoot)).sort()) {
  const html = await readFile(file, "utf8");
  if (/name="robots"[^>]*content="[^"]*noindex/i.test(html) || path.basename(file) === "404.html") continue;
  const canonical = matchValue(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
  if (!canonical.startsWith("https://zl3tom.com/")) continue;
  const url = new URL(canonical).pathname.replace(/\/$/, "") || "/";
  // Legacy .html copies and clean routes share one canonical result.
  if (pages.has(url)) continue;
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const labels = [...main.matchAll(/(?:alt|aria-label|title)="([^"]*)"/g)].map(match => match[1]).join(" ");
  pages.set(url, {
    title: matchValue(html, /<title>([\s\S]*?)<\/title>/i, "ZL3TOM"),
    url,
    description: matchValue(html, /<meta\s+name="description"\s+content="([^"]*)"/i),
    keywords: matchValue(html, /<meta\s+name="keywords"\s+content="([^"]*)"/i),
    content: plainText(main + " " + labels)
  });
}
const searchIndex = [...pages.values()].sort((a,b) => a.url.localeCompare(b.url));
// Preserve sitemap metadata for existing pages and include newly discovered pages.
const sitemapPath = path.join(publicRoot, "sitemap.xml");
let sitemap = await readFile(sitemapPath, "utf8");
const existing = new Map([...sitemap.matchAll(/<url>[\s\S]*?<\/url>/g)].map(match => {
  const loc = match[0].match(/<loc>([^<]+)<\/loc>/)?.[1];
  return [loc, match[0]];
}));
const today = new Date().toISOString().slice(0,10);
const entries = searchIndex.map(page => existing.get(`https://zl3tom.com${page.url}`)
  ?? `<url><loc>https://zl3tom.com${page.url}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
sitemap = sitemap.slice(0, sitemap.indexOf(">", sitemap.indexOf("<urlset")) + 1) + "\n" + entries.join("\n") + "\n</urlset>\n";
await writeFile(sitemapPath, sitemap);

await writeFile(path.join(publicRoot, "search-index.json"), `${JSON.stringify(searchIndex)}\n`);
console.log(`Generated full-content search index for ${searchIndex.length} pages.`);
