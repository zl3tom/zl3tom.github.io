document.addEventListener("DOMContentLoaded",()=>{
 const $=id=>document.getElementById(id),audio=$("ariss-audio"),play=$("ariss-play"),icon=$("ariss-play-icon"),seek=$("ariss-seek"),current=$("ariss-current"),duration=$("ariss-duration"),volume=$("ariss-volume"),state=$("ariss-player-state"),status=$("ariss-status");
 const url="https://ia601804.us.archive.org/21/items/tdbnz-ariss-contact-24-08-20/tdbnz%20-%20ARISS%20Contact%2024%E2%A7%B808%E2%A7%B820.mp3",speeds=[1,1.25,1.5,1.75,2,.75];let speedIndex=0,seeking=false;
 const fmt=v=>{if(!Number.isFinite(v)||v<0)return"--:--";const n=Math.floor(v),h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=n%60;return h?h+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0"):m+":"+String(s).padStart(2,"0")};
 function message(text,label){status.textContent=text;if(label)state.textContent=label}
 async function start(){try{await audio.play()}catch(e){message(e?.name==="NotAllowedError"?"Press Play to start listening.":"The ARISS recording could not start. Use the download link to open the MP3.","PLAYBACK NEEDS A TAP")}}
 audio.src=url;audio.volume=Number(volume.value);audio.load();
 play.addEventListener("click",()=>audio.paused?start():audio.pause());
 $("ariss-back").addEventListener("click",()=>audio.currentTime=Math.max(0,audio.currentTime-15));
 $("ariss-forward").addEventListener("click",()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+30)});
 $("ariss-speed").addEventListener("click",e=>{speedIndex=(speedIndex+1)%speeds.length;audio.playbackRate=speeds[speedIndex];e.currentTarget.textContent=speeds[speedIndex]+"×"});
 volume.addEventListener("input",()=>audio.volume=Number(volume.value));
 seek.addEventListener("input",()=>{seeking=true;if(Number.isFinite(audio.duration))current.textContent=fmt(audio.duration*Number(seek.value)/1000)});
 seek.addEventListener("change",()=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number(seek.value)/1000;seeking=false});
 audio.addEventListener("loadedmetadata",()=>{duration.textContent=fmt(audio.duration);seek.disabled=false;play.disabled=false;$("ariss-back").disabled=false;$("ariss-forward").disabled=false;message("The recording is ready. Press Play to listen.","AUDIO READY")});
 audio.addEventListener("timeupdate",()=>{current.textContent=fmt(audio.currentTime);if(!seeking&&Number.isFinite(audio.duration)&&audio.duration>0)seek.value=String(Math.round(audio.currentTime/audio.duration*1000))});
 audio.addEventListener("play",()=>{icon.textContent="Ⅱ";play.setAttribute("aria-label","Pause recording")});
 audio.addEventListener("pause",()=>{icon.textContent="▶";play.setAttribute("aria-label","Play recording")});
 audio.addEventListener("playing",()=>message("You're listening to the ARISS contact recording.","PLAYING"));
 audio.addEventListener("waiting",()=>state.textContent="BUFFERING AUDIO…");
 audio.addEventListener("ended",()=>message("You've reached the end of this recording.","RECORDING COMPLETE"));
 audio.addEventListener("error",()=>{message("The MP3 could not be played in this browser. Use the download link to open the original file.","AUDIO UNAVAILABLE");play.disabled=false});
 $("ariss-download").href=url;audio.volume=Number(volume.value);
 const details=document.querySelector(".ariss-details");if(details)details.addEventListener("toggle",()=>{if(details.open)details.scrollIntoView({block:"nearest",behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})});
});