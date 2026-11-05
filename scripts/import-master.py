#!/usr/bin/env python3
"""Validate and atomically replace the local canonical MASTER. Expert overlay is independent."""
import argparse,datetime,json,re,shutil,subprocess,tarfile,os
from pathlib import Path
from master_model import ROOT,validate,digest
p=argparse.ArgumentParser();p.add_argument('--master',type=Path,required=True);p.add_argument('--key-file',type=Path,required=True);p.add_argument('--backup-dir',type=Path,required=True);a=p.parse_args()
text=a.master.read_text(encoding='utf-8-sig');begin='<!-- WINE27_CANONICAL_JSON_BEGIN -->';end='<!-- WINE27_CANONICAL_JSON_END -->'
assert text.count(begin)==text.count(end)==1
block=text.split(begin,1)[1].split(end,1)[0];match=re.fullmatch(r'\s*```json\s*\n([\s\S]*?)\n```\s*',block);assert match,'Expected exactly one canonical JSON fence'
data=json.loads(match[1]);validate(data)
supp=ROOT/'private-work/expert-supplement.json';assert supp.exists(),'Restore the expert supplement from the encrypted payload before replacing data'
current=ROOT/'private-work/program.json'
if current.exists() and json.loads(current.read_text())==data:print('Unchanged canonical MASTER; no extra instances created')
else:
 stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ');backup=a.backup_dir/('before-master-'+stamp);backup.mkdir(parents=True,mode=0o700)
 with tarfile.open(backup/'calendar-source.tar.gz','w:gz') as archive:
  for name in ['private-work','scripts','index.html','data.js','expert-data.js','planning-data.js','master-app.js','master.css','program-version.json','site-version.json','work']:
   path=ROOT/name
   if path.exists():archive.add(path,arcname=name)
 (backup/'calendar-source.tar.gz').chmod(0o600)
 temporary=current.with_suffix('.pending');temporary.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');temporary.chmod(0o600);os.replace(temporary,current)
 print('Canonical replaced; backup:',backup)
subprocess.run(['python3','scripts/build-release.py','--key-file',str(a.key_file)],cwd=ROOT,check=True)
print('Local build ready; publish all generated calendar assets and encrypted payload atomically. MASTER SHA:',digest(data))
