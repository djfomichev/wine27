/* Check for a published version without interrupting typing or losing the local scenario. */
(() => {
  const current=document.querySelector('meta[name="wine27-version"]')?.content;
  if(!current)return;
  const key='wine27-ui-before-update'+(WORKING?'-work':'');
  const status=document.getElementById('updateStatus');
  let pending=null,busy=false,lastInput=0;
  const say=text=>{if(status)status.textContent=text;};
  try{
    const stored=sessionStorage.getItem(key);
    if(stored){
      sessionStorage.removeItem(key);
      const ui=JSON.parse(stored);
      if(ui&&ui.version===current&&typeof state==='object'){
        if(['load','loadMonth','year','month','projects','expert','plan'].includes(ui.view))state.view=ui.view;
        if(Number.isInteger(ui.month)&&ui.month>=0&&ui.month<12)state.month=ui.month;
        state.category=['all','wine','music','gastro','art','city','partner','expert'].includes(ui.category)?ui.category:'all';
        state.festivalsOnly=ui.festivalsOnly===true;
        state.density=ui.readabilityVersion===2&&ui.density==='compact'?'compact':'detail';
        state.expertTrack=['all','people','wines','recognition'].includes(ui.expertTrack)?ui.expertTrack:'all';
        state.expertTier=['all','core','development','reserve','conditional_session'].includes(ui.expertTier)?ui.expertTier:'all';
        state.planMonth=Number.isInteger(ui.planMonth)&&ui.planMonth>=0&&ui.planMonth<12?ui.planMonth:null;
        state.expertMonth=Number.isInteger(ui.expertMonth)&&ui.expertMonth>=0&&ui.expertMonth<12?ui.expertMonth:null;
        state.query=typeof ui.query==='string'?ui.query:'';
        document.getElementById('search').value=state.query;render();
        const planner=document.querySelector('.team-planner');if(planner&&ui.planner)planner.open=true;
        requestAnimationFrame(()=>window.scrollTo(0,Math.max(0,Number(ui.scroll)||0)));
      }
    }
  }catch{}
  document.addEventListener('input',()=>{lastInput=Date.now();});
  const editing=()=>document.activeElement?.matches('input,textarea,select,[contenteditable="true"]')||Date.now()-lastInput<2500;
  function apply(){
    if(!pending||document.visibilityState!=='visible')return;
    if(editing()){say('Новая версия готова · обновим после ввода');return;}
    if(WORKING&&typeof loadStorageOK!=='undefined'&&!loadStorageOK){say('Новая версия готова · сначала скачайте расчёт');return;}
    try{
      if(WORKING&&typeof saveLoad==='function'&&!saveLoad()){say('Сначала скачайте расчёт, затем обновите страницу');return;}
      const ui={version:pending,readabilityVersion:2,view:state.view,month:state.month,category:state.category,festivalsOnly:state.festivalsOnly,density:state.density,expertTrack:state.expertTrack,expertTier:state.expertTier,expertMonth:state.expertMonth,planMonth:state.planMonth,query:state.query,planner:!!document.querySelector('.team-planner')?.open,scroll:window.scrollY};
      sessionStorage.setItem(key,JSON.stringify(ui));
    }catch{say('Новая версия готова · обновите страницу вручную');return;}
    const next=new URL(location.href);next.searchParams.set('v',pending);
    say('Обновляем карту…');location.replace(next.href);
  }
  async function check(){
    if(busy||document.visibilityState!=='visible')return;
    if(pending){apply();return;}
    busy=true;
    try{
      const url=new URL('site-version.json',location.href);url.searchParams.set('_',Date.now());
      const res=await fetch(url,{cache:'no-store'});if(!res.ok)return;
      const data=await res.json();
      if(!/^[a-f0-9]{16}$/.test(data.version)||data.version===current){say('Автообновление включено');return;}
      // Pages/CDN may still be publishing. Wait until the HTML carries the same version.
      const htmlURL=new URL('index.html',location.href);htmlURL.searchParams.set('v',data.version);
      const page=await fetch(htmlURL,{cache:'no-store'});if(!page.ok)return;
      const html=await page.text();
      if(!html.includes(`name="wine27-version" content="${data.version}"`))return;
      pending=data.version;apply();
    }catch{say('Автообновление · ждём соединение');}finally{busy=false;}
  }
  document.addEventListener('focusout',()=>setTimeout(apply,2700));
  document.addEventListener('visibilitychange',check);
  window.addEventListener('online',check);
  setInterval(check,15000);setTimeout(check,1500);
})();
