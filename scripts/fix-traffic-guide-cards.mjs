import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/></svg>`;

const cards = [
  {
    slug: "what-is-amateur-radio",
    title: "What Is Amateur Radio?",
    desc: "A beginner-friendly introduction to ham radio, including licences, callsigns, repeaters, antennas, digital modes and making your first contact."
  },
  {
    slug: "dmr-for-beginners",
    title: "DMR for Beginners",
    desc: "Learn DMR basics including DMR IDs, talkgroups, colour codes, timeslots, repeaters, hotspots and how networked DMR contacts work."
  },
  {
    slug: "dmr-vs-echolink-vs-allstarlink",
    title: "DMR vs EchoLink vs AllStarLink",
    desc: "Compare DMR, EchoLink and AllStarLink, what each system does, what equipment you need and which option may suit a beginner."
  }
];

function cardMarkup(card) {
  return `<a href="/guides/${card.slug}" class="guide-card"><div class="guide-card-top"><span>00</span>${icon}</div><h2>${card.title}</h2><p>${card.desc}</p><em>Read guide →</em></a>`;
}

function normalizeNumbers(html) {
  let number = 0;
  return html.replace(/(<a href="\/guides\/[^"]+" class="guide-card"><div class="guide-card-top"><span>)(\d+)(<\/span>)/g, (match, start, old, end) => {
    number += 1;
    return `${start}${String(number).padStart(2, "0")}${end}`;
  });
}

for (const rel of ["guides.html", path.join("guides", "index.html")]) {
  const file = path.join(pub, rel);
  let html = await readFile(file, "utf8");

  for (const card of cards) {
    const pattern = new RegExp(`<a href="/guides/${card.slug}" class="guide-card">[\\s\\S]*?<\\/a>`, "g");
    if (pattern.test(html)) {
      html = html.replace(pattern, cardMarkup(card));
    }
  }

  html = normalizeNumbers(html);
  await writeFile(file, html);
}

console.log("Matched traffic guide cards to the existing Guides card design and renumbered guide cards.");
