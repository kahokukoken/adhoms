#!/usr/bin/env python3
from __future__ import annotations
import io, json, math, re
from collections import defaultdict, deque
from pathlib import Path
import numpy as np
import pandas as pd
import requests
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

SEASONS=["2022-23","2023-24","2024-25"]
FD_CODES={"2022-23":"2223","2023-24":"2324","2024-25":"2425"}
FD_URL="https://www.football-data.co.uk/mmz4281/{code}/E0.csv"
FPL_BASE="https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data/{season}"
OUT=Path("research/football/output")
ALIASES={"manutd":"manunited","manchesterunited":"manunited","manchestercity":"mancity","nottinghamforest":"nottmforest","newcastleunited":"newcastle","tottenhamhotspur":"tottenham","wolverhamptonwanderers":"wolves","brightonandhovealbion":"brighton","westhamunited":"westham","leicestercity":"leicester","ipswichtown":"ipswich"}


def keyname(x):
    s=re.sub(r"[^a-z0-9]+","",str(x).lower()); return ALIASES.get(s,s)

def num(x,default=0.0):
    try:
        v=float(x); return v if math.isfinite(v) else default
    except (TypeError,ValueError): return default

def get_csv(url):
    r=requests.get(url,timeout=60,headers={"User-Agent":"Mozilla/5.0 ADHOMS-Football-Research/1.2"}); r.raise_for_status()
    return pd.read_csv(io.StringIO(r.content.decode("utf-8-sig",errors="replace")),on_bad_lines="skip")

def norm3(a,b,c):
    q=1/np.array([float(a),float(b),float(c)]); return q/q.sum()
def brier(P,y): return float(np.mean(np.sum((P-np.eye(3)[y])**2,axis=1)))
def logloss(P,y): return float(-np.mean(np.log(np.clip(P[np.arange(len(y)),y],1e-12,1))))


class PlayerHistory:
    def __init__(self,n=8): self.rows=defaultdict(lambda:deque(maxlen=n))
    def profile(self,pid):
        rs=self.rows.get(pid,())
        if not rs:return {"xgi90":0.,"threat90":0.,"starts":0.}
        mins=sum(r["minutes"] for r in rs); scale=90./max(mins,90.)
        return {"xgi90":sum(r["xgi"] for r in rs)*scale,"threat90":sum(r["threat"] for r in rs)*scale,"starts":sum(r["starts"] for r in rs)}
    def update(self,pid,row): self.rows[pid].append(row)


def build_season(season):
    fd=get_csv(FD_URL.format(code=FD_CODES[season])); fd["Date"]=pd.to_datetime(fd["Date"],dayfirst=True,errors="coerce")
    fd=fd.dropna(subset=["Date","HomeTeam","AwayTeam","FTR","AvgH","AvgD","AvgA"])
    market={(str(r.Date.date()),keyname(r.HomeTeam),keyname(r.AwayTeam)):(r.FTR,norm3(r.AvgH,r.AvgD,r.AvgA)) for _,r in fd.iterrows()}

    teams=get_csv(FPL_BASE.format(season=season)+"/teams.csv")
    id_to_name={int(r.id):keyname(r.name) for _,r in teams.iterrows()}
    def resolve_team(v):
        try:
            f=float(v)
            if math.isfinite(f) and f.is_integer() and int(f) in id_to_name:return id_to_name[int(f)]
        except (TypeError,ValueError): pass
        return keyname(v)

    gw=get_csv(FPL_BASE.format(season=season)+"/gws/merged_gw.csv")
    required=["fixture","element","team","was_home","kickoff_time","minutes","starts"]
    miss=[c for c in required if c not in gw.columns]
    if miss: raise RuntimeError(f"{season}: missing FPL columns {miss}")
    gw["kickoff_time"]=pd.to_datetime(gw["kickoff_time"],utc=True,errors="coerce")
    gw=gw.dropna(subset=["kickoff_time"]).sort_values(["kickoff_time","fixture"])

    hist=PlayerHistory(); rows=[]; unmatched=0
    for fixture,g in gw.groupby("fixture",sort=False):
        kickoff=g.kickoff_time.iloc[0]; home_rows=g[g.was_home==True]; away_rows=g[g.was_home==False]
        if home_rows.empty or away_rows.empty:continue
        hname=resolve_team(home_rows.team.iloc[0]); aname=resolve_team(away_rows.team.iloc[0])
        mk=(str(kickoff.date()),hname,aname)
        if mk not in market:
            unmatched+=1
            continue
        result,m=market[mk]
        def lineup(side):
            starters=side[pd.to_numeric(side.starts,errors="coerce").fillna(0)>0]
            profs=[hist.profile(int(r.element)) for _,r in starters.iterrows()]
            x=np.array([p["xgi90"] for p in profs]); th=np.array([p["threat90"] for p in profs])
            total=float(x.sum()) if len(x) else 0.; peak=float(x.max()) if len(x) else 0.
            return {"attack":total,"peak":peak,"disruption":peak/(total+.1) if total else 0.,"continuity":float(np.mean([min(1.,p["starts"]/5.) for p in profs])) if profs else 0.,"threat":float(th.sum()) if len(th) else 0.,"n":len(profs)}
        h,a=lineup(home_rows),lineup(away_rows)
        rows.append({"season":season,"date":str(kickoff.date()),"home":hname,"away":aname,"y":{"H":0,"D":1,"A":2}[result],"mH":m[0],"mD":m[1],"mA":m[2],"market_lr_h":math.log(m[0]/m[2]),"market_lr_d":math.log(m[1]/m[2]),"lineup_attack_diff":h["attack"]-a["attack"],"individual_peak_diff":h["peak"]-a["peak"],"disruption_diff":h["disruption"]-a["disruption"],"continuity_diff":h["continuity"]-a["continuity"],"lineup_threat_diff":h["threat"]-a["threat"],"home_known_starters":h["n"],"away_known_starters":a["n"]})
        # Current performance enters history only after the prediction row exists.
        for _,r in g.iterrows():
            hist.update(int(r.element),{"minutes":num(r.get("minutes")),"xgi":num(r.get("expected_goals"))+num(r.get("expected_assists")),"threat":num(r.get("threat")),"starts":num(r.get("starts"))})
    out=pd.DataFrame(rows); out.attrs["unmatched_fixtures"]=unmatched; return out


