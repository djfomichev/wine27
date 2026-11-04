"""Deterministic projections of the single private registry; no program facts."""
import copy, hashlib, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def stable(v):return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def revision(p):
    p=copy.deepcopy(p);p['presentation'].pop('buildSource',None)
    return hashlib.sha256(stable(p).encode()).hexdigest()[:20]
def js(path,name,v):path.write_text('window.'+name+' = '+json.dumps(v,ensure_ascii=False,indent=2)+';\n')
def validate(p):
    import jsonschema
    jsonschema.validate(p,json.loads((ROOT/'schemas/program.schema.json').read_text()))
    assert p['schemaVersion']==1 and p['year']==2027
    assert [m['number'] for m in p['months']]==list(range(1,13))
    ids=[e['id'] for e in p['entities']];assert len(ids)==len(set(ids))
    for e in p['entities']:
        assert e['programType'] in ['regular','invited','owned_major','expert'],e['id']
        s=e['schedule'];assert s['kind'] in ['exact','window','season','recurrence','conditional','within_parent'],e['id']
        if s['kind']=='exact':assert s.get('start') and s.get('end') and s['start']<=s['end'],e['id']
        else:assert not s.get('start') and not s.get('end'),e['id']
        if s['kind'] in ['window','within_parent']:assert 1<=s['month']<=12,e['id']
        if e.get('parentId'):assert e['parentId'] in ids and e['parentId']!=e['id'],e['id']
    for r in p['relations']:assert r['parent'] in ids and r['child'] in ids
    for r in p['recurring']:
        assert all(i in ids for i in r['sourceIds']),r['id']
        for period in r['periods']:assert bool(period.get('start'))==bool(period.get('end')),r['id']
    keys=[s['key'] for s in p['presentation']['slides']]
    assert len(keys)==len(set(keys)) and keys==p['presentation']['deckOrder']
    assert len(p['history']['sourceInventory'])==sum(p['history']['sourceInventoryCounts'].values())
def schedule_fields(e):
    s=e['schedule'];e['start']=s.get('start');e['end']=s.get('end');e['scheduleStatus']=s['status']
    if s['kind'] in ['window','within_parent']:e['month']=s['month'];e['planningMonth']=s['month'];e['dateLabel']=s['label']
    if s['kind']=='season':e['periodMonths']=s['months'];e['dateLabel']=s['label']
    if s['kind']=='conditional':e['dateLabel']=s.get('label','После готовности')
    if s.get('parentId'):e['parentId']=s['parentId']
    return e
