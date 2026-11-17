#!/usr/bin/env python3
"""Release shared UI without decrypting or rewriting the canonical working payload."""
import datetime,hashlib,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
from calendar_decisions import apply_decisions,refresh_runtime
refresh_runtime(ROOT)
for name,var in [('data.js','CALENDAR_DATA'),('planning-data.js','PLANNING_DATA')]:
 p=ROOT/name;text=p.read_text();value=json.loads(text[text.index('{'):].strip().rstrip(';'))
 p.write_text('window.'+var+'='+json.dumps(apply_decisions(value),ensure_ascii=False,separators=(',',':'))+';\n')
def read(name):return (ROOT/name).read_text()
def asset(content,suffix):
 name='calendar/'+hashlib.sha256(content.encode()).hexdigest()[:20]+suffix
 (ROOT/name).write_text(content)
 return name
revision=json.loads(read('program-version.json'))['contentRevision']
bundle=asset('\n'.join(read(n) for n in ['data.js','expert-data.js','planning-data.js','master-app.js','auto-update.js']),'.js')
runtime=asset('\n'.join(read(n) for n in ['master-app.js','auto-update.js']),'.js')
css=asset(read('master.css').replace("url('ALS-","url('/ALS-"),'.css')
public=read('index.html')
public=re.sub(r'<script src="calendar/[^"<>]+"></script>',f'<script src="{bundle}"></script>',public)
public=re.sub(r'<link rel="stylesheet" href="calendar/[^"<>]+">',f'<link rel="stylesheet" href="{css}">',public)
work=read('work/index.html')
work=re.sub(r' data-ui-(?:runtime|css|content)="[^"]*"','',work)
work=work.replace('<body',f'<body data-ui-runtime="/{runtime}" data-ui-css="/{css}" data-ui-content="{revision}"',1)
def normalized(html):
 html=re.sub(r'<meta name="wine27-version" content="[^"]*">','',html)
 return re.sub(r'\?v=[a-f0-9]+','',html)
public,work=normalized(public),normalized(work)
version=hashlib.sha256((public+work+bundle+runtime+css+read('work/lock.js')).encode()).hexdigest()[:16]
for name,html in [('index.html',public),('work/index.html',work)]:
 html=re.sub(r'((?:href|src)="[^"<>]+\.(?:ico|png|svg|js|css))"',lambda m:m[1]+'"' if 'calendar/' in m[1] else m[1]+'?v='+version+'"',html)
 html=html.replace('</head>',f'<meta name="wine27-version" content="{version}"></head>')
 (ROOT/name).write_text(html)
previous=json.loads(read('site-version.json'))
release={'version':version,'updated':previous['updated'] if previous.get('version')==version else datetime.datetime.now(datetime.timezone.utc).isoformat(),'contentRevision':revision}
for name in ['site-version.json','work/site-version.json']:(ROOT/name).write_text(json.dumps(release,indent=2)+'\n')
print(json.dumps({'release':release,'assets':[bundle,runtime,css],'payloadRelease':json.loads(read('work/payload.json'))['release']}))
