'use strict';
const X=window.EXPERT_DATA;
const expertById=new Map(X.projects.map(p=>[p.id,p]));
const expertTracks={people:'Конкурсы специалистов',wines:'Оценка вин',recognition:'Отраслевая премия'};
const expertTiers={core:'Предлагаемое ядро',development:'Разработка',reserve:'Партнёрский резерв',conditional_session:'Специализированная сессия'};
const orgLabels={regular:'Постоянная программа',invited:'Приглашённый проект',owned:'Собственный проект'};
function isExpertItem(e){return !!e.expertId||e.category==='expert';}
function projectInMonth(e,m){return !e.start&&e.month===m+1;}
function periodPrograms(m){return D.projects.filter(p=>p.periodMonths?.includes(m+1)&&p.organizationType==='regular'&&matches(p));}
function expertMonthProjects(m){return X.projects.filter(p=>p.preferred_month_proposal===m+1);}
function expertMatches(p){
 const query=state.query.replace(/ё/g,'е');
 return (state.expertTrack==='all'||p.track===state.expertTrack)&&(!WORKING||state.expertTier==='all'||p.launch_tier===state.expertTier)&&(state.expertMonth===null||p.preferred_month_proposal===state.expertMonth+1)&&(!query||[p.title,p.detail,p.possible_partner].join(' ').toLowerCase().replace(/ё/g,'е').includes(query));
}
function expertOverview(m){if(!WORKING)return publicExpertOverview(m);
 if(state.festivalsOnly||!['all','expert'].includes(state.category))return '';
 const items=expertMonthProjects(m).filter(p=>matches({...p,category:'expert',expertId:p.id,description:p.detail}));
 if(state.query&&!items.length)return '';
 const core=items.filter(p=>p.launch_tier==='core').length,dev=items.filter(p=>p.launch_tier==='development').length,res=items.filter(p=>p.launch_tier==='reserve').length,child=items.some(p=>p.parent_id);
 const dateLines=items.filter(p=>p.proposedWindow).map(p=>`${fullPlanDate(p.proposedWindow.start,p.proposedWindow.end)} · ${p.shortTitle}`);
 const label=[core?`${core} в предлагаемом ядре`:null,dev?`${dev} в разработке`:null,res?`${res} в резерве`:null,child?'Первый год не выбран':null].filter(Boolean).join(' · ')||'Подготовка и работа с результатами';
 return `<button class="atlas-expert" data-expert-month="${m}"><span><i aria-hidden="true"></i>Экспертная линия</span><b>${esc(label)}</b>${dateLines.length?`<small class="expert-preview-dates">${dateLines.map(esc).join('<br>')}</small>`:''}</button>`;
}
function expertMonthPanel(m){if(!WORKING)return publicExpertMonth(m);
 const items=expertMonthProjects(m).filter(p=>matches({...p,category:'expert',expertId:p.id,description:p.detail}));
 if(state.festivalsOnly||(!items.length&&state.category!=='all'&&state.category!=='expert')||(state.query&&!items.length))return '';
 return `<section class="expert-month-panel"><div class="section-heading"><h3>Экспертная работа месяца</h3><button class="plain" data-expert-month="${m}">Открыть направление</button></div><p>${esc(D.months[m].expertWork)}</p>${items.length?`<div class="expert-month-items">${items.map(p=>`<button data-expert="${esc(p.id)}"><strong>${esc(p.shortTitle)}</strong><span>${esc(p.statusLabel)}${p.id==='award'?' · внутри Винной недели':''}</span></button>`).join('')}</div>`:''}</section>`;
}
function renderExpert(){if(!WORKING){renderPublicExpert();return;}
 const list=X.projects.filter(expertMatches).sort((a,b)=>a.preferred_month_proposal-b.preferred_month_proposal),main=list.filter(p=>!p.parent_id),child=list.filter(p=>p.parent_id);
 $('#expertView').innerHTML=`<section class="expert-intro"><div><h2>Экспертная программа</h2><p>Алексей Соловьёв · конкурсы специалистов, оценка вин, премия</p></div><div class="expert-composition"><b>15 проектов</b><span>6 в предлагаемом ядре · 7 в разработке · 2 в резерве</span><small>1 сессия внутри конкурса вин · первый год не выбран</small></div></section>
 <div class="expert-year" aria-label="Экспертная работа по месяцам">${D.months.map((month,m)=>{const ps=expertMonthProjects(m),n=ps.filter(p=>!p.parent_id).length;return `<button data-expert-month="${m}" aria-pressed="${state.expertMonth===m}" class="${n?'has-expert':'expert-preparation'}"><span>${esc(month.name.slice(0,3))}</span><b>${n||'·'}</b><small>${ps.some(p=>p.parent_id)?'Условная сессия':n?'Проекты':'Подготовка'}</small></button>`}).join('')}</div>
 <div class="expert-tools"><div class="expert-tabs" aria-label="Профессиональная задача"><button data-expert-track="all" aria-pressed="${state.expertTrack==='all'}">Все направления</button>${Object.entries(expertTracks).map(([k,v])=>`<button data-expert-track="${k}" aria-pressed="${state.expertTrack===k}">${v}</button>`).join('')}</div><label>Состав портфеля<select id="expertTier"><option value="all">Весь портфель</option>${Object.entries(expertTiers).map(([k,v])=>`<option value="${k}" ${state.expertTier===k?'selected':''}>${v}</option>`).join('')}</select></label>${state.expertMonth!==null?`<button class="expert-clear" data-expert-all="1">${esc(D.months[state.expertMonth].name)} ×</button>`:''}</div>
 ${state.expertMonth!==null?`<div class="expert-work-note"><h3>${esc(D.months[state.expertMonth].name)}: задача команды</h3><p>${esc(D.months[state.expertMonth].expertWork)}</p><button class="plain" data-load-month="${state.expertMonth}">Вся программа этого месяца</button></div>`:''}
 <div class="expert-portfolio">${Object.entries(expertTiers).filter(([k])=>k!=='conditional_session').map(([tier,label])=>{const rows=main.filter(p=>p.launch_tier===tier);return rows.length?`<section class="expert-tier tier-${tier}"><header><h3>${label}</h3><span>${rows.length}</span></header>${rows.map(expertRow).join('')}</section>`:''}).join('')}${child.length?`<section class="expert-tier tier-conditional"><header><h3>Внутри конкурса вин</h3><span>${child.length}</span></header><p class="expert-tier-note">Специализированная сессия. Декабрь указан как ориентир, первый год ещё не выбран.</p>${child.map(expertRow).join('')}</section>`:''}${!list.length?'<p class="no-results">По выбранным условиям проектов нет. Сбросьте фильтр или выберите другой месяц.</p>':''}</div>
 <section class="expert-team"><div><h3>Команда направления</h3><p>Дмитрий Фомичёв, HURMA и эвент-отдел. Распределение функций на согласовании.</p></div><div class="expert-team-grid">${X.team.map(t=>`<article><h4>${esc(t.name)}</h4><b>${esc(t.role)}</b><p>${esc(t.task)}</p></article>`).join('')}</div></section>`;
 $('#footerNote').textContent=`Показано: ${main.length} проектов${child.length?' и '+child.length+' сессия':''}.`;
}
function expertRow(p){return `<button class="expert-row" data-expert="${esc(p.id)}"><div class="expert-row-date"><b>${esc(p.proposedWindow?fullPlanDate(p.proposedWindow.start,p.proposedWindow.end):p.monthLabel)}</b><small>${p.id==='exp_cavists'?'Апрель как альтернатива':p.id==='award'?'Финал Винной недели':p.parent_id?'Год не выбран':p.proposedWindow?'Предложение':'Дни уточняются'}</small></div><div class="expert-row-main"><h4>${esc(p.title)}</h4><p>${esc(p.subtitle)}</p><div class="expert-row-tags"><span>${esc(expertTracks[p.track])}</span><span>${esc(orgLabels[p.organization_type])}</span>${p.concept_status==='approved_existing_decision'?'<span class="concept-approved">Концепция принята</span>':''}</div></div><span class="expert-row-open" aria-hidden="true">+</span></button>`;}
function showExpert(id){if(!WORKING){showPublicEvent(id);return;}
 const p=expertById.get(id);if(!p)return;
 const parent=p.parent_id?expertById.get(p.parent_id):null;
 openDialog(`<div class="detail-category">Экспертная программа · ${esc(expertTracks[p.track])}</div><h2 class="detail-title">${esc(p.title)}</h2><div class="detail-meta">${p.id==='award'?'<button class="badge" data-event="wineweek">Большой финал Винной недели</button>':''}<span class="badge expert-badge">${esc(p.statusLabel)}</span><span class="badge">${esc(p.proposedWindow?fullPlanDate(p.proposedWindow.start,p.proposedWindow.end):p.source_window)}</span><span class="badge pending">Точная дата не подтверждена</span>${parent?`<button class="badge" data-expert="${esc(parent.id)}">Внутри: ${esc(parent.shortTitle)}</button>`:''}</div><div class="detail-description">${p.detail.split('\n').slice(1).filter(Boolean).map(t=>`<p>${esc(t)}</p>`).join('')}</div>${productionDetail(id)}${planningDetail(id)}<div class="detail-source"><details><summary>Условия участия</summary><p>${esc(p.notes)}</p><small>${esc(p.sourceLabel)}</small></details><button class="plain" data-open-expert-month="${p.preferred_month_proposal-1}">Экспертная работа месяца</button><button class="plain" data-open-month="${p.preferred_month_proposal-1}">Общий календарь месяца</button></div>`);
}
function monthThemeCard(m,hero=false){const month=D.months[m];return `<button type="button" class="month-theme-card${hero?' month-theme-hero':''}" data-theme-month="${m}" aria-haspopup="dialog" aria-label="Тема месяца: ${esc(month.theme)}. Открыть описание"><span class="month-theme-caption"><span>Тема месяца</span><span class="month-theme-open" aria-hidden="true">+</span></span><b>${esc(month.theme)}</b></button>`;}
function showTheme(m){openDialog(`<div class="detail-category">${esc(D.months[m].name)} 2027</div><h2 class="detail-title">${esc(D.months[m].theme)}</h2><div class="detail-description">${D.months[m].themeDetail.split('\n').filter(Boolean).map(t=>`<p>${esc(t)}</p>`).join('')}</div><button class="plain" data-open-month="${m}">Открыть календарь месяца</button>`);}
document.addEventListener('click',ev=>{
 const b=ev.target.closest('button');if(!b)return;
 if(b.dataset.expert){showExpert(b.dataset.expert);return;}
 if(b.dataset.expertMonth!==undefined||b.dataset.openExpertMonth!==undefined){state.expertMonth=Number(b.dataset.expertMonth??b.dataset.openExpertMonth);$('#detailDialog').close();state.category='all';state.festivalsOnly=false;setView('expert');}
 if(b.dataset.expertAll){state.expertMonth=null;render();}
 if(b.dataset.expertTrack){state.expertTrack=b.dataset.expertTrack;render();}
 if(b.dataset.themeMonth!==undefined)showTheme(Number(b.dataset.themeMonth));
});
document.addEventListener('change',ev=>{if(ev.target.id==='expertTier'){state.expertTier=ev.target.value;render();}});
