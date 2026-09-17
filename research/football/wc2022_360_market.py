#!/usr/bin/env python3
from __future__ import annotations

import ast, io, json, math, re, unicodedata
from collections import defaultdict, deque
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

OUT=Path('research/football/output')
UA={'User-Agent':'Mozilla/5.0 ADHOMS-Football-Research/2.4'}
SB='https://raw.githubusercontent.com/hudl/open-data/master/data'
MATCHES=f'{SB}/matches/43/106.json'  # FIFA World Cup 2022
ODDS='https://raw.githubusercontent.com/qnicondavid/world-cup-predictor/main/data/wc2022_odds.csv'

ALIASES={'korearepublic':'southkorea','southkorea':'southkorea','iriran':'iran','iran':'iran','usa':'unitedstates','unitedstates':'unitedstates'}
def canon(x):
    s=unicodedata.normalize('NFKD',str(x)).encode('ascii','ignore').decode().lower();s=re.sub(r'[^a-z0-9]','',s);return ALIASES.get(s,s)
def get_json(url):
    r=requests.get(url,timeout=120,headers=UA);r.raise_for_status();return r.json()
def get_csv(url):
    r=requests.get(url,timeout=120,headers=UA);r.raise_for_status();return pd.read_csv(io.StringIO(r.text))
def norm_odds(vals):
    q=1/np.asarray(vals,float);return q/q.sum()
def dist(a,b):return math.hypot(float(a[0])-float(b[0]),float(a[1])-float(b[1]))

def profile(events,frames):
    emap={str(e.get('id')):e for e in events};acc=defaultdict(lambda:defaultdict(list))
    for fr in frames:
        e=emap.get(str(fr.get('event_uuid')))
        if not e:continue
        team=canon((e.get('team') or {}).get('name'));loc=e.get('location');ff=fr.get('freeze_frame') or []
        if not team or not loc:continue
        mates=[p['location'] for p in ff if p.get('teammate') and p.get('location')]
        opp=[p['location'] for p in ff if not p.get('teammate') and p.get('location')]
        if len(opp)<2:continue
        a=acc[team];near=min(dist(loc,o) for o in opp);a['nearest_opp'].append(near)
        a['opp10'].append(sum(dist(loc,o)<=10 for o in opp));a['opp20'].append(sum(dist(loc,o)<=20 for o in opp))
        a['mate10'].append(sum(dist(loc,m)<=10 for m in mates));a['local_superiority'].append(sum(dist(loc,m)<=15 for m in mates)-sum(dist(loc,o)<=15 for o in opp))
        bx,by=float(loc[0]),float(loc[1]);a['forward_corridor'].append(sum(float(o[0])>bx and abs(float(o[1])-by)<=12 for o in opp))
        a['forward_options'].append(sum(float(m[0])>bx+5 for m in mates))
        if len(mates)>=2:
            a['mate_x_spread'].append(float(np.std([m[0] for m in mates])));a['mate_y_spread'].append(float(np.std([m[1] for m in mates])))
        if bx>=80:
            a['deep_nearest_opp'].append(near);a['deep_corridor'].append(sum(float(o[0])>bx and abs(float(o[1])-by)<=12 for o in opp))
    keys=['nearest_opp','opp10','opp20','mate10','local_superiority','forward_corridor','forward_options','mate_x_spread','mate_y_spread','deep_nearest_opp','deep_corridor']
    out={}
    for t,d in acc.items():out[t]={k:(float(np.mean(d[k])) if d[k] else 0.0) for k in keys}|{'frames':float(len(d['nearest_opp']))}
    return out

def mean_profile(hist):
    if not hist:return None
    keys=hist[0].keys();return {k:float(np.mean([x[k] for x in hist])) for k in keys}

def odds_table():
    d=get_csv(ODDS);rows=[]
    for _,r in d.iterrows():
        try:arr=ast.literal_eval(r['1x2_market'])
        except Exception:continue
        vals=[]
        for q in arr:
            try:vals.append([float(q['1']),float(q['X']),float(q['2'])])
            except Exception:pass
        if not vals:continue
        av=np.mean(np.asarray(vals,float),axis=0);p=norm_odds(av)
        hg=float(r.home_score);ag=float(r.away_score);y=0 if hg>ag else (2 if ag>hg else 1)
        rows.append({'date':pd.to_datetime(r.match_date,utc=True).date(),'home_key':canon(r.home_team),'away_key':canon(r.away_team),'y':y,
                     'mH':p[0],'mD':p[1],'mA':p[2],'bookmakers':len(vals)})
    return pd.DataFrame(rows)

