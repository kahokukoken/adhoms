#!/usr/bin/env python3
from __future__ import annotations
import json,re,statistics
from collections import defaultdict
from pathlib import Path
from wyscout_event_residual import load_sources
from event_engine import TeamPolicy,simulate_match

OUT=Path("research/football/output")
GOAL_TAG=101

def minute_of(e):
 p=str(e.get("matchPeriod","")); sec=float(e.get("eventSec",0))
 base=45 if p in ("2H","E2") else (90 if p=="E1" else 0)
 return base+sec/60.0

def score_total(label):
 m=re.search(r",\s*(\d+)\s*-\s*(\d+)\s*$",str(label))
 return int(m.group(1))+int(m.group(2)) if m else None

def empirical_sequences():
 matches,events=load_sources();by=defaultdict(list)
 for e in events:by[int(e["matchId"])].append(e)
 seqs=[]
 for m in matches:
  mid=int(m.get("wyId",m.get("matchId")));ev=by.get(mid,[])
  goals=[]
  for e in ev:
   if e.get("eventName")!="Shot":continue
   if any(int(t.get("id",-1))==GOAL_TAG for t in e.get("tags",[])):
    goals.append((minute_of(e),str(e.get("teamId"))))
  goals.sort()
  total=score_total(m.get("label"))
  # Exclude matches with own-goal/event mismatches so the conditional sequence is trustworthy.
  if total is not None and len(goals)==total:
   seqs.append(goals)
 return seqs

def metrics(seqs):
 eligible=[g for g in seqs if len(g)>=1]
 n=len(eligible); next_any15=next_same15=next_opp15=0;next_exists=next_same=0;more2=0
 gaps=[]
 for g in eligible:
  first=g[0]
  if len(g)>=2:
   nxt=g[1];next_exists+=1;gaps.append(nxt[0]-first[0])
   if nxt[1]==first[1]:next_same+=1
   if 0<=nxt[0]-first[0]<=15:
    next_any15+=1
    if nxt[1]==first[1]:next_same15+=1
    else:next_opp15+=1
  if len(g)>=3:more2+=1
 return {
  "eligible_first_goal_matches":n,
  "p_next_goal_exists":next_exists/n if n else 0,
  "p_next_goal_same_team_given_exists":next_same/next_exists if next_exists else 0,
  "p_any_next_goal_within15":next_any15/n if n else 0,
  "p_same_team_scores_next_within15":next_same15/n if n else 0,
  "p_opponent_scores_next_within15":next_opp15/n if n else 0,
  "p_two_or_more_additional_goals":more2/n if n else 0,
  "median_next_goal_gap":statistics.median(gaps) if gaps else None
 }

def simulated(cascade,n=30000):
 p=TeamPolicy();seqs=[]
 for i in range(n):
  r=simulate_match(p,p,seed=(100000 if cascade else 500000)+i,cascade_enabled=cascade)
  seqs.append(list(r.goal_events))
 return metrics(seqs)

def dist(a,b):
 keys=["p_next_goal_exists","p_next_goal_same_team_given_exists","p_any_next_goal_within15",
       "p_same_team_scores_next_within15","p_opponent_scores_next_within15","p_two_or_more_additional_goals"]
 return sum((a[k]-b[k])**2 for k in keys)

def main():
 emp=metrics(empirical_sequences());on=simulated(True);off=simulated(False)
 out={"mode":"conditional post-goal cascade validation","empirical":emp,"cascade_on":on,"cascade_off":off,
      "squared_error_on":dist(emp,on),"squared_error_off":dist(emp,off),
      "cascade_improves_conditional_fit":dist(emp,on)<dist(emp,off),
      "decision_rule":"Keep Cascade only if it improves conditional post-goal sequence fit, not merely aggregate score tails. Goal-event mismatches are excluded."}
 OUT.mkdir(parents=True,exist_ok=True)
 (OUT/"event_engine_cascade_validation.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
 print(json.dumps(out,indent=2))
if __name__=="__main__":main()
