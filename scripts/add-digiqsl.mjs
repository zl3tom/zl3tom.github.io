import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");
const digi = "https://digiqsl.com/";

async function patch(file, kind) {
  let html = await readFile(file, "utf8");
  if (html.includes(digi)) return;
  if (kind === "qsl") {
    html = html
      .replace("How to request a QRZ Logbook or eQSL confirmation from ZL3TOM.", "Confirm amateur radio contacts with ZL3TOM using QRZ Logbook, eQSL or DigiQSL digital QSL cards.")
      .replace("I’m happy to confirm contacts through QRZ Logbook or eQSL. Here’s what I need to match your QSO.", "I’m happy to confirm contacts through QRZ Logbook, eQSL and DigiQSL digital QSL cards. Here’s what I need to match your QSO.")
      .replace("Add the contact to your QRZ Logbook or eQSL.", "Add the contact to your QRZ Logbook, eQSL or DigiQSL.")
      .replace('<div class="qsl-actions">', '<div class="info-note"><p><strong>DigiQSL digital QSL cards</strong> — I also use DigiQSL for amateur radio QSL cards and contact confirmations. <a href="https://digiqsl.com/" target="_blank" rel="noopener noreferrer">Visit DigiQSL ↗</a></p></div><div class="qsl-actions">');
  } else {
    html = html
      .replace("Find ZL3TOM on EchoLink node 304602, AllStar node 40452, APRS, BrandMeister DMR TG 91, ZL DMR, Zello, Network Radios, ZMR Radio and RemoteHams.", "Find ZL3TOM on EchoLink 304602, AllStar 40452, APRS, DMR and linked networks, plus DigiQSL digital QSL cards and amateur radio contact confirmations.")
      .replace('<section class="qrz-logbook-section"', '<section class="inner-section light"><div class="site-container"><div class="content-title"><p class="section-kicker">Digital QSL cards</p><h2>DigiQSL</h2><p>I use <strong>DigiQSL</strong> as another way to share digital amateur radio QSL cards and contact confirmations. <a class="text-link" href="https://digiqsl.com/" target="_blank" rel="noopener noreferrer">Visit DigiQSL ↗</a></p></div></div></section>\n\n  <section class="qrz-logbook-section"');
  }
  await writeFile(file, html);
}

await patch(path.join(publicRoot, "qsl.html"), "qsl");
try { await patch(path.join(publicRoot, "qsl", "index.html"), "qsl"); } catch {}
await patch(path.join(publicRoot, "radio-fun.html"), "radio");
await patch(path.join(publicRoot, "radio-fun", "index.html"), "radio");
console.log("Added DigiQSL to QSL and Radio Fun pages.");
