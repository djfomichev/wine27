#!/usr/bin/env python3
"""Publish the presentation and working editions as one content-derived release."""
from pathlib import Path
import re,hashlib,json,datetime
ROOT=Path(__file__).resolve().parents[1]
assets=['style.css','expert.css','app.js','load.js','data.js','expert.js','expert-data.js',
        'planning-data.js','plan.js','program-guide.js','public-view.js','auto-update.js',
        'work/data.js','work/expert-data.js','work/planning-data.js','logo.svg',
        'favicon.svg','favicon.png','favicon.ico','apple-touch-icon.png',
        'ALS-Hauss-Next-Regular.woff2','ALS-Hauss-Next-Wide-Bold.woff2']
pages=['index.html','work/index.html']
pattern=r'((?:href|src)="(?:'+ '|'.join(re.escape(a) for a in assets)+r'))(?:\?[^"\s]*)?"'
normal={}
for name in pages:
    html=(ROOT/name).read_text()
    html=re.sub(r'<meta name="wine27-version" content="[^"]*">','',html)
    normal[name]=re.sub(pattern,r'\1"',html)
h=hashlib.sha256()
for name,html in normal.items():h.update(name.encode());h.update(html.encode())
for name in assets:h.update(name.encode());h.update((ROOT/name).read_bytes())
version=h.hexdigest()[:16]
for name,html in normal.items():
    html=re.sub(pattern,lambda m:m.group(1)+'?v='+version+'"',html)
    html=html.replace('</head>',f'<meta name="wine27-version" content="{version}"></head>')
    (ROOT/name).write_text(html)
previous=json.loads((ROOT/'site-version.json').read_text()) if (ROOT/'site-version.json').exists() else {}
release=previous if previous.get('version')==version else {'version':version,'updated':datetime.datetime.now(datetime.timezone.utc).isoformat()}
for folder in ['', 'work/']:(ROOT/(folder+'site-version.json')).write_text(json.dumps(release,indent=2)+'\n')
print(version)
