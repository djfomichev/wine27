"""Explicit post-MASTER decisions; canonical source is retained for recovery."""
import copy,json,re
from pathlib import Path
DECISIONS=json.loads(Path(__file__).with_name('calendar-decisions.json').read_text())
def apply_decisions(data):
 def clean(value):
  if isinstance(value,str):
   for old,new in DECISIONS['textReplacements'].items():value=value.replace(old,new)
   return value
  if isinstance(value,list):return [clean(v) for v in value]
  if isinstance(value,dict):return {k:clean(v) for k,v in value.items()}
  return value
 data=clean(data)
 removed=set(DECISIONS['removedEventIds']);years=set(DECISIONS['removedYearIds'])
 if 'events' in data:data['events']=[e for e in data['events'] if e['id'] not in removed]
 if 'year_events' in data:
  data['year_events']=[e for e in data['year_events'] if e['id'] not in years]
  for e in data['year_events']:e['event_ids']=[id for id in e['event_ids'] if id not in removed]
 # Replace by stable ID, then append missing additions. Rebuilds never duplicate them.
 for key,decision in [('events','addedEvents'),('year_events','addedYearEvents')]:
  if key not in data:continue
  additions={e['id']:e for e in DECISIONS.get(decision,[])}
  seen={e['id'] for e in data[key]}
  data[key]=[copy.deepcopy(additions.get(e['id'],e)) for e in data[key]]
  data[key].extend(copy.deepcopy(e) for id,e in additions.items() if id not in seen)
 return data
def refresh_runtime(root):
 p=root/'master-app.js';s=p.read_text()
 block='// BEGIN CALENDAR DECISIONS\nconst calendarDecisions='+json.dumps(DECISIONS,ensure_ascii=False,separators=(',',':'))+';\n// END CALENDAR DECISIONS'
 s=re.sub(r'// BEGIN CALENDAR DECISIONS[\s\S]*?// END CALENDAR DECISIONS',lambda _:block,s)
 p.write_text(s)
