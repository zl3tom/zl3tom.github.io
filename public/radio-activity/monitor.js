(() => {
"use strict";
const $ = (id) => document.getElementById(id);
const state = {socket:null, active:new Map(), recent:[], heard:new Set(), talkgroups:new Set(), filter:"", latest:null, radioCache:new Map()};
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clean = v => String(v ?? "").trim();
const get = (o, ...keys) => { for (const k of keys) if (o && o[k] !== undefined && o[k] !== null && o[k] !== "") return o[k]; return ""; };
const fmtTime = value => { const d = value ? new Date(value) : new Date(); return Number.isNaN(d.getTime()) ? new Date().toLocaleTimeString("en-NZ",{hour:"2-digit",minute:"2-digit",second:"2-digit"}) : d.toLocaleTimeString("en-NZ",{hour:"2-digit",minute:"2-digit",second:"2-digit"}); };
const duration = ms => { const s=Math.max(0,Math.floor(ms/1000)); return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0"); };
function payloadOf(raw){ if(typeof raw==="string"){try{return JSON.parse(raw)}catch{return {}}} return raw && typeof raw==="object" ? raw : {}; }
function normalise(raw){
 // BrandMeister wraps the Last Heard JSON inside the Socket.IO mqtt event.
 const envelope=payloadOf(raw);
 const p=payloadOf(envelope.payload ?? envelope);
 const sourceCall=clean(get(p,"SourceCall","sourceCall","callsign","Callsign")).toUpperCase();
 const sourceId=clean(get(p,"SourceID","sourceId","RadioID","radioId","id"));
 const destId=clean(get(p,"DestinationID","destinationId","Talkgroup","talkgroup","tg"));
 const event=clean(get(p,"Event","event","Type","type"));
 const repeater=clean(get(p,"LinkCall","linkCall","RepeaterCall","repeaterCall","LinkName","linkName","Repeater"));
 const slot=clean(get(p,"Slot","slot","Timeslot","timeslot"));
 const alias=clean(get(p,"TalkerAlias","talkerAlias","SourceName","sourceName","Name","name"));
 const ts=get(p,"Timestamp","timestamp","DateTime","datetime","Time","time","Stop","Start");
 const stamp=ts ? (typeof ts==="number" ? (ts<1e12?ts*1000:ts) : ts) : Date.now();
 return {sourceCall,sourceId,destId,event,repeater,slot,alias,stamp,p};
}
function isStart(e){return /start|begin|key.?on/i.test(e.event)}
function isStop(e){return /stop|end|key.?off/i.test(e.event)}
function matches(e){return !state.filter || e.destId===state.filter}
function stationKey(e){return e.sourceId || e.sourceCall || "unknown"}
function handleEvent(raw){
 const e=normalise(raw); if(!e.sourceCall && !e.sourceId) return;
 if(!e.destId) return;
 state.latest=Date.now(); state.heard.add(e.sourceCall || e.sourceId); state.talkgroups.add(e.destId);
 const key=stationKey(e)+"-"+e.destId;
 const existing=state.active.get(key);
 if(isStart(e)){state.active.set(key,{...e,startedAt:Date.now(),active:true}); addRecent({...e,active:true,startedAt:Date.now()});}
 else if(isStop(e)){if(existing){existing.active=false;existing.endedAt=Date.now();existing.last=e;state.active.delete(key);updateRecent(key,e);}else addRecent({...e,active:false});}
 else { if(existing){Object.assign(existing,e); } else addRecent({...e,active:false}); }
 render(); if(e.sourceId) lookupRadioId(e.sourceId,e.sourceCall);
}
function addRecent(e){const key=stationKey(e)+"-"+e.destId;state.recent.unshift({...e,key,receivedAt:Date.now()});state.recent=state.recent.slice(0,30);}
function updateRecent(key,e){const row=state.recent.find(x=>x.key===key);if(row){row.active=false;row.endedAt=Date.now();row.last=e;}else addRecent({...e,active:false});}
function render(){
 const filtered=[...state.active.values()].filter(matches).sort((a,b)=>b.startedAt-a.startedAt);
 $("stat-active").textContent=filtered.length;
 $("stat-heard").textContent=state.heard.size;
 $("stat-tgs").textContent=state.talkgroups.size;
 $("stat-last").textContent=state.latest?fmtTime(state.latest):"—";
 $("onair-count").textContent=filtered.length+" ACTIVE";
 $("onair-list").innerHTML=filtered.length?filtered.map(e=>`<article class="bm-onair-card"><div class="bm-avatar">${esc((e.sourceCall||e.sourceId||"?").slice(0,2))}</div><div class="bm-caller"><a href="https://www.qrz.com/db/${encodeURIComponent(e.sourceCall||"")}" target="_blank" rel="noopener noreferrer">${esc(e.sourceCall||"DMR "+e.sourceId)}</a><p>${esc(e.alias||"Operator details loading")} · DMR ID ${esc(e.sourceId||"—")}</p><p>TG ${esc(e.destId)} ${e.repeater?"· via "+esc(e.repeater):""} ${e.slot?"· Slot "+esc(e.slot):""}</p></div><div class="bm-onair-meta"><strong class="duration" data-start="${e.startedAt}">${duration(Date.now()-e.startedAt)}</strong><small>ON AIR</small></div></article>`).join(""):'<div class="bm-empty"><span class="bm-empty-icon">⌁</span><strong>No active transmissions in this view</strong><p>We are still listening for the next station.</p></div>';
 const rows=state.recent.filter(matches).slice(0,30);
 $("activity-body").innerHTML=rows.length?rows.map(e=>`<tr><td><a class="bm-table-callsign" href="https://www.qrz.com/db/${encodeURIComponent(e.sourceCall||"")}" target="_blank" rel="noopener noreferrer">${esc(e.sourceCall||"DMR "+e.sourceId)}</a><br><small>DMR ID ${esc(e.sourceId||"—")}</small></td><td><span class="bm-tg">TG ${esc(e.destId)}</span></td><td>${esc(e.repeater||"Not supplied")}${e.slot?"<br><small>Slot "+esc(e.slot)+"</small>":""}</td><td>${esc(fmtTime(e.stamp))}</td><td><span class="bm-state ${e.active?"bm-state-active":"bm-state-ended"}">${e.active?"STARTED":"HEARD"}</span></td></tr>`).join(""):'<tr><td colspan="5" class="bm-table-empty">No activity matches this talkgroup yet.</td></tr>';
 const latest=rows[0]; if(latest) showStation(latest);
 $("filter-hint").textContent=state.filter?"Filtering to talkgroup "+state.filter:"Showing all network activity";
}
function showStation(e){
 const name=e.alias||"Operator details not supplied by the live event";
 $("station-detail").innerHTML=`<div class="bm-avatar bm-avatar-large">${esc((e.sourceCall||e.sourceId||"?").slice(0,2))}</div><strong>${esc(e.sourceCall||"Unknown callsign")}</strong><p>${esc(name)}</p><div class="bm-station-id">DMR ID · ${esc(e.sourceId||"Not supplied")}</div><p>Talkgroup ${esc(e.destId)} ${e.repeater?"· "+esc(e.repeater):""}</p><a class="bm-profile-link" href="https://www.qrz.com/db/${encodeURIComponent(e.sourceCall||"")}" target="_blank" rel="noopener noreferrer">View callsign on QRZ ↗</a>`;
}
async function lookupRadioId(id,callsign){
 if(state.radioCache.has(id))return;
 state.radioCache.set(id,true);
 try{
  const url="https://radioid.net/api/dmr/user/?id="+encodeURIComponent(id);
  const response=await fetch(url,{headers:{Accept:"application/json"}});
  if(!response.ok)return;
  const data=await response.json();const user=data.results?.[0];if(!user)return;
  const match=state.recent.find(x=>x.sourceId===id);if(match&&!match.alias){match.alias=[user.fname,user.surname,user.city,user.country].filter(Boolean).join(" · ");render();}
  const active=[...state.active.values()].find(x=>x.sourceId===id);if(active&&!active.alias){active.alias=[user.fname,user.surname,user.city,user.country].filter(Boolean).join(" · ");render();}
 }catch{/* RadioID lookup is optional; the live feed remains usable without it. */}
}
function setConnection(status,label){$("connection").dataset.state=status;$("connection-label").textContent=label;$("live-indicator").classList.toggle("is-live",status==="connected");}
function connect(){
 if(!window.io){setConnection("error","Live client failed to load");return;}
 const socket=io("https://api.brandmeister.network",{path:"/lh/socket.io",transports:["websocket"],reconnection:true,reconnectionDelay:1500,reconnectionDelayMax:10000,timeout:15000});
 state.socket=socket;
 socket.on("connect",()=>{setConnection("connected","Connected to BrandMeister");socket.emit("join","everything");});
 socket.on("disconnect",()=>setConnection("connecting","Reconnecting to BrandMeister…"));
 socket.on("connect_error",()=>setConnection("error","Connection issue · retrying"));
 socket.on("mqtt",handleEvent);
}
function applyFilter(){const raw=$("talkgroup-filter").value.trim();state.filter=/^\d{1,6}$/.test(raw)?raw:"";render();}
$("apply-filter").addEventListener("click",applyFilter);
$("talkgroup-filter").addEventListener("keydown",e=>{if(e.key==="Enter")applyFilter()});
$("clear-filter").addEventListener("click",()=>{$("talkgroup-filter").value="";state.filter="";render();});
const params=new URLSearchParams(location.search);const tg=params.get("tg");if(tg&&/^\d{1,6}$/.test(tg)){$("talkgroup-filter").value=tg;state.filter=tg;}
setInterval(()=>{document.querySelectorAll(".duration").forEach(el=>{const start=Number(el.dataset.start);if(start)el.textContent=duration(Date.now()-start);});},1000);
render();connect();
})();