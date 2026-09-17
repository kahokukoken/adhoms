#!/usr/bin/env python3
from __future__ import annotations

import io, json, math, re, unicodedata
from collections import defaultdict, deque
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

OUT=Path('research/football/output')
UA={'User-Agent':'Mozilla/5.0 ADHOMS-Football-Research/2.0'}
BASE='https://raw.githubusercontent.com/hudl/open-data/master/data'
MATCHES_URL=f'{BASE}/matches/9/281.json'  # Bundesliga 2023/24
FD_URL='https://www.football-data.co.uk/mmz4281/2324/D1.csv'

ALIASES={
 'bayernmunich':'bayernmunich','bayernmunchen':'bayernmunich','bayerleverkusen':'leverkusen',
 'borussiadortmund':'dortmund','rb leipzig':'leipzig','rbleipzig':'leipzig',
 'borussiamonchengladbach':'monchengladbach','borussiamgladbach':'monchengladbach','mgladbach':'monchengladbach',
 'eintrachtfrankfurt':'eintrachtfrankfurt','frankfurt':'eintrachtfrankfurt',
 'scfreiburg':'freiburg','vflwolfsburg':'wolfsburg','vfb stuttgart':'stuttgart','vfb stuttgart':'stuttgart',
 'vfb-stuttgart':'stuttgart','vfbbochum':'bochum','tsghoffenheim':'hoffenheim','1899hoffenheim':'hoffenheim',
 'fcaugsburg':'augsburg','werderbremen':'werderbremen','svwerderbremen':'werderbremen',
 'unionberlin':'unionberlin','fcunionberlin':'unionberlin','1fcunionberlin':'unionberlin',
 'fckoln':'cologne','1fckoln':'cologne','koln':'cologne','cologne':'cologne',
 'heidenheim':'heidenheim','1fcheidenheim':'heidenheim','darmstadt98':'darmstadt','svdarmstadt98':'darmstadt',
 'mainz05':'mainz','fsvmainz05':'mainz','1fsvmainz05':'mainz'
}

def canon(x):
    s=unicodedata.normalize('NFKD',str(x)).encode('ascii','ignore').decode().lower()
    s=re.sub(r'[^a-z0-9]','',s)
    return ALIASES.get(s,s)

def get_json(url,timeout=120):
    r=requests.get(url,timeout=timeout,headers=UA)
    if r.status_code==404: return None
    r.raise_for_status(); return r.json()

def get_csv(url):
    r=requests.get(url,timeout=120,headers=UA); r.raise_for_status()
    return pd.read_csv(io.StringIO(r.content.decode('utf-8-sig',errors='replace')),on_bad_lines='skip')

def norm_odds(vals):
    q=1/np.asarray(vals,dtype=float); return q/q.sum()

def euclid(a,b):
    return math.hypot(float(a[0])-float(b[0]),float(a[1])-float(b[1]))

def geometry_summary(events,frames,home_name,away_name):
    # StatsBomb coordinates are oriented in the acting team's attacking direction (toward x=120).
    frame_by_id={str(f.get('event_uuid')):f for f in (frames or [])}
    accum={home_name:defaultdict(list),away_name:defaultdict(list)}
    for e in events or []:
        eid=str(e.get('id','')); fr=frame_by_id.get(eid)
        loc=e.get('location'); team=(e.get('team') or {}).get('name')
        if fr is None or loc is None or team not in accum: continue
        ff=fr.get('freeze_frame') or []
        mates=[]; opp=[]
        for p in ff:
            ploc=p.get('location')
            if not ploc: continue
            (mates if p.get('teammate') else opp).append(ploc)
        if not opp: continue
        s=accum[team]; ball=loc
        nearest=min(euclid(ball,o) for o in opp)
        s['nearest_defender'].append(nearest)
        s['opp_10'].append(sum(euclid(ball,o)<=10 for o in opp))
        s['opp_20'].append(sum(euclid(ball,o)<=20 for o in opp))
        s['mate_20'].append(sum(euclid(ball,m)<=20 for m in mates))
        local_m=sum(euclid(ball,m)<=15 for m in mates)
        local_o=sum(euclid(ball,o)<=15 for o in opp)
        s['local_superiority'].append(local_m-local_o)
        # Defensive bodies in a forward corridor toward goal.
        bx,by=float(ball[0]),float(ball[1])
        corridor=sum((float(o[0])>bx) and abs(float(o[1])-by)<=12 for o in opp)
        s['forward_corridor_opp'].append(corridor)
        ahead_m=sum(float(m[0])>bx+5 for m in mates)
        s['forward_options'].append(ahead_m)
        # Visible teammate spread as a crude structure/width measure.
        if len(mates)>=2:
            xs=np.asarray([m[0] for m in mates],float); ys=np.asarray([m[1] for m in mates],float)
            s['mate_x_spread'].append(float(np.std(xs)))
            s['mate_y_spread'].append(float(np.std(ys)))
        # High-value access geometry only in attacking half/deep zone.
        if bx>=80:
            s['deep_nearest_defender'].append(nearest)
            s['deep_local_superiority'].append(local_m-local_o)
            s['deep_forward_corridor_opp'].append(corridor)
    out={}
    keys=['nearest_defender','opp_10','opp_20','mate_20','local_superiority','forward_corridor_opp',
          'forward_options','mate_x_spread','mate_y_spread','deep_nearest_defender',
          'deep_local_superiority','deep_forward_corridor_opp']
    for team in [home_name,away_name]:
        out[team]={k:(float(np.mean(accum[team][k])) if accum[team][k] else 0.0) for k in keys}
        out[team]['frame_count']=float(len(accum[team]['nearest_defender']))
        out[team]['deep_frame_count']=float(len(accum[team]['deep_nearest_defender']))
    return out

