#!/usr/bin/env python3
from __future__ import annotations

import io, json, math, re, unicodedata
from collections import defaultdict
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

SEASONS = {
    "2022-23": {"avail":"2022", "fpl":"2022-23", "fd":"2223"},
    "2023-24": {"avail":"2023", "fpl":"2023-24", "fd":"2324"},
    "2024-25": {"avail":"2024", "fpl":"2024-25", "fd":"2425"},
}
OUT=Path("research/football/output")
UA={"User-Agent":"Mozilla/5.0 ADHOMS-Football-Research/1.6"}

ALIASES={
    "manchesterunited":"manunited", "manutd":"manunited",
    "manchestercity":"mancity", "mancity":"mancity",
    "tottenhamhotspur":"tottenham", "spurs":"tottenham",
    "wolverhamptonwanderers":"wolves", "wolverhampton":"wolves",
    "brightonandhovealbion":"brighton", "brightonhovealbion":"brighton",
    "nottinghamforest":"nottmforest", "nottmforest":"nottmforest",
    "sheffieldunited":"sheffieldutd", "sheffutd":"sheffieldutd",
    "westhamunited":"westham", "newcastleunited":"newcastle",
    "leicestercity":"leicester", "ipswichtown":"ipswich",
    "afcbournemouth":"bournemouth", "bournemouth":"bournemouth",
    "arsenalfc":"arsenal", "chelseafc":"chelsea", "liverpoolfc":"liverpool",
    "evertonfc":"everton", "fulhamfc":"fulham", "brentfordfc":"brentford",
    "southamptonfc":"southampton", "astonvilla":"astonvilla",
    "crystalpalace":"crystalpalace", "lutontown":"luton",
    "burnleyfc":"burnley", "leedsunited":"leeds",
}

ROW_COLUMNS=[
    "season","date","home","away","y","openH","openD","openA","closeH","closeD","closeA",
    "absence_mass_diff","injury_mass_diff","suspension_mass_diff","attack_loss_diff","defense_loss_diff","absence_count_diff"
]

def canon(x):
    s=unicodedata.normalize("NFKD",str(x)).encode("ascii","ignore").decode().lower()
    s=re.sub(r"[^a-z0-9]","",s)
    return ALIASES.get(s,s)

def get_csv(url):
    r=requests.get(url,timeout=60,headers=UA); r.raise_for_status()
    return pd.read_csv(io.StringIO(r.content.decode("utf-8-sig",errors="replace")),on_bad_lines="skip")

def get_json(url):
    r=requests.get(url,timeout=60,headers=UA); r.raise_for_status(); return r.json()

def norm_odds(vals):
    q=1/np.asarray(vals,dtype=float); return q/q.sum()

def brier(p,y):
    t=np.zeros(3); t[int(y)]=1
    return float(np.sum((np.asarray(p)-t)**2))

def logloss(p,y): return -math.log(max(1e-12,float(p[int(y)])))

def load_fpl(meta):
    base=f"https://raw.githubusercontent.com/vaastav/Fantasy-Premier-League/master/data/{meta['fpl']}"
    fixtures=get_csv(base+"/fixtures.csv")
    teams=get_csv(base+"/teams.csv")
    fixtures=fixtures.sort_values("kickoff_time").drop_duplicates("id",keep="last")
    tmap={int(r.id):canon(r.name) for _,r in teams.iterrows()}
    fixtures=fixtures[fixtures["event"].notna()].copy()
    fixtures["event"]=fixtures["event"].astype(int)
    fixtures["home_key"]=fixtures["team_h"].astype(int).map(tmap)
    fixtures["away_key"]=fixtures["team_a"].astype(int).map(tmap)
    fixtures["kickoff"]=pd.to_datetime(fixtures["kickoff_time"],utc=True,errors="coerce")
    return fixtures.dropna(subset=["kickoff","home_key","away_key"])

