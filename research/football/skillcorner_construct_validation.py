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

def stream_target_frames(mid,target_frames):
    got={}
    with (BASE/str(mid)/f'{mid}_tracking_extrapolated.jsonl').open(encoding='utf-8') as f:
        for line in f:
            o=json.loads(line); fr=o.get('frame')
            if fr in target_frames:
                got[int(fr)]=o
                if len(got)==len(target_frames):break
    return got

def geom_for_event(row,frame,p2team):
    pid=row.get('player_in_possession_id');tid=row.get('team_id')
    if not finite(pid) or not finite(tid):return None
    pid,tid=int(float(pid)),int(float(tid))
    byid={int(p['player_id']):p for p in (frame.get('player_data') or []) if p.get('player_id') is not None and finite(p.get('x')) and finite(p.get('y'))}
    poss=byid.get(pid)
    if poss is None:return None
    px,py=float(poss['x']),float(poss['y']);mates=[];opps=[]
    for qid,p in byid.items():
        if qid==pid:continue
        qt=p2team.get(qid)
        if qt is None:continue
        d=math.hypot(float(p['x'])-px,float(p['y'])-py); rec=(d,float(p['x']),float(p['y']))
        (mates if qt==tid else opps).append(rec)
    if len(opps)<7 or len(mates)<6:return None
    dists=np.asarray([x[0] for x in opps],float);md=np.asarray([[x[1],x[2]] for x in mates],float);od=np.asarray([[x[1],x[2]] for x in opps],float)
    mdists=np.hypot(md[:,0]-px,md[:,1]-py)
    nopp=lambda r:int(np.sum(dists<=r)); nmate=lambda r:int(np.sum(mdists<=r))
    return {
      'g_nearest_opp':float(np.min(dists)),
      'g_opp_3':nopp(3),'g_opp_5':nopp(5),'g_opp_10':nopp(10),
      'g_mate_10':nmate(10),'g_local_superiority_10':nmate(10)-nopp(10),
      'g_opp_width':float(np.std(od[:,1])),'g_opp_depth':float(np.std(od[:,0])),
      'g_mate_width':float(np.std(md[:,1])),'g_mate_depth':float(np.std(md[:,0])),
    }

def process_match(mid):
    base=BASE/str(mid);df=pd.read_csv(base/f'{mid}_dynamic_events.csv',low_memory=False)
    # SkillCorner README defines the *_id constraint variables as ordinal 1..5, 1 = least constrained/easiest.
    vendor=['overall_pressure_start_id','time_to_impact_start_id','space_constraint_start_id',
            'passing_option_ease_start_id','reception_difficulty_start_id',
            'xloss_player_possession_start','possession_epv_delta_for',
            'n_passing_options_ahead_at_start','n_opponents_ahead_start']
    keep=[c for c in ['frame_start','player_in_possession_id','team_id']+vendor if c in df.columns]
    d=df[keep].copy();d['frame_start']=pd.to_numeric(d.frame_start,errors='coerce')
    d=d[d.frame_start.notna() & d.player_in_possession_id.notna() & d.team_id.notna()].drop_duplicates(['frame_start','player_in_possession_id']).copy()
    if len(d)>12000:d=d.sample(12000,random_state=mid)
    fmap=stream_target_frames(mid,set(d.frame_start.astype(int)));p2team=player_team_map(load_meta(mid));rows=[]
    for _,r in d.iterrows():
        fr=fmap.get(int(r.frame_start));g=geom_for_event(r,fr,p2team) if fr else None
        if g is None:continue
        rec={'match_id':mid,**g}
        for c in vendor:
            if c in r and finite(r[c]):rec[c]=float(r[c])
        rows.append(rec)
    return pd.DataFrame(rows),{'dynamic_rows':int(len(df)),'candidate_frames':int(len(d)),'matched_geometry_rows':int(len(rows))}

def spearman(x,y):
    z=pd.DataFrame({'x':x,'y':y}).dropna()
    if len(z)<30:return None
    return float(z.x.corr(z.y,method='spearman'))

# IDs 1..5 run from least constrained/easiest to most constrained/hardest.
TESTS={
  'pressure_vs_nearest':('g_nearest_opp','overall_pressure_start_id',-1),
  'pressure_vs_opp5':('g_opp_5','overall_pressure_start_id',+1),
  'impact_constraint_vs_nearest':('g_nearest_opp','time_to_impact_start_id',-1),
  'space_constraint_vs_opp5':('g_opp_5','space_constraint_start_id',+1),
  'reception_difficulty_vs_opp5':('g_opp_5','reception_difficulty_start_id',+1),
  'passing_difficulty_vs_local_superiority':('g_local_superiority_10','passing_option_ease_start_id',-1),
  'xloss_vs_opp5':('g_opp_5','xloss_player_possession_start',+1),
}

def main():
    parts=[];diag={}
    for mid in MATCH_IDS:
        d,x=process_match(mid);parts.append(d);diag[str(mid)]=x
    allrows=pd.concat(parts,ignore_index=True)
    if len(allrows)<500:raise RuntimeError(f'too few matched rows {len(allrows)} {diag}')
    tests={}
    for name,(gx,vy,sign) in TESTS.items():
        if vy not in allrows.columns:continue
        pooled=spearman(allrows[gx],allrows[vy]);per={};signed=0;usable=0
        for mid in MATCH_IDS:
            q=allrows[allrows.match_id==mid];c=spearman(q[gx],q[vy]) if vy in q.columns else None;per[str(mid)]=c
            if c is not None:
                usable+=1;signed+=int(c*sign>0)
        tests[name]={'geometry':gx,'vendor':vy,'expected_sign':sign,'pooled_spearman':pooled,'per_match_spearman':per,
                     'signed_consistency':f'{signed}/{usable}',
                     'construct_supported':bool(pooled is not None and pooled*sign>=0.20 and usable>=3 and signed>=2)}
    supported=[k for k,v in tests.items() if v['construct_supported']]
    summary={'mode':'ADHOMS geometry construct validation against independent SkillCorner tracking/vendor labels',
             'matches':MATCH_IDS,'rows':int(len(allrows)),'diagnostics':diag,'tests':tests,'supported_constructs':supported,
             'important_scope':'Measurement construct validation only; not a match-outcome or betting-edge test.',
             'gate':'Expected sign in >=2/3 matches and pooled signed Spearman >= 0.20.'}
    OUT.mkdir(parents=True,exist_ok=True);(OUT/'skillcorner_construct_validation.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    print(json.dumps(summary,indent=2))
if __name__=='__main__':main()
