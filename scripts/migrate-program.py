#!/usr/bin/env python3
"""Restore a reviewed registry over legacy source files without silently guessing v15 facts.
The initial migration is recorded in program.history. Modern encrypted payloads already
contain program.json. A legacy restore needs the approved registry, never generated outputs.
"""
import argparse,json,shutil
from pathlib import Path
from program_model import ROOT,validate
p=argparse.ArgumentParser();p.add_argument('--approved-registry',type=Path,required=True);p.add_argument('--baseline',type=Path,required=True);a=p.parse_args()
target=ROOT/'private-work/program.json'
if target.exists():raise SystemExit('Registry exists; edit it instead of remigrating.')
program=json.loads(a.approved_registry.read_text());validate(program)
def readjs(path):
 s=path.read_text();return json.loads(s[s.index('{'):s.rindex('}')+1])
old=readjs(a.baseline/'data.js');ids={e['id'] for e in old['events']+old['projects']};new={e['id'] for e in program['entities']}
assert ids<=new,'The reviewed registry must account for every legacy ID, including archived entries'
target.parent.mkdir(exist_ok=True);shutil.copy2(a.approved_registry,target)
print('Reviewed registry restored; all legacy IDs retained. Run build-release.py.')
