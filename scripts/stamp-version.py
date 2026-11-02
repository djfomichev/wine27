#!/usr/bin/env python3
"""Stamp all deployable assets and the page with a content-derived release ID."""
from pathlib import Path
import re,hashlib,json,datetime
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'index.html';html=p.read_text()
html=re.sub(r'<meta name="wine27-version" content="[^"]*">','',html)
html=re.sub(r'((?:href|src)="(?:style\.css|expert\.css|app\.js|load\.js|data\.js|expert\.js|expert-data\.js|planning-data\.js|plan\.js|auto-update\.js|favicon\.svg|favicon\.png|favicon\.ico|apple-touch-icon\.png))\?[^\"]*',r'\1',html)
assets=['style.css','expert.css','app.js','load.js','data.js','expert.js','expert-data.js','planning-data.js','plan.js','auto-update.js','logo.svg','favicon.svg','favicon.png','favicon.ico','apple-touch-icon.png','ALS-Hauss-Next-Regular.woff2','ALS-Hauss-Next-Wide-Bold.woff2']
h=hashlib.sha256(html.encode())
for name in assets:h.update(name.encode());h.update((ROOT/name).read_bytes())
version=h.hexdigest()[:16]
html=html.replace('</head>',f'<meta name="wine27-version" content="{version}"></head>')
html=re.sub(r'((?:href|src)="(?:style\.css|expert\.css|app\.js|load\.js|data\.js|expert\.js|expert-data\.js|planning-data\.js|plan\.js|auto-update\.js|favicon\.svg|favicon\.png|favicon\.ico|apple-touch-icon\.png))"',lambda m:m.group(1)+'?v='+version+'"',html)
p.write_text(html)
(ROOT/'site-version.json').write_text(json.dumps({'version':version,'updated':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2)+'\n')
print(version)
