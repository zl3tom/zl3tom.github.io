(() => {
"use strict";
const $ = (id) => document.getElementById(id);
const state = {socket:null, active:new Map(), recent:[], heard:new Set(), talkgroups:new Set(), filter:"", latest:null, latestStation:null, radioCache:new Map(), renderTimer:null, audioSocket:null, audioContext:null, audioProcessor:null, audioBuffer:new Float32Array(32768), audioHead:0, audioTail:0, audioFlow:0};
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
 if(isStart(e)){const startedAt=Date.now();const item={...e,startedAt,active:true};state.active.set(key,item);state.latestStation=item;addRecent({...item});}
 else if(isStop(e)){if(existing){existing.active=false;existing.endedAt=Date.now();existing.last=e;state.active.delete(key);updateRecent(key,e);}else addRecent({...e,active:false});}
 else { if(existing){Object.assign(existing,e); } else addRecent({...e,active:false}); }
 scheduleRender(); if(e.sourceId) lookupRadioId(e.sourceId,e.sourceCall);
}
function addRecent(e){const key=stationKey(e)+"-"+e.destId;const callsign=(e.sourceCall||"").toUpperCase();if(callsign)state.recent=state.recent.filter(row=>(row.sourceCall||"").toUpperCase()!==callsign);state.recent.unshift({...e,key,receivedAt:Date.now()});state.recent=state.recent.slice(0,30);}
function updateRecent(key,e){const row=state.recent.find(x=>x.key===key);if(row){row.active=false;row.endedAt=Date.now();row.last=e;}else addRecent({...e,active:false});}
function scheduleRender(){if(state.renderTimer)return;state.renderTimer=setTimeout(()=>{state.renderTimer=null;render();},900);}
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
 if(state.latestStation) showStation(state.latestStation);
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
  const match=state.recent.find(x=>x.sourceId===id);if(match&&!match.alias){match.alias=[user.fname,user.surname,user.city,user.country].filter(Boolean).join(" · ");scheduleRender();}
  const active=[...state.active.values()].find(x=>x.sourceId===id);if(active&&!active.alias){active.alias=[user.fname,user.surname,user.city,user.country].filter(Boolean).join(" · ");if(state.latestStation===active)state.latestStation=active;scheduleRender();}
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
function applyFilter(){const raw=$("talkgroup-filter").value.trim();state.filter=/^\d{1,6}$/.test(raw)?raw:"";const url=new URL(location.href);if(state.filter)url.searchParams.set("tg",state.filter);else url.searchParams.delete("tg");history.replaceState({}, "", url);updateAudioPrompt();render();}
let audioPromptTimer=null;
let audioPromptDismissed=false;
function updateAudioPrompt(){
 if(audioPromptTimer){clearTimeout(audioPromptTimer);audioPromptTimer=null;}
 const prompt=$("audio-prompt");
 if(!state.filter){prompt.hidden=true;audioPromptDismissed=false;return;}
 prompt.hidden=true;
 audioPromptDismissed=false;
 audioPromptTimer=setTimeout(()=>{if(state.filter&&!audioPromptDismissed)prompt.hidden=false;},10000);
}

function encodeMsgpack(value){
 if(Array.isArray(value)){const n=value.length;const head=n<16?[0x90|n]:n<65536?[0xdc,n>>8,n&255]:[0xdd,(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];return new Uint8Array([...head,...value.flatMap(v=>Array.from(encodeMsgpack(v)))]);}
 if(Number.isInteger(value)){if(value>=0&&value<128)return new Uint8Array([value]);if(value>=0&&value<=255)return new Uint8Array([0xcc,value]);if(value>=0&&value<=65535)return new Uint8Array([0xcd,value>>8,value&255]);if(value>=0)return new Uint8Array([0xce,(value>>>24)&255,(value>>>16)&255,(value>>>8)&255,value&255]);if(value>=-32)return new Uint8Array([value&255]);if(value>=-128)return new Uint8Array([0xd0,value&255]);if(value>=-32768)return new Uint8Array([0xd1,(value>>8)&255,value&255]);}
 throw new Error("Unsupported BrandMeister audio command");
}
function decodeMsgpack(bytes){
 let p=0;const u8=()=>bytes[p++],u16=()=>((u8()<<8)|u8()),u32=()=>{const a=u8(),b=u8(),c=u8(),d=u8();return a*16777216+b*65536+c*256+d;};
 function read(){const h=u8();if(h<0x80)return h;if(h>=0xe0)return h-256;if((h&0xf0)===0x90){const n=h&15;return Array.from({length:n},read);}if((h&0xe0)===0xa0){const n=h&31;return new TextDecoder().decode(bytes.subarray(p,p+=n));}
  if(h===0xc0)return null;if(h===0xc2)return false;if(h===0xc3)return true;
  if(h===0xcc)return u8();if(h===0xcd)return u16();if(h===0xce)return u32();
  if(h===0xd0){const n=u8();return n>127?n-256:n;}if(h===0xd1){const n=u16();return n>32767?n-65536:n;}
  if(h===0xca){const v=new DataView(bytes.buffer,bytes.byteOffset+p,4).getFloat32(0);p+=4;return v;}
  if(h===0xc4||h===0xc5||h===0xc6){const n=h===0xc4?u8():h===0xc5?u16():u32();const v=bytes.slice(p,p+n);p+=n;return v;}
  if(h===0xd9||h===0xda||h===0xdb){const n=h===0xd9?u8():h===0xda?u16():u32();const v=new TextDecoder().decode(bytes.subarray(p,p+n));p+=n;return v;}
  if(h===0xdc||h===0xdd){const n=h===0xdc?u16():u32();return Array.from({length:n},read);}
  if(h===0xde||h===0xdf){const n=h===0xde?u16():u32(),o={};for(let i=0;i<n;i++)o[read()]=read();return o;}
  throw new Error("Unsupported BrandMeister audio packet type 0x"+h.toString(16));
 }
 return read();
}
const compandTable=[0,132,396,924,1980,4092,8316,16764];
function decodeDmrSample(byte){const value=(~byte)&255,sign=value&128,exponent=(value>>4)&7,mantissa=value&15;const sample=compandTable[exponent]+(mantissa<<(exponent+3));return sign?-sample:sample;}
function pushAudio(payload){
 const bytes=payload instanceof Uint8Array?payload:new Uint8Array(payload||[]);
 for(let i=0;i<bytes.length;i++){state.audioBuffer[state.audioHead]=decodeDmrSample(bytes[i])/32768;state.audioHead=(state.audioHead+1)%state.audioBuffer.length;if(state.audioFlow<state.audioBuffer.length)state.audioFlow++;else state.audioTail=(state.audioTail+1)%state.audioBuffer.length;}
}
async function startNativeAudio(){
 const tg=state.filter;
 if(!/^\d{1,6}$/.test(tg)){ $("filter-hint").textContent="Enter a valid talkgroup number first.";return; }
 stopNativeAudio();
 try{
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass)throw new Error("Web Audio is not supported by this browser.");
  state.audioContext=new AudioContextClass({sampleRate:8000});
  state.audioProcessor=state.audioContext.createScriptProcessor(1024,0,1);
  state.audioProcessor.onaudioprocess=event=>{const output=event.outputBuffer.getChannelData(0);for(let i=0;i<output.length;i++){if(state.audioFlow){output[i]=state.audioBuffer[state.audioTail];state.audioTail=(state.audioTail+1)%state.audioBuffer.length;state.audioFlow--;}else output[i]=0;}};
  state.audioProcessor.connect(state.audioContext.destination);
  await state.audioContext.resume();
  const socket=new WebSocket("wss://hose.brandmeister.network/spotter/","spotter");state.audioSocket=socket;socket.binaryType="arraybuffer";
  socket.onopen=()=>{if(state.audioSocket===socket){socket.send(encodeMsgpack([1,[Number(tg)]]));$("audio-player-title").textContent="Playing TG "+tg+" · BrandMeister live audio";$("audio-player-status").textContent="Connected · waiting for a transmission";}};
  socket.onmessage=event=>{if(state.audioSocket!==socket)return;try{const packet=decodeMsgpack(new Uint8Array(event.data));if(!Array.isArray(packet))return;switch(packet[0]){case 11:$("audio-player-status").textContent="Receiving audio · TG "+tg;break;case 13:$("audio-player-status").textContent="Connected · waiting for the next transmission";break;case 20:pushAudio(packet[1]);$("audio-player-status").textContent="Live audio · TG "+tg;break;}}catch(error){console.error("BrandMeister audio packet error",error);}};
  socket.onerror=()=>{$("audio-player-status").textContent="Audio connection error. Please try again.";};
  socket.onclose=()=>{if(state.audioSocket===socket){state.audioSocket=null;$("audio-player-status").textContent="Audio disconnected."; }};
  $("audio-player").hidden=false;
 }catch(error){$("audio-player-status").textContent=error.message||"Could not start audio.";console.error(error);}
}
function stopNativeAudio(){
 if(state.audioSocket){try{if(state.audioSocket.readyState===WebSocket.OPEN)state.audioSocket.send(encodeMsgpack([12]));state.audioSocket.close();}catch{}state.audioSocket=null;}
 if(state.audioProcessor){state.audioProcessor.disconnect();state.audioProcessor=null;}
 if(state.audioContext){state.audioContext.close().catch(()=>{});state.audioContext=null;}
 state.audioFlow=0;state.audioHead=0;state.audioTail=0;
}

function playAudio(){
 const raw=$("talkgroup-filter").value.trim();
 if(!/^\d{1,6}$/.test(raw)){ $("filter-hint").textContent="Enter a valid talkgroup number first."; $("talkgroup-filter").focus(); return; }
 state.filter=raw;audioPromptDismissed=true;$("audio-prompt").hidden=true;
 if(audioPromptTimer){clearTimeout(audioPromptTimer);audioPromptTimer=null;}
 startNativeAudio();$("audio-player").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"nearest"});
}

