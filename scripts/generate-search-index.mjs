import { readFile, writeFile } from "node:fs/promises";
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

const sitemap = await readFile(path.join(publicRoot, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>https:\/\/zl3tom\.com([^<]*)<\/loc>/g)]
  .map((match) => match[1] || "/");

const searchIndex = [];
for (const url of urls) {
  const relative = url === "/" ? "index.html" : path.join(url.slice(1), "index.html");
  const html = await readFile(path.join(publicRoot, relative), "utf8");
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  searchIndex.push({
    title: matchValue(html, /<title>([\s\S]*?)<\/title>/i, "ZL3TOM"),
    url,
    description: matchValue(html, /<meta\s+name="description"\s+content="([^"]*)"/i),
    content: plainText(main)
  });
}

await writeFile(path.join(publicRoot, "search-index.json"), `${JSON.stringify(searchIndex)}\n`);
console.log(`Generated full-content search index for ${searchIndex.length} pages.`);
