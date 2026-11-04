const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const p=JSON.parse(fs.readFileSync('private-work/program.json')),by=new Map(p.entities.map(e=>[e.id,e]));
const ledger=p.history.sourceInventory;assert.equal(ledger.length,253);assert.equal(new Set(ledger.map(r=>r.sourceGroup+':'+r.sourceId)).size,253);for(const r of ledger)assert(r.disposition&&r.targetId);
assert.equal(by.size,91);assert.equal(p.entities.filter(e=>e.active).length,90);assert.equal(by.get('project-12').active,false);assert.equal(by.get('project-11').active,true);
for(const id of ['city-phase-25','city-phase-26','city-phase-27'])assert.equal(p.preparation.find(r=>r.id===id).active,false);
assert(p.presentation.monthsMetadata.intro);
const moved={barin:1,'fire-grape':2,cheese:3,'south-table':9,'wine-families':9,'flagman-weekend':9,anchovy:11,'exhibition-nov':11};
const harness=fs.readFileSync('scripts/check-editions.cjs','utf8').split('const pub=edition(false)')[0].replace("const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');",'');
const scope={fs,vm,assert,console,URL,Blob};vm.createContext(scope);vm.runInContext(harness+';this.pub=edition(false);this.work=edition(true)',scope);const {pub,work}=scope;
for(const [id,month] of Object.entries(moved)){
 const e=by.get(id);assert.equal(e.schedule.month,month);assert.equal(e.schedule.start,null);assert(e.history.previousSchedule.length,id+' missing previous date');
 for(const ed of [pub,work]){
  assert.equal(ed.run(`calendarItems().some(e=>e.id===${JSON.stringify(id)})`),false,id+' must not occupy invented dates');
  assert(ed.run(`monthUndated(${month-1}).some(e=>e.id===${JSON.stringify(id)})`),id+' missing month');
 }
 pub.run(`state.query='';state.filters=[];setView('month',${month-1})`);assert(pub.el('#monthTheme').innerHTML.includes('data-event="'+id+'"'));
 assert(p.resourceRequirements.scheduleChanges[id]);
}
assert.equal(by.get('fire-grape').parentId,'craft');assert.equal(by.get('wine-families').parentId,'south-table');assert.equal(by.get('flagman-weekend').parentId,'south-table');assert.equal(by.get('award').parentId,'wineweek');
assert.equal(p.expertPortfolio.projects.filter(e=>!e.parent_id).length,15);assert.equal(p.expertPortfolio.projects.find(e=>e.id==='exp_sparkling_session').first_year,null);
assert(p.preparation.find(r=>r.id==='anchovy-production').schedule.months.includes(10));assert(p.preparation.find(r=>r.id==='city-phase-39').schedule.months.includes(5));assert.equal(p.preparation.find(r=>r.id==='cheese-teardown').schedule.relation,'after');
for(const id of ['bar_july_party','bar_music_weekend'])assert.equal(p.planning.embedded.filter(r=>r.id===id).length,1);
assert.equal(work.run('planningItem("embedded-bar_music_weekend").productionGroupId'),'project-67');assert.equal(work.run('activeLoad(7).find(r=>r.id==="bar").productionGroupId'),'project-67');
work.run('loadScenario.rows["2:event:barin"]={n:1,people:3,hours:4,prep:20};loadScenario.rows["0:event:conference"]={n:1,people:2,hours:3,prep:4};saveLoad()');
assert.equal(work.run('loadScenario.rows["2:event:barin"].hours'),4);assert(work.run('loadScenario.review["2:event:barin"]'));assert(work.run('loadScenario.rows["0:event:conference"]'));assert.equal(work.run('rowHours(loadRows(0).find(r=>r.id==="event:barin"),0)'),null);
work.run('loadScenario.rows["9:prep:south-table"]={n:0,people:0,hours:0,prep:120};saveLoad();loadStats(9)');assert(work.run('loadScenario.review["9:prep:south-table"].excluded'));assert(work.run('scenarioReviewNote(9)').includes('вне текущего итога'));assert.equal(work.run('loadScenario.rows["9:prep:south-table"].prep'),120);
assert.equal(work.run('productionMonthData(8).lead.filter(r=>r.productionGroupId==="south-table").length'),1);
for(const file of ['data.js','planning-data.js','expert-data.js']){const s=fs.readFileSync(file,'utf8');assert(!s.includes('Мюзле'));assert(!s.includes('Большой август'));assert(!s.includes('previousSchedule'));assert(!s.includes('sourceInventory'));assert(!s.includes('source_snapshot'));assert(!s.includes('expertWork'));assert(!s.includes('отменено Димой'));}
execFileSync('python3',['-c',`import sys,copy,json,tempfile\nfrom pathlib import Path\nsys.path.insert(0,'scripts')\nfrom program_model import validate,revision,editions,presentation\np=json.load(open('private-work/program.json'));validate(p);q=copy.deepcopy(p);q['presentation']['buildSource']='/portable/path';assert revision(p)==revision(q)\nbefore=revision(p);q=copy.deepcopy(p);e=next(e for e in q['entities'] if e['id']=='barin');e['title']='Проверка общего названия';e['schedule']['month']=2;e['schedule']['label']='Февраль: тест';q['months'][0]['theme']='Проверка темы'\nassert revision(q)!=before\nfor d,plan,x in editions(q).values():\n assert next(e for e in d['events'] if e['id']=='barin')['title']=='Проверка общего названия';assert d['months'][0]['theme']=='Проверка темы'\nslides,months,_=presentation(q);assert next(s for s in slides if s['key']=='barin')['title']=='Проверка общего названия';assert next(s for s in slides if s['key']=='barin')['date']=='Февраль: тест';assert months['months'][0]['title']=='Проверка темы'\nassert editions(p)==editions(p) and presentation(p)==presentation(p)`],{stdio:'pipe'});
console.log('PASS:253 ledger records, stable IDs, eight honest windows, relatives/preparation, grouped production, preserved scenarios, no active stale copy, schema and deterministic three-edition mutations.');
