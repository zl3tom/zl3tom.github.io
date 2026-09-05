import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");
const files = [path.join(publicRoot, "tools.html"), path.join(publicRoot, "tools", "index.html")];

const card = `<section class="tool-card"><h2>QRZ Callsign Search</h2><p>Enter an amateur radio callsign and open its QRZ.com callsign database page.</p><label for="qrzCallsign">Amateur radio callsign</label><input id="qrzCallsign" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="20" placeholder="e.g. ZL3TOM"><div class="tool-actions"><button class="button button-primary" type="button" id="qrzLookup">Open on QRZ.com ↗</button></div><div class="tool-result" id="qrzResult" aria-live="polite">Enter a callsign such as ZL3TOM.</div><p class="tool-note">This opens the public QRZ callsign page in a new tab using <strong>qrz.com/db/CALLSIGN</strong>. QRZ.com may require you to sign in for some information.</p></section>`;

const js = `<script>
(()=>{
  const input=document.getElementById("qrzCallsign");
  const button=document.getElementById("qrzLookup");
  const result=document.getElementById("qrzResult");
  if(!input||!button||!result)return;
  function openQrz(){
    const call=input.value.trim().toUpperCase().replace(/\s+/g,"");
    if(!call||!/^[A-Z0-9/\-]+$/.test(call)){
      result.textContent="Enter a valid callsign using letters, numbers, / or -.";
      input.focus();
      return;
    }
    const url="https://www.qrz.com/db/"+encodeURIComponent(call);
    result.textContent="Opening QRZ.com for "+call+"…";
    window.open(url,"_blank","noopener,noreferrer");
  }
  button.addEventListener("click",openQrz);
  input.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();openQrz();}});
})();
</script>`;

for (const file of files) {
  let html = await readFile(file, "utf8");
  if (!html.includes('id="qrzLookup"')) {
    const marker = '<section class="tool-card tool-wide"><h2>QSO Note Generator</h2>';
    if (!html.includes(marker)) throw new Error(`Could not find QSO Note Generator marker in ${file}`);
    html = html.replace(marker, card + "\n" + marker);
  }
  if (!html.includes('const url="https://www.qrz.com/db/"')) {
    if (!html.includes("</body>")) throw new Error(`Could not find closing body tag in ${file}`);
    html = html.replace("</body>", js + "</body>");
  }
  html = html
    .replace("<title>Amateur Radio Tools & Band Lookup: NZ, UK & USA | ZL3TOM</title>", "<title>Amateur Radio Tools, QRZ Callsign Search & Band Lookup | ZL3TOM</title>")
    .replace('content="Free amateur radio tools from ZL3TOM including New Zealand, UK and USA amateur band lookup, Maidenhead grid locator, distance and bearing, wavelength and antenna calculators, UTC clock, phonetic alphabet, Q-codes, RST helper and QSO notes."', 'content="Free amateur radio tools from ZL3TOM including QRZ callsign search, New Zealand, UK and USA amateur band lookup, Maidenhead grid locator, distance and bearing, antenna and wavelength calculators, UTC clock, Q-codes, RST helper and QSO notes."')
    .replace('content="amateur radio tools, ham radio calculator, New Zealand amateur radio bands, NZ amateur band plan, UK amateur radio bands, USA amateur radio bands, ham radio band lookup, Maidenhead grid locator, antenna calculator, wavelength calculator, Q codes, RST report"', 'content="amateur radio tools, QRZ callsign search, ham radio callsign lookup, amateur radio callsign search, ham radio calculator, New Zealand amateur radio bands, NZ amateur band plan, UK amateur radio bands, USA amateur radio bands, ham radio band lookup, Maidenhead grid locator, antenna calculator, wavelength calculator, Q codes, RST report"')
    .replace("Free amateur radio calculators and operating helpers, including a country-aware NZ, UK and USA amateur band lookup. Everything runs directly in your browser.", "Free amateur radio calculators and operating helpers, including QRZ callsign search and a country-aware NZ, UK and USA amateur band lookup. Everything runs directly in your browser.");
  await writeFile(file, html);
}

console.log("Added QRZ callsign search tool and SEO metadata.");
