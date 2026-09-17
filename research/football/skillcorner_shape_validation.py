#!/usr/bin/env python3
from __future__ import annotations

import json, math
from pathlib import Path
import numpy as np
import pandas as pd

MATCH_IDS=[2017461,2016236,2010085]
BASE=Path('/tmp/skillcorner/data/matches')
OUT=Path('research/football/output')


def finite(x):
    try:return math.isfinite(float(x))
    except Exception:return False

def load_meta(mid):return json.loads((BASE/str(mid)/f'{mid}_match.json').read_text(encoding='utf-8'))
def player_team_map(meta):
    return {int(p['id']):int(p['team_id']) for p in meta.get('players',[]) if p.get('id') is not None and p.get('team_id') is not None}

def stream_frames(mid,target):
    got={}
    with (BASE/str(mid)/f'{mid}_tracking_extrapolated.jsonl').open(encoding='utf-8') as f:
        for line in f:
            o=json.loads(line);fr=o.get('frame')
            if fr in target:
                got[int(fr)]=o
                if len(got)==len(target):break
    return got

def team_shape(frame,team_id,p2team):
    pts=[]
    for p in frame.get('player_data') or []:
        pid=p.get('player_id')
        if pid is None or p2team.get(int(pid))!=team_id:continue
        if not finite(p.get('x')) or not finite(p.get('y')):continue
        pts.append((float(p['x']),float(p['y'])))
    if len(pts)<8:return None
    a=np.asarray(pts,float);x=a[:,0];y=a[:,1]
    # Raw shared geometric primitives, no SkillCorner labels involved.
    return {
      'span_x':float(x.max()-x.min()),'span_y':float(y.max()-y.min()),
      'sd_x':float(np.std(x)),'sd_y':float(np.std(y)),
      'iqr_x':float(np.percentile(x,75)-np.percentile(x,25)),
      'iqr_y':float(np.percentile(y,75)-np.percentile(y,25)),
      'n_players':int(len(a))
    }

def spearman(x,y):
    z=pd.DataFrame({'x':x,'y':y}).dropna()
    if len(z)<25:return None
    return float(z.x.corr(z.y,method='spearman'))

def process(mid):
    base=BASE/str(mid);ph=pd.read_csv(base/f'{mid}_phases_of_play.csv',low_memory=False)
    ph['frame_start']=pd.to_numeric(ph.frame_start,errors='coerce');ph=ph[ph.frame_start.notna()].copy()
    frames=set(ph.frame_start.astype(int));fm=stream_frames(mid,frames);p2team=player_team_map(load_meta(mid));rows=[]
    for _,r in ph.iterrows():
        fr=fm.get(int(r.frame_start));tid=r.get('team_in_possession_id')
        if fr is None or not finite(tid):continue
        tid=int(float(tid));ip=team_shape(fr,tid,p2team)
        # Other team inferred from tracked player team ids.
        other_ids=[t for t in set(p2team.values()) if t!=tid]
        if not other_ids:continue
        oop=team_shape(fr,other_ids[0],p2team)
        if ip is None or oop is None:continue
        rec={'match_id':mid,'frame':int(r.frame_start)}
        for k,v in ip.items():rec['ip_'+k]=v
        for k,v in oop.items():rec['oop_'+k]=v
        for c in ['team_in_possession_width_start','team_in_possession_length_start','team_out_of_possession_width_start','team_out_of_possession_length_start']:
            if c in r and finite(r[c]):rec[c]=float(r[c])
        rows.append(rec)
    return pd.DataFrame(rows),{'phase_rows':int(len(ph)),'matched_shape_rows':int(len(rows))}

# Width is lateral (y), length is longitudinal (x); signs are definitionally positive.
TESTS={
 'ip_width_span':('ip_span_y','team_in_possession_width_start'),
 'ip_length_span':('ip_span_x','team_in_possession_length_start'),
 'oop_width_span':('oop_span_y','team_out_of_possession_width_start'),
 'oop_length_span':('oop_span_x','team_out_of_possession_length_start'),
 'ip_width_sd':('ip_sd_y','team_in_possession_width_start'),
 'ip_length_sd':('ip_sd_x','team_in_possession_length_start'),
 'oop_width_sd':('oop_sd_y','team_out_of_possession_width_start'),
 'oop_length_sd':('oop_sd_x','team_out_of_possession_length_start'),
}

def main():
    parts=[];diag={}
    for mid in MATCH_IDS:
        d,x=process(mid);parts.append(d);diag[str(mid)]=x
    allrows=pd.concat(parts,ignore_index=True)
    if len(allrows)<250:raise RuntimeError(f'too few phase-aligned rows {len(allrows)} {diag}')
    tests={}
    for name,(g,v) in TESTS.items():
        if g not in allrows or v not in allrows:continue
        pooled=spearman(allrows[g],allrows[v]);per={};wins=0;usable=0
        for mid in MATCH_IDS:
            q=allrows[allrows.match_id==mid];c=spearman(q[g],q[v]);per[str(mid)]=c
            if c is not None:
                usable+=1;wins+=int(c>0)
        tests[name]={'geometry':g,'vendor':v,'pooled_spearman':pooled,'per_match_spearman':per,
                     'positive_consistency':f'{wins}/{usable}',
                     'construct_supported':bool(pooled is not None and pooled>=0.50 and usable>=3 and wins==3)}
    supported=[k for k,v in tests.items() if v['construct_supported']]
    summary={'mode':'ADHOMS raw spatial-structure construct validation against SkillCorner phase widths/lengths',
             'matches':MATCH_IDS,'rows':int(len(allrows)),'diagnostics':diag,'tests':tests,'supported_constructs':supported,
             'scope':'Measurement validation only; no target outcome or market data is used.',
             'gate':'Strict: positive in all 3 matches and pooled Spearman >= 0.50.'}
    OUT.mkdir(parents=True,exist_ok=True);(OUT/'skillcorner_shape_validation.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    print(json.dumps(summary,indent=2))
if __name__=='__main__':main()
