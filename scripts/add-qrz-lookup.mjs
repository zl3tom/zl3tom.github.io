import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(root, "public");
const files = [path.join(publicRoot, "tools.html"), path.join(publicRoot, "tools", "index.html")];

const card = `<section class="tool-card" id="qrzLookupCard"><h2>QRZ Callsign Intelligence</h2><p>Look up an amateur radio callsign using the QRZ XML subscription service, protected by Cloudflare Turnstile and server-side rate limits.</p><label for="qrzCallsign">Amateur radio callsign</label><input id="qrzCallsign" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="20" placeholder="e.g. ZL3TOM"><div id="qrzTurnstile" style="margin-top:1rem"></div><div class="tool-actions"><button class="button button-primary" type="button" id="qrzLookup" disabled>Look up callsign</button></div><div class="tool-result" id="qrzResult" aria-live="polite">Loading secure QRZ lookup…</div><div id="qrzDetails" hidden></div><p class="tool-note">Results are cached for up to 24 hours to reduce QRZ requests. Only selected callsign information is shown; private contact details are not exposed. Data provided by QRZ.com.</p></section>`;

const js = `<script id="qrzLookupScript">
(()=>{
  const input=document.getElementById("qrzCallsign");
  const button=document.getElementById("qrzLookup");
  const result=document.getElementById("qrzResult");
  const details=document.getElementById("qrzDetails");
  const turnstileBox=document.getElementById("qrzTurnstile");
  if(!input||!button||!result||!details||!turnstileBox)return;
  let token="";
  let widgetId=null;
  let config=null;

  function setMessage(message){result.textContent=message;}
  function resetChallenge(){token="";button.disabled=true;if(window.turnstile&&widgetId!==null){window.turnstile.reset(widgetId);}}
  function addRow(list,label,value){if(value===undefined||value===null||value==="")return;const dt=document.createElement("dt");dt.textContent=label;const dd=document.createElement("dd");dd.textContent=String(value);list.append(dt,dd);}
  function showData(data,cached){
    details.replaceChildren();
    const heading=document.createElement("h3");heading.textContent=data.callsign||data.lookupCallsign||"QRZ result";
    const list=document.createElement("dl");list.className="tool-data-list";
    addRow(list,"Name",data.name);addRow(list,"Nickname",data.nickname);addRow(list,"Country",data.country);addRow(list,"DXCC",data.dxcc);addRow(list,"Grid",data.grid);addRow(list,"Licence class",data.licenseClass);addRow(list,"CQ zone",data.cqZone);addRow(list,"ITU zone",data.ituZone);addRow(list,"QSL manager",data.qslManager);addRow(list,"LoTW",data.lotw);addRow(list,"eQSL",data.eqsl);addRow(list,"Mail QSL",data.mailQsl);addRow(list,"Aliases",data.aliases);addRow(list,"Previous callsign",data.previousCallsign);addRow(list,"Distance from Christchurch",Number.isFinite(data.distanceKm)?data.distanceKm.toLocaleString()+" km":"");addRow(list,"Bearing from Christchurch",Number.isFinite(data.bearing)?data.bearing+"°":"");
    details.append(heading,list);
    if(data.qrzUrl){const p=document.createElement("p");const link=document.createElement("a");link.className="button";link.href=data.qrzUrl;link.target="_blank";link.rel="noopener noreferrer";link.textContent="Open full QRZ profile ↗";p.append(link);details.append(p);}
    details.hidden=false;
    setMessage(cached?"Found — served from the protected 24-hour cache.":"Found — fresh data received from QRZ.");
  }
  async function lookup(){
    const callsign=input.value.trim().toUpperCase().replace(/\\s+/g,"");
    if(!callsign||!/^[A-Z0-9][A-Z0-9/\\-]*[A-Z0-9]$/.test(callsign)||!/[A-Z]/.test(callsign)||!/[0-9]/.test(callsign)){setMessage("Enter a valid amateur radio callsign.");input.focus();return;}
    if(!token){setMessage("Please complete the security check first.");return;}
    button.disabled=true;details.hidden=true;setMessage("Checking "+callsign+" with QRZ…");
    try{
      const response=await fetch("/api/qrz-lookup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({callsign,turnstileToken:token})});
      const body=await response.json().catch(()=>({}));
      if(!response.ok){setMessage(body.message||"The QRZ lookup could not be completed.");return;}
      showData(body.data,body.cached===true);
    }catch{setMessage("The QRZ lookup service could not be reached. Please try again.");}
    finally{resetChallenge();}
  }
  function renderChallenge(){
    if(!config?.enabled||!config.siteKey){setMessage("QRZ lookup is not available right now.");return;}
    if(!window.turnstile){setTimeout(renderChallenge,150);return;}
    widgetId=window.turnstile.render(turnstileBox,{sitekey:config.siteKey,theme:"auto",action:"qrz_lookup",callback:value=>{token=value;button.disabled=false;setMessage("Security check complete. Enter a callsign and select Look up callsign.");},"expired-callback":()=>{token="";button.disabled=true;setMessage("The security check expired. Please complete it again.");},"error-callback":()=>{token="";button.disabled=true;setMessage("The security check could not load. Please refresh and try again.");}});
  }
  async function initialise(){
    try{const response=await fetch("/api/qrz-config",{cache:"no-store"});config=await response.json();if(!config.enabled){setMessage("QRZ lookup is not configured right now.");return;}let script=document.querySelector('script[data-zl3tom-turnstile="1"]');if(!script){script=document.createElement("script");script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";script.async=true;script.defer=true;script.dataset.zl3tomTurnstile="1";script.addEventListener("load",renderChallenge);document.head.append(script);}else if(window.turnstile){renderChallenge();}else{script.addEventListener("load",renderChallenge,{once:true});}}catch{setMessage("QRZ lookup configuration could not be loaded.");}
  }
  button.addEventListener("click",lookup);
  input.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();lookup();}});
  initialise();
})();
</script>`;

