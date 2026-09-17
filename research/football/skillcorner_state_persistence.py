#!/usr/bin/env python3
from __future__ import annotations
import json, math
from collections import defaultdict
from pathlib import Path
import numpy as np
import pandas as pd

ROOT=Path('/tmp/skillcorner')
OUT=Path('research/football/output')
FEATURES=['ip_width','ip_length','oop_width','oop_length','direct_share','create_share','finish_share','high_press_share','low_block_share']

def safe_mean(s):
    z=pd.to_numeric(s,errors='coerce').dropna();return float(z.mean()) if len(z) else np.nan

def summarize_match(m):
    mid=int(m['id']);p=ROOT/'data/matches'/str(mid)/f'{mid}_phases_of_play.csv'
    if not p.exists():return []
    df=pd.read_csv(p,low_memory=False);rows=[]
    for team_id,g in df.groupby('team_in_possession_id'):
        if pd.isna(team_id):continue
        name=str(g.team_in_possession_shortname.dropna().iloc[0]) if g.team_in_possession_shortname.notna().any() else str(team_id)
        ip=g.team_in_possession_phase_type.astype(str).str.lower();oop=g.team_out_of_possession_phase_type.astype(str).str.lower()
        rec={'match_id':mid,'date':pd.to_datetime(m['date_time'],utc=True),'team_id':int(team_id),'team':name,
             'ip_width':safe_mean(g.team_in_possession_width_start),'ip_length':safe_mean(g.team_in_possession_length_start),
             'oop_width':safe_mean(g.team_out_of_possession_width_start),'oop_length':safe_mean(g.team_out_of_possession_length_start),
             'direct_share':float(ip.str.contains('direct',na=False).mean()),
             'create_share':float(ip.eq('create').mean()),'finish_share':float(ip.eq('finish').mean()),
             'high_press_share':float(oop.str.contains('high_press|high press',regex=True,na=False).mean()),
             'low_block_share':float(oop.str.contains('low_block|low block',regex=True,na=False).mean())}
        rows.append(rec)
    return rows

def icc_oneway(df,feature):
    z=df[['team_id',feature]].dropna();groups=[g[feature].to_numpy(float) for _,g in z.groupby('team_id') if len(g)>=2]
    if len(groups)<3:return None
    n=sum(map(len,groups));k=len(groups);grand=np.mean(np.concatenate(groups));
    ssb=sum(len(g)*(g.mean()-grand)**2 for g in groups);ssw=sum(((g-g.mean())**2).sum() for g in groups)
    msb=ssb/(k-1);msw=ssw/(n-k);nbar=(n-sum(len(g)**2 for g in groups)/n)/(k-1)
    denom=msb+(nbar-1)*msw
    return float((msb-msw)/denom) if denom else None

def walkforward(df,feature):
    z=df[['date','team_id',feature]].dropna().sort_values('date');hist=defaultdict(list);vals=[];global_hist=[]
    for _,r in z.iterrows():
        tid=int(r.team_id);actual=float(r[feature])
        if hist[tid] and global_hist:
            pred=float(np.mean(hist[tid][-3:]));base=float(np.mean(global_hist))
            vals.append((abs(actual-pred),abs(actual-base)))
        hist[tid].append(actual);global_hist.append(actual)
    if not vals:return None
    a=np.asarray(vals,float);return {'n':len(vals),'team_history_mae':float(a[:,0].mean()),'global_mean_mae':float(a[:,1].mean()),
                                    'mae_improvement_pct':float(100*(1-a[:,0].mean()/a[:,1].mean())) if a[:,1].mean() else None}

def main():
    matches=json.loads((ROOT/'data/matches.json').read_text(encoding='utf-8'));rows=[]
    for m in matches:rows.extend(summarize_match(m))
    df=pd.DataFrame(rows)
    reports={}
    for f in FEATURES:
        icc=icc_oneway(df,f);wf=walkforward(df,f)
        reports[f]={'icc_oneway':icc,'walkforward':wf,
                    'persistent':bool(icc is not None and icc>=0.30 and wf and wf['mae_improvement_pct']>0)}
    summary={'mode':'pre-match persistence test for team spatial/tactical state','matches':len(matches),'team_match_rows':len(df),
             'features':reports,'persistent_features':[f for f,v in reports.items() if v['persistent']],
             'interpretation':'A feature is worth carrying into pre-match prediction only if it is team-repeatable and prior team history predicts the next observed match better than the global mean.',
             'gate':'ICC >= 0.30 and positive chronological MAE improvement.'}
    OUT.mkdir(parents=True,exist_ok=True);(OUT/'skillcorner_state_persistence.json').write_text(json.dumps(summary,indent=2),encoding='utf-8');print(json.dumps(summary,indent=2))
if __name__=='__main__':main()