PUBLIC_FIELDS=set('id title shortTitle start end category status place description dateLabel sourceSlide sourceKey organizationType scale formatLabel expertId launchTier statusLabel parentId month conditionalMonth datePrecision periodMonths programType ownership productionGroupId schedule conceptStatus scheduleStatus bookingStatus readinessStatus visibility isFestival'.split())
def clean_schedule(s):return {k:copy.deepcopy(v) for k,v in s.items() if k in ['kind','year','month','months','windowCode','label','start','end','status','parentId','afterEventId','condition'] and v is not None}
def editions(program):
    rev=revision(program);out={};byid={e['id']:e for e in program['entities']}
    for public in [False,True]:
        d=copy.deepcopy(program['metadata']);d['months']=copy.deepcopy(program['months']);d['events']=[];d['projects']=[]
        d['meta']={**d.get('meta',{}),'year':program['year'],'contentRevision':rev,'schemaVersion':1,'edition':'presentation' if public else 'working'}
        for m in d['months']:
            if public:
                m.update(m['copy']['calendar'])
                for k in list(m):
                    if k not in ['number','name','theme','note','themeDetail','programStatus']:m.pop(k,None)
            m.pop('copy',None)
        for source in program['entities']:
            if not source['active']:continue
            e=schedule_fields(copy.deepcopy(source));e.update(e['copy']['calendar' if public else 'working'])
            if public:e={k:v for k,v in e.items() if k in PUBLIC_FIELDS};e['schedule']=clean_schedule(e['schedule'])
            d[source['collection']].append(e)
        p=copy.deepcopy(program['planning']);p['contentRevision']=rev;p['relations']=copy.deepcopy(program['relations']);p['preparation']=[copy.deepcopy(a) for a in program['preparation'] if a.get('active',True)];p['recurring']=[copy.deepcopy(a) for a in program['recurring'] if a.get('active',True)]
        for key in ['dated','event_details']:
            for r in p[key]:
                if r['id'] in byid:r['schedule']=copy.deepcopy(byid[r['id']]['schedule']);r['start']=r['schedule'].get('start');r['end']=r['schedule'].get('end')
        p['resourceModel']=copy.deepcopy(program['resourceRequirements']);p['programGuide']=copy.deepcopy(program['programGuide'])
        x=copy.deepcopy(program['expertPortfolio']);x['contentRevision']=rev
        for expert in x['projects']:
            if expert['id'] in byid:
                e=byid[expert['id']];expert['title']=e['title'];expert['schedule']=copy.deepcopy(e['schedule']);expert['programType']='expert';expert['conceptStatus']=e['conceptStatus'];expert['bookingStatus']=e['bookingStatus']
        if public:
            d['issues']=[];d['sources']=[];p.pop('production',None)
            for key in ['preparation','relations','conflicts','event_details','rules','resource_gates','priority_decisions']:p[key]=[]
            p['conditional_session']={};p['calendar_adjustments']={};p['source']='Программа города 2027';p['month_focus']=[];p['resourceModel']={k:v for k,v in p['resourceModel'].items() if k in ['major','umbrella','children','key']};p['resourceModel']['recurring']=[];p['programGuide']={}
            p['dated']=[{k:v for k,v in r.items() if k in ['id','start','end','status','type','venue','schedule']} for r in p['dated']]
            p['recurring']=[r for r in p['recurring'] if r.get('date_kind')!='internal_recurring' and r['id']!='orchestra_tours']
            for r in p['recurring']:
                r['description']=r['copy']['calendar'][1];r['exceptions']='';r['production']='';r.pop('history',None);r.pop('previousSummerWindows',None)
                for period in r['periods']:period['condition']=''
            for e in p['embedded']:e.update(e.pop('copy',{}).get('calendar',{}));e['basis']=e.get('description','');e['counting']='';e.pop('history',None);e.pop('previousDateRange',None)
            x['team']=[];x['monthly_work']=[];x['candidate_partner_windows']=[];x['status_definition']=''
            allowed=set('id title shortTitle subtitle track organization_type parent_id preferred_month_proposal monthLabel launch_tier first_year exact_start exact_end date_status schedule programType conceptStatus bookingStatus sourceSlide'.split())
            x['projects']=[{**{k:v for k,v in e.items() if k in allowed},'detail':e.get('subtitle',''),'notes':'','sourceLabel':'','statusLabel':'В разработке' if e['launch_tier']!='core' else 'Программа 2027'} for e in x['projects']]
        out['public' if public else 'working']=(d,p,x)
    return out
def presentation(program):
    slides=copy.deepcopy(program['presentation']['slides']);bindings={};bykey={}
    for e in program['entities']:bykey.setdefault(e.get('sourceKey'),[]).append(e)
    for s in slides:
        entities=bykey.get(s['key'],[]);bindings[s['key']]=[e['id'] for e in entities]
        if len(entities)==1:
            e=entities[0];b=e.get('deckBinding',{})
            if e['title']!=b.get('initialTitle',e['title']):s['title']=e['title']
            if 'deck' in e['copy']:s['text']=e['copy']['deck']['text']
            if e['schedule']!=b.get('initialSchedule',e['schedule']):s['date']=e['schedule'].get('label',s.get('date',''))
    months=[]
    for m in program['months']:
        card=copy.deepcopy(m['copy']['deck']);card['title']=m['theme'];card.pop('initialTheme',None);months.append(card)
    for s in slides:
        if s['key'].startswith('month_themes_'):
            index=int(s['key'].rsplit('_',1)[1])-1
            if any(m['theme']!=m['copy']['deck'].get('initialTheme',m['theme']) for m in program['months'][index*4:index*4+4]):
                s['text']='\n\n'.join(m['month']+'. '+m['title']+'\n'+m['text'] for m in months[index*4:index*4+4])
    return slides,{'schema_version':1,'year':program['year'],'months':months},bindings
