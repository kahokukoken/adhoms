#!/usr/bin/env python3
from __future__ import annotations
import json,re,statistics,math
from collections import defaultdict,deque
from pathlib import Path
import numpy as np,pandas as pd
from wyscout_event_residual import load_sources,summarize_match_events,match_sides
from event_engine import TeamPolicy,simulate_match

OUT=Path("research/football/output")
SCALES=[0.0,0.5,1.0,1.5]
REPS=18
KEYS=["shot_rate","deep_access_rate","state_jump_rate","opp_shot_rate","opp_deep_access_rate","pass_entropy","pass_success"]

def clamp(x):return max(.05,min(.95,x))
def score_from_label(label):
 m=re.search(r",\s*(\d+)\s*-\s*(\d+)\s*$",str(label))
 return (int(m.group(1)),int(m.group(2))) if m else None
def meanprof(hist):
 return {k:float(np.mean([x[k] for x in hist])) for k in KEYS}
def stats(pool):
 if len(pool)<20:return ({k:0 for k in KEYS},{k:1 for k in KEYS})
 mu={k:float(np.mean([x[k] for x in pool])) for k in KEYS}
 sd={k:max(.05,float(np.std([x[k] for x in pool]))) for k in KEYS}
 return mu,sd
def z(v,k,mu,sd):return max(-2.5,min(2.5,(v[k]-mu[k])/sd[k]))
def policy(v,mu,sd,scale):
 attack=np.mean([z(v,"shot_rate",mu,sd),z(v,"deep_access_rate",mu,sd),z(v,"state_jump_rate",mu,sd)])
 defense=np.mean([-z(v,"opp_shot_rate",mu,sd),-z(v,"opp_deep_access_rate",mu,sd)])
 structure=np.mean([z(v,"pass_entropy",mu,sd),z(v,"pass_success",mu,sd)])
 return TeamPolicy(
  structure=clamp(.75+.05*scale*structure),adaptation=.65,repertoire=.65,
  execution=clamp(.75+.075*scale*attack),disruption=clamp(.55+.065*scale*attack),
  access=clamp(.60+.08*scale*attack),suppression=clamp(.60+.08*scale*defense),
  recovery=clamp(.65+.07*scale*defense),risk=.50,misdiagnosis=.15)

def metrics(scores):
 ts=[a+b for a,b in scores]
 return {"mean_total":statistics.mean(ts),"var_total":statistics.pvariance(ts),
 "p_total_0":sum(t==0 for t in ts)/len(ts),"p_over_2_5":sum(t>=3 for t in ts)/len(ts),
 "p_total_4plus":sum(t>=4 for t in ts)/len(ts),"p_total_5plus":sum(t>=5 for t in ts)/len(ts),
 "p_both_score":sum(a>0 and b>0 for a,b in scores)/len(scores),
 "p_any_team_3plus":sum(max(a,b)>=3 for a,b in scores)/len(scores)}

def build_cases():
 matches,events=load_sources();by=defaultdict(list)
 for e in events:by[int(e["matchId"])].append(e)
 matches=sorted(matches,key=lambda m:str(m.get("dateutc",m.get("date",""))))
 hist=defaultdict(lambda:deque(maxlen=5));pool=[];cases=[]
 for m in matches:
  mid=int(m.get("wyId",m.get("matchId")));ev=by.get(mid)
  if not ev:continue
  h,a=match_sides(m);score=score_from_label(m.get("label"))
  mu,sd=stats(pool)
  if score and len(hist[h])>=5 and len(hist[a])>=5:
   cases.append({"mid":mid,"home":meanprof(hist[h]),"away":meanprof(hist[a]),"mu":mu,"sd":sd,"score":score})
  sm=summarize_match_events(ev,h,a)
  hist[h].append(sm[str(h)]);hist[a].append(sm[str(a)])
  pool.extend([sm[str(h)],sm[str(a)]])
 return cases

def main():
 cases=build_cases();actual=[c["score"] for c in cases];target=metrics(actual)
 out={"mode":"leakage-safe rolling attack/defense state distribution validation","eligible_matches":len(cases),
      "history":"last 5 matches; standardization uses only prior team-match summaries","target":target,"runs":{}}
 for scale in SCALES:
  scores=[]
  for j,c in enumerate(cases):
   hp=policy(c["home"],c["mu"],c["sd"],scale);ap=policy(c["away"],c["mu"],c["sd"],scale)
   for r in range(REPS):
    q=simulate_match(hp,ap,seed=3100000+j*REPS+r+int(scale*10000))
    scores.append((q.home_goals,q.away_goals))
  m=metrics(scores)
  keys=["mean_total","var_total","p_total_0","p_over_2_5","p_total_4plus","p_total_5plus","p_both_score","p_any_team_3plus"]
  res={k:m[k]-target[k] for k in keys}
  loss=(res["mean_total"]/2.7)**2+(res["var_total"]/2.8)**2+sum(res[k]**2 for k in keys if k not in ("mean_total","var_total"))
  out["runs"][str(scale)]={"metrics":m,"residual":res,"loss":loss}
 out["best"]=min(out["runs"],key=lambda k:out["runs"][k]["loss"])
 out["decision_rule"]="Promote separate Attack State and Defense State only if prior-match profiles improve score-shape residuals over scale=0 without using target-match events or outcomes."
 OUT.mkdir(parents=True,exist_ok=True)
 (OUT/"event_engine_attack_defense_states.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
 print(json.dumps(out,indent=2))
if __name__=="__main__":main()
