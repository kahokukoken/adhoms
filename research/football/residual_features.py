#!/usr/bin/env python3
from __future__ import annotations

import io
import json
import math
from collections import defaultdict, deque
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

SEASONS = ["1920", "2021", "2122", "2223", "2324", "2425"]
BASE_URL = "https://www.football-data.co.uk/mmz4281/{season}/E0.csv"
OUT = Path("research/football/output")


def fetch(code):
    r = requests.get(BASE_URL.format(season=code), timeout=60,
                     headers={"User-Agent": "Mozilla/5.0 ADHOMS-Football-Research/0.8"})
    r.raise_for_status()
    df = pd.read_csv(io.StringIO(r.content.decode("utf-8-sig", errors="replace")), on_bad_lines="skip")
    need = ["Date","HomeTeam","AwayTeam","FTHG","FTAG","FTR","HTHG","HTAG","HS","AS","HST","AST","HC","AC","AvgH","AvgD","AvgA","AvgCH","AvgCD","AvgCA"]
    df = df.dropna(subset=[c for c in need if c in df.columns]).copy()
    df["Date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")
    df["season_code"] = code
    return df.dropna(subset=["Date"]).sort_values("Date")


def norm_odds(vals):
    q = 1/np.asarray(vals, dtype=float)
    return q/q.sum()


def brier(P,y):
    T=np.eye(3)[y]
    return float(np.mean(np.sum((P-T)**2,axis=1)))


def logloss(P,y):
    return float(-np.mean(np.log(np.clip(P[np.arange(len(y)),y],1e-12,1))))


class Profile:
    def __init__(self, n=12):
        self.n=n
        self.sf=defaultdict(lambda:deque(maxlen=n)); self.sa=defaultdict(lambda:deque(maxlen=n))
        self.sotf=defaultdict(lambda:deque(maxlen=n)); self.sota=defaultdict(lambda:deque(maxlen=n))
        self.cf=defaultdict(lambda:deque(maxlen=n)); self.ca=defaultdict(lambda:deque(maxlen=n))
        self.share=defaultdict(lambda:deque(maxlen=n))
        self.adapt=defaultdict(lambda:deque(maxlen=n))

    @staticmethod
    def av(x,fb): return sum(x)/len(x) if x else fb
    @staticmethod
    def sd(x,fb=0.12): return float(np.std(x)) if len(x)>=3 else fb

    def team(self,t):
        sf=self.av(self.sf[t],12.0); sa=self.av(self.sa[t],12.0)
        sotf=self.av(self.sotf[t],4.0); sota=self.av(self.sota[t],4.0)
        cf=self.av(self.cf[t],5.0); ca=self.av(self.ca[t],5.0)
        shot_share=self.av(self.share[t],0.5)
        # Observable proxies, deliberately bounded and interpretable.
        control=np.clip((shot_share-0.5)*2.0,-1,1)
        access=np.clip(((sotf/max(sf,1.0))-0.33)*3.0 + ((cf/max(sf,1.0))-0.42),-1,1)
        suppression=np.clip((12.0-sa)/8.0,-1,1)
        structure=np.clip(1.0-self.sd(self.share[t])/0.25,0,1)
        adaptation=np.clip(self.av(self.adapt[t],0.0)/1.5,-1,1)
        return dict(sf=sf,sa=sa,control=control,access=access,suppression=suppression,structure=structure,adaptation=adaptation)

    def update(self,r):
        h,a=r.HomeTeam,r.AwayTeam
        hs,as_=float(r.HS),float(r.AS); hst,ast=float(r.HST),float(r.AST); hc,ac=float(r.HC),float(r.AC)
        self.sf[h].append(hs); self.sa[h].append(as_); self.sotf[h].append(hst); self.sota[h].append(ast); self.cf[h].append(hc); self.ca[h].append(ac)
        self.sf[a].append(as_); self.sa[a].append(hs); self.sotf[a].append(ast); self.sota[a].append(hst); self.cf[a].append(ac); self.ca[a].append(hc)
        total=max(hs+as_,1.0); self.share[h].append(hs/total); self.share[a].append(as_/total)
        # Adaptation proxy: second-half goal difference, only when not leading at HT.
        h2=(float(r.FTHG)-float(r.HTHG))-(float(r.FTAG)-float(r.HTAG))
        a2=-h2
        if float(r.HTHG)<=float(r.HTAG): self.adapt[h].append(h2)
        if float(r.HTAG)<=float(r.HTHG): self.adapt[a].append(a2)


