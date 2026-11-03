'use strict';
(()=>{
 const form=document.getElementById('unlockForm'),input=document.getElementById('accessKey'),button=document.getElementById('unlockButton'),status=document.getElementById('lockStatus');
 const storageKey='wine27-private-session-key';
 const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 let busy=false;
 async function unlock(value){
  if(busy)return;busy=true;button.disabled=true;status.textContent='Открываем рабочую версию…';
  try{
   const secret=value.trim();if(!/^[A-Za-z0-9_-]{43}$/.test(secret))throw Error('key');
   const key=await crypto.subtle.importKey('raw',decode(secret),{name:'AES-GCM'},false,['decrypt']);
   const url=new URL('payload.json',location.href);url.searchParams.set('_',Date.now());
   const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('network');
   const payload=await response.json();
   const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(payload.iv),additionalData:new TextEncoder().encode('wine27-work-v1:'+payload.release)},key,decode(payload.ciphertext));
   const decoded=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
   const page=JSON.parse(decoded);if(!page.html||page.release!==payload.release)throw Error('format');
   try{sessionStorage.setItem(storageKey,secret);}catch{}
   input.value='';
   if(location.hash.startsWith('#key='))history.replaceState(null,'',location.pathname+location.search+'#load');
   document.open();document.write(page.html);document.close();
  }catch(error){
   status.textContent=error.message==='network'?'Не удалось загрузить страницу. Попробуй ещё раз.':'Не удалось открыть. Проверь персональный ключ.';
   try{sessionStorage.removeItem(storageKey);}catch{}
   input.focus();
  }finally{busy=false;button.disabled=false;}
 }
 form.addEventListener('submit',event=>{event.preventDefault();unlock(input.value);});
 let saved='';try{saved=sessionStorage.getItem(storageKey)||'';}catch{}
 const linked=location.hash.startsWith('#key=')?location.hash.slice(5):'';
 // Remove the access key from the address before any subsequent navigation.
 if(linked)history.replaceState(null,'',location.pathname+location.search+'#load');
 if(linked||saved)unlock(linked||saved);
})();
