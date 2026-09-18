#!/usr/bin/env python3
from __future__ import annotations
import json,math,statistics
from pathlib import Path
import pandas as pd
from wyscout_event_residual import load_sources,label_teams,canon,load_fd,norm_odds
from event_engine import TeamPolicy,simulate_match

OUT=Path("research/football/output")
REL_SCALES=[0.20,0.30]
OPEN_SCALES=[0.0,0.5,1.0,1.5]
REPS=18
TARGET={
 "mean_total":2.6789473684210527,"p_total_0":0.08421052631578947,
 "p_over_2_5":0.5105263157894737,"p_total_4plus":0.29210526315789476,
 "p_total_5plus":0.15263157894736842,"p_both_score":0.48947368421052634,
 "p_any_team_3plus":0.3131578947368421
}
def clamp(x):return max(.05,min(.95,x))
def policy(rel,opn):
 # rel is team-relative advantage; opn is common match openness.
 return TeamPolicy(
  structure=clamp(.75+.35*rel-.10*opn),
  adaptation=.65,repertoire=.65,
  execution=clamp(.75+.44*rel+.12*opn),
  disruption=clamp(.55+.34*rel+.10*opn),
  access=clamp(.60+.44*rel+.16*opn),
  suppression=clamp(.60+.44*rel-.14*opn),
  recovery=clamp(.65+.44*rel-.12*opn),
  risk=clamp(.50+.10*opn),misdiagnosis=.15)

def market_rows():
 matches,_=load_sources();fd,mc=load_fd();rows=[]
 for m in matches:
  try:
   hn,an=label_teams(m["label"]);hk,ak=canon(hn),canon(an)
   dt=pd.to_datetime(m.get("dateutc",m.get("date")),utc=True,errors="coerce")
   c=fd[(fd.home_key==hk)&(fd.away_key==ak)].copy()
   if c.empty:continue
   c["dd"]=(c.date-dt).abs().dt.total_seconds();r=c.sort_values("dd").iloc[0]
   if float(r.dd)>3*86400:continue
   p=norm_odds([r[x] for x in mc]);rows.append(tuple(float(x) for x in p))
  except Exception:pass
 return rows

def metrics(scores):
 ts=[a+b for a,b in scores]
 return {"mean_total":statistics.mean(ts),"p_total_0":sum(t==0 for t in ts)/len(ts),
 "p_over_2_5":sum(t>=3 for t in ts)/len(ts),"p_total_4plus":sum(t>=4 for t in ts)/len(ts),
 "p_total_5plus":sum(t>=5 for t in ts)/len(ts),"p_both_score":sum(a>0 and b>0 for a,b in scores)/len(scores),
 "p_any_team_3plus":sum(max(a,b)>=3 for a,b in scores)/len(scores)}

def main():
 rows=market_rows();mean_pd=statistics.mean(pd for _,pd,_ in rows)
 out={"mode":"decompose pre-match relation into relative strength and match openness","joined_matches":len(rows),
      "mean_market_draw_prob":mean_pd,"target":TARGET,"runs":{}}
 for rs in REL_SCALES:
  for os in OPEN_SCALES:
   scores=[]
   for j,(ph,pd,pa) in enumerate(rows):
    lr=math.log(max(1e-6,ph+.5*pd)/max(1e-6,pa+.5*pd))
    edge=math.tanh(lr)
    # Higher-than-average draw probability = more closed; lower = more open.
    opn=os*(mean_pd-pd)
    for rep in range(REPS):
     r=simulate_match(policy(rs*edge,opn),policy(-rs*edge,opn),
                      seed=2000000+j*REPS+rep+int(rs*10000)+int(os*1000))
     scores.append((r.home_goals,r.away_goals))
   m=metrics(scores);res={k:m[k]-TARGET[k] for k in TARGET}
   loss=(res["mean_total"]/2.68)**2+sum(res[k]**2 for k in TARGET if k!="mean_total")
   out["runs"][f"rel={rs},open={os}"]={"metrics":m,"residual":res,"loss":loss}
 out["best"]=min(out["runs"],key=lambda k:out["runs"][k]["loss"])
 out["decision_rule"]="Retain Relation decomposition only if openness improves zero-goal/both-score residuals while relative strength preserves one-sided-score fit. Market is an external observer here, not a production dependency."
 OUT.mkdir(parents=True,exist_ok=True)
 (OUT/"event_engine_relation_decomposition.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
 print(json.dumps(out,indent=2))
if __name__=="__main__":main()