$("apply-filter").addEventListener("click",applyFilter);
$("share-talkgroup").addEventListener("click",async()=>{const raw=$("talkgroup-filter").value.trim();if(!/^\d{1,6}$/.test(raw)){$("filter-hint").textContent="Enter a talkgroup number before sharing.";return;}applyFilter();const shareUrl=new URL(location.href);shareUrl.searchParams.set("tg",raw);try{if(navigator.share){await navigator.share({title:"BrandMeister TG "+raw+" · ZL3TOM Radio Activity",url:shareUrl.href});$("filter-hint").textContent="Share link ready for TG "+raw+".";}else{await navigator.clipboard.writeText(shareUrl.href);$("filter-hint").textContent="Share link copied for TG "+raw+".";}}catch(error){if(error.name!=="AbortError")$("filter-hint").textContent="Copy this link to share TG "+raw+": "+shareUrl.href;}});
$("start-listening").addEventListener("click",()=>{applyFilter();playAudio();});
$("audio-prompt-play").addEventListener("click",playAudio);
$("close-audio-player").addEventListener("click",()=>{stopNativeAudio();$("audio-player").hidden=true;});
$("talkgroup-filter").addEventListener("keydown",e=>{if(e.key==="Enter")applyFilter()});
$("clear-filter").addEventListener("click",()=>{$("talkgroup-filter").value="";state.filter="";updateAudioPrompt();render();});
const params=new URLSearchParams(location.search);const tg=params.get("tg");if(tg&&/^\d{1,6}$/.test(tg)){$("talkgroup-filter").value=tg;state.filter=tg;}updateAudioPrompt();
setInterval(()=>{document.querySelectorAll(".duration").forEach(el=>{const start=Number(el.dataset.start);if(start)el.textContent=duration(Date.now()-start);});},1000);
render();connect();
})();