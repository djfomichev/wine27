'use strict';

function publicDescription(e){return String(e?.description||'').split(/\n\n+/).filter(Boolean).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('');}
function showPublicEvent(id){
 const e=planningItem(id);if(!e)return;
 const expert=expertById.get(id),place=e.place||'',description=e.description||expert?.subtitle||'';
 const date=e.start?fullPlanDate(e.start,e.end):e.periodMonths?.length?e.dateLabel:'';
 openDialog(`<div class="detail-category"><i class="dot" style="background:${cat(e)[1]}"></i>${esc(cat(e)[0])}</div><h2 class="detail-title">${esc(e.title)}</h2><div class="detail-meta">${eventBadge(e)}${date?`<span class="badge">${esc(date)}</span>`:''}${e.start&&e.status==='proposed'?'<span class="badge pending">Предварительная дата</span>':''}${expert&&expert.launch_tier!=='core'?'<span class="badge">В разработке</span>':''}${place&&!/уточняет|требует|согласован/i.test(place)?`<span class="badge">${esc(place)}</span>`:''}</div><div class="detail-description">${publicDescription({description})}</div>${e.start?`<button class="plain" data-open-month="${Number(e.start.slice(5,7))-1}">Открыть календарь месяца</button>`:''}`);
}
function publicMonthlyProgram(m){
 const rows=activeLoad(m).filter(r=>['program','service'].includes(guideBucket(r,m)));
 const group=(kind,title)=>{const list=rows.filter(r=>guideBucket(r,m)===kind);return list.length?`<section class="mechanics-section mechanics-${kind}"><h3>${title}</h3><div class="mechanics-grid">${list.map(r=>{
  const spec=PROGRAM_GUIDE[r.id],dated=guideRhythms(r,m).filter(x=>x.calendarVisible).flatMap(x=>scheduleInMonth(x,m).filter(p=>!x.skipCalendarDates?.includes(p.start)).map(p=>({id:'slot-'+x.id+'-'+p.start,date:fullPlanDate(p.start,p.end),title:x.title}))),schedule=dated.length?'':r.id==='radio'?(m>=4&&m<=8?'В сезон ежедневно':'По субботам и воскресеньям'):r.id==='hall'?'Концерты и шоу в холодный сезон':publicRhythm[r.id]||guideSchedule(r,m);
  return `<article class="program-mechanic mechanic-${kind}" data-program-id="${esc(r.id)}"><h4>${esc(r.title)}</h4><p class="mechanic-how">${esc(publicHow[r.id]||spec.how)}</p>${schedule?`<p class="mechanic-when">${esc(schedule)}</p>`:''}${spec.launch?'<span class="mechanic-status">После открытия проекта</span>':''}<p class="public-program-place">${esc(publicPlace[r.id]||spec.where)}</p>${dated.length?`<div class="public-program-dates">${dated.map(d=>`<button class="plain" data-event="${esc(d.id)}">${esc(d.date)}${r.id==='hall'?': '+esc(d.title):''}</button>`).join('')}</div>`:''}<button class="plain" data-event="${esc(r.source)}">О программе</button></article>`;
 }).join('')}</div></section>`:'';};
 return group('program','Регулярная программа')+group('service','Сервисы города');
}
const publicHow={
 cabaret:'Театральные и музыкальные представления в эвент-холле с июня по конец октября.',
 stage:'Камерные составы и рояль по выходным. По утрам площадка принимает занятия движением.',
 bar:'Музыканты на площади, диджеи-резиденты и вечеринки с ведущими промогруппами России и локальной южной сценой.',
 jazz:'Клуб Алексея Козлова, ЭССЕ и THE HAT представляют своих музыкантов и авторские концертные программы.',
 hall:'Концерты, театральные и клубные шоу. Среди резидентов города — оркестр «Синематика» и кабаре «Шум».',
 radio:'Музыка, авторские шоу, интервью с гостями города и участниками событий.',
 photo:'Фотографии с городских прогулок и событий можно получить напечатанными в энотеке и коворкинге.'
};
const publicPlace={wineclub:'Энотека и винные площадки города',jazz:'Музыкальные площадки города',hall:'Эвент-холл и концертные площадки',radio:'Радио города',meetings:'Кинотеатр, музей, энотека, коворкинг и городские маршруты'};
const publicRhythm={wineclub:'Винные встречи в течение месяца',bar:'По пятницам и выходным',dance:'По будним вечерам',stage:'По выходным утром, днём и вечером',beach:'Дневная и вечерняя программа',rooftop:'Камерные музыкальные вечера',meetings:'Встречи в течение месяца',bell:'Ежедневно на закате',flash:'Ежедневно в тёплый сезон',ritual:'Постоянные и сезонные ритуалы',photo:'Фотопечать в 2 точках города',trade:'С мая',cabaret:'Июнь–октябрь'};
function publicExpertOverview(m){
 if(state.festivalsOnly||!['all','expert'].includes(state.category))return '';
 const items=expertMonthProjects(m).filter(p=>matches({...p,category:'expert',description:p.subtitle}));if(!items.length)return '';
 return `<button class="atlas-expert" data-expert-month="${m}"><span><i aria-hidden="true"></i>Экспертная программа</span><b>${items.map(p=>esc(p.shortTitle||p.title)).join(' · ')}</b></button>`;
}
function publicExpertMonth(m){
 if(state.festivalsOnly||!['all','expert'].includes(state.category))return '';
 const items=expertMonthProjects(m).filter(p=>matches({...p,category:'expert',description:p.subtitle}));if(!items.length)return '';
 return `<section class="expert-month-panel"><div class="section-heading"><h3>Экспертная программа</h3><button class="plain" data-expert-month="${m}">Все проекты направления</button></div><div class="expert-month-items">${items.map(p=>`<button data-expert="${esc(p.id)}"><strong>${esc(p.title)}</strong><span>${esc(p.subtitle)}</span></button>`).join('')}</div></section>`;
}
function renderPublicExpert(){
 const list=X.projects.filter(expertMatches).sort((a,b)=>(a.preferred_month_proposal||13)-(b.preferred_month_proposal||13));
 $('#expertView').innerHTML=`<section class="expert-intro"><div><h2>Экспертная программа</h2><p>Алексей Соловьёв: конкурсы специалистов, оценка вин и отраслевая премия.</p></div></section><div class="expert-tools"><div class="expert-tabs"><button data-expert-track="all" aria-pressed="${state.expertTrack==='all'}">Все направления</button>${Object.entries(expertTracks).map(([k,v])=>`<button data-expert-track="${k}" aria-pressed="${state.expertTrack===k}">${v}</button>`).join('')}</div>${state.expertMonth!==null?`<button class="expert-clear" data-expert-all="1">${esc(D.months[state.expertMonth].name)} ×</button>`:''}</div><div class="expert-portfolio">${list.map(p=>`<button class="expert-row" data-expert="${esc(p.id)}"><div class="expert-row-date"><b>${esc(p.proposedWindow?fullPlanDate(p.proposedWindow.start,p.proposedWindow.end):p.monthLabel||'В разработке')}</b>${p.proposedWindow?'<small>Предварительно</small>':''}</div><div class="expert-row-main"><h3>${esc(p.title)}</h3><p>${esc(p.subtitle)}</p></div><span class="expert-row-open" aria-hidden="true">+</span></button>`).join('')}</div>`;
 $('#footerNote').textContent='';
}
function showPublicInfo(){openDialog('<h2 class="detail-title">Программа «Белого мыса»</h2><div class="detail-description"><p>Карта объединяет события 2027 года, темы месяцев, новые проекты и регулярную программу города.</p><p>Выберите месяц или событие, чтобы увидеть программу. Предварительные даты отмечены отдельно.</p></div>');}
