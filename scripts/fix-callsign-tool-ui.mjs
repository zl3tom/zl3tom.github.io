import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");
const homePath = path.join(publicRoot, "index.html");
const pagePath = path.join(publicRoot, "tools", "callsign-lookup", "index.html");

let home = await readFile(homePath, "utf8");
let page = await readFile(pagePath, "utf8");

const siteHeader = home.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
if (!siteHeader) throw new Error("Could not find the main site header in public/index.html");

// Use the exact branded header used across the main site, but do not mark Home as current.
const callsignHeader = siteHeader.replace(/\saria-current="page"/g, "");
if (!/<header class="site-header">[\s\S]*?<\/header>/.test(page)) {
  throw new Error("Could not find the callsign page header");
}
page = page.replace(/<header class="site-header">[\s\S]*?<\/header>/, callsignHeader);

// Make action links clearly visible regardless of inherited button styling.
const visibilityCss = `<style id="callsignToolVisibilityFix">
.qrz-actions .button,.qrz-related .button{display:inline-flex!important;align-items:center;justify-content:center;gap:.4rem;min-height:44px;padding:.72rem 1rem;border-radius:10px;text-decoration:none!important;font-weight:750;line-height:1.2;cursor:pointer}
.qrz-actions .button-secondary,.qrz-related .button-secondary{background:#fff!important;color:#0f172a!important;border:2px solid #334155!important}
.qrz-actions .button-secondary:hover,.qrz-related .button-secondary:hover{background:#f1f5f9!important;color:#020617!important}
#qrzLogContact{background:#0f766e!important;color:#fff!important;border:2px solid #0f766e!important;font-weight:800;box-shadow:0 6px 18px rgba(15,118,110,.22)}
#qrzLogContact:hover{background:#115e59!important;color:#fff!important;border-color:#115e59!important}
.qrz-log-prompt{margin:.95rem 0 .35rem;font-weight:800;font-size:1.05rem}
.qrz-related{align-items:center}
@media(max-width:600px){.qrz-actions .button,.qrz-related .button{width:100%}}
</style>`;
page = page.replace(/<style id="callsignToolVisibilityFix">[\s\S]*?<\/style>/g, "");
page = page.replace("</head>", visibilityCss + "</head>");

// Replace the QRZ logging CTA with the direct Add QSO URL pattern.
page = page
  .replace(/<a class="button button-secondary" id="qrzLogContact"[^>]*>[^<]*<\/a>/,
    '<a class="button button-secondary" id="qrzLogContact" href="https://logbook.qrz.com/logbook/?op=add;addcall=" target="_blank" rel="noopener noreferrer">Want to log on QRZ? Click here ↗</a>')
  .replace(/<p class="qrz-note">The QRZ button[\s\S]*?<\/p>/,
    '<p class="qrz-note">QRZ opens in a new tab using your own QRZ account, with the callsign filled into the Add QSO screen.</p>');

// Add a clear prompt immediately before the QRZ logging button area if it is not already present.
if (!page.includes('class="qrz-log-prompt"')) {
  page = page.replace('<div class="qrz-actions"><button class="button button-primary" type="button" id="qsoGenerate">',
    '<p class="qrz-log-prompt">Finished your QSO? You can log the contact directly on QRZ.</p><div class="qrz-actions"><button class="button button-primary" type="button" id="qsoGenerate">');
}

// Ensure the button always points to QRZ Add QSO with the selected callsign.
if (!page.includes('function qrzLogUrl(call)')) {
  page = page.replace('function profileUrl(call){return "https://www.qrz.com/db/"+encodeURIComponent(call)}',
    'function profileUrl(call){return "https://www.qrz.com/db/"+encodeURIComponent(call)}function qrzLogUrl(call){return "https://logbook.qrz.com/logbook/?op=add;addcall="+encodeURIComponent((call||"").trim().toUpperCase())}');
}
page = page
  .replace(/qrzLogContact\.href=data\.qrzUrl\|\|profileUrl\(qsoCall\.value\)/g, 'qrzLogContact.href=qrzLogUrl(qsoCall.value)')
  .replace(/qrzLogContact\.href=profileUrl\(call\)/g, 'qrzLogContact.href=qrzLogUrl(call)');

// Keep the log link in sync when a callsign is typed manually into the QSO generator.
if (!page.includes('qsoCall.addEventListener("input"')) {
  page = page.replace('qsoGenerate.addEventListener("click",generateNote);',
    'qsoCall.addEventListener("input",()=>{qrzLogContact.href=qrzLogUrl(qsoCall.value)});qsoGenerate.addEventListener("click",generateNote);');
}

// Related tools should be plain, visible site actions.
page = page.replace('<h2>Related tools</h2><div class="qrz-related">', '<h2>Related tools</h2><p>More useful amateur radio tools from ZL3TOM.</p><div class="qrz-related">');

await writeFile(pagePath, page);
console.log("Fixed callsign tool header, visible actions and direct QRZ Add QSO link.");
