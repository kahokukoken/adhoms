import statistics
from event_engine import TeamPolicy, simulate_match

def test_deterministic_seed():
    a=simulate_match(TeamPolicy(),TeamPolicy(),seed=7)
    b=simulate_match(TeamPolicy(),TeamPolicy(),seed=7)
    assert a==b

def test_state_jump_ablation_changes_distribution():
    on=[];off=[]
    for s in range(200):
        p1=TeamPolicy(disruption=.95,access=.8)
        p2=TeamPolicy(suppression=.45,recovery=.45)
        on.append(simulate_match(p1,p2,seed=s,state_jumps_enabled=True).home_goals)
        off.append(simulate_match(p1,p2,seed=s,state_jumps_enabled=False).home_goals)
    assert statistics.mean(on) > statistics.mean(off)

def test_adaptation_generates_policy_changes():
    n=0
    for s in range(100):
        r=simulate_match(TeamPolicy(adaptation=.95,repertoire=.95),TeamPolicy(),seed=s)
        n += r.home_adaptations
    assert n>0

def test_cascade_increases_tail_risk():
    on=[];off=[]
    for s in range(400):
        h=TeamPolicy(disruption=.85,access=.75)
        a=TeamPolicy(recovery=.35,suppression=.45)
        on.append(simulate_match(h,a,seed=s,cascade_enabled=True).home_goals)
        off.append(simulate_match(h,a,seed=s,cascade_enabled=False).home_goals)
    assert sum(x>=3 for x in on) >= sum(x>=3 for x in off)
