const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function edition(working){
 const elements=new Map(),handlers={};
 function el(s){if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',value:'',hidden:false,style:{},classList:{toggle(){}},dataset:{},setAttribute(){},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false}});return elements.get(s)}
 const ctx={window:{addEventListener(){},scrollTo(){}},document:{querySelector:el,querySelectorAll:()=>[],addEventListener:(k,f)=>(handlers[k]??=[]).push(f),createElement:()=>({click(){}})},localStorage:{getItem(){return null},setItem(){}},location:{hash:'',pathname:working?'/work/':'/'},setTimeout:()=>{},URL,Blob,console};vm.createContext(ctx);
 const prefix=working?'work/':'';
 for(const p of [prefix+'data',prefix+'expert-data',prefix+'planning-data','load','expert','plan','program-guide','public-view','app'])vm.runInContext(fs.readFileSync(p+'.js','utf8'),ctx);
 return {ctx,el,run:s=>vm.runInContext(s,ctx)};
}
const pub=edition(false),work=edition(true);
const plain=x=>JSON.parse(JSON.stringify(x));
assert.deepEqual(plain(pub.run('[...D.events,...D.projects].map(e=>[e.id,e.start,e.end,e.status])')),plain(work.run('[...D.events,...D.projects].map(e=>[e.id,e.start,e.end,e.status])')),'Both editions preserve all source identities, dates and statuses');
assert.equal(pub.run('D.events.length+D.projects.length'),91);
assert.deepEqual(plain(pub.run('calendarItems().map(e=>[e.id,e.start,e.end])')),plain(work.run('calendarItems().map(e=>[e.id,e.start,e.end])')),'Dated residencies and embedded programs preserved');
assert.equal(pub.run('calendarItems().length'),87);
assert.equal(pub.run('D.issues.length'),0);assert.equal(work.run('D.issues.length'),8);
assert.equal(pub.run('P.preparation.length'),0);assert(work.run('P.preparation.length')>0);
const internal=/рабочи[йехм]+\s+(?:слот|окн|план)|рабочие окна резиденций|их связь не выяснена|не обещать тот же зал|сроки требуют решения|проверить доступность|рассчитать команду|недельная сетка|этапы подготовки|производственные|ресурсный шлюз|букинг|монтаж|демонтаж|повторный.*продакшен|пока решение не принято|предлагаемый хозяин/i;
for(const id of pub.run('[...D.events,...D.projects,...D.embedded,...D.scheduledSlots].map(e=>e.id)')){
 pub.run(`showEvent(${JSON.stringify(id)})`);const html=pub.el('#detailContent').innerHTML;
 assert(html.includes('detail-title'),id);assert.doesNotMatch(html,internal,id);
 assert.doesNotMatch(html,/project-working-plan|detail-source|planningNotes/,id);
 assert((html.match(/Предварительная дата/g)||[]).length<=1,id+' duplicated date status');
}
pub.run('showEvent("slot-noise-2027-01-23")');
assert.match(pub.el('#detailContent').innerHTML,/Кабаре «Шум»/);
assert.match(pub.el('#detailContent').innerHTML,/23 января/);
assert.match(pub.el('#detailContent').innerHTML,/Театрально-музыкальный резидент/);
for(let m=0;m<12;m++){
 pub.run(`setView('loadMonth',${m})`);let html=pub.el('#loadMonthView').innerHTML;
 assert.match(html,/Регулярная программа/);assert.doesNotMatch(html,internal,'public month '+m);
 assert.doesNotMatch(html,/team-planner|mechanics-team|mechanics-launch|data-rhythm|month-production/);
 pub.run(`setView('month',${m})`);assert.doesNotMatch(pub.el('#monthAside').innerHTML,internal,'calendar aside '+m);
 pub.run(`showTheme(${m})`);assert.doesNotMatch(pub.el('#detailContent').innerHTML,internal,'theme '+m);
 work.run(`setView('loadMonth',${m})`);html=work.el('#loadMonthView').innerHTML;
 assert.match(html,/Рассчитать команду/);assert.match(html,/Готовим к запуску|После готовности проекта/);
}
work.run('setView("loadMonth",0)');
assert.match(work.el('#loadMonthView').innerHTML,/Подготовка команды/);
assert.match(work.el('#loadMonthView').innerHTML,/Дата запуска не определена/);
assert.doesNotMatch(work.el('#loadMonthView').innerHTML,/31 ритуалов/);
assert.equal(work.run('defaultUnits(LOAD.recurring.find(r=>r.id==="bell"),0)'),'');
assert.equal(work.run('defaultUnits(LOAD.recurring.find(r=>r.id==="flash"),7)'),'');
for(const name of ['load','year','projects','expert']){
 pub.run(`setView('${name}')`);
 const id={load:'#loadView',year:'#yearGrid',projects:'#projectGrid',expert:'#expertView'}[name];
 assert.doesNotMatch(pub.el(id).innerHTML,internal,name);
 assert.equal(pub.el('#issuesBtn').hidden,true);assert.equal(pub.el('#planEntry').hidden,true);
}
pub.run('location.hash="#plan";readHash()');assert.equal(pub.run('state.view'),'load');
work.run('location.hash="#plan";readHash()');assert.equal(work.run('state.view'),'plan');assert.match(work.el('#planView').innerHTML,/Рабочий план/);
pub.run('showRhythm("noise")');assert.doesNotMatch(pub.el('#detailContent').innerHTML,internal);
const publicHTML=fs.readFileSync('index.html','utf8'),workHTML=fs.readFileSync('work/index.html','utf8');
assert.doesNotMatch(publicHTML,/href="(?:\.\/)?work\//);
assert.match(workHTML,/<base href="\.\.\/">/);assert.match(workHTML,/noindex,nofollow/);
assert.match(workHTML,/src="work\/data.js\?v=/);assert.match(workHTML,/Рабочая версия/);
assert.match(fs.readFileSync('expert.css','utf8'),/@media\(max-width:900px\)\{\.mechanics-grid,\.month-dated-grid\{grid-template-columns:minmax\(0,1fr\)/);
const updater=fs.readFileSync('auto-update.js','utf8');
assert.match(updater,/if\(WORKING&&typeof saveLoad/);assert.match(updater,/WORKING\?'-work':''/);
assert.equal(pub.run('LOAD.key'),work.run('LOAD.key'));
const release=JSON.parse(fs.readFileSync('site-version.json'));
assert.deepEqual(release,JSON.parse(fs.readFileSync('work/site-version.json')));
for(const html of [publicHTML,workHTML]){
 assert(html.includes(`name="wine27-version" content="${release.version}"`));
 for(const [,url]of html.matchAll(/(?:src|href)="([^\"]+\.(?:js|css)(?:\?[^\"]*)?)"/g))assert(url.endsWith('?v='+release.version),'Unstamped '+url);
}
console.log('PASS: both editions preserve 91 projects and 87 dated records; public views and every modal exclude operational copy; working preparation, questions, scenario and launch boundaries remain available; responsive layout and synchronized auto-update paths checked.');
