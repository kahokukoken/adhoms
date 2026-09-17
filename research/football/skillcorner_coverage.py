#!/usr/bin/env python3
from __future__ import annotations
import json, requests
from collections import Counter, defaultdict
from pathlib import Path

URL='https://raw.githubusercontent.com/SkillCorner/opendata/master/data/matches.json'
OUT=Path('research/football/output')
UA={'User-Agent':'Mozilla/5.0 ADHOMS-Football-Research/2.2'}

def main():
    r=requests.get(URL,timeout=90,headers=UA);r.raise_for_status();matches=r.json()
    comps=defaultdict(list);teams=Counter();pairs=Counter()
    for m in matches:
        key=(m.get('competition_id'),m.get('season_id'),m.get('competition_edition_id'))
        comps[key].append(m)
        h=(m.get('home_team') or {}).get('short_name');a=(m.get('away_team') or {}).get('short_name')
        if h:teams[h]+=1
        if a:teams[a]+=1
        if h and a:pairs[tuple(sorted((h,a)))]+=1
    coverage=[]
    for key,ms in comps.items():
        local=Counter()
        for m in ms:
            for side in ('home_team','away_team'):
                n=(m.get(side) or {}).get('short_name')
                if n:local[n]+=1
        dates=sorted(m.get('date_time','') for m in ms)
        coverage.append({'competition_id':key[0],'season_id':key[1],'competition_edition_id':key[2],
                         'matches':len(ms),'start':dates[0] if dates else None,'end':dates[-1] if dates else None,
                         'teams':len(local),'teams_ge_3_matches':sum(v>=3 for v in local.values()),
                         'max_team_matches':max(local.values(),default=0),
                         'top_team_recurrence':local.most_common(10)})
    coverage.sort(key=lambda x:x['matches'],reverse=True)
    summary={'matches_total':len(matches),'competition_seasons':len(coverage),'coverage':coverage,
             'top_team_recurrence_global':teams.most_common(30),
             'repeated_pairs':[(list(k),v) for k,v in pairs.most_common(20) if v>1],
             'sequential_prediction_candidates':[x for x in coverage if x['matches']>=20 and x['teams_ge_3_matches']>=6]}
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'skillcorner_coverage.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    print(json.dumps(summary,indent=2))
if __name__=='__main__':main()
