"""One-shot acquisition and baseline report. Not an automatic betting service."""
from __future__ import annotations
import argparse
import gzip
import hashlib
import io
import json
import os
import sys
import time
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo
from baseline import POLICIES, bankroll, evaluate_day, turnover_summary, validate_dates

SOURCE = 'https://www1.mbrace.or.jp/od2'


def acquire(day: date, kind: str, cache: Path) -> tuple[str,dict]:
    """Retrieve public daily archive; validate LZH signature and decode strictly."""
    import lhafile
    name=f'{kind.lower()}{day:%y%m%d}.lzh'
    url=f'{SOURCE}/{kind}/{day:%Y%m}/{name}'
    target=cache/name
    retrieval=datetime.now(ZoneInfo('UTC')).isoformat()
    if target.exists():
        data=target.read_bytes()
    else:
        last=None
        for attempt in range(3):
            try:
                req=urllib.request.Request(url,headers={'User-Agent':'ADHOMS-public-data-research/0.1'})
                with urllib.request.urlopen(req,timeout=25) as response:
                    data=response.read(2_000_001)
                if len(data)>2_000_000 or len(data)<30 or data[2:5] != b'-lh':
                    raise ValueError(f'Unexpected LZH response: {url}, {len(data)} bytes')
                target.write_bytes(data)
                break
            except Exception as exc:
                last=exc
                if attempt==2:
                    raise RuntimeError(f'{url}: {last}') from exc
                time.sleep(1+attempt)
        time.sleep(.15)
    archive=lhafile.Lhafile(io.BytesIO(data))
    members=archive.namelist()
    expected=f'{kind.lower()}{day:%y%m%d}.txt'
    if not members or any(Path(m).name.lower()!=expected for m in members):
        raise ValueError(f'Wrong date/member in archive {url}: {members}')
    text='\n'.join(archive.read(m).decode('cp932') for m in members)
    if f'START{kind}' not in text:
        raise ValueError(f'Missing archive marker {url}')
    return text,{'date':day.isoformat(),'kind':kind,'url':url,'sha256':hashlib.sha256(data).hexdigest(),
                 'bytes':len(data),'retrieved_at_utc':retrieval,'members':members}


def main() -> None:
    ap=argparse.ArgumentParser()
    ap.add_argument('--start',default='2025-09-01')
    ap.add_argument('--end',default='2026-08-31')
    ap.add_argument('--out',default='research/boatrace/output')
    args=ap.parse_args()
    start,end=date.fromisoformat(args.start),date.fromisoformat(args.end)
    validate_dates(start,end,today=datetime.now(ZoneInfo('Asia/Tokyo')).date())
    out=Path(args.out); out.mkdir(parents=True,exist_ok=True)
    cache=out/'archives'; cache.mkdir(exist_ok=True)
    days=[start+timedelta(days=i) for i in range((end-start).days+1)]
    manifest,audits,errors=[],[],[]
    rows={p:[] for p in POLICIES}
    print(f'PROBE {start}',flush=True)
    acquire(start,'B',cache); acquire(start,'K',cache)
    def process(day):
        try:
            bt,bm=acquire(day,'B',cache); kt,km=acquire(day,'K',cache)
            result,audit=evaluate_day(bt,kt,day)
            if audit['program_races']==0 or audit['result_races']==0:
                raise ValueError(f'No races parsed: {audit}')
            return result,audit,[bm,km],None
        except Exception as exc:
            return None,None,[],{'date':day.isoformat(),'error':str(exc)}
    with ThreadPoolExecutor(max_workers=2) as pool:
        for i,(result,audit,provenance,error) in enumerate(pool.map(process,days),1):
            if error:
                errors.append(error)
                print('DAY_ERROR '+json.dumps(error,ensure_ascii=False),flush=True)
            else:
                for policy in POLICIES:
                    rows[policy].extend(result[policy])
                audits.append(audit); manifest.extend(provenance)
            if i%30==0 or i==len(days):
                print(f'PROGRESS {i}/{len(days)}, parsed_days={len(audits)}, errors={len(errors)}',flush=True)
    report={'schema':'adhoms.boatrace.baseline.v0.1','generated_at_utc':datetime.now(ZoneInfo('UTC')).isoformat(),
            'code_commit':os.getenv('GITHUB_SHA'),'start':start.isoformat(),'end':end.isoformat(),
            'requested_days':len(days),'parsed_days':len(audits),'failed_days':errors,
            'program_races':sum(a['program_races'] for a in audits),
            'result_races':sum(a['result_races'] for a in audits),
            'program_only_count':sum(len(a['program_only']) for a in audits),
            'result_only_count':sum(len(a['result_only']) for a in audits),
            'identity_mismatch_count':sum(len(a['identity_mismatches']) for a in audits),
            'incomplete_result_count':sum(len(a['incomplete_results']) for a in audits),
            'pre_data_skip_count':sum(len(a['pre_data_skips']) for a in audits),
            'profitability_notification_eligible':False,
            'stage':'frozen, non-optimized historical baselines; NOT an ADHOMS edge model',
            'unresolved':['pre-close timestamped odds / final pool changes',
                          'human notification and execution latency',
                          'ADHOMS probability calibration and untouched validation',
                          'risk-of-ruin estimate and market-impact assumptions',
                          'archived program publication times not independently authenticated'],
            'policies':{}}
    curves={}
    for policy,data in rows.items():
        cash=bankroll(data); curves[policy]=cash.pop('curve')
        by_month=defaultdict(list); by_venue=defaultdict(list)
        for row in data:
            by_month[row['date'][:7]].append(row); by_venue[str(row['venue'])].append(row)
        report['policies'][policy]={'unconstrained_100yen':turnover_summary(data),
            'bankroll_50000yen':cash,
            'monthly':{m:turnover_summary(v) for m,v in sorted(by_month.items())},
            'by_venue':{m:turnover_summary(v) for m,v in sorted(by_venue.items())}}
    for name,value in [('summary.json',report),('manifest.json',manifest),('audit.json',audits),('cash_curves.json',curves)]:
        (out/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
    with gzip.open(out/'orders.jsonl.gz','wt',encoding='utf-8') as f:
        for policy,data in rows.items():
            for row in data:
                f.write(json.dumps(dict(policy=policy,**row),ensure_ascii=False)+'\n')
    compact={k:v for k,v in report.items() if k!='policies'}
    compact['policies']={p:{k:v for k,v in d.items() if k not in ('monthly','by_venue')} for p,d in report['policies'].items()}
    print('SUMMARY_JSON_BEGIN\n'+json.dumps(compact,ensure_ascii=False,indent=2)+'\nSUMMARY_JSON_END',flush=True)
    if errors:
        sys.exit(2)

if __name__=='__main__':
    main()
