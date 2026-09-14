import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/></svg>`;
const cards = [
  {slug:"what-is-amateur-radio",title:"What Is Amateur Radio?",desc:"A worldwide beginner introduction to amateur radio: what it is, licensing, callsigns, bands, repeaters, antennas and making a first contact."},
  {slug:"dmr-vs-echolink-vs-allstarlink",title:"DMR vs EchoLink vs AllStarLink",desc:"A simple comparison of DMR, EchoLink and AllStarLink so beginners can understand what each system is for and choose the right guide next."}
];
function cardMarkup(c){return `<a href="/guides/${c.slug}" class="guide-card"><div class="guide-card-top"><span>00</span>${icon}</div><h2>${c.title}</h2><p>${c.desc}</p><em>Read guide →</em></a>`;}
for(const rel of ["guides.html",path.join("guides","index.html")]){
  const file=path.join(pub,rel); let html=await readFile(file,"utf8");
  html=html.replace(/<a href="\/guides\/dmr-for-beginners" class="guide-card">[\s\S]*?<\/a>/g,"");
  for(const c of cards){const p=new RegExp(`<a href="/guides/${c.slug}" class="guide-card">[\\s\\S]*?<\\/a>`,`g`); if(p.test(html)) html=html.replace(p,cardMarkup(c));}
  let n=0; html=html.replace(/(<a href="\/guides\/[^"]+" class="guide-card"><div class="guide-card-top"><span>)(\d+)(<\/span>)/g,(_,a,_old,b)=>`${a}${String(++n).padStart(2,"0")}${b}`);
  await writeFile(file,html);
}
console.log("Guide cards match the existing card design and are renumbered.");