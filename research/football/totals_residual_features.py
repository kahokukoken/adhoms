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
FEATURES=["pace","access","instability","suppression_failure","style_openness"]


def fetch(code):
    r=requests.get(BASE_URL.format(season=code),timeout=60,headers={"User-Agent":"Mozilla/5.0 ADHOMS-Football-Research/1.0"})
    r.raise_for_status()
    df=pd.read_csv(io.StringIO(r.content.decode("utf-8-sig",errors="replace")),on_bad_lines="skip")
    need=["Date","HomeTeam","AwayTeam","FTHG","FTAG","HS","AS","HST","AST","Avg>2.5","Avg<2.5"]
    df=df.dropna(subset=need).copy(); df["Date"]=pd.to_datetime(df["Date"],dayfirst=True,errors="coerce"); df["season_code"]=code
    return df.dropna(subset=["Date"]).sort_values("Date")


def norm_ou(over_odds, under_odds):
    q=np.array([1/float(over_odds),1/float(under_odds)],dtype=float); return q/q.sum()

def brier(P,y):
    T=np.eye(2)[y]; return float(np.mean(np.sum((P-T)**2,axis=1)))

def logloss(P,y):
    return float(-np.mean(np.log(np.clip(P[np.arange(len(y)),y],1e-12,1))))


class Profile:
    def __init__(self,n=12):
        self.sf=defaultdict(lambda:deque(maxlen=n)); self.sa=defaultdict(lambda:deque(maxlen=n))
        self.sotf=defaultdict(lambda:deque(maxlen=n)); self.sota=defaultdict(lambda:deque(maxlen=n))
        self.goals=defaultdict(lambda:deque(maxlen=n)); self.goal_against=defaultdict(lambda:deque(maxlen=n))
        self.shot_share=defaultdict(lambda:deque(maxlen=n))
    @staticmethod
    def av(x,fb): return sum(x)/len(x) if x else fb
    @staticmethod
    def sd(x,fb=.12): return float(np.std(x)) if len(x)>=3 else fb
    def team(self,t):
        sf=self.av(self.sf[t],12.); sa=self.av(self.sa[t],12.); sotf=self.av(self.sotf[t],4.); sota=self.av(self.sota[t],4.)
        gf=self.av(self.goals[t],1.35); ga=self.av(self.goal_against[t],1.35)
        share=self.av(self.shot_share[t],.5)
        return {
            "sf":sf,"sa":sa,"sotf":sotf,"sota":sota,"gf":gf,"ga":ga,
            "access":float(np.clip((sotf/max(sf,1.)-.32)*3,-1,1)),
            "suppression_failure":float(np.clip((sa-12.)/8.,-1,1)),
            "instability":float(np.clip(self.sd(self.shot_share[t])/.25,0,1)),
            "control":float(np.clip((share-.5)*2,-1,1)),
        }
    def update(self,r):
        h,a=r.HomeTeam,r.AwayTeam; hs,as_=float(r.HS),float(r.AS); hst,ast=float(r.HST),float(r.AST); hg,ag=float(r.FTHG),float(r.FTAG)
        self.sf[h].append(hs); self.sa[h].append(as_); self.sotf[h].append(hst); self.sota[h].append(ast); self.goals[h].append(hg); self.goal_against[h].append(ag)
        self.sf[a].append(as_); self.sa[a].append(hs); self.sotf[a].append(ast); self.sota[a].append(hst); self.goals[a].append(ag); self.goal_against[a].append(hg)
        total=max(hs+as_,1.); self.shot_share[h].append(hs/total); self.shot_share[a].append(as_/total)


