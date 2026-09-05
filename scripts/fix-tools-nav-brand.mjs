import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  path.join(root, "public", "tools.html"),
  path.join(root, "public", "tools", "index.html")
];

const oldBrand = '<a class="brand" href="/"><span><strong>ZL3TOM</strong><small>Amateur Radio</small></span></a>';
const newBrand = '<a class="brand" href="/" aria-label="ZL3TOM Amateur Radio home"><span class="brand-icon"><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio" aria-hidden="true"><path d="M16.247 7.761a6 6 0 0 1 0 8.478"></path><path d="M19.075 4.933a10 10 0 0 1 0 14.134"></path><path d="M4.925 19.067a10 10 0 0 1 0-14.134"></path><path d="M7.753 16.239a6 6 0 0 1 0-8.478"></path><circle cx="12" cy="12" r="2"></circle></svg></span><span><strong>ZL3TOM</strong><small>Amateur Radio</small></span></a>';

const oldMenu = '<button class="menu-button" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="Open navigation">☰</button>';
const newMenu = '<button class="menu-button" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="Open navigation"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu" aria-hidden="true"><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg></button>';

for (const file of files) {
  let html = await readFile(file, "utf8");
  if (!html.includes(oldBrand) && !html.includes(newBrand)) throw new Error(`Could not find tools brand markup in ${file}`);
  html = html.replace(oldBrand, newBrand).replace(oldMenu, newMenu);
  await writeFile(file, html);
}

console.log("Tools navbar branding now matches the main ZL3TOM site.");
