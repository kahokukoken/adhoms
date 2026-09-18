#!/usr/bin/env python3
from __future__ import annotations
import io,json,math,re,statistics,unicodedata
from pathlib import Path
import numpy as np,pandas as pd,requests
from wyscout_event_residual import load_sources,match_sides,label_teams,canon,load_fd,norm_odds
from event_engine import TeamPolicy,simulate_match

OUT=Path("research/football/output")
SCALES=[0.0,0.15,0.30,0.45,0.60]
REPS=30
TARGET={
 "mean_total":2.6789473684210527,
 "p_total_0":0.08421052631578947,
 "p_over_2_5":0.5105263157894737,
 "p_total_4plus":0.29210526315789476,
 "p_total_5plus":0.15263157894736842,
 "p_both_score":0.48947368421052634,
 "p_any_team_3plus":0.3131578947368421
}
def clamp(x):return max(.05,min(.95,x))
def policy(z):
 return TeamPolicy(
  structure=clamp(.75+.40*z),adaptation=.65,repertoire=.65,
  execution=clamp(.75+.50*z),disruption=clamp(.55+.38*z),
  access=clamp(.60+.48*z),suppression=clamp(.60+.48*z),
  recovery=clamp(.65+.48*z),risk=.50,misdiagnosis=.15)

def metrics(scores):
 ts=[a+b for a,b in scores]
 return {
  "mean_total":statistics.mean(ts),
  "p_total_0":sum(t==0 for t in ts)/len(ts),
  "p_over_2_5":sum(t>=3 for t in ts)/len(ts),
  "p_total_4plus":sum(t>=4 for t in ts)/len(ts),
  "p_total_5plus":sum(t>=5 for t in ts)/len(ts),
  "p_both_score":sum(a>0 and b>0 for a,b in scores)/len(scores),
  "p_any_team_3plus":sum(max(a,b)>=3 for a,b in scores)/len(scores)
 }

def joined_market():
 matches,_=load_sources();fd,mc=load_fd();rows=[]
 for m in matches:
  try:
   hn,an=label_teams(m["label"]);hk,ak=canon(hn),canon(an)
   dt=pd.to_datetime(m.get("dateutc",m.get("date")),utc=True,errors="coerce")
   c=fd[(fd.home_key==hk)&(fd.away_key==ak)].copy()
   if c.empty:continue
   c["dd"]=(c.date-dt).abs().dt.total_seconds();r=c.sort_values("dd").iloc[0]
   if float(r.dd)>3*86400:continue
   p=norm_odds([r[x] for x in mc]); rows.append((float(p[0]),float(p[1]),float(p[2])))
  except Exception:pass
 return rows

def main():
 mk=joined_market()
 out={"mode":"pre-match market-conditioned matchup heterogeneity, distribution-only validation",
      "joined_matches":len(mk),"reps_per_match":REPS,"target":TARGET,"runs":{}}
 for scale in SCALES:
  scores=[]
  for j,(ph,pd,pa) in enumerate(mk):
   # market-derived relative strength observation; no outcome is used
   logratio=math.log(max(1e-6,ph+.5*pd)/max(1e-6,pa+.5*pd))
   edge=math.tanh(logratio)
   zh=scale*edge;za=-scale*edge
   for rep in range(REPS):
    r=simulate_match(policy(zh),policy(za),seed=900000+j*REPS+rep+int(scale*10000))
    scores.append((r.home_goals,r.away_goals))
  m=metrics(scores);res={k:m[k]-TARGET[k] for k in TARGET}
  loss=(res["mean_total"]/2.68)**2+sum(res[k]**2 for k in TARGET if k!="mean_total")
  out["runs"][str(scale)]={"metrics":m,"residual":res,"loss":loss}
 out["best_scale_by_descriptive_loss"]=min(out["runs"],key=lambda k:out["runs"][k]["loss"])
 out["decision_rule"]="If real pre-match matchup strength closes both-score and one-sided-score residuals at fixed volume, model team strength as persistent State/Relation rather than strengthening Cascade."
 OUT.mkdir(parents=True,exist_ok=True)
 (OUT/"event_engine_market_matchup_shape.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
 print(json.dumps(out,indent=2))
if __name__=="__main__":main()
