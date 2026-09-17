#!/usr/bin/env python3
from __future__ import annotations
import io,json,math,re,unicodedata
from collections import defaultdict,deque
from pathlib import Path
import numpy as np,pandas as pd,requests
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

OUT=Path("research/football/output")
UA={"User-Agent":"Mozilla/5.0 ADHOMS-Football-Research/2.5"}
SB="https://raw.githubusercontent.com/statsbomb/open-data/master/data"
COMPS=f"{SB}/competitions.json"
TOURS={
 "euro2020":{"season_name":"2020","footy_id":5635},
 "euro2024":{"season_name":"2024","footy_id":11084},
}
ALIASES={"turkiye":"turkey","czechrepublic":"czechia","korearepublic":"southkorea","iriran":"iran","usa":"unitedstates"}

def canon(x):
 s=unicodedata.normalize("NFKD",str(x)).encode("ascii","ignore").decode().lower()
 s=re.sub(r"[^a-z0-9]","",s)
 return ALIASES.get(s,s)

def gj(url):
 r=requests.get(url,timeout=120,headers=UA);r.raise_for_status();return r.json()
def gcsv(url):
 r=requests.get(url,timeout=120,headers=UA);r.raise_for_status();return pd.read_csv(io.StringIO(r.text))
def dist(a,b): return math.hypot(float(a[0])-float(b[0]),float(a[1])-float(b[1]))
def norm_odds(vals):
 q=1/np.asarray(vals,float);return q/q.sum()

def season_ids(label):
 comps=gj(COMPS)
 cand=[x for x in comps if "Euro" in str(x.get("competition_name","")) and str(x.get("season_name"))==label]
 if not cand: raise RuntimeError(f"No StatsBomb Euro season {label}")
 x=cand[0];return int(x["competition_id"]),int(x["season_id"]),x["competition_name"]

def footy(comp_id):
 d=gcsv(f"https://footystats.org/c-dl.php?type=matches&comp={comp_id}")
 def pick(*names):
  for n in names:
   if n in d.columns:return n
  return None
 hc=pick("home_team_name","home_name","home_team")
 ac=pick("away_team_name","away_name","away_team")
 oh=pick("odds_ft_home_team_win","odds_home_win","odds_home")
 od=pick("odds_ft_draw","odds_draw")
 oa=pick("odds_ft_away_team_win","odds_away_win","odds_away")
 hg=pick("home_team_goal_count","homeGoals","home_score")
 ag=pick("away_team_goal_count","awayGoals","away_score")
 dc=pick("date_GMT","date","timestamp","date_unix")
 missing=[k for k,v in {"home":hc,"away":ac,"oh":oh,"od":od,"oa":oa,"hg":hg,"ag":ag}.items() if v is None]
 if missing: raise RuntimeError(f"FootyStats schema missing {missing}; cols={list(d.columns)[:80]}")
 rows=[]
 for _,r in d.iterrows():
  try:
   odds=[float(r[oh]),float(r[od]),float(r[oa])]
   if min(odds)<=1: continue
   p=norm_odds(odds)
   h=float(r[hg]);a=float(r[ag]);y=0 if h>a else (2 if a>h else 1)
   dt=pd.to_datetime(r[dc],utc=True,errors="coerce") if dc else pd.NaT
   rows.append({"date":None if pd.isna(dt) else dt.date(),"home_key":canon(r[hc]),"away_key":canon(r[ac]),"y":y,
                "mH":p[0],"mD":p[1],"mA":p[2]})
  except Exception: pass
 return pd.DataFrame(rows),list(d.columns)

def profile(events,frames):
 emap={str(e.get("id")):e for e in events};acc=defaultdict(lambda:defaultdict(list))
 for fr in frames:
  e=emap.get(str(fr.get("event_uuid")))
  if not e: continue
  team=canon((e.get("team") or {}).get("name"));loc=e.get("location");ff=fr.get("freeze_frame") or []
  if not team or not loc: continue
  mates=[p["location"] for p in ff if p.get("teammate") and p.get("location")]
  opp=[p["location"] for p in ff if not p.get("teammate") and p.get("location")]
  if len(opp)<2:continue
  a=acc[team];near=min(dist(loc,o) for o in opp)
  a["nearest_opp"].append(near);a["opp10"].append(sum(dist(loc,o)<=10 for o in opp));a["opp20"].append(sum(dist(loc,o)<=20 for o in opp))
  a["local_superiority"].append(sum(dist(loc,m)<=15 for m in mates)-sum(dist(loc,o)<=15 for o in opp))
  bx,by=float(loc[0]),float(loc[1])
  a["forward_corridor"].append(sum(float(o[0])>bx and abs(float(o[1])-by)<=12 for o in opp))
  a["forward_options"].append(sum(float(m[0])>bx+5 for m in mates))
  if len(mates)>=2:
   a["mate_x_spread"].append(float(np.std([m[0] for m in mates])));a["mate_y_spread"].append(float(np.std([m[1] for m in mates])))
  if bx>=80:
   a["deep_nearest_opp"].append(near);a["deep_corridor"].append(sum(float(o[0])>bx and abs(float(o[1])-by)<=12 for o in opp))
 keys=["nearest_opp","opp10","opp20","local_superiority","forward_corridor","forward_options","mate_x_spread","mate_y_spread","deep_nearest_opp","deep_corridor"]
 return {t:{k:(float(np.mean(d[k])) if d[k] else 0.0) for k in keys} for t,d in acc.items()}

def meanp(h):
 if not h:return None
 return {k:float(np.mean([x[k] for x in h])) for k in h[0]}