def fit_predict(train,test,features):
    model=make_pipeline(StandardScaler(),LogisticRegression(max_iter=2000,C=.35,solver="lbfgs")); model.fit(train[features],train.y); return model.predict_proba(test[features])


def main():
    frames=[build_season(s) for s in SEASONS]; rows=pd.concat(frames,ignore_index=True)
    market=["market_lr_h","market_lr_d"]; extras=["lineup_attack_diff","individual_peak_diff","disruption_diff","continuity_diff","lineup_threat_diff"]
    variants={"market_calibrated":market,**{e:market+[e] for e in extras},"all_lineup_features":market+extras}; reports=[]; windows={k:[] for k in variants}
    for i,s in enumerate(SEASONS[1:],start=1):
        train=rows[rows.season.isin(SEASONS[:i])]; test=rows[rows.season==s]; y=test.y.to_numpy(int); M=test[["mH","mD","mA"]].to_numpy(float); rb,rl=brier(M,y),logloss(M,y)
        rep={"season":s,"n":int(len(test)),"raw_market_brier":rb,"raw_market_logloss":rl,"variants":{}}
        for name,fs in variants.items():
            P=fit_predict(train,test,fs); vb,vl=brier(P,y),logloss(P,y); x={"brier":vb,"logloss":vl,"brier_delta_vs_raw_market":vb-rb,"logloss_delta_vs_raw_market":vl-rl}; rep["variants"][name]=x; windows[name].append(x)
        reports.append(rep)
    acceptance={}
    for name,ws in windows.items():
        wb=sum(x["brier_delta_vs_raw_market"]<0 for x in ws); wl=sum(x["logloss_delta_vs_raw_market"]<0 for x in ws); mb=float(np.mean([x["brier_delta_vs_raw_market"] for x in ws])); ml=float(np.mean([x["logloss_delta_vs_raw_market"] for x in ws]))
        acceptance[name]={"windows_brier_better_than_raw_market":wb,"windows_logloss_better_than_raw_market":wl,"mean_brier_delta":mb,"mean_logloss_delta":ml,"candidate":bool(wb==len(ws) and wl==len(ws) and mb<0 and ml<0)}
    summary={"mode":"post-lineup pre-kickoff research backtest","timing_rule":"current fixture contributes only starts; all player ability statistics come strictly from prior fixtures","train":"2022-23","evaluation":["2023-24","2024-25"],"matched_rows_by_season":{s:int(len(f)) for s,f in zip(SEASONS,frames)},"unmatched_fixtures_by_season":{s:int(f.attrs.get('unmatched_fixtures',0)) for s,f in zip(SEASONS,frames)},"features":extras,"seasons":reports,"acceptance":acceptance,"candidate_rule":"With only two evaluation seasons, candidate requires beating raw market on both Brier and log loss in both seasons; candidate is not production acceptance."}
    OUT.mkdir(parents=True,exist_ok=True); (OUT/"lineup_proxy_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8"); print(json.dumps(summary,indent=2))

if __name__=="__main__": main()
