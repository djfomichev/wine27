"""Lossless MASTER storage; explicit public projection and preserved expert overlay."""
from pathlib import Path
import json, hashlib, calendar, datetime, copy, re
ROOT=Path(__file__).resolve().parents[1]
def digest(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def validate(p):
 assert p['schema_version']=='wine27-master-2027/v1' and p['year']==2027
 assert len(p['events'])==p['validation']['event_count']
 assert digest(p['events'])==p['validation']['events_sha256']
 assert len(p['year_events'])==p['validation']['year_event_count']
 for key in ['events','year_events','venues']:assert len({e['id'] for e in p[key]})==len(p[key])
 vids={v['id'] for v in p['venues']}; ys={y['id']:y for y in p['year_events']}; es={e['id']:e for e in p['events']}
 for e in p['events']:
  assert datetime.date.fromisoformat(e['date']).year==2027 and e['timezone']=='Europe/Moscow'
  assert e['venue_id'] in vids
  for y in e['year_event_ids']:assert y in ys and e['id'] in ys[y]['event_ids']
 for y in p['year_events']:
  for i in y['event_ids']:assert i in es and y['id'] in es[i]['year_event_ids']
 assert len(p['month_metadata'])==12
 for m in p['month_metadata']:assert m['days']==[f"2027-{m['month']:02}-{i:02}" for i in range(1,calendar.monthrange(2027,m['month'])[1]+1)]
 assert all(not x['fixed_occurrences'] and not x['public_calendar'] for x in p['conditional_programs'])

KIND_CATS={}
for cat,kinds in {
 'music':'paradis beach central_bar rooftop orchestra jazz rotunda_orchestra piano festival_concert etudes_vinyl etudes_duo central_promogroup central_dj_residency special_concert kerman_live',
 'wine':'winemaker wine_week wine_talk guest_wine forum ceremony',
 'art':'exhibition book cinema podcast shum cinematica art_meeting exhibition_opening cabaret',
 'city':'bell city_dance dance running stretch coffee newyear festival_day special night_show',
 'gastro':'gastro_dinner gastro_meeting'
}.items():
 for k in kinds.split():KIND_CATS[k]=[cat]
FESTIVALS={'masters','rose','cheese','city-reads','mayovka','shtil','terroir','city-birthday','russia-day','white-sail','orchestras','resonance','paradiz-festival','height','etudes-art','velvet','south-table','golitsyn','wineweek','anchovy','barin','newyear-jan','newyear-dec'}
def event_categories(e):
 c=list(KIND_CATS.get(e['kind'],['city']))
 if e['kind']=='cabaret':c+=['wine','music']
 if any(y in ('award','wineforum') for y in e.get('year_event_ids',[])):c+=['expert','wine']
 if any(y in FESTIVALS for y in e.get('year_event_ids',[])):c+=['festival']
 if 'HURMA' in e['title']:c+=['partner']
 return list(dict.fromkeys(c))

def guest_conditions(e):
 out=[]
 if e['date']=='2027-02-13' and e['kind']=='cinematica':out.append('«Синематика» с приглашённым вокалистом. Билетная программа для влюблённых. Все столики на двоих.')
 if 'march8' in e.get('year_event_ids',[]):out.append('Леонид Агутин и Владимир Пресняков — варианты для рассмотрения. Участие не подтверждено.')
 if e['date']=='2027-02-14' and ('пирс' in e['venue'].lower() or 'шат' in e['title'].lower()):out.append('Два прозрачных купольных шатра на двух пирсах, по одному столу на двоих в каждом. Всего два стола. Специальное обслуживание из ресторана «Амбассадор». Предварительная продажа.')
 return out

def sync(p,out=ROOT):
 validate(p);supp=json.loads((ROOT/'private-work/expert-supplement.json').read_text())
 director_copy=json.loads((ROOT/'scripts/director-copy.json').read_text())
 def director_text(text):
  key=hashlib.sha256(text.encode('utf-8')).hexdigest()
  assert key in director_copy,'Exhibition copy must be reviewed before publication: '+key
  return director_copy[key]
 # Display the complete exhibition run without moving/expanding opening instances.
 month_numbers={m['genitive']:m['month'] for m in p['month_metadata']}
 spring=re.search(r'(\d{1,2})\s*([а-я]+)\s*[–-]\s*(\d{1,2})\s*([а-я]+)',p['special_conditions']['expo']['spring'])
 autumn=re.search(r'до\s*(\d{1,2})\s*([а-я]+)',p['special_conditions']['expo']['autumn'])
 assert spring and autumn,'Exhibition display periods require explicit MASTER bounds'
 years={y['id']:y for y in p['year_events']}
 periods={
  'exhibition-feb':{'start':years['exhibition-feb']['start_date'],'end':f"2027-{month_numbers[spring[4]]:02}-{int(spring[3]):02}",'opening':years['exhibition-feb']['start_date']},
  'exhibition-nov':{'start':years['exhibition-nov']['start_date'],'end':f"2027-{month_numbers[autumn[2]]:02}-{int(autumn[1]):02}",'opening':years['exhibition-nov']['start_date']}
 }
 revision=digest({'master':p,'expertSupplement':supp,'directorCopy':director_copy,'displayPeriods':periods})[:20]
 (out/'private-work/director-copy.json').write_text(json.dumps(director_copy,ensure_ascii=False,indent=2)+'\n')
 for working in (False,True):
  data=copy.deepcopy(p) if working else {k:copy.deepcopy(p[k]) for k in ['schema_version','year','timezone','locale','events','year_events','venues','month_metadata','holiday_periods','shortened_workdays']}
  # Working facts live in the encrypted canonical source, not in root assets.
  if not working:
   for e in data['events']:
    for k in ['production_notes','performance_start_time','performance_end_time','sort_minute_reference','sort_reference_is_public_time','theme_relation','work_key','venue_status','seasonal_venue_status']:e.pop(k,None)
    for k in ['description','public_description']:e[k]=director_text(e[k])
   for y in data['year_events']:y['description']=director_text(y['description'])
   for m in data['month_metadata']:m.pop('program_logic',None)
  for e in data['events']:
   e['categories']=event_categories(e);e['guest_conditions']=guest_conditions(e)
  data['display_periods']=copy.deepcopy(periods)
  byid={e['id']:e for e in data['events']}
  for y in data['year_events']:
   y['categories']=list(dict.fromkeys(c for i in y['event_ids'] for c in byid[i]['categories'])) or ['city']
   if y['id'] in FESTIVALS:y['categories']=list(dict.fromkeys(y['categories']+['festival']))
  overlay=copy.deepcopy(supp['working' if working else 'public'])
  overlay['events']=[e for e in overlay['events'] if e['id'] not in supp.get('masterBindings',{})]
  if not working:
   overlay.pop('portfolio',None)
   overlay['events']=[{k:(director_text(v) if k=='description' else v) for k,v in e.items() if k in ['id','title','start','end','place','description','status']} for e in overlay['events']]
  data['contentRevision']=revision;data['edition']='working' if working else 'team';data['sourceEventCount']=len(p['events']);data['sourceYearCount']=len(p['year_events'])
  dest=out/'private-work' if working else out;dest.mkdir(exist_ok=True,parents=True)
  for name,var,value in [('data.js','CALENDAR_DATA',data),('expert-data.js','EXPERT_DATA',{'contentRevision':revision,**overlay}),('planning-data.js','PLANNING_DATA',{'contentRevision':revision,**({'conditional_programs':p['conditional_programs'],'special_conditions':p['special_conditions'],'rules':p['rules'],'expertPreparation':supp.get('preparation',[]),'resourceModel':{'key':'belyi-mys-2027-resource-scenario-v1'}} if working else {})})]:
   (dest/name).write_text('window.'+var+'='+json.dumps(value,ensure_ascii=False,separators=(',',':'))+';\n')
 (out/'program-version.json').write_text(json.dumps({'schemaVersion':p['schema_version'],'contentRevision':revision,'sourceEventCount':len(p['events']),'sourceYearCount':len(p['year_events']),'eventsSha256':digest(p['events']),'expertSupplementCount':len(supp['public']['events'])-len(supp['masterBindings']),'priority':'master_then_experts'},indent=2)+'\n')
 for name in ['index.html','private-work/index.html']:
  page=out/name
  if page.exists():page.write_text(re.sub(r'(<meta name="wine27-content" content=")[^"]*',lambda m:m[1]+revision,page.read_text()))
 # Immutable public assets keep cached HTML and its data/schema together.
 bundle='\n'.join((out/name).read_text() for name in ['data.js','expert-data.js','planning-data.js','master-app.js','auto-update.js'])
 css=(out/'master.css').read_text().replace("url('ALS-", "url('/ALS-")
 bundle_name='calendar/'+hashlib.sha256(bundle.encode()).hexdigest()[:20]+'.js'
 css_name='calendar/'+hashlib.sha256(css.encode()).hexdigest()[:20]+'.css'
 (out/'calendar').mkdir(exist_ok=True)
 (out/bundle_name).write_text(bundle);(out/css_name).write_text(css)
 page=out/'index.html';html=page.read_text()
 html=re.sub(r'<script src="(?:data|expert-data|planning-data|master-app|auto-update)\.js[^"<>]*"></script>','',html)
 html=re.sub(r'<script src="calendar/[^"<>]*"></script>','',html)
 html=html.replace('</body>',f'<script src="{bundle_name}"></script></body>')
 html=re.sub(r'<link rel="stylesheet" href="(?:master\.css|calendar/[^"<>]*\.css)[^"<>]*">',f'<link rel="stylesheet" href="{css_name}">',html)
 page.write_text(html)
 print('MASTER synchronized:',len(p['events']),'instances,',len(p['year_events']),'year entries, expert supplement preserved;',revision)
 return revision
