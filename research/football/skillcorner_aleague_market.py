#!/usr/bin/env python3
from __future__ import annotations

import io, json, math, re, unicodedata
from collections import defaultdict
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

ROOT=Path('/tmp/skillcorner')
OUT=Path('research/football/output')
BETFAIR='https://betfair-datascientists.github.io/data/assets/A-League_2024-2025_Match_Odds.csv'
UA={'User-Agent':'Mozilla/5.0 ADHOMS-Football-Research/2.3'}

ALIASES={
 'melbournevictory':'melbournevictory','melbournev':'melbournevictory',
 'melbournecity':'melbournecity','melbournecityfc':'melbournecity',
 'aucklandfc':'aucklandfc','auckland':'aucklandfc',
 'centralcoastmariners':'centralcoastmariners','centralcoast':'centralcoastmariners',
 'wellingtonphoenix':'wellingtonphoenix','wellington':'wellingtonphoenix',
 'westernunited':'westernunited','westernunitedfc':'westernunited',
 'sydneyfc':'sydneyfc','sydney':'sydneyfc','westernsydneywanderers':'westernsydneywanderers',
 'wswanderers':'westernsydneywanderers','adelaideunited':'adelaideunited','adelaide':'adelaideunited',
 'brisbaneroar':'brisbaneroar','brisbane':'brisbaneroar','newcastlejets':'newcastlejets','newcastlejet':'newcastlejets',
 'perthglory':'perthglory','perth':'perthglory','macarthurfc':'macarthurfc','macarthur':'macarthurfc'
}

def canon(x):
    s=unicodedata.normalize('NFKD',str(x)).encode('ascii','ignore').decode().lower()
    s=re.sub(r'[^a-z0-9]','',s)
    return ALIASES.get(s,s)

def safe_mean(s):
    z=pd.to_numeric(s,errors='coerce').dropna(); return float(z.mean()) if len(z) else np.nan

def match_state(mid):
    p=ROOT/'data/matches'/str(mid)/f'{mid}_phases_of_play.csv'
    if not p.exists():return {}
    df=pd.read_csv(p,low_memory=False);out={}
    for tid,g in df.groupby('team_in_possession_id'):
        if pd.isna(tid):continue
        name=str(g.team_in_possession_shortname.dropna().iloc[0]) if g.team_in_possession_shortname.notna().any() else str(tid)
        out[canon(name)]={'ip_length':safe_mean(g.team_in_possession_length_start),
                          'oop_length':safe_mean(g.team_out_of_possession_length_start)}
    return out

def market_table():
    r=requests.get(BETFAIR,timeout=90,headers=UA);r.raise_for_status()
    df=pd.read_csv(io.StringIO(r.text))
    df=df[df.MARKET_TYPE.eq('MATCH_ODDS')].copy();df['date']=pd.to_datetime(df.EVENT_DATE,utc=True,errors='coerce').dt.date
    df['home_key']=df.HOME_TEAM.map(canon);df['away_key']=df.AWAY_TEAM.map(canon);df['runner_key']=df.RUNNER_NAME.map(canon)
    rows=[]
    for (eid,date,hk,ak,hn,an),g in df.groupby(['EVENT_ID','date','home_key','away_key','HOME_TEAM','AWAY_TEAM']):
        prices={};winner=None
        for _,r in g.iterrows():
            rk='D' if str(r.RUNNER_NAME)=='The Draw' else ('H' if r.runner_key==hk else ('A' if r.runner_key==ak else None))
            if rk is None:continue
            prices[rk]=float(r.BEST_BACK_KICK_OFF)
            if int(r.IS_WINNER)==1:winner=rk
        if set(prices)=={'H','D','A'} and winner:
            q=np.asarray([1/prices['H'],1/prices['D'],1/prices['A']],float);q=q/q.sum()
            rows.append({'date':date,'home_key':hk,'away_key':ak,'home':hn,'away':an,'y':{'H':0,'D':1,'A':2}[winner],
                         'mH':q[0],'mD':q[1],'mA':q[2], 'priceH':prices['H'],'priceD':prices['D'],'priceA':prices['A']})
    return pd.DataFrame(rows)

def brier3(p,y):
    vals=[]
    for pp,yy in zip(p,y):
        t=np.zeros(3);t[int(yy)]=1;vals.append(np.sum((pp-t)**2))
    return float(np.mean(vals))
