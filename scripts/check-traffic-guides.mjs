import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const problems = [];

const expectedNew = [
  ["what-is-amateur-radio", "What Is Amateur Radio? A Beginner's Guide to Ham Radio"],
  ["dmr-for-beginners", "DMR for Beginners: Talkgroups, Hotspots and DMR IDs Explained"],
  ["dmr-vs-echolink-vs-allstarlink", "DMR vs EchoLink vs AllStarLink: What's the Difference?"]
];

const sitemap = await readFile(path.join(pub, "sitemap.xml"), "utf8");
const guidesIndex = await readFile(path.join(pub, "guides.html"), "utf8");

for (const [slug, title] of expectedNew) {
  const friendly = path.join(pub, "guides", slug, "index.html");
  try {
    const html = await readFile(friendly, "utf8");
    if (!html.includes(title)) problems.push(`${slug} is missing its expected title.`);
    if (!html.includes(`rel="canonical" href="https://zl3tom.com/guides/${slug}"`)) problems.push(`${slug} is missing its canonical URL.`);
    if (!html.includes('"@type":"BreadcrumbList"')) problems.push(`${slug} is missing breadcrumb structured data.`);
    if (!html.includes('"@type":"TechArticle"')) problems.push(`${slug} is missing TechArticle structured data.`);
  } catch { problems.push(`${slug} guide is missing.`); }
  if (!guidesIndex.includes(`/guides/${slug}`)) problems.push(`Guides index is missing ${slug}.`);
  if (!sitemap.includes(`<loc>https://zl3tom.com/guides/${slug}</loc>`)) problems.push(`Sitemap is missing ${slug}.`);
}

for (const [slug, title] of [
  ["echolink-getting-started", "EchoLink for Beginners: Setup, Validation, Nodes and First Contact"],
  ["allstarlink-for-beginners", "AllStarLink for Beginners: Nodes, Hubs and How AllStar Works"]
]) {
  try {
    const html = await readFile(path.join(pub, "guides", slug, "index.html"), "utf8");
    if (!html.includes(title)) problems.push(`${slug} was not upgraded to the new SEO title.`);
    if (!html.includes('data-seo-upgrade="2026-09-10"')) problems.push(`${slug} is missing its SEO content upgrade.`);
  } catch { problems.push(`${slug} existing guide is missing.`); }
}

for (const stale of ["echolink-for-beginners", "allstarlink-for-beginners-guide"]) {
  try {
    await stat(path.join(pub, "guides", stale));
    problems.push(`Duplicate guide path /guides/${stale} still exists.`);
  } catch {}
  if (sitemap.includes(`/guides/${stale}`)) problems.push(`Sitemap still contains duplicate ${stale}.`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Traffic guide validation passed: 3 new guides, 2 upgraded guides, no duplicate EchoLink/AllStar pages.");
}