def availability_team_rounds(meta):
    api=f"https://api.github.com/repos/withqwerty/availability-data/contents/raw/GB1/{meta['avail']}"
    listing=get_json(api)
    out={}
    for entry in listing:
        if entry.get("type")!="file" or not entry["name"].endswith(".json"): continue
        data=get_json(entry["download_url"])
        team=canon(data.get("club",""))
        comp=next((c for c in data.get("competitions",[]) if c.get("code")=="GB1"),None)
        if not comp: continue
        history=defaultdict(list); positions={}; rounds=defaultdict(list)
        for pl in comp.get("players",[]):
            pid=str(pl.get("tmId",pl.get("name")))
            positions[pid]=str(pl.get("position",""))
            for m in pl.get("matches",[]):
                try: rnd=int(m.get("round"))
                except Exception: continue
                rounds[rnd].append((pid,str(m.get("status",""))))
        for rnd in sorted(rounds):
            injured_mass=suspended_mass=national_mass=0.0
            injured_n=suspended_n=0
            starter_loss=attack_loss=defense_loss=0.0
            known_players=0
            for pid,status in rounds[rnd]:
                prior=history[pid]
                eligible=[x for x in prior if x not in {"not_at_club","not_included"}]
                start_rate=(sum(x=="starting" for x in eligible)/len(eligible)) if eligible else 0.0
                appearance_rate=(sum(x in {"starting","sub_in","bench"} for x in eligible)/len(eligible)) if eligible else 0.0
                importance=0.75*start_rate+0.25*appearance_rate
                pos=positions.get(pid,"").upper()
                if status in {"injured","absent","suspended","national_team"}:
                    known_players += 1
                    if status in {"injured","absent"}:
                        injured_n += 1; injured_mass += importance
                    elif status=="suspended":
                        suspended_n += 1; suspended_mass += importance
                    elif status=="national_team": national_mass += importance
                    starter_loss += importance
                    if any(x in pos for x in ["FW","CF","LW","RW","AM","ST"]): attack_loss += importance
                    if any(x in pos for x in ["CB","LB","RB","DM","GK"]): defense_loss += importance
            out[(team,rnd)]={
                "injured_n":injured_n,"suspended_n":suspended_n,
                "injured_mass":injured_mass,"suspended_mass":suspended_mass,
                "national_mass":national_mass,"starter_loss":starter_loss,
                "attack_loss":attack_loss,"defense_loss":defense_loss,
                "absence_events":known_players,
            }
            for pid,status in rounds[rnd]: history[pid].append(status)
    return out

def load_fd(meta):
    url=f"https://www.football-data.co.uk/mmz4281/{meta['fd']}/E0.csv"
    df=get_csv(url)
    need=["Date","HomeTeam","AwayTeam","FTR","AvgH","AvgD","AvgA","AvgCH","AvgCD","AvgCA"]
    df=df.dropna(subset=need).copy()
    df["date"]=pd.to_datetime(df.Date,dayfirst=True,utc=True,errors="coerce")
    df["home_key"]=df.HomeTeam.map(canon); df["away_key"]=df.AwayTeam.map(canon)
    return df.dropna(subset=["date"])

def merge_season(label,meta):
    fpl=load_fpl(meta); av=availability_team_rounds(meta); fd=load_fd(meta)
    rows=[]; unmatched=0; unmatched_examples=[]
    for _,r in fpl.iterrows():
        rnd=int(r.event); hk,ak=r.home_key,r.away_key
        hfeat=av.get((hk,rnd),{}); afeat=av.get((ak,rnd),{})
        cand=fd[(fd.home_key==hk)&(fd.away_key==ak)].copy()
        if cand.empty:
            unmatched+=1
            if len(unmatched_examples)<8: unmatched_examples.append({"home":hk,"away":ak,"reason":"pair"})
            continue
        cand["dd"]=(cand.date-r.kickoff).abs().dt.total_seconds()
        m=cand.sort_values("dd").iloc[0]
        if float(m.dd)>7*86400:
            unmatched+=1
            if len(unmatched_examples)<8: unmatched_examples.append({"home":hk,"away":ak,"reason":"date","days":float(m.dd)/86400})
            continue
        op=norm_odds([m.AvgH,m.AvgD,m.AvgA]); cp=norm_odds([m.AvgCH,m.AvgCD,m.AvgCA])
        def v(d,k): return float(d.get(k,0.0))
        rows.append({
            "season":label,"date":m.date,"home":m.HomeTeam,"away":m.AwayTeam,
            "y":{"H":0,"D":1,"A":2}[m.FTR],
            "openH":op[0],"openD":op[1],"openA":op[2],
            "closeH":cp[0],"closeD":cp[1],"closeA":cp[2],
            "absence_mass_diff":v(afeat,"starter_loss")-v(hfeat,"starter_loss"),
            "injury_mass_diff":v(afeat,"injured_mass")-v(hfeat,"injured_mass"),
            "suspension_mass_diff":v(afeat,"suspended_mass")-v(hfeat,"suspended_mass"),
            "attack_loss_diff":v(afeat,"attack_loss")-v(hfeat,"attack_loss"),
            "defense_loss_diff":v(afeat,"defense_loss")-v(hfeat,"defense_loss"),
            "absence_count_diff":v(afeat,"absence_events")-v(hfeat,"absence_events"),
        })
    return pd.DataFrame(rows,columns=ROW_COLUMNS),unmatched,unmatched_examples

