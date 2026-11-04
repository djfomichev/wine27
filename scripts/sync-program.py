#!/usr/bin/env python3
"""Generate calendar, work model and presentation content from program.json."""
import argparse, json
from pathlib import Path
from program_model import ROOT,validate,revision,editions,presentation,js
def sync(source=None,out=None):
    source=source or ROOT/'private-work/program.json';out=out or ROOT
    program=json.loads(source.read_text());validate(program);rev=revision(program)
    (out/'private-work/presentation').mkdir(parents=True,exist_ok=True)
    for name,(d,p,x) in editions(program).items():
        dest=out if name=='public' else out/'private-work'
        for path,var,value in [('data.js','CALENDAR_DATA',d),('planning-data.js','PLANNING_DATA',p),('expert-data.js','EXPERT_DATA',x)]:js(dest/path,var,value)
    slides,months,bindings=presentation(program)
    for name,data in [('slides.json',slides),('canonical-months.json',months),('slide-bindings.json',bindings)]:
        (out/'private-work/presentation'/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    (out/'program-version.json').write_text(json.dumps({'schemaVersion':1,'contentRevision':rev,'presentationVersion':program['presentation']['version']},indent=2)+'\n')
    print('Synchronized content revision',rev);return rev
if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--source',type=Path);a.add_argument('--out',type=Path);args=a.parse_args();sync(args.source,args.out)