def mean_profile(hist):
    if not hist:return None
    keys=hist[0].keys()
    return {k:float(np.mean([x[k] for x in hist])) for k in keys}

def load_fd():
    df=get_csv(FD_URL)
    one=None
    for cols in [('AvgH','AvgD','AvgA'),('B365H','B365D','B365A')]:
        if all(c in df.columns for c in cols): one=cols; break
    totals=None
    for cols in [('Avg>2.5','Avg<2.5'),('B365>2.5','B365<2.5')]:
        if all(c in df.columns for c in cols): totals=cols; break
    if one is None: raise RuntimeError('No 1X2 market columns')
    df['date']=pd.to_datetime(df.Date,dayfirst=True,utc=True,errors='coerce')
    df['home_key']=df.HomeTeam.map(canon);df['away_key']=df.AwayTeam.map(canon)
    return df,one,totals

def build_rows():
    matches=get_json(MATCHES_URL)
    if not matches: raise RuntimeError('No StatsBomb Bundesliga matches')
    matches=sorted(matches,key=lambda m:(m.get('match_date',''),m.get('kick_off','')))
    fd,one_cols,total_cols=load_fd(); hist=defaultdict(lambda:deque(maxlen=6)); rows=[]; skipped360=0; unmatched=[]
    for m in matches:
        mid=int(m['match_id']); hn=m['home_team']['home_team_name']; an=m['away_team']['away_team_name']
        hk,ak=canon(hn),canon(an); dt=pd.to_datetime(m['match_date'],utc=True,errors='coerce')
        cand=fd[(fd.home_key==hk)&(fd.away_key==ak)].copy()
        if cand.empty:
            unmatched.append((mid,hn,an,'pair')); continue
        cand['dd']=(cand.date-dt).abs().dt.total_seconds(); fm=cand.sort_values('dd').iloc[0]
        if float(fm.dd)>2*86400:
            unmatched.append((mid,hn,an,'date')); continue
        hp,ap=mean_profile(hist[hk]),mean_profile(hist[ak])
        if hp is not None and ap is not None and len(hist[hk])>=4 and len(hist[ak])>=4:
            mp=norm_odds([fm[c] for c in one_cols]); feats={}
            for k in hp:
                feats[k+'_diff']=hp[k]-ap[k]
                feats[k+'_sum']=hp[k]+ap[k]
                feats[k+'_absdiff']=abs(hp[k]-ap[k])
            row={'mid':mid,'date':dt,'home':fm.HomeTeam,'away':fm.AwayTeam,'y1x2':{'H':0,'D':1,'A':2}[fm.FTR],
                 'mH':mp[0],'mD':mp[1],'mA':mp[2],**feats}
            if total_cols and pd.notna(fm.get('FTHG')) and pd.notna(fm.get('FTAG')) and all(pd.notna(fm[c]) for c in total_cols):
                tp=norm_odds([fm[c] for c in total_cols]); row.update({'yOver':int(float(fm.FTHG)+float(fm.FTAG)>2.5),'mOver':tp[0],'mUnder':tp[1]})
            rows.append(row)
        events=get_json(f'{BASE}/events/{mid}.json')
        frames=get_json(f'{BASE}/three-sixty/{mid}.json')
        if not frames:
            skipped360+=1; continue
        gs=geometry_summary(events,frames,hn,an)
        hist[hk].append(gs[hn]); hist[ak].append(gs[an])
    return pd.DataFrame(rows),{'skipped360':skipped360,'unmatched':unmatched,'one_cols':one_cols,'total_cols':total_cols,'matches':len(matches)}

G1={
 'pressure_geometry':['nearest_defender_diff','opp_10_diff','opp_20_diff'],
 'local_superiority':['local_superiority_diff','forward_options_diff','forward_corridor_opp_diff'],
 'deep_access_geometry':['deep_nearest_defender_diff','deep_local_superiority_diff','deep_forward_corridor_opp_diff'],
 'spatial_structure':['mate_x_spread_diff','mate_y_spread_diff'],
 'all_geometry':['nearest_defender_diff','opp_10_diff','opp_20_diff','local_superiority_diff','forward_options_diff','forward_corridor_opp_diff',
                 'deep_nearest_defender_diff','deep_local_superiority_diff','deep_forward_corridor_opp_diff','mate_x_spread_diff','mate_y_spread_diff']
}
GT={
 'pressure_open':['opp_10_sum','opp_20_sum','nearest_defender_sum'],
 'local_open':['local_superiority_absdiff','forward_options_sum','forward_corridor_opp_sum'],
 'deep_open':['deep_nearest_defender_sum','deep_local_superiority_absdiff','deep_forward_corridor_opp_sum'],
 'spatial_open':['mate_x_spread_sum','mate_y_spread_sum'],
 'all_geometry_totals':['opp_10_sum','opp_20_sum','nearest_defender_sum','forward_options_sum','forward_corridor_opp_sum',
                        'deep_nearest_defender_sum','deep_forward_corridor_opp_sum','mate_x_spread_sum','mate_y_spread_sum']
}