FEATURES=["absence_mass_diff","injury_mass_diff","suspension_mass_diff","attack_loss_diff","defense_loss_diff","absence_count_diff"]

def eval_variant(train,test,features):
    base=["openH","openD","openA"]
    model=make_pipeline(StandardScaler(),LogisticRegression(C=0.35,max_iter=3000))
    model.fit(train[base+features],train.y)
    p=model.predict_proba(test[base+features])
    aligned=np.zeros((len(test),3))
    for j,c in enumerate(model[-1].classes_): aligned[:,int(c)]=p[:,j]
    return aligned

def metrics(p,y):
    return {"brier":float(np.mean([brier(pp,yy) for pp,yy in zip(p,y)])),
            "logloss":float(np.mean([logloss(pp,yy) for pp,yy in zip(p,y)]))}

def main():
    parts=[]; unmatched={}; diagnostics={}
    for label,meta in SEASONS.items():
        d,u,ex=merge_season(label,meta); parts.append(d); unmatched[label]=u
        diagnostics[label]={"matched":int(len(d)),"unmatched":int(u),"examples":ex}
    allrows=pd.concat(parts,ignore_index=True)
    if allrows.empty:
        raise RuntimeError("No fixtures matched across sources: "+json.dumps(diagnostics))
    reports=[]; labels=list(SEASONS)
    for i,label in enumerate(labels[1:],start=1):
        train=allrows[allrows["season"].isin(labels[:i])]
        test=allrows[allrows["season"]==label]
        if train.empty or test.empty:
            raise RuntimeError("Insufficient matched data: "+json.dumps(diagnostics))
        y=test.y.to_numpy(int)
        openp=test[["openH","openD","openA"]].to_numpy(float)
        closep=test[["closeH","closeD","closeA"]].to_numpy(float)
        variants={}
        for name,fs in {
            "absence_mass":["absence_mass_diff"],
            "injury_mass":["injury_mass_diff"],
            "suspension_mass":["suspension_mass_diff"],
            "attack_defense_loss":["attack_loss_diff","defense_loss_diff"],
            "all_availability":FEATURES,
        }.items():
            p=eval_variant(train,test,fs); mm=metrics(p,y); om=metrics(openp,y); cm=metrics(closep,y)
            variants[name]={**mm,"brier_delta_vs_open":mm["brier"]-om["brier"],"logloss_delta_vs_open":mm["logloss"]-om["logloss"],
                            "brier_delta_vs_close":mm["brier"]-cm["brier"],"logloss_delta_vs_close":mm["logloss"]-cm["logloss"]}
        reports.append({"season":label,"n":int(len(test)),"opening":metrics(openp,y),"closing":metrics(closep,y),"variants":variants})
    acceptance={}
    for name in reports[0]["variants"]:
        ds=[r["variants"][name] for r in reports]
        acceptance[name]={
            "beats_open_both_metrics_windows":sum(d["brier_delta_vs_open"]<0 and d["logloss_delta_vs_open"]<0 for d in ds),
            "beats_close_both_metrics_windows":sum(d["brier_delta_vs_close"]<0 and d["logloss_delta_vs_close"]<0 for d in ds),
            "mean_brier_delta_vs_open":float(np.mean([d["brier_delta_vs_open"] for d in ds])),
            "mean_logloss_delta_vs_open":float(np.mean([d["logloss_delta_vs_open"] for d in ds])),
        }
    summary={
        "mode":"availability information upper-bound experiment",
        "critical_warning":"Historical availability statuses are retrospective labels and may not have been known at opening time. This experiment tests causal signal potential, not executable betting edge.",
        "importance_rule":"player importance is computed only from statuses in earlier rounds; current-round status supplies absence truth only",
        "round_mapping":"availability round -> FPL official event/gameweek -> Football-Data team-pair/date match",
        "rows_by_season":{k:int((allrows["season"]==k).sum()) for k in labels},
        "unmatched_fpl_fixtures":unmatched,"diagnostics":diagnostics,
        "features":FEATURES,"seasons":reports,"acceptance":acceptance,
        "next_gate":"If availability fails even against opening market as an upper bound, deprioritize injury/absence features. If it helps repeatedly, obtain timestamped pre-kickoff injury announcements before any executable-edge claim."
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"availability_upper_bound_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print(json.dumps(summary,indent=2))

if __name__=="__main__": main()
