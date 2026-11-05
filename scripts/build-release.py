#!/usr/bin/env python3
"""One local build of the accepted registry, all three editions and protected source."""
from pathlib import Path
import argparse,subprocess,json
ROOT=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('--key-file',required=True);args=a.parse_args()
master=json.loads((ROOT/'private-work/program.json').read_text()).get('schema_version')=='wine27-master-2027/v1'
commands=[['python3','scripts/sync-program.py']]
if not master:commands.append(['python3','scripts/build-presentation.py'])
commands.extend([['python3','scripts/stamp-version.py'],['python3','scripts/protect-work.py','--key-file',args.key_file]])
for cmd in commands:subprocess.run(cmd,cwd=ROOT,check=True)
for path in ROOT.glob('*.js'):subprocess.run(['node','--check',str(path)],check=True)
for test in ['check-calendar.cjs','check-editions.cjs','check-program-sync.cjs','check-presentation.cjs']:subprocess.run(['node','scripts/'+test],cwd=ROOT,check=True)
subprocess.run(['node','scripts/check-protection.cjs',args.key_file],cwd=ROOT,check=True)
if master:subprocess.run(['python3','scripts/check-master-source.py'],cwd=ROOT,check=True)
