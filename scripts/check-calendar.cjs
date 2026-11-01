const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();function el(s){if(!elements.has(s))elements.set(s,{innerHTML:'',textContent:'',value:'',hidden:false,style:{},classList:{toggle(){}},dataset:{},setAttribute(){},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false}});return elements.get(s)}
const handlers={};const ctx={window:{addEventListener(){},scrollTo(){}},document:{querySelector:el,querySelectorAll:()=>[],addEventListener:(k,f)=>(handlers[k]??=[]).push(f),createElement:()=>({click(){}})},localStorage:{getItem(){return null},setItem(){}},location:{hash:''},setTimeout:()=>{},URL,Blob,console};vm.createContext(ctx);
for(const p of ['data','load','app'])vm.runInContext(fs.readFileSync(p+'.js','utf8'),ctx);
function check(code){return vm.runInContext(code,ctx)}
assert.equal(check('state.view'),'load');assert.match(el('#loadView').innerHTML,/Год работы команды/);assert.equal((el('#loadView').innerHTML.match(/<article class="overview-month/g)||[]).length,12);
assert.equal(check('D.events.length'),35);assert.equal(check('D.projects.length'),35);assert.equal(check('D.holidays.length'),8);
assert.equal(check('activeLoad(7).length'),13);assert.equal(check('loadEvents(7,"major").length'),3);
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
for(let i=0;i<12;i++){check(`setView('loadMonth',${i})`);assert.match(el('#loadMonthView').innerHTML,/Постоянная работа месяца/);assert.match(el('#loadMonthView').innerHTML,/Сценарий команды/);check(`setView('month',${i})`);assert.match(el('#monthGrid').innerHTML,/day-number/)}
check('location.hash="#load-month-8";readHash()');assert.equal(check('state.view'),'loadMonth');assert.equal(check('state.month'),7);
check('state.query="радио";renderLoad()');assert.equal(check('activeLoad(7).length'),1);assert.equal(check('loadEvents(7,"major").length'),0);assert.match(el('#loadView').innerHTML,/Радио/);
check('state.query="";setView("year")');assert.match(el('#yearGrid').innerHTML,/Большой август/);
check('setView("projects")');assert.match(el('#projectGrid').innerHTML,/Центральный бар/);
check('showEvent("project-67")');assert.match(el('#detailContent').innerHTML,/Personality/);
for(const r of check('LOAD.recurring')){assert(check(`D.projects.some(p=>p.id===${JSON.stringify(r.source)})`),r.source)}
console.log('PASS: source preservation, 12-month rendering, August programs, no double counting, monthly preparation, complete/partial/zero calculations, filters and source cards.');

assert.equal(check('D.events.some(e=>e.id==="conference")'),false);assert.equal(check('D.issues.length'),9);

check('state.query="";setView("loadMonth",7)');assert.match(el("#loadMonthView").innerHTML,/<details class="team-planner">/);assert.equal(check('activeLoad(7).length'),13);
check('state.query="";state.category="all";state.festivalsOnly=false');
for(let m=0;m<12;m++){
 const g=check(`overviewGroups(${m})`),ids=Object.values(g).flat().map(e=>e.id);
 assert.equal(ids.length,new Set(ids).size,'Duplicate overview event in '+m);
 assert.equal(g.festivals.length+g.major.length+g.projects.length,check(`loadRows(${m}).filter(e=>e.id.startsWith("event:")||e.id.startsWith("project:")).length`),'Display groups must match event workload rows '+m);
}
check('setView("load")');
assert.equal((el('#loadView').innerHTML.match(/data-event="project-58"/g)||[]).length,1);
assert.match(el('#loadView').innerHTML,/Большой август/);assert.match(el('#loadView').innerHTML,/Партнёрские окна/);
assert.equal(check('overviewGroups(7).festivals.length'),2);assert.equal(check('overviewGroups(7).major.length'),1);
check('state.festivalsOnly=true;setView("load")');assert.doesNotMatch(el('#loadView').innerHTML,/class="overview-regular"/);
assert.equal(check('D.events.filter(matches).length'),8);assert.equal(check('D.projects.filter(matches).length'),1);
check('state.category="music";render()');assert.equal(check('D.events.filter(matches).length'),2);
el('#reset').onclick();assert.equal(check('D.events.filter(matches).length'),35);
console.log('PASS: disjoint counts in 12 months, workload row parity, Etudes once, August and partner windows, combined festival filters.');
