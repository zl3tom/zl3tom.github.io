import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const files = [path.join(pub, "about.html"), path.join(pub, "about", "index.html")];

for (const file of files) {
  let html = await readFile(file, "utf8");

  html = html.replace(
    "I host a live FM radio show at Plains FM in Christchurch.",
    'I host a live FM radio show at <a href="http://plains.org.nz" target="_blank" rel="noopener noreferrer">Plains Media ↗</a> in Christchurch.'
  );

  html = html.replace(
    "I volunteer with Hāpai Access Card and TechMate.",
    'I volunteer with <a href="http://hapaiaccesscard.org.nz" target="_blank" rel="noopener noreferrer">Hāpai Access Card ↗</a> and <a href="http://techmate.org.nz" target="_blank" rel="noopener noreferrer">TechMate ↗</a>.'
  );

  await writeFile(file, html);
}

console.log("Updated About page: Plains Media, Hāpai Access Card and TechMate links.");
