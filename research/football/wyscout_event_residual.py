#!/usr/bin/env python3
from __future__ import annotations

import io, json, math, re, unicodedata, zipfile
from collections import defaultdict, deque, Counter
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

OUT=Path('research/football/output')
CACHE=Path('research/football/cache/wyscout')
UA={'User-Agent':'Mozilla/5.0 ADHOMS-Football-Research/1.7'}
MATCH_ZIP='https://ndownloader.figshare.com/files/14464622'
EVENT_ZIP='https://ndownloader.figshare.com/files/14464685'
FD_URL='https://www.football-data.co.uk/mmz4281/1718/E0.csv'

ALIASES={
 'manchesterunited':'manunited','manutd':'manunited','manchestercity':'mancity',
 'tottenhamhotspur':'tottenham','wolverhamptonwanderers':'wolves',
 'brightonandhovealbion':'brighton','brightonhovealbion':'brighton',
 'westbromwichalbion':'westbrom','afcbournemouth':'bournemouth',
 'newcastleunited':'newcastle','westhamunited':'westham',
 'leicestercity':'leicester','huddersfieldtown':'huddersfield',
 'stokecity':'stoke','swanseacity':'swansea'
}

def canon(x):
    s=unicodedata.normalize('NFKD',str(x)).encode('ascii','ignore').decode().lower()
    s=re.sub(r'[^a-z0-9]','',s)
    return ALIASES.get(s,s)

def download(url,path):
    if path.exists(): return path
    path.parent.mkdir(parents=True,exist_ok=True)
    r=requests.get(url,timeout=180,headers=UA); r.raise_for_status(); path.write_bytes(r.content)
    return path

def extract_member(zip_path, suffix, out_path):
    if out_path.exists(): return out_path
    with zipfile.ZipFile(zip_path) as z:
        names=[n for n in z.namelist() if n.endswith(suffix)]
        if not names: raise RuntimeError(f'{suffix} missing in {zip_path}')
        out_path.parent.mkdir(parents=True,exist_ok=True)
        out_path.write_bytes(z.read(names[0]))
    return out_path

def load_sources():
    mz=download(MATCH_ZIP,CACHE/'matches.zip')
    ez=download(EVENT_ZIP,CACHE/'events.zip')
    mp=extract_member(mz,'matches_England.json',CACHE/'matches_England.json')
    ep=extract_member(ez,'events_England.json',CACHE/'events_England.json')
    return json.loads(mp.read_text(encoding='utf-8')), json.loads(ep.read_text(encoding='utf-8'))

def successful(e): return any(int(t.get('id',-1))==1801 for t in e.get('tags',[]))

def pos(e, idx=0):
    ps=e.get('positions') or []
    if len(ps)<=idx: return None
    try: return float(ps[idx]['x']), float(ps[idx]['y'])
    except Exception: return None

def entropy_norm(counter):
    vals=np.asarray([v for v in counter.values() if v>0],dtype=float)
    if len(vals)<=1: return 0.0
    p=vals/vals.sum(); h=-float(np.sum(p*np.log(p)))
    return h/math.log(len(vals))

def summarize_match_events(events, home_id, away_id):
    stats={str(home_id):defaultdict(float),str(away_id):defaultdict(float)}
    pass_players={str(home_id):Counter(),str(away_id):Counter()}
    deep_players={str(home_id):set(),str(away_id):set()}
    active={str(home_id):set(),str(away_id):set()}
    for e in events:
        tid=str(e.get('teamId'))
        if tid not in stats: continue
        s=stats[tid]; player=str(e.get('playerId',0)); active[tid].add(player)
        p0=pos(e,0); p1=pos(e,1)
        s['actions']+=1
        if e.get('eventName')=='Shot':
            s['shots']+=1
            if p0 and p0[0]>=80: s['deep_shots']+=1
        if e.get('eventName')=='Pass':
            s['passes']+=1
            if successful(e):
                s['passes_ok']+=1; pass_players[tid][player]+=1
                if p0 and p1:
                    dx=p1[0]-p0[0]
                    if dx>=15 and p1[0]>=60: s['progressive_passes']+=1
                    if dx>=30: s['state_jumps']+=1
                    if p1[0]>=80 and p0[0]<80:
                        s['deep_entries']+=1; deep_players[tid].add(player)
        elif e.get('eventName')=='Others on the ball' and 'Acceleration' in str(e.get('subEventName','')):
            if p0 and p1 and p1[0]-p0[0]>=20:
                s['state_jumps']+=1
                if p1[0]>=80 and p0[0]<80:
                    s['deep_entries']+=1; deep_players[tid].add(player)
        elif p0 and p1 and p1[0]>=80 and p0[0]<80:
            # Non-pass progression into the deep zone, kept generic.
            s['deep_entries']+=1; deep_players[tid].add(player)
    out={}
    for tid in [str(home_id),str(away_id)]:
        s=stats[tid]; actions=max(1.0,s['actions']); passes=max(1.0,s['passes'])
        out[tid]={
            'pass_entropy':entropy_norm(pass_players[tid]),
            'pass_success':s['passes_ok']/passes,
            'progression_rate':100*s['progressive_passes']/actions,
            'deep_access_rate':100*s['deep_entries']/actions,
            'state_jump_rate':100*s['state_jumps']/actions,
            'shot_rate':100*s['shots']/actions,
            'deep_shot_rate':100*s['deep_shots']/actions,
            'deep_route_breadth':len(deep_players[tid])/max(1,len(active[tid])),
        }
    # Defensive suppression is defined relationally from opponent production.
    out[str(home_id)]['opp_deep_access_rate']=out[str(away_id)]['deep_access_rate']
    out[str(home_id)]['opp_shot_rate']=out[str(away_id)]['shot_rate']
    out[str(away_id)]['opp_deep_access_rate']=out[str(home_id)]['deep_access_rate']
    out[str(away_id)]['opp_shot_rate']=out[str(home_id)]['shot_rate']
    return out

