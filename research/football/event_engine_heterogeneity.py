#!/usr/bin/env python3
from __future__ import annotations
import json,random,statistics
from pathlib import Path
from event_engine import TeamPolicy,simulate_match

OUT=Path("research/football/output")
SIGMAS=[0.0,0.04,0.08,0.12,0.16]
N=12000
TARGET={
 "mean_total":2.6789473684210527,
 "p_total_0":0.08421052631578947,
 "p_over_2_5":0.5105263157894737,
 "p_total_4plus":0.29210526315789476,
 "p_total_5plus":0.15263157894736842,
 "p_both_score":0.48947368421052634,
 "p_any_team_3plus":0.3131578947368421
}

def clamp(x): return max(.05,min(.95,x))

def make_policy(z):
    # One latent team-quality draw changes attack and defense coherently.
    # No parameter is fitted to a specific match result.
    return TeamPolicy(
      structure=clamp(.75+.45*z),
      adaptation=.65,
      repertoire=.65,
      execution=clamp(.75+.55*z),
      disruption=clamp(.55+.45*z),
      access=clamp(.60+.55*z),
      suppression=clamp(.60+.50*z),
      recovery=clamp(.65+.50*z),
      risk=.50,
      misdiagnosis=.15
    )

def metrics(scores):
    ts=[a+b for a,b in scores]
    return {
      "mean_total":statistics.mean(ts),
      "p_total_0":sum(t==0 for t in ts)/len(ts),
      "p_over_2_5":sum(t>=3 for t in ts)/len(ts),
      "p_total_4plus":sum(t>=4 for t in ts)/len(ts),
      "p_total_5plus":sum(t>=5 for t in ts)/len(ts),
      "p_both_score":sum(a>0 and b>0 for a,b in scores)/len(scores),
      "p_any_team_3plus":sum(max(a,b)>=3 for a,b in scores)/len(scores),
    }

def main():
    out={"mode":"team heterogeneity sensitivity at fixed 138 effective possessions","target":TARGET,"runs":{}}
    for sigma in SIGMAS:
        rng=random.Random(8800+int(sigma*1000));scores=[]
        for i in range(N):
            zh=rng.gauss(0,sigma);za=rng.gauss(0,sigma)
            r=simulate_match(make_policy(zh),make_policy(za),seed=100000*i+int(sigma*10000))
            scores.append((r.home_goals,r.away_goals))
        m=metrics(scores)
        resid={k:m[k]-TARGET[k] for k in TARGET}
        # Equal weight on probability residuals; mean total scaled to comparable units.
        loss=(resid["mean_total"]/2.68)**2+sum(resid[k]**2 for k in TARGET if k!="mean_total")
        out["runs"][str(sigma)]={"metrics":m,"residual":resid,"loss":loss}
    best=min(out["runs"],key=lambda k:out["runs"][k]["loss"])
    out["best_sigma_by_descriptive_loss"]=best
    out["decision_rule"]="If modest heterogeneity reduces shutout/one-sided residuals without breaking mean total, add team heterogeneity as a structural layer. Do not tune Cascade to compensate for missing between-team variance."
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"event_engine_heterogeneity_sensitivity.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
    print(json.dumps(out,indent=2))
if __name__=="__main__":main()
