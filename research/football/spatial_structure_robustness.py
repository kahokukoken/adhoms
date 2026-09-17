#!/usr/bin/env python3
from __future__ import annotations
import json, math
from pathlib import Path
import numpy as np
from scipy.optimize import minimize
from euro_360_market_replication import build,metrics

OUT=Path("research/football/output")
FS=["mate_x_spread_diff","mate_y_spread_diff"]
LAMBDAS=[3.0,10.0,30.0,100.0]
SEED=20260918
BOOT=10000

def fit_offset(tr,lam):
    X=tr[FS].to_numpy(float)
    mu=X.mean(axis=0); sd=X.std(axis=0); sd[sd<1e-8]=1.0
    Z=(X-mu)/sd
    base=np.clip(tr[["mH","mD","mA"]].to_numpy(float),1e-8,1)
    y=tr.y.to_numpy(int); k=Z.shape[1]
    def obj(v):
        B=v.reshape(k,3)
        s=np.log(base)+Z@B; s-=s.max(axis=1,keepdims=True)
        p=np.exp(s); p/=p.sum(axis=1,keepdims=True)
        return -np.log(np.clip(p[np.arange(len(y)),y],1e-12,1)).mean()+lam*np.mean(B*B)
    res=minimize(obj,np.zeros(k*3),method="L-BFGS-B")
    return mu,sd,res.x.reshape(k,3),bool(res.success)

def apply(te,pars):
    mu,sd,B,_=pars
    Z=(te[FS].to_numpy(float)-mu)/sd
    base=np.clip(te[["mH","mD","mA"]].to_numpy(float),1e-8,1)
    s=np.log(base)+Z@B; s-=s.max(axis=1,keepdims=True)
    p=np.exp(s); return p/p.sum(axis=1,keepdims=True)

def paired_deltas(p,market,y,idx):
    pm=p[idx]; mm=market[idx]; yy=y[idx]
    a=metrics(pm,yy); b=metrics(mm,yy)
    return a["brier"]-b["brier"],a["logloss"]-b["logloss"]

def main():
    tr,_=build("euro2020",{"season_name":"2020","footy_id":5635})
    te,_=build("euro2024",{"season_name":"2024","footy_id":11084})
    y=te.y.to_numpy(int); market=te[["mH","mD","mA"]].to_numpy(float)
    rng=np.random.default_rng(SEED)
    result={"mode":"spatial_structure robustness","train_n":len(tr),"test_n":len(te),"features":FS,
            "primary_lambda":10.0,"bootstrap_n":BOOT,"seed":SEED,"lambda_sensitivity":{}}
    primary=None
    for lam in LAMBDAS:
        pars=fit_offset(tr,lam); p=apply(te,pars)
        d=paired_deltas(p,market,y,np.arange(len(te)))
        result["lambda_sensitivity"][str(lam)]={"brier_delta":d[0],"logloss_delta":d[1],
            "both_improve":d[0]<0 and d[1]<0,"coef_l2":float(np.sqrt(np.sum(pars[2]**2)))}
        if lam==10.0: primary=(pars,p,d)

    pars,p,d=primary
    boots=np.empty((BOOT,2))
    n=len(te)
    for i in range(BOOT):
        idx=rng.integers(0,n,n)
        boots[i]=paired_deltas(p,market,y,idx)
    q=np.quantile(boots,[.025,.5,.975],axis=0)
    result["bootstrap"]={
      "brier_ci95":[float(q[0,0]),float(q[2,0])],
      "brier_median":float(q[1,0]),
      "brier_fraction_improves":float(np.mean(boots[:,0]<0)),
      "logloss_ci95":[float(q[0,1]),float(q[2,1])],
      "logloss_median":float(q[1,1]),
      "logloss_fraction_improves":float(np.mean(boots[:,1]<0)),
      "both_fraction_improve":float(np.mean((boots[:,0]<0)&(boots[:,1]<0)))
    }
    jack=[]
    for drop in range(n):
        idx=np.array([i for i in range(n) if i!=drop])
        db,dl=paired_deltas(p,market,y,idx)
        jack.append([db,dl])
    jack=np.asarray(jack)
    result["jackknife"]={
      "brier_min":float(jack[:,0].min()),"brier_max":float(jack[:,0].max()),
      "logloss_min":float(jack[:,1].min()),"logloss_max":float(jack[:,1].max()),
      "all_leave_one_out_both_improve":bool(np.all((jack[:,0]<0)&(jack[:,1]<0))),
      "fraction_leave_one_out_both_improve":float(np.mean((jack[:,0]<0)&(jack[:,1]<0)))
    }
    result["decision"]={
      "lambda_sign_stable":bool(all(v["both_improve"] for v in result["lambda_sensitivity"].values())),
      "bootstrap_strong":bool(result["bootstrap"]["both_fraction_improve"]>=0.95),
      "jackknife_strong":bool(result["jackknife"]["all_leave_one_out_both_improve"])
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"spatial_structure_robustness.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
    print(json.dumps(result,indent=2))

if __name__=="__main__":main()
