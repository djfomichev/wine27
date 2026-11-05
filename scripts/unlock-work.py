#!/usr/bin/env python3
"""Recover editable working sources locally using the owner's access key."""
from pathlib import Path
import argparse,base64,gzip,json,re
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--key-file',required=True);args=parser.parse_args()
secret=next(line.strip() for line in Path(args.key_file).read_text().splitlines() if re.fullmatch(r'[A-Za-z0-9_-]{43}',line.strip()))
decode=lambda s:base64.urlsafe_b64decode(s+'='*((-len(s))%4))
p=json.loads((ROOT/'work/payload.json').read_text())
raw=AESGCM(decode(secret)).decrypt(decode(p['iv']),decode(p['ciphertext']),('wine27-work-v1:'+p['release']).encode())
page=json.loads(gzip.decompress(raw))
target=ROOT/'private-work';target.mkdir(exist_ok=True)
for name in ['data.js','expert-data.js','planning-data.js','index.html','program.json','expert-supplement.json','director-copy.json']:
    if name in page['sources']:(target/name).write_text(page['sources'][name])
if 'program.json' not in page['sources']:print('Legacy payload restored. Run the reviewed v15 migration before synchronization.')
print('Working sources restored locally. Do not publish private-work/.')
