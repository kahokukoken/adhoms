#!/usr/bin/env python3
import json, statistics
from pathlib import Path
from event_engine import TeamPolicy, simulate_match

OUT=Path("research/football/output")
def run(n=5000):
    home=TeamPolicy(structure=.86,adaptation=.88,repertoire=.82,execution=.84,disruption=.66,access=.73,suppression=.68,recovery=.72,risk=.52,misdiagnosis=.12)
    away=TeamPolicy(structure=.77,adaptation=.57,repertoire=.52,execution=.79,disruption=.82,access=.64,suppression=.62,recovery=.58,risk=.56,misdiagnosis=.24)
    variants={
      "full":dict(adaptation_enabled=True,state_jumps_enabled=True,cascade_enabled=True),
      "no_adaptation":dict(adaptation_enabled=False,state_jumps_enabled=True,cascade_enabled=True),
      "no_state_jump":dict(adaptation_enabled=True,state_jumps_enabled=False,cascade_enabled=True),
      "no_cascade":dict(adaptation_enabled=True,state_jumps_enabled=True,cascade_enabled=False),
    }
    out={}
    for name,kw in variants.items():
        rs=[simulate_match(home,away,seed=i,**kw) for i in range(n)]
        hg=[r.home_goals for r in rs];ag=[r.away_goals for r in rs]
        out[name]={
          "n":n,"home_goals":statistics.mean(hg),"away_goals":statistics.mean(ag),
          "home_win":sum(h>a for h,a in zip(hg,ag))/n,
          "draw":sum(h==a for h,a in zip(hg,ag))/n,
          "away_win":sum(h<a for h,a in zip(hg,ag))/n,
          "home_3plus":sum(h>=3 for h in hg)/n,
          "mean_adaptations":statistics.mean(r.home_adaptations+r.away_adaptations for r in rs),
          "mean_state_jumps":statistics.mean(r.state_jumps for r in rs),
          "mean_cascades":statistics.mean(r.cascades for r in rs),
        }
    return out

if __name__=="__main__":
    OUT.mkdir(parents=True,exist_ok=True)
    r=run()
    p=OUT/"event_engine_ablation.json";p.write_text(json.dumps(r,indent=2),encoding="utf-8")
    print(json.dumps(r,indent=2))
