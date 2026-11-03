'use strict';

function publicDescription(e){return String(e?.description||'').split(/\n\n+/).filter(Boolean).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('');}
function showPublicEvent(id){
 const e=planningItem(id);if(!e)return;
 const expert=expertById.get(id),place=e.place||'',description=e.description||expert?.subtitle||'';
 const date=e.start?fullPlanDate(e.start,e.end):e.periodMonths?.length?e.dateLabel:'';
 openDialog(`<div class="detail-category"><i class="dot" style="background:${cat(e)[1]}"></i>${esc(cat(e)[0])}</div><h2 class="detail-title">${esc(e.title)}</h2><div class="detail-meta">${eventBadge(e)}${date?`<span class="badge">${esc(date)}</span>`:''}${e.start&&e.status==='proposed'?'<span class="badge pending">Предварительная дата</span>':''}${place&&!/уточняет|требует|согласован/i.test(place)?`<span class="badge">${esc(place)}</span>`:''}</div><div class="detail-description">${publicDescription({description})}</div>${e.start?`<button class="plain" data-open-month="${Number(e.start.slice(5,7))-1}">Открыть календарь месяца</button>`:''}`);
}
function publicMonthlyProgram(m){return publicCalendarProgram(m);}
function publicExpertOverview(m){
 if(!matchesFilters({category:'expert'}))return '';
 const items=expertMonthProjects(m).filter(p=>matches({...p,category:'expert',description:p.subtitle}));if(!items.length)return '';
 return `<button class="atlas-expert" data-load-month="${m}"><span><i aria-hidden="true"></i>Экспертная программа</span><b>${items.map(p=>esc(p.shortTitle||p.title)).join(' · ')}</b></button>`;
}
function publicExpertMonth(m){return '';}
function renderPublicExpert(){
 const list=X.projects.filter(expertMatches).sort((a,b)=>(a.preferred_month_proposal||13)-(b.preferred_month_proposal||13));
 $('#expertView').innerHTML=`<section class="expert-intro"><div><h2>Экспертная программа</h2><p>Алексей Соловьёв: конкурсы специалистов, оценка вин и отраслевая премия.</p></div></section><div class="expert-tools"><div class="expert-tabs"><button data-expert-track="all" aria-pressed="${state.expertTrack==='all'}">Все направления</button>${Object.entries(expertTracks).map(([k,v])=>`<button data-expert-track="${k}" aria-pressed="${state.expertTrack===k}">${v}</button>`).join('')}</div>${state.expertMonth!==null?`<button class="expert-clear" data-expert-all="1">${esc(D.months[state.expertMonth].name)} ×</button>`:''}</div><div class="expert-portfolio">${list.map(p=>`<button class="expert-row" data-expert="${esc(p.id)}"><div class="expert-row-date"><b>${esc(p.proposedWindow?fullPlanDate(p.proposedWindow.start,p.proposedWindow.end):p.monthLabel||'В разработке')}</b>${p.proposedWindow?'<small>Предварительно</small>':''}</div><div class="expert-row-main"><h3>${esc(p.title)}</h3><p>${esc(p.subtitle)}</p></div><span class="expert-row-open" aria-hidden="true">+</span></button>`).join('')}</div>`;
 $('#footerNote').textContent='';
}
function showPublicInfo(){openDialog('<h2 class="detail-title">Календарь «Белого мыса»</h2><div class="detail-description"><p>Календарь для команды: события 2027 года, темы месяцев, регулярная программа и городские ритуалы.</p><p>Выберите месяц или событие, чтобы увидеть программу. Предварительные даты отмечены отдельно. Нажмите на день, чтобы увидеть всю его программу.</p></div>');}