def build_rows(df):
    p=Profile(); rows=[]
    for _,r in df.sort_values("Date").iterrows():
        m=norm_ou(r["Avg>2.5"],r["Avg<2.5"]); hp,ap=p.team(r.HomeTeam),p.team(r.AwayTeam)
        # Totals use sums/interactions, not home-minus-away differences.
        pace=float(np.clip(((hp['sf']+hp['sa']+ap['sf']+ap['sa'])-48.)/24.,-1,1))
        access=float(np.clip((hp['access']+ap['access'])/2.,-1,1))
        instability=float(np.clip((hp['instability']+ap['instability'])/2.,0,1))
        suppression_failure=float(np.clip((hp['suppression_failure']+ap['suppression_failure'])/2.,-1,1))
        style_openness=float(np.clip(((hp['sf']+ap['sa'])+(ap['sf']+hp['sa'])-48.)/24.,-1,1))
        rows.append({
            "date":r.Date,"season":r.season_code,"home":r.HomeTeam,"away":r.AwayTeam,
            "y":0 if float(r.FTHG)+float(r.FTAG)>2.5 else 1,
            "mO":m[0],"mU":m[1],
            "market_lr":math.log(max(m[0],1e-9)/max(m[1],1e-9)),
            "pace":pace,"access":access,"instability":instability,
            "suppression_failure":suppression_failure,"style_openness":style_openness,
        })
        p.update(r)
    return pd.DataFrame(rows)


def fit_predict(train,test,features):
    model=make_pipeline(StandardScaler(),LogisticRegression(max_iter=2000,C=.5,solver="lbfgs"))
    model.fit(train[features],train.y); raw=model.predict_proba(test[features])
    # sklearn column order follows classes_; classes are [0=Over,1=Under]
    return raw


def main():
    df=pd.concat([fetch(s) for s in SEASONS],ignore_index=True).sort_values("Date"); rows=build_rows(df)
    market=["market_lr"]
    variants={"market_calibrated":market}
    for f in FEATURES: variants[f]=market+[f]
    variants["all_features"]=market+FEATURES

    reports=[]; windows={k:[] for k in variants}
    for i,s in enumerate(SEASONS[1:],start=1):
        train=rows[rows.season.isin(SEASONS[:i])]; test=rows[rows.season==s]; y=test.y.to_numpy(int); M=test[["mO","mU"]].to_numpy(float)
        rb,rl=brier(M,y),logloss(M,y); rep={"season":s,"n":int(len(test)),"raw_market_brier":rb,"raw_market_logloss":rl,"variants":{}}
        for name,fs in variants.items():
            P=fit_predict(train,test,fs); vb,vl=brier(P,y),logloss(P,y)
            x={"brier":vb,"logloss":vl,"brier_delta_vs_raw_market":vb-rb,"logloss_delta_vs_raw_market":vl-rl}
            rep["variants"][name]=x; windows[name].append(x)
        reports.append(rep)

    acceptance={}
    for name,ws in windows.items():
        wb=sum(x["brier_delta_vs_raw_market"]<0 for x in ws); wl=sum(x["logloss_delta_vs_raw_market"]<0 for x in ws)
        mb=float(np.mean([x["brier_delta_vs_raw_market"] for x in ws])); ml=float(np.mean([x["logloss_delta_vs_raw_market"] for x in ws]))
        acceptance[name]={"windows_brier_better_than_raw_market":wb,"windows_logloss_better_than_raw_market":wl,"mean_brier_delta":mb,"mean_logloss_delta":ml,"accepted":bool(wb>=2 and wl>=2 and mb<0 and ml<0)}

    summary={
        "market":"EPL Over/Under 2.5 opening average odds",
        "method":"expanding-season binary logistic; raw market is hard benchmark",
        "features":FEATURES,"seasons":reports,"acceptance":acceptance,
        "acceptance_rule":"Accepted only if Brier and log loss beat raw opening market in >=2 non-overlapping seasons and mean delta is negative for both.",
        "warning":"These are match-stat-derived historical proxies, not full tracking-state features."
    }
    OUT.mkdir(parents=True,exist_ok=True); (OUT/"totals_proxy_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8"); print(json.dumps(summary,indent=2))

if __name__=="__main__": main()
