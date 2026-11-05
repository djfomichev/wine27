const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const source=JSON.parse(fs.readFileSync('private-work/program.json')),supp=JSON.parse(fs.readFileSync('private-work/expert-supplement.json'));
const ctx={window:{}};vm.createContext(ctx);for(const f of ['data.js','expert-data.js','planning-data.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const D=JSON.parse(JSON.stringify(ctx.window.CALENDAR_DATA)),X=JSON.parse(JSON.stringify(ctx.window.EXPERT_DATA));
assert.equal(D.events.length,1283);assert.equal(D.year_events.length,59);assert.equal(X.events.length,15);assert(!X.events.some(e=>e.id==='award'));
const directorCopy=JSON.parse(fs.readFileSync('scripts/director-copy.json'));const cleanText=s=>directorCopy[crypto.createHash('sha256').update(s).digest('hex')]??s;
const excluded=new Set(['production_notes','performance_start_time','performance_end_time','sort_minute_reference','sort_reference_is_public_time','theme_relation','work_key','venue_status','seasonal_venue_status']);
for(let i=0;i<source.events.length;i++){
 const e=source.events[i],p=D.events[i];assert.equal(p.id,e.id);
 for(const [k,v] of Object.entries(e))if(!excluded.has(k))assert.deepEqual(p[k],['description','public_description'].includes(k)?cleanText(v):v,`${e.id}: ${k}`);
 assert(!('production_notes' in p));
}
for(let i=0;i<source.year_events.length;i++)for(const [k,v] of Object.entries(source.year_events[i]))assert.deepEqual(D.year_events[i][k],k==='description'?cleanText(v):v);
assert.deepEqual(D.venues,source.venues);assert.deepEqual(X.events.map(e=>e.id).sort(),supp.public.events.filter(e=>e.id!=='award').map(e=>e.id).sort());
const els=new Map();function el(sel){if(!els.has(sel))els.set(sel,{innerHTML:'',textContent:'',value:'',hidden:false,disabled:false,open:false,isConnected:true,classList:{toggle(){}},setAttribute(){},addEventListener(){},focus(){},showModal(){this.open=true},close(){this.open=false}});return els.get(sel)}
const rev=JSON.parse(fs.readFileSync('program-version.json')).contentRevision;
el('meta[name="wine27-content"]').content=rev;
let savedWrites=0;const stored='{"rows":{"0:event:legacy":{"people":4}},"capacity":{"0":100},"extra":[]}';
Object.assign(ctx,{document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){},activeElement:null},location:{hash:'#load',pathname:'/'},history:{replaceState(){}},localStorage:{getItem:()=>stored,setItem(){savedWrites++}},URL,Blob,Intl,console});ctx.window.addEventListener=()=>{};ctx.window.scrollTo=()=>{};
vm.runInContext(fs.readFileSync('master-app.js','utf8'),ctx);
assert.deepEqual(D.display_periods['exhibition-feb'],{start:'2027-02-05',end:'2027-03-31',opening:'2027-02-05'});
assert.deepEqual(D.display_periods['exhibition-nov'],{start:'2027-11-12',end:'2027-12-19',opening:'2027-11-12'});
vm.runInContext("openYear('exhibition-feb')",ctx);assert(el('#detailContent').innerHTML.includes('31 марта'));
vm.runInContext("setView('month',1)",ctx);assert(el('#dailyAgenda').innerHTML.includes('5 февраля — 31 марта'));assert(el('#dailyAgenda').innerHTML.includes('tone-major'));assert(el('#dailyAgenda').innerHTML.includes('tone-expert'));
vm.runInContext("setView('month',4)",ctx);assert(el('#dailyAgenda').innerHTML.includes('tone-festival'));assert(el('#dailyAgenda').innerHTML.includes('tone-regular'));
const api=ctx.window.WINE27_MASTER;assert.equal(api.allEvents.length,1298);assert.equal(api.allYears.length,74);
let days=0,rendered=new Set(),appearances=new Map();
for(let m=0;m<12;m++){
 vm.runInContext(`setView('month',${m})`,ctx);const html=el('#dailyAgenda').innerHTML;
 const dayList=[...html.matchAll(/data-date="(.*?)"/g)].map(x=>x[1]);assert.deepEqual(dayList,source.month_metadata[m].days);days+=dayList.length;
 const ids=[...html.matchAll(/data-event="(.*?)"/g)].map(x=>x[1]);for(const id of ids){rendered.add(id);appearances.set(id,(appearances.get(id)||0)+1);}
 for(const e of source.events.filter(e=>e.date.slice(5,7)===String(m+1).padStart(2,'0')))assert(ids.includes(e.id));
}
vm.runInContext("state.filters=[];state.query='';setView('month',0)",ctx);
for(const section of el('#dailyAgenda').innerHTML.split('<section class="agenda-day').slice(1)){
 const date=section.match(/data-date="([^"]+)"/)[1];
 if(date<='2027-01-10'){assert(section.includes('Новогодняя программа'));assert(!section.includes('Отдельных событий нет'));}
}
assert.equal(days,365);assert.equal(rendered.size,1298);for(const e of source.events)assert.equal(appearances.get(e.id),1,e.id+" must appear only on its start date");
for(const e of source.events){
 if(['sunset','after_bell'].includes(e.time_anchor))assert.equal(api.timeLabel(e),e.display_time);
 if(e.end_anchor==='sunset')assert(api.timeLabel(e,true).endsWith('до заката'));
 if(e.ends_next_day){const next=new Date(e.date+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);assert(!api.eventsOn(next.toISOString().slice(0,10)).some(x=>x.id===e.id));}
}
vm.runInContext("state.query='';state.filters=[];setView('load')",ctx);const years=[...el('#loadView').innerHTML.matchAll(/data-year-event="(.*?)"/g)].map(x=>x[1]);assert.equal(new Set(years).size,74);for(const y of source.year_events)assert(years.includes(y.id));
vm.runInContext("state.filters=['wine','expert']",ctx);const union=api.allEvents.filter(api.matches);assert(union.some(e=>e.supplemental));assert(union.some(e=>e.categories.includes('wine')));assert.equal(new Set(union.map(e=>e.id)).size,union.length);
vm.runInContext("state.filters=['expert']",ctx);assert(api.allEvents.filter(api.matches).some(e=>e.year_event_ids?.includes('award')));
vm.runInContext("state.filters=[];state.query='Беговой клуб';setView('load')",ctx);assert(el('#loadView').innerHTML.includes('Беговой клуб'));
vm.runInContext("state.query='несуществующеесобытиеxyz';render()",ctx);assert(el('#loadView').innerHTML.includes('Ничего не найдено'));
const cinema=source.events.find(e=>e.phases);vm.runInContext(`openEvent(${JSON.stringify(cinema.id)})`,ctx);assert.equal((el('#detailContent').innerHTML.match(/<li>/g)||[]).length,cinema.phases.length);for(const b of cinema.phases)assert(el('#detailContent').innerHTML.includes(b.start_time));
const jazz=source.events.find(e=>e.time_blocks);vm.runInContext(`openEvent(${JSON.stringify(jazz.id)})`,ctx);assert.equal((el('#detailContent').innerHTML.match(/<li>/g)||[]).length,jazz.time_blocks.length);
const love=D.events.find(e=>e.date==='2027-02-13'&&e.kind==='cinematica');assert(love.guest_conditions.some(t=>t.includes('Билетная')&&t.includes('на двоих')));
const piers=D.events.filter(e=>e.date==='2027-02-14'&&e.guest_conditions.length);assert(piers.some(e=>e.guest_conditions.some(t=>t.includes('Всего два стола')&&t.includes('Амбассадор'))));
assert.equal(savedWrites,0,'Existing local scenario must not be silently rewritten');
assert(!fs.readFileSync('index.html','utf8').includes('src="app.js'));assert(/<script src="calendar\/[a-f0-9]+\.js"><\/script>/.test(fs.readFileSync('index.html','utf8')));
assert(!fs.readFileSync('data.js','utf8').includes('production_notes'));
for(const phrase of ['принято пользователем','исходный ID','исходную сущность','по прямому решению Дмитрия','в эту сборку','служба перестановки'])assert(!fs.readFileSync('data.js','utf8').includes(phrase));assert(!fs.readFileSync('planning-data.js','utf8').includes('event_hall_turnaround'));
const priv={window:{}};vm.createContext(priv);vm.runInContext(fs.readFileSync('private-work/data.js','utf8'),priv);for(let i=0;i<source.events.length;i++)for(const [k,v] of Object.entries(source.events[i]))assert.deepEqual(JSON.parse(JSON.stringify(priv.window.CALENDAR_DATA.events[i][k])),v);
console.log('PASS MASTER: lossless 1283/59 mapping, 15 preserved expert entries, 365 daily sections, full timing/venues, solar/night/cinema, union filters/search, conditions, private/public separation, untouched local scenario.');
