'use strict';

// Guest formats, operating services and internal work have distinct roles.
const PROGRAM_GUIDE=window.PLANNING_DATA.programGuide;

function guideRhythms(r,m){return (PROGRAM_GUIDE[r.id]?.rhythms||[]).map(id=>P.recurring.find(p=>p.id===id)).filter(p=>p&&scheduleInMonth(p,m).length);}
function guideBucket(r,m){const spec=PROGRAM_GUIDE[r.id];if(spec.kind==='team')return 'team';if(!guideRhythms(r,m).length)return 'launch';return spec.kind==='service'?'service':'program';}
function guideSchedule(r,m){
 const rhythms=guideRhythms(r,m);
 if(r.id==='radio')return `${defaultUnits(r,m)} дней вещания · ${m>=4&&m<=8?'ежедневно в сезон':'субботы и воскресенья'}`;
 if(!rhythms.length)return 'Дата запуска не определена';
 if(r.id==='jazz')return rhythms.flatMap(x=>scheduleInMonth(x,m).map(p=>fullPlanDate(p.start,p.end))).join('; ');
 if(r.id==='hall'){const dates=rhythms.filter(x=>x.calendarVisible).flatMap(x=>scheduleInMonth(x,m).map(p=>fullPlanDate(p.start,p.end)+': '+x.title));return dates.join('; ')||'Возможные окна по субботам';}
 const text={wineclub:'Винный клуб: последний четверг месяца; подборки и приезды по отдельной сетке',bar:'Пятница–воскресенье: музыка на площади и вечеринки',dance:'Вторник и среда вечером',stage:'Камерные концерты по субботам и воскресеньям',beach:'Пятница–воскресенье, у заката',rooftop:'Предложены четверг и суббота',meetings:'Кино по средам, лекции по субботам, клубные встречи по своей сетке',bell:'Ежедневно на закате, после запуска',flash:'Ежедневно в тёплый сезон, после запуска',ritual:'По расписанию каждого ритуала, после запуска',photo:'Смены по сезону и режиму точек выдачи',trade:'С мая, по режиму территории','orchestra-rehearsal':'Предложены репетиции во вторник и четверг',cabaret:'Предложены четверг и воскресенье; июнь–октябрь'};
 return text[r.id]||rhythms.map(x=>x.dayLabel).join('; ');
}
function guideStatus(r,m){if(guideBucket(r,m)==='launch')return 'Готовится к запуску';if(PROGRAM_GUIDE[r.id].launch)return 'После готовности проекта';if(r.id==='radio')return m>=4&&m<=8?'Границы сезона согласуются':'Режим выходного дня';return 'Расписание на согласовании';}
function guideCard(r,m){
 const spec=PROGRAM_GUIDE[r.id],rhythms=guideRhythms(r,m),bucket=guideBucket(r,m);
 return `<article class="program-mechanic mechanic-${bucket}" data-program-id="${esc(r.id)}"><header><h4>${esc(r.title)}</h4><span class="mechanic-status">${esc(guideStatus(r,m))}</span></header><p class="mechanic-how">${esc(spec.how)}</p><p class="mechanic-when">${esc(guideSchedule(r,m))}</p><dl class="mechanic-roles"><div><dt>Где</dt><dd>${esc(spec.where)}</dd></div><div><dt>Команда</dt><dd>${esc(spec.team)}</dd></div></dl><details class="mechanic-details"><summary>Условия и расписание</summary><p>${esc(spec.condition)}</p>${rhythms.map(x=>`<div class="mechanic-rhythm"><b>${esc(x.title)}</b>${scheduleInMonth(x,m).map(p=>`<p>${esc(p.dayLabel||x.dayLabel)} · ${esc(p.time)}</p>${x.calendarVisible?`<button class="plain" data-event="slot-${esc(x.id)}-${esc(p.start)}">${esc(fullPlanDate(p.start,p.end))}: программа</button>`:''}`).join('')}<button class="plain" data-rhythm="${esc(x.id)}">Подробнее о расписании</button></div>`).join('')}<button class="plain" data-event="${esc(r.source)}">О проекте</button></details></article>`;
}
function monthlyMechanics(m){
 if(!WORKING)return publicMonthlyProgram(m);
 const rows=activeLoad(m),groups={program:[],service:[],launch:[],team:[]};for(const r of rows)groups[guideBucket(r,m)].push(r);
 const block=(key,title,intro)=>groups[key].length?`<section class="mechanics-section mechanics-${key}"><h3>${title}</h3><p class="mechanics-intro">${intro}</p><div class="mechanics-grid">${groups[key].map(r=>guideCard(r,m)).join('')}</div></section>`:'';
 return block('program','Регулярная программа','Повторяющиеся форматы для гостей между большими событиями.')+block('service','Сервисы для гостей','Работа точек и сервисных команд в течение месяца.')+(groups.launch.length?`<section class="mechanics-section mechanics-launch"><h3>Готовим к запуску</h3><p class="mechanics-intro">До запуска в расчёт гостевой программы не входят.</p><div class="mechanics-grid">${groups.launch.map(r=>guideCard(r,m)).join('')}</div></section>`:'')+(groups.team.length?`<details class="mechanics-team"><summary>Подготовка команды</summary><div class="mechanics-grid">${groups.team.map(r=>guideCard(r,m)).join('')}</div></details>`:'');
}
function monthlyDatedEvents(m){
 const dates=monthEvents(m).filter(e=>!WORKING||!e.isSlot),pending=D.projects.filter(e=>projectInMonth(e,m)&&matches(e)&&!e.expertId&&!dates.some(d=>d.id===e.id));
 const label=e=>e.status==='proposed'?'Дата предварительная':e.embedded?'В программе события':'В плане';
 return `<section class="month-dated"><div class="section-heading"><h3>События по датам</h3><button class="plain" data-month="${m}">Календарь по дням</button></div><div class="load-events-list month-dated-grid">${dates.map(e=>`<button class="work-event work-${displayTier(e)}${festivalClass(e)}" data-event="${esc(e.id)}"><span>${esc(shortRange(e,m))}</span><b>${esc(e.title)}${eventBadge(e)}</b><small>${esc(label(e))}${LOAD.children[e.id]?' · '+esc(planningItem(LOAD.children[e.id])?.title||''):''}</small></button>`).join('')}${pending.map(e=>`<button class="work-event${festivalClass(e)}" data-event="${esc(e.id)}"><span>≈</span><b>${esc(e.title)}${eventBadge(e)}</b><small>Дата уточняется</small></button>`).join('')}</div>${!dates.length&&!pending.length?'<p>Отдельные события по выбранному фильтру не назначены.</p>':''}</section>`;
}
