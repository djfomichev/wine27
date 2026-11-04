#!/usr/bin/env python3
"""One local build of the accepted registry, all three editions and protected source."""
from pathlib import Path
import argparse,subprocess
ROOT=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('--key-file',required=True);args=a.parse_args()
for cmd in [['python3','scripts/sync-program.py'],['python3','scripts/build-presentation.py'],['python3','scripts/stamp-version.py'],['python3','scripts/protect-work.py','--key-file',args.key_file]]:
    subprocess.run(cmd,cwd=ROOT,check=True)
for path in ROOT.glob('*.js'):subprocess.run(['node','--check',str(path)],check=True)
subprocess.run(['node','--check',str(ROOT/'presentation/viewer.js')],check=True)
for test in ['check-calendar.cjs','check-editions.cjs','check-program-sync.cjs','check-presentation.cjs']:
    subprocess.run(['node','scripts/'+test],cwd=ROOT,check=True)
subprocess.run(['node','scripts/check-protection.cjs',args.key_file],cwd=ROOT,check=True)
