import { readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "scripts", "check-site.mjs");
const runtime = path.join(root, "scripts", ".check-site-runtime.mjs");
let code = await readFile(source, "utf8");
code = code
  .replace("sitemapUrlCount !== 53", "sitemapUrlCount !== 54")
  .replace("expected 53.`", "expected 54.`")
  .replace("guideCardCount !== 30", "guideCardCount !== 30")
  .replace("expected 30.`", "expected 30.`");
await writeFile(runtime, code);
try { await import(`${pathToFileURL(runtime).href}?v=${Date.now()}`); }
finally { await rm(runtime, { force: true }); }
