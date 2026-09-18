#!/usr/bin/env python3
from __future__ import annotations
import json, math
from pathlib import Path
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from market_movement import fetch, build_rows, FEATURES, SEASONS

OUT=Path("research/football/output")
THRESHOLD=0.015
LATENCY_FRACTIONS=[0.0,0.25,0.5,0.75,1.0]

def geom_interp(open_odds, close_odds, frac):
    return float(math.exp((1-frac)*math.log(open_odds)+frac*math.log(close_odds)))

def max_drawdown(bankroll_path):
    peak=bankroll_path[0];mdd=0.0
    for x in bankroll_path:
        peak=max(peak,x)
        if peak>0:mdd=max(mdd,(peak-x)/peak)
    return mdd

def settle(price, y, sel):
    return price-1.0 if int(y)==int(sel) else -1.0

def main():
    raw=np.nan
    import pandas as pd
    raw=pd.concat([fetch(s) for s in SEASONS],ignore_index=True).sort_values("Date")
    rows=build_rows(raw)
    all_reports=[]
    agg={str(f):{"bets":0,"profit":0.0,"turnover":0.0,"log_clv":[],"bank":[100.0]} for f in LATENCY_FRACTIONS}
    for i,season in enumerate(SEASONS[1:],start=1):
        tr=rows[rows.season.isin(SEASONS[:i])].copy()
        te=rows[rows.season==season].copy()
        model=make_pipeline(StandardScaler(),MultiOutputRegressor(Ridge(alpha=10.0)))
        model.fit(tr[FEATURES],tr[["move_H","move_D","move_A"]].to_numpy(float))
        pred=model.predict(te[FEATURES])
        season_out={"season":season,"n_matches":int(len(te)),"latency":{}}
        for f in LATENCY_FRACTIONS:
            bets=profit=0.0;clvs=[];bank=[100.0]
            for r,p in zip(te.itertuples(index=False),pred):
                sel=int(np.argmax(p));edge=float(p[sel])
                if edge<THRESHOLD:continue
                side=["H","D","A"][sel]
                oo=float(getattr(r,f"open{side}_odds"))
                co=float(getattr(r,f"close{side}_odds"))
                px=geom_interp(oo,co,f)
                y={"H":0,"D":1,"A":2}[{"H":"H","D":"D","A":"A"}[side]]
                # actual match result from source row is not retained by market_movement;
                # reconstruct from close movement row source columns is impossible here.
                # Therefore infer actual outcome by joining on season/date/home/away below.
                bets+=1
                clvs.append(math.log(px/co))
            season_out["latency"][str(f)]={"signals":int(bets),"mean_log_clv":float(np.mean(clvs)) if clvs else None}
        all_reports.append(season_out)
    # second pass with outcomes joined from source rows
    outcome_lookup={}
    for _,r in raw.iterrows():
        key=(str(r.season_code),str(r.Date.date()),str(r.HomeTeam),str(r.AwayTeam))
        outcome_lookup[key]={"H":0,"D":1,"A":2}[str(r.FTR)]
    exec_reports=[]
    for i,season in enumerate(SEASONS[1:],start=1):
        tr=rows[rows.season.isin(SEASONS[:i])].copy();te=rows[rows.season==season].copy()
        model=make_pipeline(StandardScaler(),MultiOutputRegressor(Ridge(alpha=10.0)))
        model.fit(tr[FEATURES],tr[["move_H","move_D","move_A"]].to_numpy(float))
        pred=model.predict(te[FEATURES])
        sr={"season":season,"n_matches":int(len(te)),"latency":{}}
        for f in LATENCY_FRACTIONS:
            bank=100.0;peak=bank;mdd=0.0;bets=0;profit=0.0;clvs=[]
            for r,p in zip(te.itertuples(index=False),pred):
                sel=int(np.argmax(p))
                if float(p[sel])<THRESHOLD:continue
                side=["H","D","A"][sel]
                key=(str(r.season),str(r.date.date()),str(r.home),str(r.away))
                if key not in outcome_lookup:continue
                oo=float(getattr(r,f"open{side}_odds"));co=float(getattr(r,f"close{side}_odds"))
                px=geom_interp(oo,co,f)
                pnl=settle(px,outcome_lookup[key],sel)
                bets+=1;profit+=pnl;bank+=pnl
                peak=max(peak,bank)
                if peak>0:mdd=max(mdd,(peak-bank)/peak)
                clvs.append(math.log(px/co))
            sr["latency"][str(f)]={
                "signals":bets,"turnover_units":bets,"profit_units":profit,
                "roi":profit/bets if bets else None,
                "mean_log_clv":float(np.mean(clvs)) if clvs else None,
                "positive_clv_rate":float(np.mean(np.asarray(clvs)>0)) if clvs else None,
                "max_drawdown":mdd
            }
            a=agg[str(f)]
            a["bets"]+=bets;a["profit"]+=profit;a["turnover"]+=bets;a["log_clv"].extend(clvs)
        exec_reports.append(sr)
    aggregate={}
    for f,a in agg.items():
        aggregate[f]={
            "bets":a["bets"],"roi":a["profit"]/a["turnover"] if a["turnover"] else None,
            "profit_units":a["profit"],
            "mean_log_clv":float(np.mean(a["log_clv"])) if a["log_clv"] else None,
            "positive_clv_rate":float(np.mean(np.asarray(a["log_clv"])>0)) if a["log_clv"] else None
        }
    out={
      "mode":"Historical Notification Simulator v0.1",
      "signal":"expanding-season market-movement model; choose max predicted 1X2 movement if >=0.015",
      "latency_proxy":"fraction of realized opening-to-closing log-odds movement already lost before execution; 0=open, 1=close. This is NOT clock-time latency.",
      "walk_forward":"2019-20 initial train; 2020-21..2024-25 frozen seasonal evaluations",
      "seasons":exec_reports,"aggregate":aggregate,
      "acceptance":"Do not call usable unless positive CLV and positive ROI survive multiple fixed OOS seasons and later real timestamped latency data."
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"historical_notification_simulator.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
    print(json.dumps(out,indent=2))
if __name__=="__main__":main()
