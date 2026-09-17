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

SEASONS=["1920","2021","2122","2223","2324","2425"]
BASE_URL="https://www.football-data.co.uk/mmz4281/{season}/E0.csv"
OUT=Path("research/football/output")
PROXIES=["structure","control","access","adaptation","suppression","style_matchup"]


def fetch(code):
    r=requests.get(BASE_URL.format(season=code),timeout=60,headers={"User-Agent":"Mozilla/5.0 ADHOMS-Football-Research/0.9"})
    r.raise_for_status()
    df=pd.read_csv(io.StringIO(r.content.decode("utf-8-sig",errors="replace")),on_bad_lines="skip")
    need=["Date","HomeTeam","AwayTeam","FTHG","FTAG","FTR","HTHG","HTAG","HS","AS","HST","AST","HC","AC","AvgH","AvgD","AvgA"]
    df=df.dropna(subset=need).copy(); df["Date"]=pd.to_datetime(df["Date"],dayfirst=True,errors="coerce"); df["season_code"]=code
    return df.dropna(subset=["Date"]).sort_values("Date")


def norm_odds(vals):
    q=1/np.asarray(vals,dtype=float); return q/q.sum()

def brier(P,y):
    T=np.eye(3)[y]; return float(np.mean(np.sum((P-T)**2,axis=1)))

def logloss(P,y):
    return float(-np.mean(np.log(np.clip(P[np.arange(len(y)),y],1e-12,1))))


class Profile:
    def __init__(self,n=12):
        self.sf=defaultdict(lambda:deque(maxlen=n)); self.sa=defaultdict(lambda:deque(maxlen=n))
        self.sotf=defaultdict(lambda:deque(maxlen=n)); self.sota=defaultdict(lambda:deque(maxlen=n))
        self.cf=defaultdict(lambda:deque(maxlen=n)); self.ca=defaultdict(lambda:deque(maxlen=n))
        self.share=defaultdict(lambda:deque(maxlen=n)); self.adapt=defaultdict(lambda:deque(maxlen=n))
    @staticmethod
    def av(x,fb): return sum(x)/len(x) if x else fb
    @staticmethod
    def sd(x,fb=.12): return float(np.std(x)) if len(x)>=3 else fb
    def team(self,t):
        sf=self.av(self.sf[t],12.); sa=self.av(self.sa[t],12.); sotf=self.av(self.sotf[t],4.); cf=self.av(self.cf[t],5.)
        shot_share=self.av(self.share[t],.5)
        return {
            "sf":sf,"sa":sa,
            "control":float(np.clip((shot_share-.5)*2,-1,1)),
            "access":float(np.clip(((sotf/max(sf,1.))-.33)*3+((cf/max(sf,1.))-.42),-1,1)),
            "suppression":float(np.clip((12.-sa)/8.,-1,1)),
            "structure":float(np.clip(1-self.sd(self.share[t])/.25,0,1)),
            "adaptation":float(np.clip(self.av(self.adapt[t],0.)/1.5,-1,1)),
        }
    def update(self,r):
        h,a=r.HomeTeam,r.AwayTeam; hs,as_=float(r.HS),float(r.AS); hst,ast=float(r.HST),float(r.AST); hc,ac=float(r.HC),float(r.AC)
        self.sf[h].append(hs); self.sa[h].append(as_); self.sotf[h].append(hst); self.sota[h].append(ast); self.cf[h].append(hc); self.ca[h].append(ac)
        self.sf[a].append(as_); self.sa[a].append(hs); self.sotf[a].append(ast); self.sota[a].append(hst); self.cf[a].append(ac); self.ca[a].append(hc)
        total=max(hs+as_,1.); self.share[h].append(hs/total); self.share[a].append(as_/total)
        h2=(float(r.FTHG)-float(r.HTHG))-(float(r.FTAG)-float(r.HTAG)); a2=-h2
        if float(r.HTHG)<=float(r.HTAG): self.adapt[h].append(h2)
        if float(r.HTAG)<=float(r.HTHG): self.adapt[a].append(a2)