def metrics3(p,y):
    out=[]
    for pp,yy in zip(p,y):
        t=np.zeros(3);t[int(yy)]=1;out.append(np.sum((pp-t)**2))
    b=float(np.mean(out)); ll=float(np.mean([-math.log(max(1e-12,float(pp[int(yy)]))) for pp,yy in zip(p,y)]))
    return {'brier':b,'logloss':ll}

def metrics2(p,y):
    po=np.clip(np.asarray(p)[:,0],1e-12,1-1e-12); y=np.asarray(y,int)
    return {'brier':float(np.mean(2*(po-y)**2)),
            'logloss':float(np.mean(-(y*np.log(po)+(1-y)*np.log(1-po))))}

def pred3(tr,te,fs):
    cols=['mH','mD','mA']+fs; model=make_pipeline(StandardScaler(),LogisticRegression(C=.15,max_iter=3000))
    model.fit(tr[cols],tr.y1x2); p=model.predict_proba(te[cols]); out=np.zeros((len(te),3))
    for j,c in enumerate(model[-1].classes_):out[:,int(c)]=p[:,j]
    return out

def pred2(tr,te,fs):
    cols=['mOver','mUnder']+fs; model=make_pipeline(StandardScaler(),LogisticRegression(C=.15,max_iter=3000))
    model.fit(tr[cols],tr.yOver); po=model.predict_proba(te[cols])[:,list(model[-1].classes_).index(1)]
    return np.column_stack([po,1-po])

def evaluate(rows,groups,target):
    rows=rows.sort_values('date').reset_index(drop=True)
    # expanding chronological windows, enough warm-up for market+geometry residual fit
    b=[int(len(rows)*.45),int(len(rows)*.65),int(len(rows)*.82),len(rows)]; reps=[]
    for i in range(3):
        tr=rows.iloc[:b[i]]; te=rows.iloc[b[i]:b[i+1]]
        if target=='1x2':
            y=te.y1x2.to_numpy(int); market=te[['mH','mD','mA']].to_numpy(float); mm=metrics3(market,y); fn=pred3; met=metrics3
        else:
            y=te.yOver.to_numpy(int); market=te[['mOver','mUnder']].to_numpy(float); mm=metrics2(market,y); fn=pred2; met=metrics2
        variants={}
        for name,fs in groups.items():
            p=fn(tr,te,fs); vm=met(p,y); variants[name]={**vm,'brier_delta_vs_market':vm['brier']-mm['brier'],'logloss_delta_vs_market':vm['logloss']-mm['logloss']}
        reps.append({'window':i+1,'n':int(len(te)),'market':mm,'variants':variants})
    acc={}
    for name in groups:
        ds=[r['variants'][name] for r in reps]; wb=sum(d['brier_delta_vs_market']<0 and d['logloss_delta_vs_market']<0 for d in ds)
        mb=float(np.mean([d['brier_delta_vs_market'] for d in ds])); ml=float(np.mean([d['logloss_delta_vs_market'] for d in ds]))
        acc[name]={'windows_better_both':wb,'mean_brier_delta':mb,'mean_logloss_delta':ml,'accepted':bool(wb>=2 and mb<0 and ml<0)}
    return {'windows':reps,'acceptance':acc}

def main():
    rows,diag=build_rows()
    if len(rows)<120: raise RuntimeError(f'too few leakage-safe rows={len(rows)} diagnostics={diag}')
    result={'mode':'StatsBomb 360 geometry leakage-safe market residual experiment','diagnostics':diag,'rows_1x2':int(len(rows)),
            'timing_rule':'target-match 360 data never used; team geometry profiles use prior 6 matches, minimum 4',
            'geometry_groups_1x2':G1,'one_x_two':evaluate(rows,G1,'1x2')}
    trows=rows.dropna(subset=['mOver','mUnder','yOver']).copy() if 'mOver' in rows.columns else pd.DataFrame()
    if len(trows)>=120:
        result['rows_totals']=int(len(trows)); result['geometry_groups_totals']=GT; result['totals']=evaluate(trows,GT,'totals')
    else: result['totals_note']=f'insufficient O/U rows {len(trows)}'
    result['gate']='Any accepted geometry group advances to multi-season/competition validation; otherwise 360 event snapshots are insufficient and full tracking is next.'
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'statsbomb360_residual_summary.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result,indent=2))

if __name__=='__main__':main()
