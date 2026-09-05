import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");
const files = [path.join(publicRoot, "tools.html"), path.join(publicRoot, "tools", "index.html")];

const oldCard = /<section class="tool-card"><h2>Amateur Band Lookup<\/h2>[\s\S]*?<div class="tool-result" id="bandResult">Enter a frequency\.<\/div><\/section>/;
const newCard = `<section class="tool-card"><h2>Amateur Band Lookup — NZ, UK &amp; USA</h2><p>Check which broad amateur-radio band a frequency falls inside for New Zealand, the United Kingdom or the United States. <strong>New Zealand is selected by default.</strong></p><label for="bandCountry">Country / band plan</label><select id="bandCountry"><option value="NZ" selected>New Zealand (NZ)</option><option value="UK">United Kingdom (UK)</option><option value="USA">United States (USA)</option></select><label for="bandFreq">Frequency (MHz)</label><input id="bandFreq" type="number" min="0" step="any" inputmode="decimal" placeholder="e.g. 145.500"><div class="tool-actions"><button class="button button-primary" type="button" id="bandCalc">Identify band</button></div><div class="tool-result" id="bandResult" aria-live="polite">New Zealand selected. Enter a frequency to identify the amateur band.</div><p class="tool-note" id="bandPlanNote">Band edges, licence classes, permitted modes and power limits differ between countries. This lookup identifies broad allocations only — always confirm the current official rules before transmitting.</p><p class="tool-note"><strong>Official references:</strong> <a href="https://nzart.org.nz/info/band-plans/" target="_blank" rel="noopener noreferrer">NZART New Zealand band plans ↗</a> · <a href="https://rsgb.org/main/operating/band-plans/" target="_blank" rel="noopener noreferrer">RSGB UK band plans ↗</a> · <a href="https://www.arrl.org/frequency-bands" target="_blank" rel="noopener noreferrer">ARRL/FCC US frequency bands ↗</a></p></section>`;

const oldJs = /const bands=\[[\s\S]*?\];\$\("bandCalc"\)\.onclick=\(\)=>\{[\s\S]*?\};/;
const newJs = `const bandPlans={
NZ:{name:"New Zealand",source:"NZART / New Zealand amateur allocations",bands:[[0.13,0.19,"1800 metres"],[0.472,0.479,"630 metres"],[1.8,1.95,"160 metres"],[3.5,3.9,"80 metres"],[5.3515,5.3665,"60 metres"],[7,7.3,"40 metres"],[10.1,10.15,"30 metres"],[14,14.35,"20 metres"],[18.068,18.168,"17 metres"],[21,21.45,"15 metres"],[24.89,24.99,"12 metres"],[28,29.7,"10 metres"],[50,54,"6 metres"],[144,148,"2 metres"],[430,440,"70 centimetres"],[915,928,"33 centimetres"],[1240,1300,"23 centimetres"],[2396,2450,"12 centimetres"],[3300,3410,"9 centimetres"],[5650,5850,"5 centimetres"],[10000,10500,"3 centimetres"]]},
UK:{name:"United Kingdom",source:"RSGB / UK amateur allocations",bands:[[0.1357,0.1378,"2200 metres"],[0.472,0.479,"630 metres"],[1.81,2,"160 metres"],[3.5,3.8,"80 metres"],[7,7.2,"40 metres"],[10.1,10.15,"30 metres"],[14,14.35,"20 metres"],[18.068,18.168,"17 metres"],[21,21.45,"15 metres"],[24.89,24.99,"12 metres"],[28,29.7,"10 metres"],[50,52,"6 metres"],[144,146,"2 metres"],[430,440,"70 centimetres"]]},
USA:{name:"United States",source:"ARRL / FCC amateur allocations",bands:[[0.1357,0.1378,"2200 metres"],[0.472,0.479,"630 metres"],[1.8,2,"160 metres"],[3.5,4,"80/75 metres"],[5.3515,5.3665,"60 metres (15 kHz segment)"],[7,7.3,"40 metres"],[10.1,10.15,"30 metres"],[14,14.35,"20 metres"],[18.068,18.168,"17 metres"],[21,21.45,"15 metres"],[24.89,24.99,"12 metres"],[28,29.7,"10 metres"],[50,54,"6 metres"],[144,148,"2 metres"],[222,225,"1.25 metres"],[420,450,"70 centimetres"],[902,928,"33 centimetres"],[1240,1300,"23 centimetres"]]}
};
function bandLookup(){const f=Number($("bandFreq").value),code=$("bandCountry").value,plan=bandPlans[code]||bandPlans.NZ,b=plan.bands.find(x=>f>=x[0]&&f<=x[1]);if(!(f>0)){ $("bandResult").textContent=plan.name+" selected. Enter a frequency above 0 MHz.";return }$("bandResult").textContent=b?(f+" MHz falls within the "+b[2]+" amateur allocation in "+plan.name+" (broad band-edge lookup). Check the current official band plan, licence class, modes and power limits before transmitting."):("No broad amateur-band match was found for "+f+" MHz in the "+plan.name+" quick-reference data. Check the current official band plan because special, channelised or restricted allocations may not be included.")}
$("bandCalc").onclick=bandLookup;$("bandCountry").onchange=()=>{const plan=bandPlans[$("bandCountry").value]||bandPlans.NZ;$("bandResult").textContent=plan.name+" selected. Enter a frequency to identify the amateur band."};`;

for (const file of files) {
  let html = await readFile(file, "utf8");
  if (!oldCard.test(html)) throw new Error(`Could not find Amateur Band Lookup card in ${file}`);
  html = html.replace(oldCard, newCard);
  if (!oldJs.test(html)) throw new Error(`Could not find Amateur Band Lookup JavaScript in ${file}`);
  html = html.replace(oldJs, newJs);
  html = html
    .replace("<title>Amateur Radio Tools | ZL3TOM</title>", "<title>Amateur Radio Tools & Band Lookup: NZ, UK & USA | ZL3TOM</title>")
    .replace('content="Free browser-based amateur radio tools from ZL3TOM: Maidenhead grid locator, distance and bearing, wavelength and antenna calculators, band lookup, UTC clock, phonetic alphabet, Q-codes, RST helper and QSO notes."', 'content="Free amateur radio tools from ZL3TOM including New Zealand, UK and USA amateur band lookup, Maidenhead grid locator, distance and bearing, wavelength and antenna calculators, UTC clock, phonetic alphabet, Q-codes, RST helper and QSO notes."')
    .replace('content="amateur radio tools, ham radio calculator, Maidenhead grid locator, grid square converter, antenna calculator, wavelength calculator, ham radio band lookup, Q codes, RST report"', 'content="amateur radio tools, ham radio calculator, New Zealand amateur radio bands, NZ amateur band plan, UK amateur radio bands, USA amateur radio bands, ham radio band lookup, Maidenhead grid locator, antenna calculator, wavelength calculator, Q codes, RST report"')
    .replace("<h1>Amateur Radio Tools</h1>", "<h1>Amateur Radio Tools &amp; Band Lookup</h1>")
    .replace("Practical calculators and operating helpers for amateur radio. Everything on this page runs directly in your browser.", "Free amateur radio calculators and operating helpers, including a country-aware NZ, UK and USA amateur band lookup. Everything runs directly in your browser.");
  await writeFile(file, html);
}

console.log("Enhanced Amateur Band Lookup with NZ (default), UK and USA selectors and country-specific broad band edges.");
