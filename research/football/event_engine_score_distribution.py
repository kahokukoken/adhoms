#!/usr/bin/env python3
from __future__ import annotations
import json,re,statistics,math
from collections import defaultdict,Counter
from pathlib import Path
from wyscout_event_residual import load_sources
from event_engine import TeamPolicy,simulate_match

OUT=Path("research/football/output")

def score_from_match(m):
    td=m.get("teamsData",{})
    try:
        vals=list(td.values())
        if len(vals)>=2 and all("score" in v for v in vals):
            ss=[int(v.get("score",0)) for v in vals]
            # accept 0-0; teamsData is preferable to label
            return ss[0],ss[1]
    except Exception: pass
    mm=re.search(r",\s*(\d+)\s*-\s*(\d+)\s*$",str(m.get("label","")))
    if mm:return int(mm.group(1)),int(mm.group(2))
    return None

def metrics(scores):
    totals=[a+b for a,b in scores]
    return {
      "n":len(scores),
      "mean_total":statistics.mean(totals),
      "var_total":statistics.pvariance(totals),
      "p_total_0":sum(t==0 for t in totals)/len(totals),
      "p_total_1":sum(t==1 for t in totals)/len(totals),
      "p_over_2_5":sum(t>=3 for t in totals)/len(totals),
      "p_total_4plus":sum(t>=4 for t in totals)/len(totals),
      "p_total_5plus":sum(t>=5 for t in totals)/len(totals),
      "p_both_score":sum(a>0 and b>0 for a,b in scores)/len(scores),
      "p_any_team_3plus":sum(max(a,b)>=3 for a,b in scores)/len(scores),
      "max_total":max(totals),
      "hist_total":{str(k):totals.count(k)/len(totals) for k in range(0,9)}
    }

def main():
    matches,_=load_sources()
    emp=[]
    for m in matches:
        s=score_from_match(m)
        if s is not None:emp.append(s)
    p=TeamPolicy()
    sim=[]
    for i in range(20000):
        r=simulate_match(p,p,seed=i)
        sim.append((r.home_goals,r.away_goals))
    e=metrics(emp);s=metrics(sim)
    diffs={k:s[k]-e[k] for k in ["mean_total","var_total","p_total_0","p_total_1","p_over_2_5","p_total_4plus","p_total_5plus","p_both_score","p_any_team_3plus"]}
    out={"mode":"score distribution validation after aggregate calibration","empirical":e,"simulated":s,"delta_sim_minus_empirical":diffs,
         "interpretation_rule":"Mean-goal calibration is fixed. Use distribution residuals to assess cascade/tail mechanics; do not retune effective possessions."}
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"event_engine_score_distribution.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
    print(json.dumps(out,indent=2))
if __name__=="__main__":main()