for (const file of files) {
  let html = await readFile(file, "utf8");

  html = html.replace(/<section class="tool-card" id="qrzLookupCard">[\s\S]*?<\/section>\s*/g, "");
  html = html.replace(/<section class="tool-card"><h2>QRZ Callsign Search<\/h2>[\s\S]*?<\/section>\s*/g, "");
  html = html.replace(/<script id="qrzLookupScript">[\s\S]*?<\/script>\s*/g, "");
  html = html.replace(/<script>\s*\(\(\)=>\{\s*const input=document\.getElementById\("qrzCallsign"\);[\s\S]*?<\/script>\s*/g, "");

  const marker = '<section class="tool-card tool-wide"><h2>QSO Note Generator</h2>';
  if (!html.includes(marker)) throw new Error(`Could not find QSO Note Generator marker in ${file}`);
  html = html.replace(marker, card + "\n" + marker);
  if (!html.includes("</body>")) throw new Error(`Could not find closing body tag in ${file}`);
  html = html.replace("</body>", js + "\n</body>");

  html = html
    .replace("<title>Amateur Radio Tools & Band Lookup: NZ, UK & USA | ZL3TOM</title>", "<title>Amateur Radio Tools, QRZ Callsign Lookup & Band Lookup | ZL3TOM</title>")
    .replace("<title>Amateur Radio Tools, QRZ Callsign Search & Band Lookup | ZL3TOM</title>", "<title>Amateur Radio Tools, QRZ Callsign Lookup & Band Lookup | ZL3TOM</title>")
    .replace('content="Free amateur radio tools from ZL3TOM including QRZ callsign search, New Zealand, UK and USA amateur band lookup, Maidenhead grid locator, distance and bearing, antenna and wavelength calculators, UTC clock, Q-codes, RST helper and QSO notes."', 'content="Free amateur radio tools from ZL3TOM including protected QRZ callsign lookup, New Zealand, UK and USA amateur band lookup, Maidenhead grid locator, distance and bearing, antenna and wavelength calculators, UTC clock, Q-codes, RST helper and QSO notes."')
    .replace("Free amateur radio calculators and operating helpers, including QRZ callsign search and a country-aware NZ, UK and USA amateur band lookup. Everything runs directly in your browser.", "Free amateur radio calculators and operating helpers, including a protected QRZ callsign lookup and a country-aware NZ, UK and USA amateur band lookup.");

  await writeFile(file, html);
}

console.log("Added protected QRZ XML callsign lookup and SEO metadata.");
