'use strict';
// UI-only releases keep the encrypted content and the owner's key untouched.
// Replace only the two shared scripts after authenticated decryption, locally.
function refreshWorkingUI(html,config){
 if(!config.runtime||!config.css)return html;
 if(!/^\/calendar\/[a-f0-9]{20}\.js$/.test(config.runtime)||!/^\/calendar\/[a-f0-9]{20}\.css$/.test(config.css)||!/^\w{16}$/.test(config.version))throw Error('ui');
 const page=new DOMParser().parseFromString(html,'text/html');
 if(page.querySelector('meta[name="wine27-content"]')?.content!==config.contentRevision)throw Error('ui');
 const scripts=[...page.querySelectorAll('script')];
 const apps=scripts.filter(s=>s.textContent.includes("const WORKING=window.CALENDAR_DATA.edition==='working'"));
 const updates=scripts.filter(s=>s.textContent.startsWith('/* Check for a published version'));
 if(apps.length!==1||updates.length!==1)throw Error('ui');
 const runtime=page.createElement('script');runtime.src=config.runtime;
 apps[0].replaceWith(runtime);updates[0].remove();
 const css=page.querySelector('link[rel="stylesheet"][href*="master.css"]');
 if(!css)throw Error('ui');css.setAttribute('href',config.css);
 page.querySelector('meta[name="wine27-version"]').content=config.version;
 return '<!doctype html>'+page.documentElement.outerHTML;
}
(()=>{
 const form=document.getElementById('unlockForm'),input=document.getElementById('accessKey'),button=document.getElementById('unlockButton'),status=document.getElementById('lockStatus');
 const uiConfig={runtime:document.body.dataset.uiRuntime,css:document.body.dataset.uiCss,version:document.querySelector('meta[name="wine27-version"]')?.content,contentRevision:document.body.dataset.uiContent};
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
   const html=refreshWorkingUI(page.html,uiConfig);
   document.open();document.write(html);document.close();
  }catch(error){
   status.textContent=error.message==='ui'?'Рабочая версия обновляется. Обновите страницу и попробуйте ещё раз.':error.message==='network'?'Не удалось загрузить страницу. Попробуй ещё раз.':'Не удалось открыть. Проверь персональный ключ.';
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
