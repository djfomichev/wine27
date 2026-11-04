#!/usr/bin/env python3
"""Package the accepted deck; rerender changed source through the existing Mac pipeline."""
from pathlib import Path
import hashlib,json,re,shutil,subprocess,datetime
from program_model import ROOT,stable,revision,presentation

def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def build():
    p=json.loads((ROOT/'private-work/program.json').read_text());slides,months,bindings=presentation(p);source=Path(p['presentation']['buildSource']);version=p['presentation']['version']
    accepted=json.loads((source/'slides.json').read_text());accepted_months=json.loads((source/'canonical-months.json').read_text())
    # Schema envelopes may differ; compare actual card content only.
    original=slides==accepted and months['months']==accepted_months['months']
    deck=source
    if not original:
        deck=ROOT/'private-work/presentation/render';deck.mkdir(parents=True,exist_ok=True)
        for f in ['build_scene.py','render_isolated.py','build_viewer.py','render.swift','font-metrics.json','baseline-slides.json','visual-map-01-36.json','visual-map-37-73.json','layout-spec.json','assets-manifest.json']:
            if (source/f).exists():shutil.copy2(source/f,deck/f)
        shutil.copytree(source/'assets',deck/'assets',dirs_exist_ok=True)
        scene_script=deck/'build_scene.py';scene_script.write_text(scene_script.read_text().replace('R=O.parents[1]', 'R=Path('+repr(str(source.parents[1]))+')'))
        (deck/'slides.json').write_text(json.dumps(slides,ensure_ascii=False,indent=2));(deck/'canonical-months.json').write_text(json.dumps(months,ensure_ascii=False,indent=2))
        f=deck/'build_viewer.py';s=f.read_text().replace('len(records) != 77','len(records) != '+str(len(slides))).replace('Expected the complete 77-slide presentation','Incomplete approved slide sequence');f.write_text(s)
        for script in ['build_scene.py','render_isolated.py','build_viewer.py']:subprocess.run(['python3',str(deck/script)],check=True)
        qa=json.loads((deck/'qa-render.json').read_text());assert not qa['violations'],qa['violations']
    pdf=deck/'BelyiMys_Season_2027_v15.pdf';info=subprocess.check_output(['pdfinfo',str(pdf)],text=True);count=int(re.search(r'^Pages:\s+(\d+)',info,re.M)[1]);assert count==len(slides)==p['presentation']['acceptedPageCount']
    sha=digest(pdf)
    if original:assert sha==p['presentation']['acceptedPdfSha256'],'Accepted PDF was changed outside the registry'
    target=ROOT/'presentation';assets=target/'assets';assets.mkdir(exist_ok=True)
    pdfname=f'BelyiMys_Season_2027_v{version}.pdf';destination=assets/pdfname
    if destination.exists() and digest(destination)!=sha:raise ValueError('Bump presentation.version before replacing an already packaged PDF')
    shutil.copy2(pdf,destination)
    renderkey=sha[:16];folder=assets/f'v{version}-{renderkey}';folder.mkdir(exist_ok=True)
    records=[]
    from PIL import Image
    for i,s in enumerate(slides,1):
        name=f'slide-{i:02}.jpg';preview=folder/name;shutil.copy2(deck/'previews'/name,preview)
        thumb=folder/f'thumb-{i:02}.jpg'
        if not thumb.exists():
            with Image.open(preview) as image:image.thumbnail((480,270));image.save(thumb,quality=85)
        url=lambda f:'/presentation/'+str(f.relative_to(target))
        records.append({'key':s['key'],'title':s['title'],'text':s.get('text',''),'date':s.get('date',''),'src':url(preview),'thumbnail':url(thumb),'sha256':digest(preview)})
    rev=revision(p);proof={'contentRevision':rev,'pdfSha256':sha,'pageCount':count,'pdfBytes':pdf.stat().st_size}
    # Revision-specific proof prevents a late CDN manifest from mixing content generations.
    proofpath=assets/f'content-{rev}.json';proofpath.write_text(json.dumps(proof,indent=2)+'\n')
    path=target/'manifest.json';old=json.loads(path.read_text()) if path.exists() else {}
    generated=old.get('generatedAt') if old.get('contentRevision')==rev else datetime.datetime.now(datetime.timezone.utc).isoformat()
    manifest={**proof,'presentationVersion':version,'generatedAt':generated,'releaseId':'pending','pdfUrl':'/presentation/assets/'+pdfname,'assetManifestUrl':'/presentation/assets/'+proofpath.name,'viewerUrl':'/presentation/','slides':records}
    path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print('Presentation:',count,'pages;',sha)
if __name__=='__main__':build()
