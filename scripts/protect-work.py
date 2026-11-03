#!/usr/bin/env python3
"""Encrypt the working app and its editable sources; never publish the key."""
from pathlib import Path
import argparse,base64,gzip,json,os,re,secrets
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--key-file',required=True);args=parser.parse_args()
key_path=Path(args.key_file)
if not key_path.exists():
    key_path.parent.mkdir(parents=True,exist_ok=True)
    key_path.write_text(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip('=')+'\n');key_path.chmod(0o600)
secret=next(line.strip() for line in key_path.read_text().splitlines() if re.fullmatch(r'[A-Za-z0-9_-]{43}',line.strip()))
key=base64.urlsafe_b64decode(secret+'=')
release=json.loads((ROOT/'site-version.json').read_text())['version']
source_names=['data.js','expert-data.js','planning-data.js','index.html']
sources={name:(ROOT/'private-work'/name).read_text() for name in source_names}
html=sources['index.html']
html=html.replace('</header>','<button id="lockWork" class="plain">Закрыть доступ</button></header>',1)
def inline(match):
    path=match.group(1).split('?')[0]
    text=(ROOT/path).read_text().replace('</script','<\\/script')
    return '<script>'+text+'</script>'
html=re.sub(r'<script src="([^"]+)"></script>',inline,html)
logout="<script>document.getElementById('lockWork').onclick=()=>{try{sessionStorage.removeItem('wine27-private-session-key')}catch{}location.replace(location.pathname)};</script>"
html=html.replace('</body>',logout+'</body>')
body=json.dumps({'release':release,'html':html,'sources':sources},ensure_ascii=False).encode()
compressed=gzip.compress(body,mtime=0)
iv=os.urandom(12);encrypted=AESGCM(key).encrypt(iv,compressed,('wine27-work-v1:'+release).encode())
b64=lambda b:base64.urlsafe_b64encode(b).decode().rstrip('=')
payload={'format':'wine27-work-v1','release':release,'algorithm':'AES-256-GCM','compression':'gzip','iv':b64(iv),'ciphertext':b64(encrypted)}
(ROOT/'work/payload.json').write_text(json.dumps(payload,separators=(',',':'))+'\n')
print('Protected working edition:',release,'encrypted bytes:',len(encrypted))