def build_rows(df):
    prof=Profile(); rows=[]
    for _,r in df.sort_values("Date").iterrows():
        m=norm_odds([r.AvgH,r.AvgD,r.AvgA]); hp,ap=prof.team(r.HomeTeam),prof.team(r.AwayTeam)
        rec={
            "date":r.Date,"season":r.season_code,"home":r.HomeTeam,"away":r.AwayTeam,"y":{"H":0,"D":1,"A":2}[r.FTR],
            "mH":m[0],"mD":m[1],"mA":m[2],
            "market_lr_h":math.log(max(m[0],1e-9)/max(m[2],1e-9)),
            "market_lr_d":math.log(max(m[1],1e-9)/max(m[2],1e-9)),
            "structure":hp["structure"]-ap["structure"],"control":hp["control"]-ap["control"],
            "access":hp["access"]-ap["access"],"adaptation":hp["adaptation"]-ap["adaptation"],
            "suppression":hp["suppression"]-ap["suppression"],
            "style_matchup":float(np.clip(((hp['sf']+ap['sa'])-(ap['sf']+hp['sa']))/24.,-1,1)),
        }
        rows.append(rec); prof.update(r)
    return pd.DataFrame(rows)


def fit_predict(train,test,features):
    model=make_pipeline(StandardScaler(),LogisticRegression(max_iter=2000,C=.5,solver="lbfgs"))
    model.fit(train[features],train.y); return model.predict_proba(test[features])


def main():
    df=pd.concat([fetch(s) for s in SEASONS],ignore_index=True).sort_values("Date"); rows=build_rows(df)
    market_features=["market_lr_h","market_lr_d"]
    variants={"market_calibrated":market_features}
    for p in PROXIES: variants[p]=market_features+[p]
    variants["all_proxies"]=market_features+PROXIES

    season_reports=[]; variant_windows={name:[] for name in variants}
    for i,s in enumerate(SEASONS[1:],start=1):
        train=rows[rows.season.isin(SEASONS[:i])]; test=rows[rows.season==s]; y=test.y.to_numpy(int); M=test[["mH","mD","mA"]].to_numpy(float)
        raw_b,raw_l=brier(M,y),logloss(M,y)
        report={"season":s,"n":int(len(test)),"raw_market_brier":raw_b,"raw_market_logloss":raw_l,"variants":{}}
        for name,features in variants.items():
            P=fit_predict(train,test,features); vb,vl=brier(P,y),logloss(P,y)
            entry={"brier":vb,"logloss":vl,"brier_delta_vs_raw_market":vb-raw_b,"logloss_delta_vs_raw_market":vl-raw_l}
            report["variants"][name]=entry; variant_windows[name].append(entry)
        season_reports.append(report)

    acceptance={}
    for name,windows in variant_windows.items():
        wins_b=sum(w["brier_delta_vs_raw_market"]<0 for w in windows); wins_l=sum(w["logloss_delta_vs_raw_market"]<0 for w in windows)
        mean_b=float(np.mean([w["brier_delta_vs_raw_market"] for w in windows])); mean_l=float(np.mean([w["logloss_delta_vs_raw_market"] for w in windows]))
        acceptance[name]={"windows_brier_better_than_raw_market":wins_b,"windows_logloss_better_than_raw_market":wins_l,"mean_brier_delta":mean_b,"mean_logloss_delta":mean_l,
                          "accepted":bool(wins_b>=2 and wins_l>=2 and mean_b<0 and mean_l<0)}

    summary={
        "method":"expanding-season multinomial logistic; raw market is the hard benchmark",
        "proxies":PROXIES,
        "seasons":season_reports,
        "acceptance":acceptance,
        "acceptance_rule":"A feature set is accepted only if it beats raw opening-market probabilities on Brier and log loss in at least 2 non-overlapping seasons AND has negative mean delta on both metrics.",
        "warning":"These are observable match-stat proxies, not the tracking-derived Structure/Access definitions from v0.6."
    }
    OUT.mkdir(parents=True,exist_ok=True); (OUT/"residual_proxy_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print(json.dumps(summary,indent=2))

if __name__=="__main__": main()
