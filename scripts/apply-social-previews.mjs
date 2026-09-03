import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const previewUrl = "https://zl3tom.com/social-preview.png";
const previewAlt = "ZL3TOM Amateur Radio — Thomas Bernard in Christchurch, New Zealand";
const facebookUrl = "https://www.facebook.com/zl3tom";
const facebookFooterLink = `<a href="${facebookUrl}" target="_blank" rel="noopener noreferrer">ZL3TOM on Facebook ↗</a>`;
const facebookAboutLink = `<a class="button button-secondary operator-social-link" href="${facebookUrl}" target="_blank" rel="noopener noreferrer">Visit my Facebook page ↗</a>`;
const htmlFiles = [];

async function walk(directory) {
  for (const name of await readdir(directory)) {
    const fullPath = path.join(directory, name);
    const details = await stat(fullPath);
    if (details.isDirectory()) await walk(fullPath);
    else if (name.endsWith(".html")) htmlFiles.push(fullPath);
  }
}

function valueFrom(html, expression, fallback = "") {
  return html.match(expression)?.[1]?.trim() || fallback;
}

function escapeAttribute(value) {
  return value
    .replace(/&(?!#\d+;|#x[0-9a-f]+;|[a-z][a-z0-9]+;)/gi, "&amp;")
    .replaceAll('"', "&quot;");
}

await walk(publicRoot);

for (const filePath of htmlFiles) {
  let html = await readFile(filePath, "utf8");
  const title = valueFrom(html, /<title>([\s\S]*?)<\/title>/i, "ZL3TOM Amateur Radio");
  const description = valueFrom(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i,
    "Thomas Bernard, ZL3TOM — amateur radio operator in Christchurch, New Zealand.");
  const canonical = valueFrom(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i, "https://zl3tom.com/");

  html = html
    .replaceAll("https://facebook.com/zl3tom", facebookUrl)
    .replace(/\s*<!-- ZL3TOM social sharing preview -->[\s\S]*?<!-- End ZL3TOM social sharing preview -->\s*/gi, "")
    .replace(/<meta\b[^>]*(?:property|name)=["'](?:og:(?:title|description|url|site_name|locale|image(?::(?:secure_url|type|width|height|alt))?)|twitter:(?:card|title|description|image(?::alt)?))["'][^>]*>\s*/gi, "");

  if (!html.includes(facebookFooterLink)) {
    html = html.replace(
      '<a href="/contact">Contact ZL3TOM</a>',
      `<a href="/contact">Contact ZL3TOM</a>${facebookFooterLink}`
    );
  }

  if (canonical === "https://zl3tom.com/about" && !html.includes("operator-social-link")) {
    html = html.replace("</svg></a></aside>", `</svg></a>${facebookAboutLink}</aside>`);
  }

  const socialBlock = `
  <!-- ZL3TOM social sharing preview -->
  <meta property="og:title" content="${escapeAttribute(title)}">
  <meta property="og:description" content="${escapeAttribute(description)}">
  <meta property="og:url" content="${escapeAttribute(canonical)}">
  <meta property="og:site_name" content="ZL3TOM Amateur Radio">
  <meta property="og:locale" content="en_NZ">
  <meta property="og:image" content="${previewUrl}">
  <meta property="og:image:secure_url" content="${previewUrl}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${previewAlt}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttribute(title)}">
  <meta name="twitter:description" content="${escapeAttribute(description)}">
  <meta name="twitter:image" content="${previewUrl}">
  <meta name="twitter:image:alt" content="${previewAlt}">
  <link rel="me" href="${facebookUrl}">
  <!-- End ZL3TOM social sharing preview -->
`;

  html = html.replace(/<\/head>/i, `${socialBlock}</head>`);
  await writeFile(filePath, html);
}

console.log(`Added complete social sharing previews to ${htmlFiles.length} HTML files.`);
