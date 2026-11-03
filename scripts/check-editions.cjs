const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function edition(working){
 const elements=new Map(),handlers={};
 function el(s){if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',value:'',hidden:false,style:{},classList:{toggle(){}},dataset:{},setAttribute(){},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false}});return elements.get(s)}
 const ctx={window:{addEventListener(){},scrollTo(){}},document:{querySelector:el,querySelectorAll:()=>[],addEventListener:(k,f)=>(handlers[k]??=[]).push(f),createElement:()=>({click(){}})},localStorage:{getItem(){return null},setItem(){}},location:{hash:'',pathname:working?'/work/':'/'},setTimeout:()=>{},URL,Blob,console};vm.createContext(ctx);
 const prefix=working?'private-work/':'';
 for(const p of [prefix+'data',prefix+'expert-data',prefix+'planning-data','load','expert','plan','program-guide','public-view','public-calendar','production','app'])vm.runInContext(fs.readFileSync(p+'.js','utf8'),ctx);
 return {ctx,el,handlers,run:s=>vm.runInContext(s,ctx)};
}
const pub=edition(false),work=edition(true);
const plain=x=>JSON.parse(JSON.stringify(x));
assert.deepEqual(plain(pub.run('[...D.events,...D.projects].map(e=>[e.id,e.start,e.end,e.status])')),plain(work.run('[...D.events,...D.projects].map(e=>[e.id,e.start,e.end,e.status])')),'Both editions preserve all source identities, dates and statuses');
assert.equal(pub.run('D.events.length+D.projects.length'),91);
assert.deepEqual(plain(pub.run('calendarItems().map(e=>[e.id,e.start,e.end])')),plain(work.run('calendarItems().map(e=>[e.id,e.start,e.end])')),'Dated residencies and embedded programs preserved');
assert.equal(pub.run('calendarItems().length'),88);
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
 const monthButton={dataset:{loadMonth:String(m)}};
 for(const click of pub.handlers.click)click({target:{closest:()=>monthButton}});
 assert.equal(pub.run('state.view'),'month');assert.equal(pub.run('state.month'),m);
 assert.equal(pub.el('#monthView').hidden,false);assert.equal(pub.el('#loadMonthView').hidden,true);
 let html=pub.el('#monthGrid').innerHTML+pub.el('#mobileAgenda').innerHTML+pub.el('#monthAside').innerHTML;
 assert.match(html,/data-city-day=/);assert.doesNotMatch(html,internal,'public month '+m);
 assert.doesNotMatch(html,/team-planner|mechanics-team|mechanics-launch|data-rhythm|month-production/);
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
const publicHTML=fs.readFileSync('index.html','utf8'),workHTML=fs.readFileSync('private-work/index.html','utf8');
assert.doesNotMatch(publicHTML,/href="(?:\.\/)?work\//);
assert.match(workHTML,/<base href="\.\.\/">/);assert.match(workHTML,/noindex,nofollow/);
assert.match(workHTML,/src="private-work\/data.js\?v=/);assert.match(workHTML,/Рабочая версия/);
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
console.log('PASS: both editions preserve 91 projects and 88 dated records; public views and every modal exclude operational copy; working preparation, questions, scenario and launch boundaries remain available; responsive layout and synchronized auto-update paths checked.');

// Public calendar has no project or expert portfolio navigation.
assert.doesNotMatch(publicHTML, /<button data-view="(?:projects|expert)"/);
pub.run('setView("projects")');assert.equal(pub.run('state.view'),'load');
pub.run('setView("expert")');assert.equal(pub.run('state.view'),'load');
pub.run('state.filters=[];state.query="";setView("loadMonth",7)');
assert.equal(pub.run('state.view'),'month');
assert.match(pub.el('#monthGrid').innerHTML,/data-city-day="2027-08-12"/);
assert.doesNotMatch(pub.el('#monthAside').innerHTML,/После открытия проекта|Готовим к запуску|Сервисы города|Сроки на согласовании/);
for(const id of ['bell','flash','ritual'])assert(pub.run('publicDailyFormats("2027-08-12").some(r=>r.rhythmId==="'+id+'")'));
assert.equal(pub.run('publicDailyFormats("2027-01-09").every(r=>r.rhythmId==="radio")'),true);
assert.equal(pub.run('publicDailyFormats("2027-08-14").some(r=>r.rhythmId==="bar")'),false);
assert.equal(pub.run('publicDailyFormats("2027-08-11").some(r=>r.rhythmId==="dance")'),false);
assert.equal(pub.run('publicDailyFormats("2027-03-06").some(r=>r.rhythmId==="coffee_rave")'),false);
assert.equal(pub.run('publicDailyFormats("2027-03-13").some(r=>r.rhythmId==="coffee_rave")'),true);
assert.equal(pub.run('publicDailyFormats("2027-03-18").some(r=>r.rhythmId==="wineclub")'),false);
assert.equal(pub.run('publicDailyFormats("2027-03-25").some(r=>r.rhythmId==="wineclub")'),true);
pub.run('setView("month",7)');assert.match(pub.el('#monthGrid').innerHTML,/data-city-day="2027-08-12"/);assert.match(pub.el('#mobileAgenda').innerHTML,/data-city-day="2027-08-12"/);
pub.run('showPublicDay("2027-08-12")');assert.match(pub.el('#detailContent').innerHTML,/Колокол на закате/);assert.doesNotMatch(pub.el('#detailContent').innerHTML,internal);
pub.run('showPublicRhythm("bell",7)');assert.equal((pub.el('#detailContent').innerHTML.match(/data-city-day=/g)||[]).length,31);
console.log('PASS: calendar-only navigation, rituals and regular formats in daily views, monthly rules, festival replacement and mobile day access.');

// Full expert schedule and HURMA responsibilities remain in the working edition.
for(const id of work.run('X.projects.map(p=>p.id)'))assert(work.run('!!planningItem('+JSON.stringify(id)+').start'),'Expert project lacks proposed dates: '+id);
assert.equal(work.run('planningItem("exp_sparkling_session").start'),'2027-12-03');
assert.equal(work.run('expertById.get("exp_sparkling_session").first_year'),null,'A proposed window does not approve the first year');
assert.equal(pub.run('P.production===undefined'),true,'Operational ownership must remain encrypted');
for(const role of work.run('productionRoles()'))assert(work.run('!!planningItem('+JSON.stringify(role.projectId)+')'),'Unknown production role');
assert(work.run('productionMonthData(1).parallel')>=2);assert(work.run('productionMonthData(10).parallel')>=2);
assert.equal(work.run('productionMonthData(9).lead.some(r=>r.projectId==="award")'),false);
assert.equal(work.run('productionMonthData(9).lead.some(r=>r.projectId==="wineweek")'),true);
work.run('setView("loadMonth",9)');assert.match(work.el('#loadMonthView').innerHTML,/Команда месяца/);assert.match(work.el('#loadMonthView').innerHTML,/HURMA/);
console.log('PASS: all 16 expert entries have proposed dates, HURMA roles resolve, exhibition overlaps identified, and Wine Week/Award production counted once.');

// Year/month navigation, old bookmarks and an automatic update keep the same program.
const nav=publicHTML.match(/<nav class="views city-calendar-views"[\s\S]*?<\/nav>/)[0];
assert.deepEqual([...nav.matchAll(/data-view="([^"]+)"/g)].map(m=>m[1]),['load','month']);
assert.match(nav,/nav-label-wide">Год<\/span>/);
assert.match(fs.readFileSync('expert.css','utf8'),/\.views\.city-calendar-views\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
const before=plain(pub.run('calendarItems().map(e=>[e.id,e.start,e.end])'));
pub.run('state.filters=["music"];state.query="джаз";location.hash="#load-month-8";readHash()');
assert.equal(pub.run('state.view'),'month');assert.equal(pub.run('state.month'),7);
assert.deepEqual(plain(pub.run('state.filters')),['music']);assert.equal(pub.run('state.query'),'джаз');
pub.el('#backYear').onclick();assert.equal(pub.run('state.view'),'load');
pub.run('location.hash="#year";readHash()');assert.equal(pub.run('state.view'),'load');
pub.run('state.view="loadMonth";state.month=9;render()');assert.equal(pub.run('state.view'),'month');assert.equal(pub.run('state.month'),9);
for(const change of pub.handlers.change)change({target:{dataset:{jumpView:'load'},value:'6'}});
assert.equal(pub.run('state.view'),'month');assert.equal(pub.run('state.month'),6);
assert.deepEqual(plain(pub.run('calendarItems().map(e=>[e.id,e.start,e.end])')),before);
work.run('setView("year")');assert.equal(work.run('state.view'),'year');
console.log('PASS: 2 team views; all 12 month cards, mobile selector, legacy bookmarks and restored state open the daily calendar; event dates and working navigation preserved.');

// Independent chips add/remove results without replacing other selections.
for(const ed of [pub,work]){
 const click=dataset=>{const b={dataset};for(const fn of ed.handlers.click)fn({target:{closest:()=>b}})};
 ed.el('#reset').onclick();click({cat:'wine'});click({cat:'music'});
 assert.deepEqual(plain(ed.run('state.filters')),['wine','music']);
 assert.equal(ed.run('matches({category:"wine"})'),true);
 assert.equal(ed.run('matches({category:"music"})'),true);
 assert.equal(ed.run('matches({category:"art"})'),false);
 click({cat:'wine'});assert.deepEqual(plain(ed.run('state.filters')),['music']);
 assert.equal(ed.run('matches({category:"wine"})'),false);
 click({festivals:'1'});assert.deepEqual(plain(ed.run('state.filters')),['music','festival']);
 assert.equal(ed.run('matches({id:"cheese",category:"gastro"})'),true);
 assert.equal(ed.run('matches({id:"radio",category:"music"})'),true);
 const ids=ed.run('calendarItems().filter(matches).map(e=>e.id)');assert.equal(ids.length,new Set(ids).size);
 ed.run('setView("month",7)');assert.deepEqual(plain(ed.run('state.filters')),['music','festival']);
 click({cat:'expert'});assert.equal(ed.run('matches({category:"wine",expertId:"example"})'),true);
 click({cat:'all'});assert.deepEqual(plain(ed.run('state.filters')),[]);
 assert.equal(ed.run('filterSelected("all")'),true);
 click({cat:'city'});click({cat:'city'});assert.equal(ed.run('filterSelected("all")'),true);
 click({cat:'wine'});click({cat:'music'});ed.run('state.query="радио"');
 assert.equal(ed.run('matches({category:"music",title:"Радио города"})'),true);
 assert.equal(ed.run('matches({category:"wine",title:"Вино недели"})'),false);
 ed.el('#reset').onclick();ed.run('setView("load")');
}
assert.doesNotMatch(pub.el('#loadView').innerHTML,/overview-key|unplaced-strip|Конкурс названий города/);
assert.match(work.el('#loadView').innerHTML,/overview-key|unplaced-strip/);
// Upgrade from the old single-category schema and preserve multiple new selections.
const restore=(ui)=>{
 const original=pub.ctx.document.querySelector;
 pub.ctx.document.querySelector=s=>s==='meta[name="wine27-version"]'?{content:'aabbccddeeff0011'}:original(s);
 pub.ctx.document.getElementById=id=>pub.el('#'+id);pub.ctx.requestAnimationFrame=f=>f();pub.ctx.setInterval=()=>{};
 pub.ctx.sessionStorage={getItem:()=>JSON.stringify({version:'aabbccddeeff0011',...ui}),removeItem(){}};
 vm.runInContext(fs.readFileSync('auto-update.js','utf8'),pub.ctx);
 pub.ctx.document.querySelector=original;
};
restore({category:'music',festivalsOnly:true});assert.deepEqual(plain(pub.run('state.filters')),['music','festival']);
restore({filters:['wine','music','wine','unknown'],view:'month',month:4});
assert.deepEqual(plain(pub.run('state.filters')),['wine','music']);assert.equal(pub.run('state.view'),'month');
assert.match(fs.readFileSync('auto-update.js','utf8'),/filters:state.filters/);
restore({density:'compact',readabilityVersion:2,filters:['wine','music'],view:'load'});assert.equal(pub.run('state.density'),'detail');assert.deepEqual(plain(pub.run('state.filters')),['wine','music']);
assert.doesNotMatch(publicHTML,/calendarDensity|data-density|control-meta/);
console.log('PASS: additive filter toggles, independent removal, festival/category union, no duplicates, search, navigation, reset and update migration; public legend and undated strip removed.');

// Public search must expose every matching recurring format and nested event.
pub.run('resetCalendarFilters();state.query="книжный";setView("load")');
assert.equal(pub.run('publicSearchMonths().length'),12);
assert.match(pub.el('#loadView').innerHTML,/data-city-rhythm="book_club"/);
assert.doesNotMatch(pub.el('#loadView').innerHTML,/Нет программы по фильтру/);
pub.run('state.query="";state.filters=["art"]');
assert.match(pub.run('JSON.stringify(publicRegularPreview(4))'),/Кино и обсуждения.*Лекции и встречи.*Книжный клуб/);
pub.run('state.filters=[];state.query="вино недели";render()');
assert.match(pub.el('#loadView').innerHTML,/Вино недели/);
assert.doesNotMatch(pub.el('#loadView').innerHTML,/Клуб Соловьёва, виноделы/);
pub.run('state.query="Соловьева".toLocaleLowerCase("ru");render()');assert(pub.run('publicSearchMonths().length')>0);
for(const item of pub.run('D.embedded.filter(e=>e.scale!=="major")')){
 pub.run('state.query='+JSON.stringify(item.title.toLocaleLowerCase('ru'))+';render()');
 assert(pub.run('publicSearchMonths().some(r=>r.events.some(e=>e.id==='+JSON.stringify(item.id)+'))'),item.id);
}
pub.run('state.query="абракадабра";render()');assert.equal(pub.run('publicSearchMonths().length'),0);
assert.equal(pub.el('#resultNotice').hidden,false);assert.match(pub.el('#resultNotice').innerHTML,/Ничего не найдено/);
assert.doesNotMatch(pub.el('#loadView').innerHTML,/overview-month|data-holiday/);
pub.run('setView("month",4)');assert.equal(pub.run('publicMobileCalendar(4)'), '');
assert.equal(pub.el('.month-layout').hidden,true);
pub.run('state.query="диджейские резиденции";render()');assert.match(pub.el('#monthSearchResults').innerHTML,/data-city-rhythm="djs"/);
pub.run('showPublicRhythm("djs",4)');assert.match(pub.el('#detailContent').innerHTML,/Период программы/);
pub.run('state.query="джаз";showPublicRhythm("jazz",4)');assert.match(pub.el('#detailContent').innerHTML,/data-event="slot-jazz-/);
pub.run('state.query="колокол";showPublicRhythm("bell",4)');assert.equal((pub.el('#detailContent').innerHTML.match(/data-city-day=/g)||[]).length,31);
pub.run('clearCalendarSearch()');assert.equal(pub.el('.month-layout').hidden,false);assert.equal(pub.el('#monthSearchResults').hidden,true);
console.log('PASS: all recurring categories, exact titles, ё/е search, nested events, honest empty state, month search, seasonal periods and dated slots.');
// Publishing a new release must not interrupt a reader inside a dialog.
(async()=>{
 const ed=edition(false),original=ed.ctx.document.querySelector;let poll,reloads=0;
 ed.ctx.document.querySelector=s=>s==='meta[name="wine27-version"]'?{content:'1111111111111111'}:original(s);
 ed.ctx.document.getElementById=id=>ed.el('#'+id);ed.ctx.document.visibilityState='visible';ed.ctx.document.activeElement={matches:()=>false};
 ed.ctx.sessionStorage={getItem:()=>null,setItem(){}};ed.ctx.setInterval=f=>{poll=f;};ed.ctx.location.href='https://wine27.ru/';ed.ctx.location.replace=()=>{reloads++;};
 ed.ctx.fetch=async url=>({ok:true,json:async()=>({version:'2222222222222222'}),text:async()=>'<meta name="wine27-version" content="2222222222222222">'});
 vm.runInContext(fs.readFileSync('auto-update.js','utf8'),ed.ctx);
 ed.el('#detailDialog').open=true;await poll();assert.equal(reloads,0,'An open event dialog must postpone an update');
 ed.el('#detailDialog').open=false;await poll();assert.equal(reloads,1,'The pending update applies after closing');
 console.log('PASS: open dialogs postpone auto-update; a pending release applies after closing.');
})().catch(e=>{console.error(e);process.exitCode=1;});
