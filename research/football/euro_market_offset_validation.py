#!/usr/bin/env python3
from __future__ import annotations
import json,math
from pathlib import Path
import numpy as np
from scipy.optimize import minimize
from euro_360_market_replication import build,GROUPS,metrics

OUT=Path("research/football/output")
LAMBDA=10.0

def fit_offset(tr,fs):
    X=tr[fs].to_numpy(float)
    mu=X.mean(axis=0); sd=X.std(axis=0); sd[sd<1e-8]=1.0
    Z=(X-mu)/sd
    base=np.clip(tr[["mH","mD","mA"]].to_numpy(float),1e-8,1)
    y=tr.y.to_numpy(int)
    k=Z.shape[1]
    def unpack(v): return v.reshape(k,3)
    def objective(v):
        B=unpack(v)
        s=np.log(base)+Z@B
        s=s-s.max(axis=1,keepdims=True)
        p=np.exp(s);p=p/p.sum(axis=1,keepdims=True)
        nll=-np.log(np.clip(p[np.arange(len(y)),y],1e-12,1)).mean()
        return nll+LAMBDA*np.mean(B*B)
    res=minimize(objective,np.zeros(k*3),method="L-BFGS-B")
    return mu,sd,unpack(res.x),float(res.fun),bool(res.success)

def apply_offset(te,fs,pars):
    mu,sd,B,_,_=pars
    Z=(te[fs].to_numpy(float)-mu)/sd
    base=np.clip(te[["mH","mD","mA"]].to_numpy(float),1e-8,1)
    s=np.log(base)+Z@B
    s=s-s.max(axis=1,keepdims=True)
    p=np.exp(s);return p/p.sum(axis=1,keepdims=True)

def main():
    tr,_=build("euro2020",{"season_name":"2020","footy_id":5635})
    te,_=build("euro2024",{"season_name":"2024","footy_id":11084})
    y=te.y.to_numpy(int)
    market=metrics(te[["mH","mD","mA"]].to_numpy(float),y)
    variants={}
    for name,fs in GROUPS.items():
        try:
            pars=fit_offset(tr,fs);p=apply_offset(te,fs,pars);vm=metrics(p,y)
            B=pars[2]
            variants[name]={**vm,
              "brier_delta":vm["brier"]-market["brier"],
              "logloss_delta":vm["logloss"]-market["logloss"],
              "beats_market_both":vm["brier"]<market["brier"] and vm["logloss"]<market["logloss"],
              "fit_success":pars[4],"coef_l2":float(np.sqrt(np.sum(B*B)))}
        except Exception as e: variants[name]={"error":str(e)}
    out={
      "mode":"frozen market-offset cross-tournament validation",
      "train":"EURO 2020 group stage","test":"EURO 2024 group stage",
      "train_n":len(tr),"test_n":len(te),"lambda":LAMBDA,
      "formula":"p_new proportional to p_market * exp(z_geometry @ B); market probabilities are fixed offsets",
      "market":market,"variants":variants,
      "accepted":[k for k,v in variants.items() if v.get("beats_market_both")],
      "decision":"Only improvements that survive this frozen cross-tournament offset test are candidates for further replication."
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"euro_market_offset_validation.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
    print(json.dumps(out,indent=2))
if __name__=="__main__":main()
