const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();function el(s){if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',value:'',hidden:false,style:{},classList:{toggle(){}},dataset:{},setAttribute(){},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false}});return elements.get(s)}
const handlers={};const ctx={window:{addEventListener(){},scrollTo(){}},document:{querySelector:el,querySelectorAll:()=>[],addEventListener:(k,f)=>(handlers[k]??=[]).push(f),createElement:()=>({click(){}})},localStorage:{getItem(){return null},setItem(){}},location:{hash:''},setTimeout:()=>{},URL,Blob,console};vm.createContext(ctx);
for(const p of ['data','expert-data','planning-data','load','expert','plan','app'])vm.runInContext(fs.readFileSync(p+'.js','utf8'),ctx);
function check(code){return vm.runInContext(code,ctx)}
assert.equal(check('state.view'),'load');assert.equal(check('state.density'),'detail');assert.match(el('#loadView').innerHTML,/Карта года/);assert.equal((el('#loadView').innerHTML.match(/<article[^>]*class="overview-month/g)||[]).length,12);
assert.equal(check('D.events.length'),34);assert.equal(check('D.projects.length'),58);assert.equal(check('D.holidays.length'),8);
assert.equal(check('activeLoad(7).length'),16);assert.equal(check('loadEvents(7,"major").length'),3);
assert.equal(check('defaultUnits(LOAD.recurring.find(r=>r.id==="radio"),7)'),31);
assert.equal(check('defaultUnits(LOAD.recurring.find(r=>r.id==="radio"),0)'),10);
assert.equal(check('loadRows(7).some(r=>r.id==="event:august")'),false);
assert.equal(check('loadRows(9).some(r=>r.id==="event:award")'),false);
assert.equal(check('loadStats(7).done'),0);assert.equal(check('loadStats(7).total'),0);
check('loadScenario.rows["7:regular:radio"]={n:31,people:2,hours:3,prep:10}');
assert.equal(check('loadStats(7).total'),196);assert.equal(check('loadStats(7).done'),1);
check('loadScenario.rows["7:regular:radio"].prep=""');assert.equal(check('loadStats(7).done'),0);
check('loadScenario.rows["7:regular:radio"]={n:0,people:0,hours:0,prep:0}');assert.equal(check('loadStats(7).done'),1);assert.equal(check('loadStats(7).total'),0);
check('loadScenario.extra.push({id:"extra:test",title:"Букинг Винной недели",month:6,category:"city"});loadScenario.rows["6:extra:test"]={n:0,people:0,hours:0,prep:100}');assert.equal(check('loadStats(6).total'),100);assert.equal(check('loadStats(9).total'),0);
check('loadScenario={rows:{},capacity:{},extra:[]}');
for(let i=0;i<12;i++){check(`setView('loadMonth',${i})`);assert.match(el('#loadMonthView').innerHTML,/Постоянная работа месяца/);assert.match(el('#loadMonthView').innerHTML,/Рассчитать команду/);check(`setView('month',${i})`);assert.match(el('#monthGrid').innerHTML,/day-number/)}
check('location.hash="#load-month-8";readHash()');assert.equal(check('state.view'),'loadMonth');assert.equal(check('state.month'),7);
check('state.query="радио";renderLoad()');assert.equal(check('activeLoad(7).length'),1);assert.equal(check('loadEvents(7,"major").length'),0);assert.match(el('#loadView').innerHTML,/Радио/);
check('state.query="";setView("year")');assert.match(el('#yearGrid').innerHTML,/Большой август/);
check('setView("projects")');assert.match(el('#projectGrid').innerHTML,/Центральный бар/);
check('showEvent("project-67")');assert.match(el('#detailContent').innerHTML,/Personality/);
for(const r of check('LOAD.recurring')){assert(check(`D.projects.some(p=>p.id===${JSON.stringify(r.source)})`),r.source)}
console.log('PASS: source preservation, 12-month rendering, August programs, no double counting, monthly preparation, complete/partial/zero calculations, filters and source cards.');

assert.equal(check('D.events.some(e=>e.id==="conference")'),false);assert.equal(check('D.issues.length'),16);

check('state.query="";setView("loadMonth",7)');assert.match(el("#loadMonthView").innerHTML,/<details class="team-planner">/);assert.equal(check('activeLoad(7).length'),16);
check('state.query="";state.category="all";state.festivalsOnly=false');
for(let m=0;m<12;m++){
 const g=check(`overviewGroups(${m})`),ids=Object.values(g).flat().map(e=>e.id);
 assert.equal(ids.length,new Set(ids).size,'Duplicate overview event in '+m);
 assert.equal(g.festivals.length+g.major.length+g.projects.length+g.expert.length,check(`loadRows(${m}).filter(e=>e.id.startsWith("event:")||e.id.startsWith("project:")).length`),'Display groups must match event workload rows '+m);
}
check('setView("load")');
assert.equal((el('#loadView').innerHTML.match(/data-event="project-58"/g)||[]).length,1);
assert.match(el('#loadView').innerHTML,/Большой август/);assert.match(el('#loadView').innerHTML,/Партнёрское окно/);
assert.equal(check('overviewGroups(7).festivals.length'),2);assert.equal(check('overviewGroups(7).major.length'),1);
check('state.festivalsOnly=true;setView("load")');assert.doesNotMatch(el('#loadView').innerHTML,/class="overview-regular"/);
assert.equal(check('D.events.filter(matches).length'),8);assert.equal(check('D.projects.filter(matches).length'),2);
check('state.category="music";render()');assert.equal(check('D.events.filter(matches).length'),2);
el('#reset').onclick();assert.equal(check('D.events.filter(matches).length'),34);
console.log('PASS: disjoint counts in 12 months, workload row parity, Etudes once, August and partner windows, combined festival filters.');

check('state.density="compact";setView("load")');assert.match(el('#loadView').innerHTML,/atlas-compact/);
check('state.density="detail";render()');assert.match(el('#loadView').innerHTML,/atlas-detail/);
assert.equal((el('#loadView').innerHTML.match(/<article[^>]*class="overview-month/g)||[]).length,12);
assert.match(fs.readFileSync('auto-update.js','utf8'),/density:state.density/);
assert.match(fs.readFileSync('auto-update.js','utf8'),/state.density=ui.readabilityVersion===2&&ui.density/);
console.log('PASS: both density modes retain 12 months; auto-update retains density.');

// v10 preserves every existing project while adding the professional program.
const preservedIds=["anatoliy", "anchovy", "august", "award", "barin", "birthday", "blacksea", "books", "christmas", "craft", "dozen", "exhibition", "fire-grape", "flagman-weekend", "golitsyn", "italian-sunday", "love", "march8", "may", "newyear-dec", "newyear-jan", "orchestras", "paradiz", "partner-apr", "partner-dec", "partner-feb", "partner-mar", "project-10", "project-11", "project-12", "project-13", "project-14", "project-15", "project-16", "project-17", "project-18", "project-19", "project-2", "project-20", "project-21", "project-22", "project-23", "project-24", "project-25", "project-26", "project-27", "project-28", "project-29", "project-3", "project-4", "project-5", "project-58", "project-6", "project-67", "project-68", "project-69", "project-7", "project-70", "project-71", "project-72", "project-8", "project-9", "resonance", "sail", "shtil", "south-table", "terroir", "velvet", "wine-families", "wineweek"];

const allIds=check('[...D.events,...D.projects].map(p=>p.id)');
assert.equal(allIds.length,new Set(allIds).size);
for(const id of preservedIds)assert(allIds.includes(id),'Lost existing project '+id);
assert.equal(check('X.projects.filter(p=>!p.parent_id).length'),15);
assert.equal(check('X.projects.filter(p=>p.parent_id).length'),1);
for(const [tier,n] of [['core',6],['development',7],['reserve',2]])assert.equal(check(`X.projects.filter(p=>p.launch_tier===${JSON.stringify(tier)}).length`),n);
for(const [id,month] of [['exhibition',2],['exhibition-nov',11]]){
 assert.equal(check(`D.projects.find(p=>p.id==='${id}').month`),month);
 assert.equal(check(`D.events.some(p=>p.id==='${id}')`),false);
 assert.equal(check(`!!D.projects.find(p=>p.id==='${id}').start`),true);
}
assert.equal(check('D.projects.find(p=>p.id==="cheese").month??null'),null);
for(const id of ['dozen','south-table','anchovy'])assert(check(`D.events.some(p=>p.id==='${id}')`));
assert.equal(check('D.projects.find(p=>p.id==="exp_sparkling_session").month??null'),null);
assert.equal(check('expertById.get("exp_sparkling_session").first_year'),null);
assert.equal(check('loadRows(11).some(r=>r.source==="exp_sparkling_session")'),false);
assert.equal(check('expertById.get("award").concept_status'),'approved_existing_decision');
assert.equal(check('D.events.filter(p=>p.id==="award").length'),1);
assert.equal(check('D.projects.some(p=>p.id==="award")'),false);
assert.equal(check('D.months.every(m=>m.themeDetail.length>100&&m.expertWork.length>40)'),true);
assert.equal(check('D.events.filter(p=>p.category==="partner"&&p.candidateLabel&&p.status==="proposed").length'),4);
assert.match(check('D.sources[0].title'),/v10: 79/);
assert.match(check('D.sources.find(s=>s.title.startsWith("Погодная")).title'),/слайд 38/);
check('state.category="all";state.query="";state.festivalsOnly=false');
for(let m=0;m<12;m++){
 assert.equal(check(`periodPrograms(${m}).some(p=>p.id==='cabaret_series')`),m>=5&&m<=9);
 assert.equal(check(`activeLoad(${m}).some(p=>p.id==='cabaret')`),m>=5&&m<=9);
}
check('state.category="expert";setView("year")');
assert.match(el('#footerNote').textContent,/С рабочими датами: 15 · Без точных дней: 0/);
check('setView("month",1)');
assert.match(el('#footerNote').textContent,/С рабочими датами: 3 · Без точных дней: 0/);
check('state.category="all";setView("expert")');
assert.equal((el('#expertView').innerHTML.match(/class="expert-row"/g)||[]).length,16);
assert.equal((el('#expertView').innerHTML.match(/data-expert-month=/g)||[]).length,12);
check('state.expertTrack="wines";render()');
assert.equal((el('#expertView').innerHTML.match(/class="expert-row"/g)||[]).length,2);
check('state.expertTier="core";render()');
assert.equal((el('#expertView').innerHTML.match(/class="expert-row"/g)||[]).length,1);
check('state.expertTrack="all";state.expertTier="all";state.expertMonth=1;render()');
assert.equal((el('#expertView').innerHTML.match(/class="expert-row"/g)||[]).length,3);
check('state.expertMonth=null;state.query="dropreaders";render()');
assert.equal((el('#expertView').innerHTML.match(/class="expert-row"/g)||[]).length,2);
assert.match(el('#expertView').innerHTML,/data-expert="exp_dropreaders"/);
check('state.query="";showExpert("award")');
assert.match(el('#detailContent').innerHTML,/Премия входит в Винную неделю/);
assert.doesNotMatch(el('#detailContent').innerHTML,/существующий ID/);
check('showExpert("exp_sparkling_session")');
assert.match(el('#detailContent').innerHTML,/первый год|Первый год/);
function clickData(dataset){const b={dataset,closest(){return b}};for(const h of handlers.click)h({target:b});}
clickData({expertMonth:'5'});assert.equal(check('state.view'),'expert');assert.equal(check('state.expertMonth'),5);
clickData({expertAll:'1'});assert.equal(check('state.expertMonth'),null);
clickData({expertTrack:'recognition'});assert.equal((el('#expertView').innerHTML.match(/class="expert-row"/g)||[]).length,1);
clickData({changes:'1'});assert.match(el('#detailContent').innerHTML,/Что изменилось на карте/);
assert.equal((el('#detailContent').innerHTML.match(/<section>/g)||[]).length,check('D.revisionChanges.length'));
clickData({themeMonth:'7'});assert.match(el('#detailContent').innerHTML,/Август 2027/);
clickData({openMonth:'7'});assert.equal(check('state.view'),'month');assert.equal(check('state.month'),7);
check('location.hash="#expert";readHash()');assert.equal(check('state.view'),'expert');
el('#reset').onclick();
check('state.festivalsOnly=true;setView("load")');
assert.match(el('#loadView').innerHTML,/data-event="cheese"/);
assert.doesNotMatch(el('#loadView').innerHTML,/data-event="names_contest"|data-event="exp_sparkling_session"/);
el('#reset').onclick();
console.log('PASS: v10 project preservation, 15+1 portfolio, proposed exhibition windows, seasonal cabaret, conditional year, expert filters, real calendar counts and cross-view navigation.');

// The update restores the new expert state without changing existing scenario keys.
assert.match(fs.readFileSync('load.js','utf8'),/belyi-mys-2027-resource-scenario-v1/);
const originalQuery=ctx.document.querySelector;
ctx.document.querySelector=s=>s==='meta[name="wine27-version"]'?{content:'aabbccddeeff0011'}:originalQuery(s);
ctx.document.getElementById=id=>el('#'+id);
ctx.requestAnimationFrame=f=>f();ctx.setInterval=()=>{};
ctx.sessionStorage={getItem:()=>JSON.stringify({version:'aabbccddeeff0011',view:'expert',month:9,category:'all',expertTrack:'wines',expertTier:'core',expertMonth:5,query:'',density:'detail'}),removeItem(){}};
vm.runInContext(fs.readFileSync('auto-update.js','utf8'),ctx);
assert.equal(check('state.view'),'expert');assert.equal(check('state.expertTrack'),'wines');assert.equal(check('state.expertTier'),'core');assert.equal(check('state.expertMonth'),5);assert.equal(check('state.density'),'detail');
console.log('PASS: automatic update restores the expert view, track, tier and month.');

// Phone layout uses dated event rows, while retaining the desktop day grid.
check('state.query="";state.category="all";state.festivalsOnly=false;setView("month",4)');
assert.match(el('#mobileAgenda').innerHTML,/mobile-date-card/);
assert.match(el('#mobileAgenda').innerHTML,/1–10/);
assert.match(el('#mobileAgenda').innerHTML,/data-event="may"/);
assert.match(el('#mobileAgenda').innerHTML,/data-holiday=/);
assert.match(el('#monthGrid').innerHTML,/day-number/);
check('setView("load")');
assert.match(el('#loadView').innerHTML,/id="load-month-11"/);
assert.match(el('#loadView').innerHTML,/data-jump-view="load"/);
check('setView("year")');assert.match(el('#calendarJump').innerHTML,/data-jump-view="year"/);
const html=fs.readFileSync('index.html','utf8');
assert.equal((html.match(/class="nav-label-mobile"/g)||[]).length,5);
assert.match(fs.readFileSync('expert.css','utf8'),/env\(safe-area-inset-bottom\)/);
console.log('PASS: large default, 12 month jump targets, mobile navigation labels and dated phone agenda.');

// The full production plan is separate from confirmed dates and does not invent openings.
check('state.query="";state.category="all";state.festivalsOnly=false;state.planMonth=null;setView("plan")');
assert.match(el('#planView').innerHTML,/Рабочий план/);
assert.equal((el('#planView').innerHTML.match(/class="plan-card tier-[^" ]+(?: is-festival)?"/g)||[]).length,100);
assert.equal(check('calendarItems().length'),79);
assert.equal(check('D.embedded.length'),8);
assert.equal(check('new Set(calendarItems().map(e=>e.id)).size'),check('calendarItems().length'));
for(const id of check('[...D.events,...D.projects].map(e=>e.id)'))assert(check(`!!planningItem('${id}').start||preparationFor('${id}').length>0||recurringFor('${id}').length>0`),'No date, preparation or rhythm for '+id);
for(const id of ['project-2','project-3','project-5','project-6','project-7','project-8','project-9'])assert.equal(check(`!!planningItem('${id}').start`),false,'Readiness is not an opening date');
assert.equal(check('fullPlanDate("2026-11-16","2027-03-26")'),'16 ноября 2026 – 26 марта 2027');
assert.equal(check('fullPlanDate("2026-11-16","2026-12-18")'),'16 ноября – 18 декабря 2026');
for(let m=0;m<12;m++){
 check(`setView('loadMonth',${m})`);assert.match(el('#loadMonthView').innerHTML,/Недельная сетка/);assert.match(el('#loadMonthView').innerHTML,/prep-details/);
 assert.equal(check(`new Set(loadRows(${m}).map(r=>r.id)).size`),check(`loadRows(${m}).length`));
 assert.equal(check(`loadRows(${m}).some(r=>r.id.startsWith('event:embedded-')||r.id.startsWith('event:slot-'))`),false,'Program components must not add production twice');
}
check('showEvent("embedded-height")');assert.match(el('#detailContent').innerHTML,/Высота/);assert.match(el('#detailContent').innerHTML,/14 августа/);
check('showRhythm("cabaret")');assert.match(el('#detailContent').innerHTML,/26 октября|2027-10-26/);assert.match(el('#detailContent').innerHTML,/Паузы/);
clickData({planMonth:'7'});assert.equal(check('state.view'),'plan');assert.equal(check('state.planMonth'),7);assert.match(el('#planView').innerHTML,/Большой август/);
check('location.hash="#plan";readHash()');assert.equal(check('state.view'),'plan');
console.log('PASS: all original projects scheduled or assigned preparation, no invented openings, readable cross-year dates, embedded programs and regular slots counted once.');

// Large annual events must remain visible, without turning nested programs into extra production.
check('state.category="all";state.query="";state.festivalsOnly=false;setView("load")');
for(const id of ['craft','love','march8','barin','books','anatoliy','italian-sunday']){
 assert.equal(check(`loadEventType(planningItem('${id}'))`),'major',id);
 assert.match(el('#loadView').innerHTML,new RegExp('data-event="'+id+'"'),id+' is hidden on the year map');
}
for(const id of check('[...D.events,...D.projects].filter(isFestival).map(e=>e.id)'))assert.equal(check(`loadEventType(planningItem('${id}'))`),'major',id);
assert.match(el('#loadView').innerHTML,/data-event="embedded-bar_music_weekend"/);
assert.equal(check('displayTier(planningItem("embedded-bar_music_weekend"))'),'major');
assert.equal(check('loadRows(7).some(e=>e.source==="embedded-bar_music_weekend")'),false);
for(const id of ['project-19','exhibition','exhibition-nov'])assert.equal(check(`planningItem('${id}').title`),'Выставка современного искусства');
check('setView("plan")');assert.equal(el('#planEntry').hidden,true);
assert.equal((el('#planView').innerHTML.match(/<h2>/g)||[]).length,1);
assert.doesNotMatch(el('#planView').innerHTML,/Здесь собрана вся программа|plan-principles/);
check('setView("load")');assert.equal(el('#planEntry').hidden,false);
console.log('PASS: large weekends and festivals stay visible, nested bar weekend counted once, exhibition names and single plan heading.');