def match_sides(m):
    td=m.get('teamsData',{})
    home=away=None
    for tid,v in td.items():
        if v.get('side')=='home': home=int(tid)
        elif v.get('side')=='away': away=int(tid)
    if home is None or away is None: raise RuntimeError(f'missing sides {m.get("wyId") or m.get("matchId") or m.get("label")}')
    return home,away

def label_teams(label):
    # Label is 'Home - Away, score'. Team names may contain hyphens, so split on spaced separator.
    pair=str(label).rsplit(',',1)[0]
    h,a=pair.split(' - ',1)
    return h.strip(),a.strip()

def load_fd():
    r=requests.get(FD_URL,timeout=90,headers=UA); r.raise_for_status()
    df=pd.read_csv(io.StringIO(r.content.decode('utf-8-sig',errors='replace')),on_bad_lines='skip')
    # 2017/18 provides bookmaker average (BbAv*) and Pinnacle closing (PSC*) columns.
    market_cols=None
    for cols in [('BbAvH','BbAvD','BbAvA'),('AvgH','AvgD','AvgA'),('B365H','B365D','B365A')]:
        if all(c in df.columns for c in cols): market_cols=cols; break
    if market_cols is None: raise RuntimeError('No usable 1X2 market columns')
    df=df.dropna(subset=['Date','HomeTeam','AwayTeam','FTR',*market_cols]).copy()
    df['date']=pd.to_datetime(df.Date,dayfirst=True,utc=True,errors='coerce')
    df['home_key']=df.HomeTeam.map(canon); df['away_key']=df.AwayTeam.map(canon)
    df['market_cols']='|'.join(market_cols)
    return df,market_cols

def norm_odds(vals):
    q=1/np.asarray(vals,dtype=float); return q/q.sum()

def mean_profile(hist):
    if not hist: return None
    keys=hist[0].keys()
    return {k:float(np.mean([r[k] for r in hist])) for k in keys}

def build_rows(matches, events):
    ev_by_match=defaultdict(list)
    for e in events: ev_by_match[int(e['matchId'])].append(e)
    england=[]
    for m in matches:
        mid=int(m.get('wyId',m.get('matchId')))
        if mid in ev_by_match: england.append(m)
    england.sort(key=lambda m:str(m.get('dateutc',m.get('date',''))))
    fd,market_cols=load_fd(); histories=defaultdict(lambda:deque(maxlen=8)); rows=[]; unmatched=[]
    event_feature_cache={}
    for m in england:
        mid=int(m.get('wyId',m.get('matchId'))); hid,aid=match_sides(m); hn,an=label_teams(m['label'])
        hk,ak=canon(hn),canon(an)
        dt=pd.to_datetime(m.get('dateutc',m.get('date')),utc=True,errors='coerce')
        cand=fd[(fd.home_key==hk)&(fd.away_key==ak)].copy()
        if cand.empty:
            unmatched.append((mid,hk,ak,'pair')); continue
        cand['dd']=(cand.date-dt).abs().dt.total_seconds(); fm=cand.sort_values('dd').iloc[0]
        if float(fm.dd)>3*86400:
            unmatched.append((mid,hk,ak,'date')); continue
        hp=mean_profile(histories[hid]); ap=mean_profile(histories[aid])
        if hp is not None and ap is not None and len(histories[hid])>=5 and len(histories[aid])>=5:
            odds=[fm[c] for c in market_cols]; mp=norm_odds(odds)
            feats={}
            for k in hp:
                feats[k+'_diff']=hp[k]-ap[k]
            rows.append({'mid':mid,'date':dt,'home':fm.HomeTeam,'away':fm.AwayTeam,
                         'y':{'H':0,'D':1,'A':2}[fm.FTR],
                         'mH':mp[0],'mD':mp[1],'mA':mp[2],**feats})
        summary=summarize_match_events(ev_by_match[mid],hid,aid)
        event_feature_cache[mid]=summary
        histories[hid].append(summary[str(hid)]); histories[aid].append(summary[str(aid)])
    return pd.DataFrame(rows),unmatched,market_cols

