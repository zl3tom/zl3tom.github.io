document.addEventListener("DOMContentLoaded",()=>{
 const videoTab=document.getElementById("ccc-video-tab"),audioTab=document.getElementById("ccc-audio-tab");
 const video=document.getElementById("ccc-video-panel"),audioPanel=document.getElementById("ccc-audio-panel");
 const audio=document.getElementById("ccc-audio"),format=document.getElementById("ccc-audio-format");
 const title=document.getElementById("ccc-player-title"),status=document.getElementById("ccc-player-status");
 const urls={mp3:"https://ia601606.us.archive.org/9/items/coffee-coax-computers-qso-one-the-future-of-digital-voice-live-with-developer-frank-kd-8-jkk-w-9-jam/Coffee%2C%20Coax%20%26%20Computers%20-%20QSO%20One%EF%BC%9A%20The%20Future%20of%20Digital%20Voice%EF%BC%9F%20LIVE%20with%20Developer%20Frank%20KD8JKK%20%EF%BD%9C%20W9JAM.mp3",m4a:"https://ia601606.us.archive.org/9/items/coffee-coax-computers-qso-one-the-future-of-digital-voice-live-with-developer-frank-kd-8-jkk-w-9-jam/Coffee%2C%20Coax%20%26%20Computers%20-%20QSO%20One%EF%BC%9A%20The%20Future%20of%20Digital%20Voice%EF%BC%9F%20LIVE%20with%20Developer%20Frank%20KD8JKK%20%EF%BD%9C%20W9JAM.m4a"};
 function select(mode){
  const isVideo=mode==="video";
  video.hidden=!isVideo;audioPanel.hidden=isVideo;
  videoTab.classList.toggle("is-active",isVideo);audioTab.classList.toggle("is-active",!isVideo);
  videoTab.setAttribute("aria-pressed",String(isVideo));audioTab.setAttribute("aria-pressed",String(!isVideo));
  title.textContent=isVideo?"Watch the video":"Listen to the audio";
  status.textContent=isVideo?"VIDEO · YOUTUBE":"AUDIO · "+format.value.toUpperCase();
  if(isVideo)audio.pause();
 }
 videoTab.addEventListener("click",()=>select("video"));
 audioTab.addEventListener("click",()=>select("audio"));
 format.addEventListener("change",()=>{const wasPlaying=!audio.paused;audio.src=urls[format.value];audio.load();status.textContent="AUDIO · "+format.value.toUpperCase();if(wasPlaying)audio.play().catch(()=>{});});
 audio.addEventListener("play",()=>{status.textContent="PLAYING · "+format.value.toUpperCase();});
 audio.addEventListener("pause",()=>{if(!audio.ended)status.textContent="AUDIO · "+format.value.toUpperCase();});
 audio.addEventListener("ended",()=>{status.textContent="AUDIO COMPLETE";});
 select("video");
});