#!/usr/bin/env python3
from __future__ import annotations

import io, json, math
from collections import defaultdict, deque
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from wyscout_event_residual import (
    OUT, UA, FD_URL, canon, load_sources, match_sides, label_teams,
    summarize_match_events, mean_profile
)


def load_fd_totals():
    r=requests.get(FD_URL,timeout=90,headers=UA); r.raise_for_status()
    df=pd.read_csv(io.StringIO(r.content.decode('utf-8-sig',errors='replace')),on_bad_lines='skip')
    pairs=[('BbAv>2.5','BbAv<2.5'),('Avg>2.5','Avg<2.5'),('B365>2.5','B365<2.5')]
    cols=next((p for p in pairs if all(c in df.columns for c in p)),None)
    if cols is None:
        raise RuntimeError('No usable O/U 2.5 market columns; columns='+','.join(map(str,df.columns)))
    need=['Date','HomeTeam','AwayTeam','FTHG','FTAG',*cols]
    df=df.dropna(subset=need).copy()
    df['date']=pd.to_datetime(df.Date,dayfirst=True,utc=True,errors='coerce')
    df['home_key']=df.HomeTeam.map(canon); df['away_key']=df.AwayTeam.map(canon)
    return df,cols


def norm_binary_odds(over_odds,under_odds):
    q=np.asarray([1/float(over_odds),1/float(under_odds)],dtype=float)
    return q/q.sum()


def build_rows(matches,events):
    ev_by_match=defaultdict(list)
    for e in events: ev_by_match[int(e['matchId'])].append(e)
    ms=[]
    for m in matches:
        mid=int(m.get('wyId',m.get('matchId')))
        if mid in ev_by_match: ms.append(m)
    ms.sort(key=lambda m:str(m.get('dateutc',m.get('date',''))))
    fd,market_cols=load_fd_totals(); histories=defaultdict(lambda:deque(maxlen=8)); rows=[]; unmatched=[]
    for m in ms:
        mid=int(m.get('wyId',m.get('matchId'))); hid,aid=match_sides(m); hn,an=label_teams(m['label'])
        hk,ak=canon(hn),canon(an); dt=pd.to_datetime(m.get('dateutc',m.get('date')),utc=True,errors='coerce')
        cand=fd[(fd.home_key==hk)&(fd.away_key==ak)].copy()
        if cand.empty: unmatched.append((mid,hk,ak,'pair')); continue
        cand['dd']=(cand.date-dt).abs().dt.total_seconds(); fm=cand.sort_values('dd').iloc[0]
        if float(fm.dd)>3*86400: unmatched.append((mid,hk,ak,'date')); continue
        hp=mean_profile(histories[hid]); ap=mean_profile(histories[aid])
        if hp is not None and ap is not None and len(histories[hid])>=5 and len(histories[aid])>=5:
            mp=norm_binary_odds(fm[market_cols[0]],fm[market_cols[1]])
            # For total-goal openness, use sums/interaction rather than home-away differences.
            feats={}
            for k in hp:
                feats[k+'_sum']=hp[k]+ap[k]
                feats[k+'_absdiff']=abs(hp[k]-ap[k])
            rows.append({'mid':mid,'date':dt,'home':fm.HomeTeam,'away':fm.AwayTeam,
                         'y':int(float(fm.FTHG)+float(fm.FTAG)>2.5),
                         'mOver':mp[0],'mUnder':mp[1],**feats})
        summary=summarize_match_events(ev_by_match[mid],hid,aid)
        histories[hid].append(summary[str(hid)]); histories[aid].append(summary[str(aid)])
    return pd.DataFrame(rows),unmatched,market_cols

GROUPS={
 'pace_access':['progression_rate_sum','deep_access_rate_sum','shot_rate_sum','deep_shot_rate_sum'],
 'state_jump':['state_jump_rate_sum'],
 'suppression_failure':['opp_deep_access_rate_sum','opp_shot_rate_sum'],
 'structure_openness':['pass_entropy_absdiff','pass_success_absdiff','deep_route_breadth_sum'],
 'all_event_totals':[
     'progression_rate_sum','deep_access_rate_sum','shot_rate_sum','deep_shot_rate_sum',
     'state_jump_rate_sum','opp_deep_access_rate_sum','opp_shot_rate_sum',
     'pass_entropy_absdiff','pass_success_absdiff','deep_route_breadth_sum'
 ]
}


def metrics(p,y):
    y=np.asarray(y,dtype=int); p=np.asarray(p,dtype=float)
    # p[:,0] = P(over), market order [over,under].
    po=np.clip(p[:,0],1e-12,1-1e-12)
    brier=float(np.mean(2*(po-y)**2))
    logloss=float(np.mean(-(y*np.log(po)+(1-y)*np.log(1-po))))
    return {'brier':brier,'logloss':logloss}


def predict(train,test,fs):
    cols=['mOver','mUnder']+fs
    model=make_pipeline(StandardScaler(),LogisticRegression(C=0.20,max_iter=3000))
    model.fit(train[cols],train.y)
    po=model.predict_proba(test[cols])[:,list(model[-1].classes_).index(1)]
    return np.column_stack([po,1-po])


def main():
    matches,events=load_sources(); rows,unmatched,market_cols=build_rows(matches,events)
    if len(rows)<200: raise RuntimeError(f'too few rows {len(rows)} unmatched={unmatched[:10]}')
    rows=rows.sort_values('date').reset_index(drop=True)
    cut1=int(len(rows)*0.45); bounds=[cut1,int(len(rows)*0.65),int(len(rows)*0.82),len(rows)]
    reports=[]
    for wi in range(3):
        tr=rows.iloc[:bounds[wi]]; te=rows.iloc[bounds[wi]:bounds[wi+1]]
        y=te.y.to_numpy(int); market=te[['mOver','mUnder']].to_numpy(float); mm=metrics(market,y)
        variants={}
        for name,fs in GROUPS.items():
            p=predict(tr,te,fs); vm=metrics(p,y)
            variants[name]={**vm,'brier_delta_vs_market':vm['brier']-mm['brier'],
                            'logloss_delta_vs_market':vm['logloss']-mm['logloss']}
        reports.append({'window':wi+1,'n':int(len(te)),'start':str(te.date.min()),'end':str(te.date.max()),'market':mm,'variants':variants})
    acceptance={}
    for name in GROUPS:
        ds=[r['variants'][name] for r in reports]
        wb=sum(d['brier_delta_vs_market']<0 and d['logloss_delta_vs_market']<0 for d in ds)
        mb=float(np.mean([d['brier_delta_vs_market'] for d in ds])); ml=float(np.mean([d['logloss_delta_vs_market'] for d in ds]))
        acceptance[name]={'windows_better_both':wb,'mean_brier_delta':mb,'mean_logloss_delta':ml,
                          'accepted':bool(wb>=2 and mb<0 and ml<0)}
    summary={
      'mode':'Wyscout event-derived leakage-safe O/U2.5 residual experiment',
      'rows':int(len(rows)),'unmatched':len(unmatched),'market_columns':list(market_cols),
      'timing_rule':'target-match events excluded; rolling last 8 prior matches, minimum 5',
      'feature_groups':GROUPS,'windows':reports,'acceptance':acceptance,
      'acceptance_rule':'Brier and log loss both beat raw O/U market in at least 2 of 3 non-overlapping windows and mean deltas are negative',
      'decision_gate':'If no group is accepted, public event aggregates are deprioritized and the next data tier is tracking/360 geometry.'
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'wyscout_totals_residual_summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    print(json.dumps(summary,indent=2))

if __name__=='__main__': main()