FEATURES=[
 'pass_entropy_diff','pass_success_diff','progression_rate_diff','deep_access_rate_diff',
 'state_jump_rate_diff','shot_rate_diff','deep_shot_rate_diff','deep_route_breadth_diff',
 'opp_deep_access_rate_diff','opp_shot_rate_diff'
]
GROUPS={
 'structure':['pass_entropy_diff','pass_success_diff','deep_route_breadth_diff'],
 'access':['progression_rate_diff','deep_access_rate_diff','deep_shot_rate_diff'],
 'state_jump':['state_jump_rate_diff'],
 'suppression':['opp_deep_access_rate_diff','opp_shot_rate_diff'],
 'all_event_features':FEATURES,
}

def brier(p,y):
    t=np.zeros(3); t[int(y)]=1; return float(np.sum((np.asarray(p)-t)**2))

def ll(p,y): return -math.log(max(1e-12,float(p[int(y)])))

def metrics(p,y):
    return {'brier':float(np.mean([brier(a,b) for a,b in zip(p,y)])),
            'logloss':float(np.mean([ll(a,b) for a,b in zip(p,y)]))}

def predict(train,test,fs):
    cols=['mH','mD','mA']+fs
    model=make_pipeline(StandardScaler(),LogisticRegression(C=0.20,max_iter=3000))
    model.fit(train[cols],train.y)
    p=model.predict_proba(test[cols]); out=np.zeros((len(test),3))
    for j,c in enumerate(model[-1].classes_): out[:,int(c)]=p[:,j]
    return out

def main():
    matches,events=load_sources(); rows,unmatched,market_cols=build_rows(matches,events)
    if len(rows)<200: raise RuntimeError(f'too few joined rows {len(rows)}; unmatched={unmatched[:10]}')
    rows=rows.sort_values('date').reset_index(drop=True)
    # Non-overlapping chronological windows after warm-up. Model refits using only past target outcomes.
    cut1=int(len(rows)*0.45); bounds=[cut1,int(len(rows)*0.65),int(len(rows)*0.82),len(rows)]
    reports=[]
    for wi in range(3):
        tr=rows.iloc[:bounds[wi]]; te=rows.iloc[bounds[wi]:bounds[wi+1]]
        y=te.y.to_numpy(int); market=te[['mH','mD','mA']].to_numpy(float); mm=metrics(market,y)
        variants={}
        for name,fs in GROUPS.items():
            p=predict(tr,te,fs); vm=metrics(p,y)
            variants[name]={**vm,'brier_delta_vs_market':vm['brier']-mm['brier'],
                            'logloss_delta_vs_market':vm['logloss']-mm['logloss']}
        reports.append({'window':wi+1,'n':len(te),'start':str(te.date.min()),'end':str(te.date.max()),'market':mm,'variants':variants})
    acceptance={}
    for name in GROUPS:
        ds=[r['variants'][name] for r in reports]
        acceptance[name]={
            'windows_better_both':sum(d['brier_delta_vs_market']<0 and d['logloss_delta_vs_market']<0 for d in ds),
            'mean_brier_delta':float(np.mean([d['brier_delta_vs_market'] for d in ds])),
            'mean_logloss_delta':float(np.mean([d['logloss_delta_vs_market'] for d in ds])),
        }
        acceptance[name]['accepted']=(acceptance[name]['windows_better_both']>=2 and acceptance[name]['mean_brier_delta']<0 and acceptance[name]['mean_logloss_delta']<0)
    summary={
      'mode':'Wyscout event-derived leakage-safe residual experiment',
      'source':'Pappalardo et al. 2017/18 Wyscout public event dataset, English first division',
      'rows':int(len(rows)),'unmatched':len(unmatched),'market_columns':list(market_cols),
      'timing_rule':'target-match event data is never used in its own prediction; team profiles use only previous matches (last 8, minimum 5)',
      'feature_groups':GROUPS,'windows':reports,'acceptance':acceptance,
      'acceptance_rule':'accepted only if Brier and log loss both beat raw pre-match market in at least 2 of 3 non-overlapping chronological windows and mean deltas are negative',
      'note':'This tests event-derived causal structure, not tracking geometry. One-season evidence is exploratory even if accepted.'
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'wyscout_event_residual_summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    print(json.dumps(summary,indent=2))

if __name__=='__main__': main()
