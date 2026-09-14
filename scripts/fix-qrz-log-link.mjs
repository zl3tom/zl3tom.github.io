import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "public", "tools", "callsign-lookup", "index.html");
let html = await readFile(file, "utf8");

html = html
  .replace(
    '<a class="button button-secondary" id="qrzLogContact" href="https://www.qrz.com/logbook" target="_blank" rel="noopener noreferrer">Log Contact on QRZ ↗</a>',
    '<a class="button button-secondary" id="qrzLogContact" href="https://logbook.qrz.com/logbook/?op=add;addcall=" target="_blank" rel="noopener noreferrer">Want to log on QRZ? Click here ↗</a>'
  )
  .replace(
    'The QRZ button opens QRZ in a new tab. Sign in to your own QRZ account and log the contact there.',
    'Want to log this contact on QRZ? Use the button above. QRZ opens in a new tab with the callsign filled in; sign in to your own QRZ account if needed.'
  )
  .replace(
    'function profileUrl(call){return "https://www.qrz.com/db/"+encodeURIComponent(call)}',
    'function profileUrl(call){return "https://www.qrz.com/db/"+encodeURIComponent(call)}function logbookUrl(call){return "https://logbook.qrz.com/logbook/?op=add;addcall="+encodeURIComponent(call||"")}'
  )
  .replace(
    'qrzLogContact.href=data.qrzUrl||profileUrl(qsoCall.value);',
    'qrzLogContact.href=logbookUrl(qsoCall.value);'
  )
  .replace(
    'qrzLogContact.href=profileUrl(call)}',
    'qrzLogContact.href=logbookUrl(call)}'
  );

if (!html.includes('https://logbook.qrz.com/logbook/?op=add;addcall=')) {
  throw new Error("QRZ add-QSO link was not added.");
}
if (!html.includes('function logbookUrl(call)')) {
  throw new Error("QRZ logbook URL helper was not added.");
}

await writeFile(file, html);
console.log("Updated callsign tool with QRZ Add QSO link.");
