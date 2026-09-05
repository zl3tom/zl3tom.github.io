import { readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(dir, "add-radio-tools.mjs");
const runtimePath = path.join(dir, ".radio-tools-runtime.mjs");
let source = await readFile(sourcePath, "utf8");

// The tools page is itself generated from a template literal. Convert the
// browser-side template literals to ordinary string concatenation before
// Node parses the generated module, so they cannot terminate the outer template.
source = source
  .replace('g?`Grid locator: ${g}`:', 'g?("Grid locator: "+g):')
  .replace('`About ${dist.toFixed(0)} km (${(dist*.621371).toFixed(0)} mi), initial bearing ${br.toFixed(0)}°.`', '("About "+dist.toFixed(0)+" km ("+(dist*.621371).toFixed(0)+" mi), initial bearing "+br.toFixed(0)+"°.")')
  .replace('`Wavelength: ${(299.792458/f).toFixed(3)} metres.`', '("Wavelength: "+(299.792458/f).toFixed(3)+" metres.")')
  .replace('`Approximate length: ${(299.792458/f*m).toFixed(3)} m (${(299.792458/f*m*100).toFixed(1)} cm). Tune for your actual antenna and installation.`', '("Approximate length: "+(299.792458/f*m).toFixed(3)+" m ("+(299.792458/f*m*100).toFixed(1)+" cm). Tune for your actual antenna and installation.")')
  .replace('`${f} MHz is in the commonly recognised ${b[2]} amateur band. Check your local band plan for exact permitted segments.`', '(f+" MHz is in the commonly recognised "+b[2]+" amateur band. Check your local band plan for exact permitted segments.")')
  .replace('`Voice report: ${$("readability").value}${$("strength").value}`', '("Voice report: "+$("readability").value+$("strength").value)')
  .replace('`Thanks ${c} for the contact today via ${m}${l?` from ${l}`:""}.${x?` ${x}.`:""} 73 de ZL3TOM.`', '("Thanks "+c+" for the contact today via "+m+(l?" from "+l:"")+"."+(x?" "+x+".":"")+" 73 de ZL3TOM.")');

await writeFile(runtimePath, source);
try {
  await import(pathToFileURL(runtimePath).href + "?v=" + Date.now());
} finally {
  await unlink(runtimePath).catch(() => {});
}
