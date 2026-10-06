document.addEventListener('DOMContentLoaded',()=>{
 document.documentElement.classList.add('js-enabled');
 const category=document.getElementById('guide-category');
 const query=document.getElementById('guide-query');
 if(category&&query){
  document.getElementById('guide-filter-controls').hidden=false;
  const cards=[...document.querySelectorAll('#guide-list .guide-card')];
  const status=document.getElementById('guide-filter-status');
  function filter(){let visible=0;
   for(const card of cards){
    const text=card.querySelector('h3').textContent.toLowerCase();
    const match=(category.value==='all'||category.value===card.dataset.category)&&text.includes(query.value.trim().toLowerCase());
    card.hidden=!match;if(match)visible++;
   }
   document.getElementById('guide-list-title').textContent=category.value==='all'?'All guides':category.selectedOptions[0].textContent;
   status.textContent=`Showing ${visible} of ${cards.length} guides.`;
   document.getElementById('guide-no-results').hidden=visible!==0;
  }
  document.querySelectorAll('[data-guide-category]').forEach(link=>link.addEventListener('click',()=>{category.value=link.dataset.guideCategory;filter();}));
  let timer;
  category.addEventListener('change',filter);
  query.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(filter,250);});
  document.getElementById('guide-reset').addEventListener('click',()=>{clearTimeout(timer);category.value='all';query.value='';filter();query.focus();});
  filter();
 }
 document.querySelectorAll('.skip-link').forEach(link=>link.addEventListener('click',()=>{document.getElementById('main')?.focus({preventScroll:true});}));
 // QRZ lookup and generated notes are updated by existing tool code.
 for(const id of ['qrzResult','qrz-view-status']){const result=document.getElementById(id);if(result){result.setAttribute('role','status');result.setAttribute('aria-live','polite');result.setAttribute('aria-atomic','true');}}
 const announce=document.createElement('p');announce.className='sr-only';announce.setAttribute('role','status');announce.setAttribute('aria-live','polite');document.body.appendChild(announce);
 const generate=document.getElementById('qsoGenerate');const note=document.getElementById('qsoNote');
 if(generate&&note){generate.addEventListener('click',()=>{announce.textContent='';requestAnimationFrame(()=>{announce.textContent=note.value?'QSO note generated. Read it in the Generated QSO note field.':'Enter contact details to generate a note.';});});}
});
