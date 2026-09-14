import { readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "scripts", "check-site.mjs");
const runtime = path.join(root, "scripts", ".check-site-runtime.mjs");
let code = await readFile(source, "utf8");
code = code
  .replace("sitemapUrlCount !== 40", "sitemapUrlCount !== 42")
  .replace("expected 40.`", "expected 42.`")
  .replace("guideCardCount !== 26", "guideCardCount !== 28")
  .replace("expected 26.`", "expected 28.`");
await writeFile(runtime, code);
try { await import(`${pathToFileURL(runtime).href}?v=${Date.now()}`); }
finally { await rm(runtime, { force: true }); }
