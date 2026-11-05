#!/usr/bin/env python3
"""Publish the presentation and working editions as one content-derived release."""
from pathlib import Path
import re,hashlib,json,datetime
ROOT=Path(__file__).resolve().parents[1]
assets=['style.css','expert.css','app.js','load.js','data.js','expert.js','expert-data.js',
        'planning-data.js','plan.js','program-guide.js','public-view.js','public-calendar.js','production.js','auto-update.js',
        'private-work/data.js','private-work/expert-data.js','private-work/planning-data.js','work/lock.js','work/lock.css','logo.svg',
        'program-version.json','presentation/viewer.js','presentation/viewer.css',
        'favicon.svg','favicon.png','favicon.ico','apple-touch-icon.png',
        'ALS-Hauss-Next-Regular.woff2','ALS-Hauss-Next-Wide-Bold.woff2']
is_master=json.loads((ROOT/'program-version.json').read_text()).get('schemaVersion')=='wine27-master-2027/v1'
if is_master:assets+=['master-app.js','master.css']
pages=['index.html','work/index.html','private-work/index.html']+([] if is_master else ['presentation/index.html'])
pattern=r'((?:href|src)="(?:'+ '|'.join(re.escape(a) for a in assets)+r'))(?:\?[^"\s]*)?"'
normal={}
manifest=json.loads((ROOT/'presentation/manifest.json').read_text());manifest.pop('releaseId',None)
for name in pages:
    html=(ROOT/name).read_text()
    html=re.sub(r'<meta name="wine27-version" content="[^"]*">','',html)
    if name=='presentation/index.html':html=re.sub(r'(href="viewer.css|src="viewer.js)(?:\?[^"]*)?"',r'\1"',html)
    normal[name]=re.sub(pattern,r'\1"',html)
h=hashlib.sha256()
if not is_master:h.update(json.dumps(manifest,ensure_ascii=False,sort_keys=True).encode())
for name,html in normal.items():h.update(name.encode());h.update(html.encode())
for name in assets:h.update(name.encode());h.update((ROOT/name).read_bytes())
version=h.hexdigest()[:16]
for name,html in normal.items():
    html=re.sub(pattern,lambda m:m.group(1)+'?v='+version+'"',html)
    if name=='presentation/index.html':html=html.replace('href="viewer.css"',f'href="viewer.css?v={version}"').replace('src="viewer.js"',f'src="viewer.js?v={version}"')
    html=html.replace('</head>',f'<meta name="wine27-version" content="{version}"></head>')
    (ROOT/name).write_text(html)
previous=json.loads((ROOT/'site-version.json').read_text()) if (ROOT/'site-version.json').exists() else {}
release=previous if previous.get('version')==version else {'version':version,'updated':datetime.datetime.now(datetime.timezone.utc).isoformat()}
release['contentRevision']=json.loads((ROOT/'program-version.json').read_text())['contentRevision']
if not is_master:
    manifest['releaseId']=version;(ROOT/'presentation/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
for folder in (['', 'work/'] if is_master else ['', 'work/','presentation/']):(ROOT/(folder+'site-version.json')).write_text(json.dumps(release,indent=2)+'\n')
print(version)