def build_rows(df):
    prof=Profile()
    rows=[]
    for _,r in df.sort_values("Date").iterrows():
        m=norm_odds([r.AvgH,r.AvgD,r.AvgA])
        hp,ap=prof.team(r.HomeTeam),prof.team(r.AwayTeam)
        # Market prior represented as log ratios; two dimensions are sufficient.
        market_lr_h=math.log(max(m[0],1e-9)/max(m[2],1e-9))
        market_lr_d=math.log(max(m[1],1e-9)/max(m[2],1e-9))
        style=((hp['sf'] + ap['sa']) - (ap['sf'] + hp['sa']))/24.0
        rows.append({
            "date":r.Date,"season":r.season_code,"home":r.HomeTeam,"away":r.AwayTeam,
            "y":{"H":0,"D":1,"A":2}[r.FTR],
            "mH":m[0],"mD":m[1],"mA":m[2],
            "market_lr_h":market_lr_h,"market_lr_d":market_lr_d,
            "structure":hp['structure']-ap['structure'],
            "control":hp['control']-ap['control'],
            "access":hp['access']-ap['access'],
            "adaptation":hp['adaptation']-ap['adaptation'],
            "suppression":hp['suppression']-ap['suppression'],
            "style_matchup":float(np.clip(style,-1,1)),
        })
        prof.update(r)
    return pd.DataFrame(rows)


def fit_predict(train,test,features):
    model=make_pipeline(StandardScaler(),LogisticRegression(max_iter=2000,C=0.5,solver='lbfgs'))
    model.fit(train[features],train.y)
    return model.predict_proba(test[features])


def main():
    df=pd.concat([fetch(s) for s in SEASONS],ignore_index=True).sort_values("Date")
    rows=build_rows(df)
    market_features=["market_lr_h","market_lr_d"]
    proxy_features=market_features+["structure","control","access","adaptation","suppression","style_matchup"]

    reports=[]
    preds=[]
    eval_seasons=SEASONS[1:]
    for i,s in enumerate(eval_seasons, start=1):
        train=rows[rows.season.isin(SEASONS[:i])]
        test=rows[rows.season==s].copy()
        y=test.y.to_numpy(int)
        M=test[["mH","mD","mA"]].to_numpy(float)
        pm=fit_predict(train,test,market_features)
        pf=fit_predict(train,test,proxy_features)
        report={
            "season":s,"n":int(len(test)),
            "raw_market_brier":brier(M,y),"market_calibrated_brier":brier(pm,y),"market_plus_proxies_brier":brier(pf,y),
            "raw_market_logloss":logloss(M,y),"market_calibrated_logloss":logloss(pm,y),"market_plus_proxies_logloss":logloss(pf,y),
        }
        report["proxy_brier_delta_vs_market_calibrated"]=report["market_plus_proxies_brier"]-report["market_calibrated_brier"]
        report["proxy_logloss_delta_vs_market_calibrated"]=report["market_plus_proxies_logloss"]-report["market_calibrated_logloss"]
        reports.append(report)
        for j,(_,r) in enumerate(test.iterrows()):
            preds.append({"date":str(r.date.date()),"season":s,"home":r.home,"away":r.away,"result":int(r.y),
                          "rawH":M[j,0],"rawD":M[j,1],"rawA":M[j,2],
                          "calH":pm[j,0],"calD":pm[j,1],"calA":pm[j,2],
                          "proxyH":pf[j,0],"proxyD":pf[j,1],"proxyA":pf[j,2]})

    accepted_brier=sum(r["proxy_brier_delta_vs_market_calibrated"]<0 for r in reports)
    accepted_log=sum(r["proxy_logloss_delta_vs_market_calibrated"]<0 for r in reports)
    summary={
        "method":"expanding-season multinomial logistic; market prior vs market+pre-match rolling ADHOMS observable proxies",
        "features":["structure_proxy","control_proxy","access_proxy","adaptation_proxy","suppression_proxy","style_matchup_proxy"],
        "seasons":reports,
        "windows_improved_brier":accepted_brier,
        "windows_improved_logloss":accepted_log,
        "acceptance_rule":"Do not promote proxies to production unless improvement repeats in at least 2 non-overlapping windows and is not driven only by calibration.",
        "accepted": bool(accepted_brier>=2 and accepted_log>=2),
        "warning":"These are observable match-stat proxies, not the tracking-derived Structure/Access definitions from v0.6."
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"residual_proxy_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    pd.DataFrame(preds).to_csv(OUT/"residual_proxy_predictions.csv",index=False)
    print(json.dumps(summary,indent=2))

if __name__=="__main__":
    main()
