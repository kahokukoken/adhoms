#!/usr/bin/env python3
from __future__ import annotations
import json, math
from collections import defaultdict, Counter
from pathlib import Path
import numpy as np
from wyscout_event_residual import load_sources, pos

OUT=Path("research/football/output")
OBS_STATES=["buildup","middle_progression","final_third_entry","dangerous_reception","shot","turnover","set_piece"]

def event_state(e):
    name=str(e.get("eventName",""))
    # Possession-state calibration must use on-ball actions only. Duel/Foul/
    # Interruption records can be emitted for both teams around one contest and
    # would create artificial possession changes.
    if name not in {"Pass","Shot","Free Kick"}:
        return None
    if name=="Shot":
        return "shot"
    if name=="Free Kick":
        return "set_piece"
    p0=pos(e,0); p1=pos(e,1)
    if name=="Pass" and p0 and p1:
        x0,x1=p0[0],p1[0]
        if x0 < 30 and x1 < 45:
            return "buildup"
        if x1 < 65:
            return "middle_progression"
        if x1 < 82:
            return "final_third_entry"
        return "dangerous_reception"
    if p0:
        x=p1[0] if p1 else p0[0]
        if x < 35: return "buildup"
        if x < 65: return "middle_progression"
        if x < 82: return "final_third_entry"
        return "dangerous_reception"
    return None

def build_empirical(events):
    by_match=defaultdict(list)
    for e in events:
        by_match[int(e["matchId"])].append(e)
    counts=defaultdict(Counter)
    direct_skips=0; possession_turnovers=0; usable_matches=0
    stage_rank={"buildup":0,"middle_progression":1,"final_third_entry":2,"dangerous_reception":3,"shot":4}
    for mid,evs in by_match.items():
        evs=sorted(evs,key=lambda e:(str(e.get("matchPeriod","")),float(e.get("eventSec",0))))
        prev_team=None; prev_state=None; prev_period=None; prev_sec=None
        used=False
        for e in evs:
            period=str(e.get("matchPeriod",""))
            team=str(e.get("teamId",""))
            st=event_state(e)
            if st is None: continue
            used=True
            sec=float(e.get("eventSec",0))
            if period!=prev_period:
                prev_team=None;prev_state=None;prev_sec=None
            if prev_team is not None and team != prev_team:
                # Treat only near-continuous changes as turnovers. A long gap is
                # more likely a restart after foul, out-of-play, goal, etc.
                gap = sec-prev_sec if prev_sec is not None else 999
                if 0 <= gap <= 8:
                    if prev_state and prev_state!="turnover":
                        counts[prev_state]["turnover"]+=1
                    possession_turnovers+=1
                prev_state=None
            if prev_state is not None and st!=prev_state:
                counts[prev_state][st]+=1
                if prev_state in stage_rank and st in stage_rank and stage_rank[st]-stage_rank[prev_state]>=2:
                    direct_skips+=1
            prev_team=team;prev_state=st;prev_period=period;prev_sec=sec
        if used: usable_matches+=1
    probs={}
    for s,c in counts.items():
        tot=sum(c.values())
        probs[s]={k:v/tot for k,v in c.items()} if tot else {}
    return probs,counts,direct_skips,possession_turnovers,usable_matches

def model_collapsed():
    # Collapse PRESS_ESCAPE into middle progression because Wyscout event data
    # has no pressure context. State Jump is evaluated separately.
    return {
      "buildup":{"middle_progression":.72,"turnover":.28},
      "middle_progression":{"final_third_entry":.44,"turnover":.36,"set_piece":.20},
      "final_third_entry":{"dangerous_reception":.38,"shot":.22,"turnover":.28,"set_piece":.12},
      "dangerous_reception":{"shot":.48,"turnover":.34,"set_piece":.18},
      "set_piece":{"shot":.26,"turnover":.54,"dangerous_reception":.20},
    }

def tvd(a,b):
    keys=set(a)|set(b)
    return .5*sum(abs(a.get(k,0)-b.get(k,0)) for k in keys)

def main():
    _,events=load_sources()
    emp,counts,jumps,turnovers,nm=build_empirical(events)
    mod=model_collapsed()
    rows={}
    for s in mod:
        rows[s]={
          "empirical":emp.get(s,{}),
          "model":mod[s],
          "tvd":tvd(emp.get(s,{}),mod[s]),
          "n_transitions":int(sum(counts.get(s,{}).values()))
        }
    out={
      "mode":"Wyscout 2017/18 EPL observable state-transition calibration",
      "usable_matches":nm,
      "event_rows":len(events),
      "compression":"Pass/Shot/Free Kick only; consecutive identical spatial states collapsed; only team changes within 8 seconds insert turnover",
      "unobservable_model_states":["press_escape","counter","restart"],
      "rows":rows,
      "mean_tvd":float(np.mean([v["tvd"] for v in rows.values()])),
      "direct_stage_skips":int(jumps),
      "direct_stage_skips_per_match":float(jumps/max(1,nm)),
      "team_changes_per_match":float(turnovers/max(1,nm)),
      "decision_rule":"Do not tune to market outcomes. Only revise base transition mechanics when empirical state-flow mismatch is large and mapping assumptions are defensible."
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"wyscout_state_calibration.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
    print(json.dumps(out,indent=2))
if __name__=="__main__": main()
