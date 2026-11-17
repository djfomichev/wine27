// Public UI integrity checks. Does not require the private owner key.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);
for(const name of ['data.js','expert-data.js','planning-data.js'])vm.runInContext(fs.readFileSync(name,'utf8'),ctx);
const elements=new Map();const el=s=>{if(!elements.has(s))elements.set(s,{innerHTML:'',content:ctx.window.CALENDAR_DATA.contentRevision,value:'',hidden:false,classList:{toggle(){}},addEventListener(){},setAttribute(){},focus(){},showModal(){},close(){}});return elements.get(s)};
Object.assign(ctx,{document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){}},location:{hash:'#load'},history:{replaceState(){}},localStorage:{getItem(){},setItem(){throw Error('Unexpected scenario write')}},Intl,URL,Blob});
ctx.window.addEventListener=()=>{};ctx.window.scrollTo=()=>{};
vm.runInContext(fs.readFileSync('master-app.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx),api=ctx.window.WINE27_MASTER;
assert.equal(api.source.events.length,1283);assert.equal(api.source.year_events.length,59);assert.equal(api.allEvents.length,1298);assert.equal(api.allYears.length,74);
assert(!api.allEvents.some(e=>e.title.includes('Шум')));assert.equal(api.allEvents.filter(e=>e.kind==='cabaret').length,54);
const replacements=api.source.events.filter(e=>e.id.startsWith('artist-closeup-'));
const seasons=api.source.year_events.filter(e=>e.id.startsWith('artist-closeup-'));
assert.equal(replacements.length,8);assert.equal(seasons.length,4);
assert.equal(new Set(api.source.events.map(e=>e.id)).size,1283);
assert.deepEqual([...new Set(replacements.map(e=>e.date))],['2027-01-23','2027-03-27','2027-07-18','2027-11-13']);
for(const y of seasons){
 assert.equal(y.event_ids.length,2);assert.equal(api.tone(y),'music');assert(!api.isBranded(y));
 run(`openYear(${JSON.stringify(y.id)})`);
 for(const artist of ['Пётр Налич','Найк Борзов','Сергей Сироткин','Антон Беляев'])assert(el('#detailContent').innerHTML.includes(artist));
 assert(el('#detailContent').innerHTML.includes('не подтверждены'));
}
for(const e of replacements){
 assert.equal(e.booking_status,'not_confirmed');assert.equal(e.calendar_status,'planned');assert.equal(api.tone(e),'music');
 assert.equal(e.venue,e.kind==='podcast'?'Коворкинг':'Эвент-холл');
 const year=seasons.find(y=>y.id===e.parent_id);assert(year.event_ids.includes(e.id));
 assert(e.public_description.includes('не подтверждены'));
}
const stable=JSON.stringify(api.source);run('applyCalendarDecisions(D)');assert.equal(JSON.stringify(api.source),stable,'Decision overlay must be idempotent');
assert.equal(api.allYears.filter(api.isBranded).length,20);
for(const id of ['wineforum','award','paradiz-festival'])assert.equal(api.tone(api.allYears.find(e=>e.id===id)),'brand');
for(const e of api.allEvents.filter(e=>['forum','ceremony'].includes(e.kind)&&api.isBranded(e)))assert.equal(api.tone(e),'brand');
for(const e of api.allEvents.filter(e=>e.kind==='cabaret'))assert.equal(api.unitsFor(e).join(),'hall');
for(const e of api.allEvents.filter(e=>e.kind==='rooftop'||e.venue==='«Парадиз»'))assert(api.unitsFor(e).includes('fb'));
assert.equal(Object.keys(run('businessUnits')).length,5);assert(!Object.hasOwn(run('businessUnits'),'city'));assert(api.allEvents.every(e=>!api.unitsFor(e).includes('city')));
const select=f=>{ctx.filters=f;run('state.filters=filters');return api.allEvents.filter(api.matches).map(e=>e.id).sort()};
const hall=select(['unit:hall']),fb=select(['unit:fb']);assert.equal(select(['unit:hall','unit:fb']).join(),[...new Set([...hall,...fb])].sort().join());
assert(select(['brand','unit:fb']).every(id=>{const e=api.allEvents.find(e=>e.id===id);return api.isBranded(e)&&api.unitsFor(e).includes('fb')}));
run('state.filters=[]');let days=0;const appearances=new Map();
for(let m=0;m<12;m++){run(`setView('month',${m})`);const html=el('#dailyAgenda').innerHTML;days+=(html.match(/data-date=/g)||[]).length;for(const [,id] of html.matchAll(/data-event="([^"]+)"/g))appearances.set(id,(appearances.get(id)||0)+1);}
assert.equal(days,365);for(const e of api.source.events)assert.equal(appearances.get(e.id),1,e.id);
const html=fs.readFileSync('index.html','utf8'),gate=fs.readFileSync('work/index.html','utf8');
for(const href of [...html.matchAll(/(?:href|src)="(calendar\/[^"]+)"/g),...gate.matchAll(/data-ui-(?:runtime|css)="\/(calendar\/[^"]+)"/g)])assert(fs.existsSync(href[1]),href[1]);
assert.equal(JSON.parse(fs.readFileSync('site-version.json')).version,JSON.parse(fs.readFileSync('work/site-version.json')).version);
console.log('PASS: 1283 daily events, 59 year entries, 15 experts; all 365 days; Shum removed; 4 approved seasonal concerts + 4 linked podcasts with unconfirmed artist examples; 54 wine-cabaret shows preserved; 20 branded cards; 5 units; unit unions and brand intersection; matching assets and edition versions.');