def build_rows():
    matches=sorted(get_json(MATCHES),key=lambda m:(m['match_date'],m.get('kick_off','')));od=odds_table();hist=defaultdict(lambda:deque(maxlen=3));rows=[];diag=[]
    for m in matches:
        mid=int(m['match_id']);hk=canon(m['home_team']['home_team_name']);ak=canon(m['away_team']['away_team_name']);dt=pd.to_datetime(m['match_date']).date()
        cand=od[((od.home_key==hk)&(od.away_key==ak))|((od.home_key==ak)&(od.away_key==hk))].copy()
        hp,ap=mean_profile(hist[hk]),mean_profile(hist[ak])
        if hp is not None and ap is not None and not cand.empty:
            cand['dd']=cand.date.map(lambda d:abs((d-dt).days));o=cand.sort_values('dd').iloc[0]
            if int(o.dd)<=1:
                # Orient market probs to StatsBomb home/away if the odds row is reversed.
                if o.home_key==hk:mp=[o.mH,o.mD,o.mA]
                else:mp=[o.mA,o.mD,o.mH]
                feat={}
                for k in hp:
                    feat[k+'_diff']=hp[k]-ap[k];feat[k+'_sum']=hp[k]+ap[k];feat[k+'_absdiff']=abs(hp[k]-ap[k])
                # Outcome from StatsBomb score in regulation/official final score; for knockout draws after 90 are represented by match result fields imperfectly,
                # so use odds-row result orientation only when row direction known.
                y=int(o.y if o.home_key==hk else (2 if o.y==0 else (0 if o.y==2 else 1)))
                rows.append({'date':str(dt),'mid':mid,'home':hk,'away':ak,'y':y,'mH':mp[0],'mD':mp[1],'mA':mp[2],**feat})
        try:
            ev=get_json(f'{SB}/events/{mid}.json');fr=get_json(f'{SB}/three-sixty/{mid}.json');pr=profile(ev,fr)
            if hk in pr:hist[hk].append(pr[hk])
            if ak in pr:hist[ak].append(pr[ak])
        except Exception as e:diag.append({'mid':mid,'error':str(e)})
    return pd.DataFrame(rows),{'matches':len(matches),'odds_rows':len(od),'errors':diag}

GROUPS={
 'pressure':['nearest_opp_diff','opp10_diff','opp20_diff'],
 'local_superiority':['local_superiority_diff','forward_options_diff','forward_corridor_diff'],
 'deep_access':['deep_nearest_opp_diff','deep_corridor_diff'],
 'spatial_structure':['mate_x_spread_diff','mate_y_spread_diff'],
 'all_geometry':['nearest_opp_diff','opp10_diff','opp20_diff','local_superiority_diff','forward_options_diff','forward_corridor_diff','deep_nearest_opp_diff','deep_corridor_diff','mate_x_spread_diff','mate_y_spread_diff']
}
def metrics(p,y):
    b=[];ll=[]
    for pp,yy in zip(p,y):
        t=np.zeros(3);t[int(yy)]=1;b.append(np.sum((pp-t)**2));ll.append(-math.log(max(1e-12,float(pp[int(yy)]))))
    return {'brier':float(np.mean(b)),'logloss':float(np.mean(ll))}
def predict(tr,te,fs):
    cols=['mH','mD','mA']+fs;model=make_pipeline(StandardScaler(),LogisticRegression(C=.05,max_iter=5000));model.fit(tr[cols],tr.y);raw=model.predict_proba(te[cols]);p=np.zeros((len(te),3))
    for j,c in enumerate(model[-1].classes_):p[:,int(c)]=raw[:,j]
    return p

def main():
    d,diag=build_rows();d=d.sort_values('date').reset_index(drop=True)
    summary={'mode':'World Cup 2022 prior-match StatsBomb 360 geometry vs historical bookmaker market','diagnostics':diag,'eligible_rows':len(d),
             'timing_rule':'target-match events/360 excluded; profiles use up to 3 prior tournament matches only',
             'market_warning':'Historical OddsPortal-derived bookmaker snapshots; useful as a market benchmark but not proven executable timestamped closing prices.'}
    if len(d)<18:
        summary['decision']='insufficient sample';summary['rows']=d[['date','home','away']].to_dict('records')
    else:
        # First 45% training; remaining evaluation split into two chronological windows to require directional replication.
        c1=max(10,int(len(d)*.45));c2=c1+max(4,(len(d)-c1)//2);windows=[]
        for end0,end1 in [(c1,c2),(c2,len(d))]:
            tr=d.iloc[:end0];te=d.iloc[end0:end1];y=te.y.to_numpy(int);mp=te[['mH','mD','mA']].to_numpy(float);mm=metrics(mp,y);variants={}
            for name,fs in GROUPS.items():
                try:
                    p=predict(tr,te,fs);vm=metrics(p,y);variants[name]={**vm,'brier_delta':vm['brier']-mm['brier'],'logloss_delta':vm['logloss']-mm['logloss']}
                except Exception as e:variants[name]={'error':str(e)}
            windows.append({'train_n':len(tr),'test_n':len(te),'market':mm,'variants':variants})
        acc={}
        for name in GROUPS:
            ds=[w['variants'][name] for w in windows if 'brier_delta' in w['variants'][name]]
            if len(ds)==2:
                acc[name]={'both_windows_better':all(x['brier_delta']<0 and x['logloss_delta']<0 for x in ds),
                           'mean_brier_delta':float(np.mean([x['brier_delta'] for x in ds])),'mean_logloss_delta':float(np.mean([x['logloss_delta'] for x in ds]))}
        summary['windows']=windows;summary['acceptance']=acc
        summary['decision']='candidate only if both proper scores improve in both chronological windows; one tournament still requires external replication.'
    OUT.mkdir(parents=True,exist_ok=True);(OUT/'wc2022_360_market.json').write_text(json.dumps(summary,indent=2),encoding='utf-8');print(json.dumps(summary,indent=2))
if __name__=='__main__':main()