def logloss3(p,y):return float(np.mean([-math.log(max(1e-12,float(pp[int(yy)]))) for pp,yy in zip(p,y)]))

def main():
    matches=json.loads((ROOT/'data/matches.json').read_text(encoding='utf-8'))
    matches=sorted(matches,key=lambda m:m['date_time']);market=market_table();hist=defaultdict(list);rows=[];diag=[]
    for m in matches:
        mid=int(m['id']);dt=pd.to_datetime(m['date_time'],utc=True);hk=canon((m.get('home_team') or {}).get('short_name'));ak=canon((m.get('away_team') or {}).get('short_name'))
        cand=market[(market.home_key==hk)&(market.away_key==ak)].copy()
        if not cand.empty:
            cand['dd']=cand.date.map(lambda d:abs((pd.Timestamp(d,tz='UTC')-dt.normalize()).days)); mm=cand.sort_values('dd').iloc[0]
            if int(mm.dd)<=1 and hist[hk] and hist[ak]:
                hp={k:float(np.mean([x[k] for x in hist[hk][-3:] if np.isfinite(x[k])])) for k in ['ip_length','oop_length']}
                ap={k:float(np.mean([x[k] for x in hist[ak][-3:] if np.isfinite(x[k])])) for k in ['ip_length','oop_length']}
                rows.append({'date':dt,'mid':mid,'home_key':hk,'away_key':ak,'y':int(mm.y),'mH':mm.mH,'mD':mm.mD,'mA':mm.mA,
                             'ip_length_diff':hp['ip_length']-ap['ip_length'],'oop_length_diff':hp['oop_length']-ap['oop_length'],
                             'compactness_diff':(hp['oop_length']-hp['ip_length'])-(ap['oop_length']-ap['ip_length'])})
        st=match_state(mid)
        for team,x in st.items():hist[team].append(x)
    d=pd.DataFrame(rows).sort_values('date').reset_index(drop=True)
    summary={'mode':'exploratory A-League pre-match Structure residual vs Betfair kickoff match-odds market',
             'tracked_matches':len(matches),'eligible_both_have_prior_tracking':int(len(d)),
             'timing_rule':'only earlier SkillCorner matches feed ip/oop length; target match phase/tracking excluded',
             'market':'normalized Betfair BEST_BACK_KICK_OFF prices; this is a kickoff/closing-like benchmark, not opening odds',
             'features':['ip_length_diff','oop_length_diff','compactness_diff']}
    if len(d)<10:
        summary['decision']='insufficient sample for even exploratory residual fit';summary['rows']=d.to_dict('records')
    else:
        # Small-sample discipline: first half is calibration only, second half chronological evaluation; strong L2 shrinkage.
        cut=max(6,len(d)//2);tr=d.iloc[:cut];te=d.iloc[cut:]
        y=te.y.to_numpy(int);marketp=te[['mH','mD','mA']].to_numpy(float)
        variants={}
        for name,fs in {'ip_length':['ip_length_diff'],'oop_length':['oop_length_diff'],'both_lengths':['ip_length_diff','oop_length_diff'],'compactness':['compactness_diff']}.items():
            cols=['mH','mD','mA']+fs
            model=make_pipeline(StandardScaler(),LogisticRegression(C=.05,max_iter=5000))
            try:
                model.fit(tr[cols],tr.y);raw=model.predict_proba(te[cols]);p=np.zeros((len(te),3))
                for j,c in enumerate(model[-1].classes_):p[:,int(c)]=raw[:,j]
                mb=brier3(marketp,y);ml=logloss3(marketp,y);vb=brier3(p,y);vl=logloss3(p,y)
                variants[name]={'n_train':len(tr),'n_test':len(te),'brier':vb,'market_brier':mb,'brier_delta':vb-mb,'logloss':vl,'market_logloss':ml,'logloss_delta':vl-ml}
            except Exception as e:variants[name]={'error':str(e)}
        summary['chronological_split']={'train':len(tr),'test':len(te)};summary['variants']=variants
        summary['decision']='exploratory only: sample is too small for an edge claim; retain a feature only if directionally better on both proper scores.'
    OUT.mkdir(parents=True,exist_ok=True);(OUT/'skillcorner_aleague_market.json').write_text(json.dumps(summary,indent=2,default=str),encoding='utf-8');print(json.dumps(summary,indent=2,default=str))
if __name__=='__main__':main()
