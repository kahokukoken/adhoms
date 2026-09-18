#!/usr/bin/env python3
from __future__ import annotations
import json, statistics
from pathlib import Path
from collections import Counter,defaultdict
from wyscout_event_residual import load_sources, match_sides
from event_engine import TeamPolicy, simulate_match

OUT=Path("research/football/output")

def empirical():
    matches,events=load_sources()
    by=defaultdict(list)
    for e in events: by[int(e["matchId"])].append(e)
    shots=[];goals=[];jumps=[]
    for m in matches:
        mid=int(m.get("wyId",m.get("matchId")))
        ev=by.get(mid,[])
        if not ev: continue
        shot_n=sum(1 for e in ev if e.get("eventName")=="Shot")
        jump_n=0
        for e in ev:
            ps=e.get("positions") or []
            if len(ps)>=2:
                try:
                    if float(ps[1]["x"])-float(ps[0]["x"])>=30:
                        jump_n+=1
                except Exception: pass
        # Wyscout match object score
        g=None
        for key in ("score","winner"):
            _=m.get(key)
        td=m.get("teamsData",{})
        try:
            vals=list(td.values())
            g=sum(int(v.get("score",0)) for v in vals)
        except Exception:
            g=None
        if g is None or g==0:
            # fallback from label "... , 2 - 1"
            import re
            mm=re.search(r",\s*(\d+)\s*-\s*(\d+)\s*$",str(m.get("label","")))
            if mm: g=int(mm.group(1))+int(mm.group(2))
        if g is not None:
            shots.append(shot_n);goals.append(g);jumps.append(jump_n)
    return {
      "matches":len(shots),
      "shots_per_match":statistics.mean(shots),
      "goals_per_match":statistics.mean(goals),
      "state_jump_proxy_per_match":statistics.mean(jumps),
    }

def simulated(n=5000):
    h=TeamPolicy();a=TeamPolicy()
    rs=[simulate_match(h,a,seed=i) for i in range(n)]
    return {
      "matches":n,
      "shots_per_match":statistics.mean(r.home_shots+r.away_shots for r in rs),
      "goals_per_match":statistics.mean(r.home_goals+r.away_goals for r in rs),
      "state_jumps_per_match":statistics.mean(r.state_jumps for r in rs),
      "adaptations_per_match":statistics.mean(r.home_adaptations+r.away_adaptations for r in rs),
    }

def main():
    e=empirical();s=simulated()
    out={"mode":"aggregate observable calibration","empirical":e,"simulated":s,
         "ratios":{
           "shots_ratio":s["shots_per_match"]/e["shots_per_match"],
           "goals_ratio":s["goals_per_match"]/e["goals_per_match"],
           "jump_ratio":s["state_jumps_per_match"]/e["state_jump_proxy_per_match"]
         },
         "decision_rule":"Calibrate only if aggregate observable ratios are materially outside plausible range; do not force hidden-state transitions to event logging frequencies."}
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"event_engine_observable_calibration.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
    print(json.dumps(out,indent=2))
if __name__=="__main__":main()
