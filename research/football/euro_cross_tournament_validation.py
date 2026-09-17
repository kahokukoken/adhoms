#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
import numpy as np
from euro_360_market_replication import build,GROUPS,metrics,pred

OUT=Path("research/football/output")

def main():
    tr,d0=build("euro2020",{"season_name":"2020","footy_id":5635})
    te,d1=build("euro2024",{"season_name":"2024","footy_id":11084})
    market=metrics(te[["mH","mD","mA"]].to_numpy(float),te.y.to_numpy(int))
    variants={}
    for name,fs in GROUPS.items():
        try:
            p=pred(tr,te,fs)
            vm=metrics(p,te.y.to_numpy(int))
            variants[name]={**vm,
                "brier_delta":vm["brier"]-market["brier"],
                "logloss_delta":vm["logloss"]-market["logloss"],
                "beats_market_both":vm["brier"]<market["brier"] and vm["logloss"]<market["logloss"]}
        except Exception as e:
            variants[name]={"error":str(e)}
    out={
      "mode":"strict cross-tournament frozen-coefficient validation",
      "train":"EURO 2020 group-stage eligible matches only",
      "test":"EURO 2024 group-stage eligible matches only",
      "train_n":len(tr),"test_n":len(te),
      "timing_rule":"within each tournament, target-match 360 excluded; no EURO2024 row used to fit scaler or classifier",
      "market":market,"variants":variants,
      "accepted":[k for k,v in variants.items() if v.get("beats_market_both")],
      "warning":"Small tournament samples; acceptance here is a replication signal, not evidence of guaranteed betting profitability."
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"euro_cross_tournament_validation.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
    print(json.dumps(out,indent=2))
if __name__=="__main__":main()
