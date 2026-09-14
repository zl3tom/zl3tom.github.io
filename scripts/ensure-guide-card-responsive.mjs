import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "public", "site-extras.css");
const marker = "/* ZL3TOM guide card responsive layout */";
const css = `\n${marker}\n.guide-card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;align-items:stretch}.guide-card{display:flex;flex-direction:column;min-width:0;width:100%;height:100%;overflow:hidden}.guide-card .guide-card-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.guide-card h2{overflow-wrap:anywhere;word-break:normal}.guide-card p{flex:1;overflow-wrap:anywhere}.guide-card em{margin-top:auto}.guide-card svg{flex:none}@media(max-width:900px){.guide-card-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}}@media(max-width:620px){.guide-card-grid{grid-template-columns:minmax(0,1fr);gap:12px}.guide-card{padding:18px}.guide-card h2{font-size:1.15rem;line-height:1.25}.guide-card p{font-size:.92rem;line-height:1.55}.guide-card .guide-card-top{margin-bottom:10px}}\n`;
let current = await readFile(file, "utf8");
if (!current.includes(marker)) current += css;
else current = current.replace(/\/\* ZL3TOM guide card responsive layout \*\/[\s\S]*?(?=\/\* ZL3TOM|$)/, css.trimStart());
await writeFile(file, current);
console.log("Guide card responsive CSS ensured for desktop, tablet and mobile.");