GROUPS={
 "pressure":["nearest_opp_diff","opp10_diff","opp20_diff"],
 "local_superiority":["local_superiority_diff","forward_options_diff","forward_corridor_diff"],
 "deep_access":["deep_nearest_opp_diff","deep_corridor_diff"],
 "spatial_structure":["mate_x_spread_diff","mate_y_spread_diff"],
 "all_geometry":["nearest_opp_diff","opp10_diff","opp20_diff","local_superiority_diff","forward_options_diff","forward_corridor_diff","deep_nearest_opp_diff","deep_corridor_diff","mate_x_spread_diff","mate_y_spread_diff"]
}

def metrics(p,y):
 b=[];ll=[]
 for pp,yy in zip(p,y):
  t=np.zeros(3);t[int(yy)]=1;b.append(np.sum((pp-t)**2));ll.append(-math.log(max(1e-12,float(pp[int(yy)]))))
 return {"brier":float(np.mean(b)),"logloss":float(np.mean(ll))}

def pred(tr,te,fs):
 cols=["mH","mD","mA"]+fs
 m=make_pipeline(StandardScaler(),LogisticRegression(C=.05,max_iter=5000))
 m.fit(tr[cols],tr.y);raw=m.predict_proba(te[cols]);p=np.zeros((len(te),3))
 for j,c in enumerate(m[-1].classes_):p[:,int(c)]=raw[:,j]
 return p

def build(name,cfg):
 cid,sid,cname=season_ids(cfg["season_name"])
 matches=sorted(gj(f"{SB}/matches/{cid}/{sid}.json"),key=lambda m:(m["match_date"],m.get("kick_off","")))
 od,cols=footy(cfg["footy_id"]);hist=defaultdict(lambda:deque(maxlen=3));rows=[];errs=[]
 for m in matches:
  mid=int(m["match_id"]);hk=canon(m["home_team"]["home_team_name"]);ak=canon(m["away_team"]["away_team_name"]);dt=pd.to_datetime(m["match_date"]).date()
  hp,ap=meanp(hist[hk]),meanp(hist[ak])
  cand=od[((od.home_key==hk)&(od.away_key==ak))|((od.home_key==ak)&(od.away_key==hk))].copy()
  if hp is not None and ap is not None and not cand.empty:
   if cand.date.notna().any():
    cand["dd"]=cand.date.map(lambda d:999 if d is None else abs((d-dt).days));cand=cand.sort_values("dd")
   o=cand.iloc[0]
   if ("dd" not in cand.columns) or int(o.dd)<=2:
    mp=[o.mH,o.mD,o.mA] if o.home_key==hk else [o.mA,o.mD,o.mH]
    y=int(o.y if o.home_key==hk else (2 if o.y==0 else (0 if o.y==2 else 1)))
    feat={}
    for k in hp:feat[k+"_diff"]=hp[k]-ap[k]
    rows.append({"date":str(dt),"mid":mid,"home":hk,"away":ak,"y":y,"mH":mp[0],"mD":mp[1],"mA":mp[2],**feat})
  try:
   pr=profile(gj(f"{SB}/events/{mid}.json"),gj(f"{SB}/three-sixty/{mid}.json"))
   if hk in pr:hist[hk].append(pr[hk])
   if ak in pr:hist[ak].append(pr[ak])
  except Exception as e:errs.append({"mid":mid,"error":str(e)})
 return pd.DataFrame(rows).sort_values("date").reset_index(drop=True),{"competition":cname,"competition_id":cid,"season_id":sid,"matches":len(matches),"odds_rows":len(od),"footy_cols":cols[:30],"errors":errs}

def evaluate(d):
 if len(d)<18:return {"decision":"insufficient sample","n":len(d)}
 c1=max(10,int(len(d)*.45));c2=c1+max(4,(len(d)-c1)//2);windows=[]
 for a,b in [(c1,c2),(c2,len(d))]:
  tr=d.iloc[:a];te=d.iloc[a:b];y=te.y.to_numpy(int);mp=te[["mH","mD","mA"]].to_numpy(float);mm=metrics(mp,y);vs={}
  for n,fs in GROUPS.items():
   try:
    vm=metrics(pred(tr,te,fs),y);vs[n]={**vm,"brier_delta":vm["brier"]-mm["brier"],"logloss_delta":vm["logloss"]-mm["logloss"]}
   except Exception as e:vs[n]={"error":str(e)}
  windows.append({"train_n":len(tr),"test_n":len(te),"market":mm,"variants":vs})
 acc={}
 for n in GROUPS:
  ds=[w["variants"][n] for w in windows if "brier_delta" in w["variants"][n]]
  if len(ds)==2:acc[n]={"both_windows_better":all(x["brier_delta"]<0 and x["logloss_delta"]<0 for x in ds),
                         "mean_brier_delta":float(np.mean([x["brier_delta"] for x in ds])),
                         "mean_logloss_delta":float(np.mean([x["logloss_delta"] for x in ds]))}
 return {"windows":windows,"acceptance":acc}

def main():
 out={"mode":"External replication of WC2022 prior-match 360 geometry vs pre-match 1X2 market",
      "timing_rule":"target-match events/360 excluded; profiles use up to 3 prior tournament matches only",
      "market":"FootyStats pre-match 1X2 odds, normalized for overround"}
 for name,cfg in TOURS.items():
  try:
   d,diag=build(name,cfg);out[name]={"diagnostics":diag,"eligible_rows":len(d),**evaluate(d)}
  except Exception as e:out[name]={"error":str(e)}
 OUT.mkdir(parents=True,exist_ok=True)
 (OUT/"euro_360_market_replication.json").write_text(json.dumps(out,indent=2),encoding="utf-8")
 print(json.dumps(out,indent=2))
if __name__=="__main__":main()
