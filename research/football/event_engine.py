from __future__ import annotations
from dataclasses import dataclass, replace
from enum import Enum
import math, random
from typing import Dict, Tuple

class State(str, Enum):
    RESTART="restart"
    BUILDUP="buildup"
    PRESS_ESCAPE="press_escape"
    MIDDLE="middle_progression"
    FINAL_THIRD="final_third_entry"
    DANGEROUS="dangerous_reception"
    SHOT="shot"
    TURNOVER="turnover"
    COUNTER="counter"
    SET_PIECE="set_piece"

@dataclass(frozen=True)
class TeamPolicy:
    structure: float=.75
    adaptation: float=.65
    repertoire: float=.65
    execution: float=.75
    disruption: float=.55
    access: float=.60
    suppression: float=.60
    recovery: float=.65
    risk: float=.50
    misdiagnosis: float=.15

@dataclass
class TeamRuntime:
    policy: TeamPolicy
    goals: int=0
    red: int=0
    fatigue: float=0.0
    observed_failures: int=0
    adaptation_events: int=0
    cascade_damage: float=0.0
    last_adapt_window: int=-1

@dataclass
class MatchResult:
    home_goals:int
    away_goals:int
    home_adaptations:int
    away_adaptations:int
    state_jumps:int
    cascades:int
    possessions:int

BASE = {
    State.RESTART:{State.BUILDUP:.78,State.SET_PIECE:.04,State.TURNOVER:.18},
    State.BUILDUP:{State.PRESS_ESCAPE:.34,State.MIDDLE:.24,State.TURNOVER:.42},
    State.PRESS_ESCAPE:{State.MIDDLE:.46,State.COUNTER:.12,State.TURNOVER:.42},
    State.MIDDLE:{State.FINAL_THIRD:.44,State.TURNOVER:.42,State.SET_PIECE:.14},
    State.FINAL_THIRD:{State.DANGEROUS:.30,State.SHOT:.06,State.TURNOVER:.50,State.SET_PIECE:.14},
    State.DANGEROUS:{State.SHOT:.18,State.TURNOVER:.52,State.SET_PIECE:.30},
    State.COUNTER:{State.FINAL_THIRD:.36,State.DANGEROUS:.28,State.SHOT:.10,State.TURNOVER:.26},
    State.SET_PIECE:{State.SHOT:.06,State.TURNOVER:.58,State.DANGEROUS:.36},
}

def _clamp(x,a=.02,b=.96): return max(a,min(b,x))

def _norm(d):
    s=sum(max(0,v) for v in d.values())
    return {k:max(0,v)/s for k,v in d.items()}

def transition_probs(state, atk:TeamRuntime, dfn:TeamRuntime, minute:int):
    if state not in BASE: return {}
    p=dict(BASE[state])
    A=atk.policy; D=dfn.policy
    attack_edge=.16*(A.execution-.5)+.13*(A.access-.5)+.10*(A.structure-.5)
    suppress=.17*(D.suppression-.5)+.11*(D.structure-.5)+.08*(D.recovery-.5)
    fatigue=(atk.fatigue-dfn.fatigue)*.10
    score_risk=.0
    if minute>=55:
        if atk.goals<dfn.goals: score_risk=.08*A.risk
        elif atk.goals>dfn.goals: score_risk=-.05*(1-A.risk)
    for k in list(p):
        if k in (State.MIDDLE,State.FINAL_THIRD,State.DANGEROUS,State.SHOT):
            p[k]*=math.exp(attack_edge-suppress-fatigue+score_risk)
        elif k==State.TURNOVER:
            p[k]*=math.exp(-attack_edge+suppress+fatigue+abs(score_risk)*.35)
        elif k==State.COUNTER:
            p[k]*=math.exp(.4*score_risk)
    return _norm(p)

def state_jump_prob(atk:TeamRuntime, dfn:TeamRuntime):
    A=atk.policy;D=dfn.policy
    # Rare nonlinear bypass of the normal progression chain.
    return _clamp(.002 + .025*A.disruption + .012*A.access - .018*D.suppression - .010*D.recovery, .001, .05)

