import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const pub=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const problems=[];let checked=0;
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);if(entry.isDirectory()){await walk(file);continue;}if(!entry.name.endsWith('.html'))continue;
 const html=await readFile(file,'utf8');checked++;
 const fail=message=>problems.push(`${path.relative(pub,file)}: ${message}`);
 for(const needle of ['class="skip-link"','id="main"','tabindex="-1"','href="/accessibility.css','src="/accessibility.js','class="accessibility-footer-link"'])if(!html.includes(needle))fail(`Missing ${needle}`);
 const ids=[...html.matchAll(/<(?!script\b)[a-z][^>]*\sid="([^"]+)"/gi)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)fail('Duplicate element IDs');
 const labels=new Set([...html.matchAll(/<label\b[^>]*\sfor="([^"]+)"/g)].map(m=>m[1]));
 for(const m of html.matchAll(/<(input|select|textarea)\b[^>]*>/g)){
  if(/type="hidden"/.test(m[0]))continue;
  const id=m[0].match(/\sid="([^"]+)"/)?.[1];
  if(!labels.has(id)&&!/(aria-label|aria-labelledby)="[^"]+"/.test(m[0]))fail(`Unlabelled ${m[1]} ${id||''}`);
 }
 for(const m of html.matchAll(/<(div|p)\b[^>]*class="[^"]*\btool-result\b[^>]*>/g))if(!m[0].includes('role="status"')||!m[0].includes('aria-live="polite"'))fail('Calculator result not announced');
 for(const m of html.matchAll(/<div class="guide-table-wrap"[^>]*>/g))if(!m[0].includes('tabindex="0"')||!m[0].includes('aria-label='))fail('Reference table cannot be reached with keyboard');
 if((html.match(/<h1\b/g)||[]).length!==1)fail('Expected one page H1');
 if(!/<html\s+lang="[^"]+"/.test(html))fail('Missing document language');
}}
await walk(pub);
const guides=await readFile(path.join(pub,'guides.html'),'utf8');
if((guides.match(/class="guide-category-section"/g)||[]).length!==6)problems.push('Expected six guide topic sections');
if(!guides.includes('/guides/accessible-amateur-radio'))problems.push('Accessibility guide missing from index');
if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}else console.log(`Accessibility markup checks passed for ${checked} HTML files.`);
