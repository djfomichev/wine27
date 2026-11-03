'use strict';

// The team calendar includes the full program. Provisional dates stay labelled.
const publicRitualIds=new Set(['bell','flash','ritual']);
const publicNonEventIds=new Set(['photo','trade','orchestra_rehearsal','orchestra_tours','city_program_meeting','monthly_program_lock']);
const publicFormatCopy={
 coffee_rave:['Кофе-рейв','Утренние встречи с кофе, диджейской музыкой и танцами.','Кофейная точка и коворкинг','music'],
 anatoliy_meetings:['Встречи у Анатолия','Музыка, истории города и встречи у тополя Анатолия. В холодную погоду программа проходит в энотеке.','Энотека','city'],
 wineclub:['Винный клуб Соловьёва','Встречи с Алексеем Соловьёвым, дегустации и знакомство с винодельческими хозяйствами.','Энотека','wine'],
 wine_week:['Вино недели','Новая подборка вин в общей теме месяца.','Энотека и рестораны','wine'],
 winemaker_in_city:['Винодел в городе','Производитель представляет хозяйство и вина, встречается с гостями и участвует в ресторанной программе.','Энотека и площадки города','wine'],
 wine_shop_residencies:['Гастроли винотек','Приглашённые команды представляют свои коллекции вин и сменяются в течение сезона.','Центральный бар','wine'],
 bar:['Вечеринки Центрального бара','Артисты, диджеи и ведущие промогруппы России: RML, ACT, Odyssey, Personality и локальная южная сцена.','Центральный бар','music'],
 august_promoters:['Промогруппы в Центральном баре','RML, ACT, Odyssey, Personality и другие ведущие промогруппы России представляют свои вечеринки.','Центральный бар','music'],
 august_main_stage:['Городские концерты','Концерты и выступления локальной южной сцены в программе Большого августа.','Городские музыкальные площадки','music'],
 square_music:['Музыка на площади','Живые музыкальные составы, столики и вечерняя программа на городской площади.','Центральная площадь','music'],
 dance:['Ротонда: сальса и румба','Танцевальные вечера с ведущим: сальса и румба для гостей и команды города.','Ротонда','music'],
 stage:['Ротонда: камерная музыка','Камерные составы и рояль. По субботам вечерние концерты, по воскресеньям дневные.','Ротонда','music'],
 rotunda_morning:['Утро в Ротонде','Утренние занятия движением, йога и растяжка.','Ротонда','city'],
 cabaret:['Кабаре в эвент-холле','Сезонная серия театральных и музыкальных представлений с июня по конец октября.','Эвент-холл','music'],
 jazz:['Джазовые резиденции','Клуб Алексея Козлова, ЭССЕ и THE HAT представляют своих музыкантов и авторские программы.','Городские музыкальные площадки','music'],
 cinematica:['Оркестр «Синематика»','Музыка кино, самостоятельные концерты и программы для городских событий.','Концертные площадки города','music'],
 noise:['Кабаре «Шум»','Театральные и музыкальные шоу резидента города.','Эвент-холл','music'],
 hall:['Концерты и шоу эвент-холла','Приглашённые концерты, театральные и клубные шоу в холодный сезон.','Эвент-холл','music'],
 djs:['Диджейские резиденции','Диджеи со всей России приезжают на 1 месяц и выступают на городских площадках.','Центральный бар, пляж, руфтоп и радио','music'],
 beach:['Программа пляжа','Музыка и диджейские сеты у моря, встречи на закате. Еду и напитки можно заказать из ресторанов.','Пляж','music'],
 rooftop:['Камерные вечера на крыше','Музыкальные вечера и специальные программы пространства с ограниченным доступом.','Руфтоп «Флагмана»','music'],
 cinema:['Кино и обсуждения','Тематические показы, встречи с авторами и разговоры с экспертами.','Кинотеатр и зал музея','art'],
 science:['Лекции и встречи','Разговоры о вине, природе, технологиях и истории в темах месяцев.','Музей и лекторий','art'],
 book_club:['Книжный клуб','Чтения, встречи с авторами и обсуждения книг о вине, гастрономии, искусстве и путешествиях.','Коворкинг и городские площадки','art'],
 city_clubs:['Городские клубы','Бег, прогулки и встречи сообществ на городских маршрутах.','Городские маршруты','city'],
 radio:['Радио города','Музыка, авторские шоу, интервью с участниками событий и городские истории.','Радио города','music'],
 bell:['Колокол на закате','Городовой звонит в колокол на пирсе каждый день в момент заката.','Пирс','city'],
 flash:['Городской флешмоб','Общее действие команды и гостей на закате: городской танец, круг или аплодисменты уходящему дню.','Городская площадка','city'],
 ritual:['Ритуалы ресторанов и Wine o’clock','Постоянные и сезонные ритуалы из «Свитка ритуалов Белого мыса». Wine o’clock объединяет винную программу ресторанов.','Рестораны и городские объекты','wine'],
 june14_day:['Дневная городская программа','Музыка, встречи и открытые программы городских клубов.','Городские площадки','city']
};
function publicRhythmItem(r){const c=publicFormatCopy[r.id]||[r.title,r.description,r.location,'city'];return {id:'rhythm-'+r.id,title:c[0],description:c[1],place:c[2],category:c[3],rhythmId:r.id,status:'proposed'};}
function publicFormats(m){return P.recurring.filter(r=>!publicNonEventIds.has(r.id)&&scheduleInMonth(r,m).length&&matches(publicRhythmItem(r)));}
function publicRhythmSummary(r,m){
 const labels={coffee_rave:m>=4&&m<=8?'Каждую субботу':'2-я суббота месяца',anatoliy_meetings:m===0?'24 января':'2-е и 4-е воскресенье',wineclub:'Последний четверг месяца',wine_week:'Каждый понедельник',winemaker_in_city:'Пятница и суббота',wine_shop_residencies:'Новая команда каждую неделю',bar:'Пятница и суббота',square_music:'Пятница, суббота и воскресенье',dance:'Вторник и среда вечером',stage:'Суббота вечером и воскресенье днём',rotunda_morning:'Вторник и четверг утром',cabaret:'Четверг и воскресенье',hall:'По субботам',djs:'Резидент на 1 месяц',beach:'Пятница, суббота и воскресенье',rooftop:'Четверг и суббота',cinema:'По средам',science:'По субботам',book_club:'1-е и 3-е воскресенье',city_clubs:'Суббота и воскресенье',radio:m>=4&&m<=8?'Ежедневно':'Суббота и воскресенье',bell:'Ежедневно на закате',flash:'Ежедневно на закате',ritual:'Ежедневно · Wine o’clock в 18:00'};
 return labels[r.id]||r.dayLabel;
}
function publicRegularPreview(m){
 const formats=publicFormats(m),names=(ids)=>formats.filter(r=>ids.includes(r.id)).map(r=>publicRhythmItem(r).title);
 const music=names(['bar','stage','cabaret','jazz','hall','cinematica','noise','beach','rooftop']);
 const lines=[];
 if(music.length)lines.push({title:'Музыка',text:music.slice(0,3).join(', ')+(music.length>3?' и ещё '+(music.length-3):'')});
 const wine=names(['wineclub','winemaker_in_city','wine_week']);if(wine.length)lines.push({title:'Вино',text:'Клуб Соловьёва, виноделы и подборки'});
 const rituals=formats.filter(r=>publicRitualIds.has(r.id));if(rituals.length)lines.push({title:'Ритуалы',text:rituals.map(r=>({bell:'колокол',flash:'флешмоб',ritual:'Wine o’clock'})[r.id]).join(' · ')});
 if(formats.some(r=>r.id==='dance'))lines.push({title:'Танцы',text:'сальса и румба по будням'});
 if(formats.some(r=>r.id==='radio'))lines.push({title:'Радио',text:m>=4&&m<=8?'ежедневно':'по выходным'});
 return lines;
}
function publicCalendarProgram(m){
 const list=publicFormats(m).filter(r=>!r.calendarVisible);
 const section=(rituals,title)=>{const rows=list.filter(r=>publicRitualIds.has(r.id)===rituals);if(!rows.length)return '';return `<section class="mechanics-section ${rituals?'city-rituals':'city-regular'}"><div class="section-heading"><h3>${title}</h3><span>${rows.length} ${rituals?'ритуала':'форматов'}</span></div><div class="mechanics-grid">${rows.map(r=>{const e=publicRhythmItem(r);return `<article class="program-mechanic ${rituals?'mechanic-ritual':''}"><h4>${esc(e.title)}</h4><p>${esc(e.description)}</p><p class="mechanic-when">${esc(publicRhythmSummary(r,m))}</p><p class="public-program-place">${esc(e.place)}</p><button class="plain" data-city-rhythm="${esc(r.id)}" data-city-month="${m}">Даты и время</button></article>`;}).join('')}</div></section>`;};
 return section(true,'Городские ритуалы')+section(false,'Регулярная программа');
}
function publicRhythmTime(r,p,date){
 const day=weekday(date)||7,m=Number(date.slice(5,7));
 if(r.id==='bell'||r.id==='flash')return 'На закате';
 if(r.id==='ritual')return 'Wine o’clock · 18:00';
 if(r.id==='wine_week')return 'Подборка недели';
 if(r.id==='winemaker_in_city')return day===5?'18:00':'16:00';
 if(r.id==='stage')return day===7?'12:00–13:00':m>=6&&m<=8?'19:00–20:00':'17:00–18:00';
 if(r.id==='cabaret')return m===10?(day===4?'19:30':'18:00'):(day===4?'20:30':'19:30');
 return p.time?.match(/\d{1,2}:\d{2}(?:[–—-]\d{1,2}:\d{2})?(?: и \d{1,2}:\d{2}[–—-]\d{1,2}:\d{2})?/)?.[0]||'';
}
function publicDailyFormats(date){
 const m=Number(date.slice(5,7))-1,day=weekday(date)||7,n=Number(date.slice(8)),nth=Math.floor((n-1)/7)+1;
 const current=calendarItems().filter(e=>e.start<=date&&e.end>=date),has=id=>current.some(e=>e.id===id),hasRhythm=id=>current.some(e=>e.rhythmId===id);
 const result=[];
 for(const r of publicFormats(m)){
  if(r.calendarVisible||['djs','wine_shop_residencies'].includes(r.id))continue;
  if(['2027-01-09','2027-01-10'].includes(date)&&r.id!=='radio')continue;
  const extra=r.extra_dates?.find(p=>p.date===date);
  const p=r.periods.find(p=>p.start<=date&&p.end>=date);if(!p&&!extra)continue;
  if(!extra){
   if(r.excludedDates?.includes(date)||r.exclude_ranges?.some(([a,b])=>date>=a&&date<=b))continue;
   const days=p.weekdays_iso||r.weekdays_iso||[];
   if(days.length&&!days.includes(day))continue;
   if(r.id==='coffee_rave'&&(m<4||m>8)&&nth!==2)continue;
   if(r.id==='anatoliy_meetings'&&m!==0&&![2,4].includes(nth))continue;
   if(r.id==='book_club'&&![1,3].includes(nth))continue;
   if(r.id==='wineclub'&&n+7<=daysIn(m))continue;
   if(r.id==='bar'&&(hasRhythm('august_promoters')||has('embedded-bar_july_party')||has('embedded-bar_music_weekend')))continue;
   if(r.id==='dance'&&has('embedded-rotunda_big_dance'))continue;
   if(r.id==='stage'&&(hasRhythm('jazz')||['orchestras','resonance','paradiz'].some(has)))continue;
   if(r.id==='hall'&&(hasRhythm('noise')||hasRhythm('cinematica')||has('embedded-blacksea_night')))continue;
   if(r.id==='cinema'&&has('terroir'))continue;
   if(r.id==='book_club'&&has('books'))continue;
   if(r.id==='august_main_stage'&&(has('paradiz')||has('embedded-bar_music_weekend')))continue;
  }
  result.push({...publicRhythmItem(r),date,time:extra?.time||publicRhythmTime(r,p,date),isRitual:publicRitualIds.has(r.id)});
 }
 return result;
}
function calendarCount(n,one,few,many){const last=n%10,teen=n%100;return `${n} ${teen>=11&&teen<=14?many:last===1?one:last>=2&&last<=4?few:many}`;}
function publicDayButton(date){const rows=publicDailyFormats(date);if(!rows.length)return '';const ritual=rows.filter(r=>r.isRitual).length;return `<button class="daily-program-button" data-city-day="${date}"><b>${calendarCount(rows.length,'формат','формата','форматов')}</b>${ritual?`<span>${calendarCount(ritual,'ритуал','ритуала','ритуалов')}</span>`:''}</button>`;}
function showPublicDay(date){
 const rows=publicDailyFormats(date),events=calendarItems().filter(e=>e.start<=date&&e.end>=date&&matches(e));
 const line=(id,title,caption,ritual=false)=>`<button class="city-day-item ${ritual?'city-day-ritual':''}" ${id.startsWith('rhythm-')?`data-city-rhythm="${esc(id.slice(7))}" data-city-month="${Number(date.slice(5,7))-1}"`:`data-event="${esc(id)}"`}><b>${esc(title)}</b><span>${esc(caption)}</span></button>`;
 openDialog(`<div class="detail-category">Программа дня</div><h2 class="detail-title">${esc(fullPlanDate(date))}</h2><div class="detail-meta"><span class="badge pending">Предварительное расписание</span></div><div class="city-day-list">${events.map(e=>line(e.id,e.title,e.place||'')).join('')}${rows.map(e=>line(e.id,e.title,[e.time,e.place].filter(Boolean).join(' · '),e.isRitual)).join('')}</div>`);
}
function showPublicRhythm(id,m){const r=P.recurring.find(r=>r.id===id);if(!r)return;const e=publicRhythmItem(r),days=Array.from({length:daysIn(m)},(_,i)=>dateOf(m,i+1)).map(date=>publicDailyFormats(date).find(e=>e.rhythmId===id)).filter(Boolean);openDialog(`<div class="detail-category">${publicRitualIds.has(id)?'Городской ритуал':'Регулярная программа'} · ${esc(D.months[m].name)}</div><h2 class="detail-title">${esc(e.title)}</h2><div class="detail-meta"><span class="badge">${esc(e.place)}</span><span class="badge pending">Предварительное расписание</span></div><div class="detail-description"><p>${esc(e.description)}</p><p>${esc(publicRhythmSummary(r,m))}</p></div><div class="city-rhythm-dates">${days.map(d=>`<button data-city-day="${d.date}"><b>${Number(d.date.slice(8))}</b><span>${esc(d.time)}</span></button>`).join('')}</div>`);}
function publicMobileCalendar(m){return Array.from({length:daysIn(m)},(_,i)=>{const date=dateOf(m,i+1),events=monthEvents(m).filter(e=>e.start<=date&&e.end>=date),regular=publicDailyFormats(date),hol=D.holidays.find(h=>h.start<=date&&h.end>=date);if(!events.length&&!regular.length&&!hol)return '';const titles=events.slice(0,2).map(e=>e.title).join(' · ');return `<button class="mobile-date-card city-mobile-day ${hol?'date-holiday':''}" data-city-day="${date}"><span class="mobile-date-range">${i+1}<small>${['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][weekday(date)]}</small></span><span><b>${esc(titles||hol?.title||'Регулярная программа')}</b><small>${events.length?calendarCount(events.length,'событие','события','событий')+' · ':''}${calendarCount(regular.length,'регулярный формат','регулярных формата','регулярных форматов')}${regular.some(e=>e.isRitual)?' · ритуалы':''}</small></span><span aria-hidden="true">+</span></button>`;}).join('');}
document.addEventListener('click',event=>{if(WORKING)return;const b=event.target.closest('button');if(!b)return;if(b.dataset.cityDay)showPublicDay(b.dataset.cityDay);if(b.dataset.cityRhythm)showPublicRhythm(b.dataset.cityRhythm,Number(b.dataset.cityMonth??state.month));});