def shot_goal_prob(atk:TeamRuntime, dfn:TeamRuntime, source:State):
    A=atk.policy; D=dfn.policy
    q=.085 + .045*A.execution + .035*A.disruption + .025*A.access - .05*D.recovery - .03*D.suppression
    if source in (State.DANGEROUS,State.COUNTER): q += .035
    q += .025*min(.5, dfn.cascade_damage)
    return _clamp(q,.025,.28)

def maybe_adapt(team:TeamRuntime, opp:TeamRuntime, minute:int, rng:random.Random, enabled=True):
    if not enabled or minute < 15:
        return
    window = minute // 15
    if window <= team.last_adapt_window:
        return
    team.last_adapt_window = window
    P=team.policy
    evidence = team.observed_failures + max(0, opp.goals-team.goals)*2 + team.cascade_damage*3
    # Meaningful tactical adaptations should be sparse, not triggered at every checkpoint.
    trigger=_clamp(.02 + .025*evidence + .08*P.adaptation, .02,.50)
    if rng.random()>trigger: return
    correct = rng.random() > P.misdiagnosis
    # When adaptation happens, it changes policy enough to alter downstream
    # transition probabilities rather than acting as a tiny scalar bonus.
    mag=.11*P.repertoire*P.adaptation
    if correct:
        team.policy=replace(P, suppression=_clamp(P.suppression+mag),
                              access=_clamp(P.access+mag*.80),
                              risk=_clamp(P.risk + (.07 if team.goals<opp.goals else -.035)))
    else:
        team.policy=replace(P, suppression=_clamp(P.suppression-mag*.70),
                              access=_clamp(P.access-mag*.35),
                              risk=_clamp(P.risk+.075))
    team.adaptation_events+=1
    team.observed_failures=max(0,team.observed_failures-1)

def simulate_match(home_policy:TeamPolicy, away_policy:TeamPolicy, seed=1,
                   adaptation_enabled=True, state_jumps_enabled=True,
                   cascade_enabled=True, possessions=110):
    rng=random.Random(seed); H=TeamRuntime(home_policy); A=TeamRuntime(away_policy)
    jumps=casc=0
    for poss in range(possessions):
        minute=min(94, int(poss/possessions*95))
        atk,dfn=(H,A) if poss%2==0 else (A,H)
        atk.fatigue=min(.35, minute/95*.22)
        dfn.fatigue=min(.35, minute/95*.22)
        maybe_adapt(H,A,minute,rng,adaptation_enabled)
        maybe_adapt(A,H,minute,rng,adaptation_enabled)
        state=State.RESTART; shot_source=State.RESTART; steps=0
        while steps<8:
            steps+=1
            if state_jumps_enabled and state not in (State.SHOT,State.TURNOVER) and rng.random()<state_jump_prob(atk,dfn):
                shot_source=state
                state=rng.choice([State.FINAL_THIRD,State.DANGEROUS,State.SHOT]); jumps+=1
            if state==State.SHOT:
                if rng.random()<shot_goal_prob(atk,dfn,shot_source):
                    atk.goals+=1
                    if cascade_enabled:
                        dmg=.10 + .18*atk.policy.disruption + .12*(1-dfn.policy.recovery)
                        dfn.cascade_damage=min(1.0,dfn.cascade_damage+dmg);casc+=1
                else:
                    dfn.cascade_damage=max(0,dfn.cascade_damage-.025*dfn.policy.recovery)
                break
            if state==State.TURNOVER:
                atk.observed_failures+=1
                break
            probs=transition_probs(state,atk,dfn,minute)
            if not probs: break
            x=rng.random();c=0
            prev=state
            for ns,p in probs.items():
                c+=p
                if x<=c:
                    state=ns
                    if ns==State.SHOT:
                        shot_source=prev
                    break
    return MatchResult(H.goals,A.goals,H.adaptation_events,A.adaptation_events,jumps,casc,possessions)
