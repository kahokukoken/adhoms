#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
import numpy as np
from scipy.optimize import minimize
from euro_360_market_replication import build as build_euro,metrics
from wc2022_360_market import build_rows as build_wc

OUT=Path("research/football/output")
FS=["mate_x_spread_diff","mate_y_spread_diff"]
LAMBDA=10.0

def fit_offset(tr):
    X=tr[FS].to_numpy(float); mu=X.mean(axis=0); sd=X.std(axis=0); sd[sd<1e-8]=1.0
    Z=(X-mu)/sd; base=np.clip(tr[["mH","mD","mA"]].to_numpy(float),1e-8,1); y=tr.y.to_numpy(int)
    def obj(v):
        B=v.reshape(len(FS),3); s=np.log(base)+Z@B; s-=s.max(axis=1,keepdims=True)
        p=np.exp(s);p/=p.sum(axis=1,keepdims=True)
        return -np.log(np.clip(p[np.arange(len(y)),y],1e-12,1)).mean()+LAMBDA*np.mean(B*B)
    r=minimize(obj,np.zeros(len(FS)*3),method="L-BFGS-B")
    return mu,sd,r.x.reshape(len(FS),3),bool(r.success)

def apply(te,pars):
    mu,sd,B,_=pars;Z=(te[FS].to_numpy(float)-mu)/sd;base=np.clip(te[["mH","mD","mA"]].to_numpy(float),1e-8,1)
    s=np.log(base)+Z@B;s-=s.max(axis=1,keepdims=True);p=np.exp(s);return p/p.sum(axis=1,keepdims=True)

def main():
    tr,_=build_euro("euro2020",{"season_name":"2020","footy_id":5635})
    te,_=build_wc()
    te=te.sort_values("date").reset_index(drop=True)
    pars=fit_offset(tr);p=apply(te,pars);y=te.y.to_numpy(int)
    market=metrics(te[["mH","mD","mA"]].to_numpy(float),y);vm=metrics(p,y)
    out={"mode":"independent tournament replication","train":"EURO 2020 group-stage eligible","test":"World Cup 2022 eligible prior-360 matches",
         "train_n":len(tr),"test_n":len(te),"lambda":LAMBDA,"features":FS,
         "market":market,"spatial_structure":{**vm,"brier_delta":vm["brier"]-market["brier"],"logloss_delta":vm["logloss"]-market["logloss"],
         "beats_market_both":vm["brier"]<market["brier"] and vm["logloss"]<market["logloss"]},
         "decision":"retain only if both proper scores improve without refitting on WC2022"}
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"spatial_structure_wc2022_replication.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
    print(json.dumps(out,indent=2))
if __name__=="__main__":main()
