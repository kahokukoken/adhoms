#!/usr/bin/env python3
from __future__ import annotations

import io, json, math
from pathlib import Path
import numpy as np
import pandas as pd
import requests

SEASONS=["2021","2122","2223","2324","2425"]
BASE_URL="https://www.football-data.co.uk/mmz4281/{season}/E0.csv"
OUT=Path("research/football/output")
ADOPTION_LEVELS=[0.0,0.1,0.25,0.5,0.75,1.0]

def fetch(code):
    r=requests.get(BASE_URL.format(season=code),timeout=60,headers={"User-Agent":"Mozilla/5.0 ADHOMS-Football-Research/1.5"})
    r.raise_for_status()
    df=pd.read_csv(io.StringIO(r.content.decode("utf-8-sig",errors="replace")),on_bad_lines="skip")
    need=["AvgH","AvgD","AvgA","AvgCH","AvgCD","AvgCA"]
    return df.dropna(subset=need).copy()

def norm(vals):
    q=1.0/np.asarray(vals,dtype=float)
    return q/q.sum()

def fair_odds(p): return 1.0/np.asarray(p,dtype=float)

def main():
    rows=[]
    for s in SEASONS:
        for _,r in fetch(s).iterrows():
            op=norm([r.AvgH,r.AvgD,r.AvgA]); cp=norm([r.AvgCH,r.AvgCD,r.AvgCA])
            k=int(np.argmax(cp-op))
            rows.append((op,cp,k))
    results=[]
    for a in ADOPTION_LEVELS:
        edges=[]; clvs=[]
        for op,cp,k in rows:
            early=(1-a)*op+a*cp; early=early/early.sum()
            edge=float(cp[k]-early[k]); edges.append(edge)
            if edge>0:
                clvs.append(math.log(fair_odds(early)[k]/fair_odds(cp)[k]))
        results.append({"adoption":a,"mean_residual_probability_edge":float(np.mean(edges)),"mean_log_clv_if_direction_known":float(np.mean(clvs)) if clvs else 0.0})
    summary={"question":"How quickly does a shared prediction edge disappear as adoption rises?","results":results,"warning":"Stylized sensitivity analysis only; not a bookmaker microstructure model."}
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"market_feedback_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print(json.dumps(summary,indent=2))

if __name__=="__main__": main()
