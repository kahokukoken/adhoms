#!/usr/bin/env python3
from __future__ import annotations
import json, requests
from collections import defaultdict
from pathlib import Path

OUT=Path('research/football/output')
UA={'User-Agent':'Mozilla/5.0 ADHOMS-Football-Research/2.1'}
RAW='https://raw.githubusercontent.com/hudl/open-data/master/data'
API='https://api.github.com/repos/hudl/open-data/contents/data/three-sixty?ref=master'

def get_json(url):
    r=requests.get(url,timeout=120,headers=UA); r.raise_for_status(); return r.json()

def main():
    comps=get_json(f'{RAW}/competitions.json')
    listing=get_json(API)
    ids={int(x['name'].split('.')[0]) for x in listing if x.get('type')=='file' and x.get('name','').endswith('.json')}
    reports=[]
    for c in comps:
        if c.get('match_available_360') is None: continue
        cid=int(c['competition_id']); sid=int(c['season_id'])
        try: matches=get_json(f'{RAW}/matches/{cid}/{sid}.json')
        except Exception: continue
        mids={int(m['match_id']) for m in matches}
        covered=mids & ids
        reports.append({
            'competition_id':cid,'season_id':sid,'country':c.get('country_name'),
            'competition':c.get('competition_name'),'season':c.get('season_name'),
            'matches_total':len(mids),'matches_360':len(covered),
            'coverage_pct':round(100*len(covered)/max(1,len(mids)),1),
            'match_ids_360':sorted(covered)
        })
    reports.sort(key=lambda x:(x['matches_360'],x['coverage_pct']),reverse=True)
    summary={'three_sixty_files':len(ids),'competitions_with_360_flag':len(reports),'coverage':reports,
             'market_validation_candidates':[r for r in reports if r['matches_360']>=80],
             'geometry_only_candidates':[r for r in reports if 20<=r['matches_360']<80]}
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'statsbomb360_coverage.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    print(json.dumps(summary,indent=2))
if __name__=='__main__': main()
