"""Research-only boat-race archive parsing and frozen baseline accounting.

No betting API, probability claim, odds selection, or outcome-derived features.
Only B (program) fields may enter select(); K files are settlement data.
"""
from __future__ import annotations
import math
import re
import unicodedata
from collections import defaultdict
from datetime import date
from typing import Any

TYPES = {'単勝': ('win', 1), '2連単': ('exacta', 2),
         '2連複': ('quinella', 2), '3連単': ('trifecta', 3),
         '3連複': ('trio', 3)}
POLICIES = ('boat1_win', 'national_rating_win', 'fixed12_exacta', 'fixed12_quinella',
            'fixed123_trifecta', 'fixed123_trio')
UNORDERED = {'quinella', 'trio'}


def validate_dates(start: date, end: date, *, today: date) -> None:
    if start > end or end >= today:
        raise ValueError('Require start <= end < today (completed dates only)')
    if (end-start).days > 740:
        raise ValueError('Research run capped at 741 days')


def _key(day: date, venue: int, number: int) -> str:
    return f'{day:%Y%m%d}{venue:02d}{number:02d}'


def _lines(text: str) -> list[str]:
    return unicodedata.normalize('NFKC', text).splitlines()


def parse_program(text: str, day: date) -> dict[str, dict[str, Any]]:
    races: dict[str, dict[str, Any]] = {}
    venue, current = None, None
    for line in _lines(text):
        marker = re.fullmatch(r'\s*(\d{2})BBGN\s*', line)
        if marker:
            venue, current = int(marker[1]), None
            continue
        if re.fullmatch(r'\s*\d{2}BEND\s*', line):
            current = None
        header = re.match(r'^\s*(\d{1,2})R\s+', line)
        if venue and header and re.search(r'H\s*\d{3,4}m', line, re.I):
            number = int(header[1])
            rid = _key(day, venue, number)
            if rid in races:
                raise ValueError(f'Duplicate program race {rid}')
            clock = re.search(r'締切予定\s*(\d{1,2}):(\d{2})', line)
            current = {'race_id': rid, 'date': day.isoformat(), 'venue': venue,
                       'number': number, 'close': f'{int(clock[1]):02d}:{clock[2]}' if clock else None,
                       'entries': {}}
            races[rid] = current
            continue
        entrant = re.match(r'^\s*([1-6])\s+(\d{4})(.*)', line)
        if current is not None and entrant:
            lane, racer_id = int(entrant[1]), int(entrant[2])
            grade = re.search(r'([AB][12])\s*(.*)', entrant[3])
            if not grade:
                raise ValueError(f'Unparsed program grade: {current["race_id"]} {lane}')
            values = re.findall(r'\d+\.\d+', grade[2])
            if len(values) < 4 or lane in current['entries']:
                raise ValueError(f'Invalid program fields: {current["race_id"]} {lane}')
            current['entries'][lane] = {'racer_id': racer_id, 'class': grade[1],
                'national_rating': float(values[0]), 'national_top2': float(values[1]),
                'local_rating': float(values[2]), 'local_top2': float(values[3])}
    return races


def parse_results(text: str, day: date) -> dict[str, dict[str, Any]]:
    races: dict[str, dict[str, Any]] = {}
    venue, current, active_type = None, None, None
    for line in _lines(text):
        marker = re.fullmatch(r'\s*(\d{2})KBGN\s*', line)
        if marker:
            venue, current, active_type = int(marker[1]), None, None
            continue
        if re.fullmatch(r'\s*\d{2}KEND\s*', line):
            current, active_type = None, None
        header = re.match(r'^\s*(\d{1,2})R\s+', line)
        # Payout summaries may contain pool-level 不成立; only distance-bearing
        # detail headers define races. Unrecognized headers remain audit gaps.
        if venue and header and re.search(r'H\s*\d{3,4}m', line, re.I):
            rid = _key(day, venue, int(header[1]))
            if rid in races:
                raise ValueError(f'Duplicate result race {rid}')
            current = {'race_id': rid, 'entries': {}, 'payouts': {},
                       'pool_status': {}, 'special_payouts': {},
                       'cancelled': bool(re.search('中止|不成立|取り止め', line))}
            races[rid], active_type = current, None
            continue
        if current is None:
            continue
        if re.fullmatch(r'\s*レース(?:不成立|中止)\s*', line):
            current['cancelled'], active_type = True, None
            continue
        entrant = re.match(r'^\s*(0[0-6]|F|L[01]?|K[01]?|S[012]?)\s+([1-6])\s+(\d{4})\b', line)
        if entrant:
            lane = int(entrant[2])
            if lane in current['entries']:
                raise ValueError(f'Duplicate result entrant {current["race_id"]} {lane}')
            current['entries'][lane] = {'status': entrant[1], 'racer_id': int(entrant[3])}
            continue
        label = re.match(r'^\s*(単勝|複勝|2連単|2連複|拡連複|3連単|3連複)\s+(.*)', line)
        if label:
            active_type = TYPES.get(label[1])
            body = label[2]
        elif active_type and re.match(r'^\s+[1-6](?:[-=]|\s)', line):
            body = line
        else:
            continue
        if active_type:
            ticket_type, length = active_type
            status = current['pool_status'].get(ticket_type)
            if re.search('不成立|全返還', body):
                if current['payouts'].get(ticket_type) or status == 'special':
                    raise ValueError(f'Conflicting pool status {current["race_id"]} {ticket_type}')
                current['pool_status'][ticket_type] = 'void'
                continue
            if '特払' in body:
                special = re.fullmatch(r'\s*特払(?:い)?\s+([\d,]+)\s*', body)
                if not special:
                    raise ValueError(f'Invalid special payout {current["race_id"]}: {body}')
                amount = int(special[1].replace(',', ''))
                if amount < 10 or amount > 100 or amount % 10:
                    raise ValueError(f'Invalid special amount {current["race_id"]}: {amount}')
                previous = current['special_payouts'].get(ticket_type)
                if current['payouts'].get(ticket_type) or status == 'void' or previous not in (None, amount):
                    raise ValueError(f'Conflicting special payout {current["race_id"]} {ticket_type}')
                current['pool_status'][ticket_type] = 'special'
                current['special_payouts'][ticket_type] = amount
                continue
            pattern = rf'(?<!\d)([1-6](?:[-=][1-6]){{{length-1}}})\s+([\d,]+)'
            for match in re.finditer(pattern, body.split('人気')[0]):
                combo = tuple(map(int, re.split('[-=]', match[1])))
                if ticket_type in UNORDERED:
                    combo = tuple(sorted(combo))
                payout = int(match[2].replace(',', ''))
                if len(set(combo)) != length or payout < 10 or payout % 10:
                    raise ValueError(f'Invalid payout {current["race_id"]}: {match[0]}')
                if status in ('void', 'special'):
                    raise ValueError(f'Conflicting pool status {current["race_id"]} {ticket_type}')
                values = current['payouts'].setdefault(ticket_type, {})
                if combo in values and values[combo] != payout:
                    raise ValueError(f'Conflicting payouts {current["race_id"]}')
                values[combo] = payout
    return races


def select(program: dict, policy: str) -> tuple[str, tuple[int, ...]] | None:
    """Decide from schedule only. Missing/incomplete schedule -> no order."""
    if set(program['entries']) != set(range(1, 7)) or program['close'] is None:
        return None
    if policy == 'boat1_win':
        return 'win', (1,)
    if policy == 'national_rating_win':
        lane = min(program['entries'], key=lambda n: (-program['entries'][n]['national_rating'], n))
        return 'win', (lane,)
    fixed = {'fixed12_exacta': ('exacta',(1,2)), 'fixed12_quinella':('quinella',(1,2)),
             'fixed123_trifecta':('trifecta',(1,2,3)), 'fixed123_trio':('trio',(1,2,3))}
    if policy not in fixed:
        raise ValueError(f'Unknown policy: {policy}')
    return fixed[policy]


def settlement(result: dict | None, ticket_type: str, combo: tuple[int, ...]) -> tuple[int | None, str]:
    """Separate hit, loss, return and special payout; never call a refund a hit."""
    if result is None:
        return None, 'unknown'
    if result['cancelled']:
        return 100, 'race_refund'
    if result.get('pool_status', {}).get(ticket_type) == 'void':
        return 100, 'pool_refund'
    if any(n not in result['entries'] for n in combo):
        return None, 'unknown'
    if any(result['entries'][n]['status'][0] in 'FKL' for n in combo):
        return 100, 'boat_refund'
    special = result.get('special_payouts', {}).get(ticket_type)
    if special is not None:
        return special, 'special_payout'
    payouts = result['payouts'].get(ticket_type)
    if not payouts:
        return None, 'unknown'
    key = tuple(sorted(combo)) if ticket_type in UNORDERED else combo
    if key in payouts:
        return payouts[key], 'hit'
    return 0, 'loss'


def settle(result: dict | None, ticket_type: str, combo: tuple[int, ...]) -> int | None:
    """Return yen per 100 yen, INCLUDING principal; None denotes unknown."""
    return settlement(result, ticket_type, combo)[0]


def turnover_summary(rows: list[dict]) -> dict:
    known = [r for r in rows if r['payout_yen'] is not None]
    staked = 100 * len(known)
    returned = sum(r['payout_yen'] for r in known)
    return {'scheduled_orders': len(rows), 'settled_orders': len(known),
            'unknown_settlements': len(rows)-len(known), 'stake_yen': staked,
            'payout_including_refunds_yen': returned,
            'net_profit_yen': returned-staked,
            'roi': (returned-staked)/staked if staked else None,
            'return_rate': returned/staked if staked else None,
            'definition': 'Known settlements only; submitted stakes include refunded stakes.'}


def bankroll(rows: list[dict], initial: int = 50000) -> dict:
    """100 yen/order; daily cap min(1000, 2% of opening cash).

    Reserve the entire day's tickets using morning cash. All payouts become
    available NEXT DAY. Unknown settlement=loss in the conservative scenario;
    this is not an unbiased estimate of an unobserved actual equity curve.
    """
    cash, peak, max_dd, bets, unknown = initial, initial, 0.0, 0, 0
    total_stake, total_payout = 0, 0
    days = defaultdict(list)
    for row in rows:
        days[row['date']].append(row)
    curve = []
    for day in sorted(days):
        cap = min(1000, math.floor(cash*0.02/100)*100)
        planned = sorted(days[day], key=lambda r: (r['close'],r['race_id']))[:cap//100]
        stake = 100*len(planned)
        payout = sum(r['payout_yen'] if r['payout_yen'] is not None else 0 for r in planned)
        unknown += sum(r['payout_yen'] is None for r in planned)
        before = cash
        cash += payout-stake
        if cash < 0:
            raise AssertionError('Cash cannot be negative; no borrowing or top-ups.')
        peak = max(peak,cash)
        max_dd = max(max_dd,(peak-cash)/peak)
        bets += len(planned)
        total_stake += stake
        total_payout += payout
        curve.append({'date':day,'opening_yen':before,'stake_yen':stake,'payout_yen':payout,
                      'closing_yen':cash,'orders':len(planned)})
    return {'initial_bankroll_yen':initial,'final_bankroll_yen':cash,'bets':bets,
            'stake_yen':total_stake,'payout_yen':total_payout,
            'roi': (total_payout-total_stake)/total_stake if total_stake else None,
            'max_end_of_day_drawdown':max_dd, 'unknown_settlements':unknown,
            'is_conservative_scenario':unknown>0, 'hard_ruin_observed':cash<100,
            'unable_to_stake_under_cap':cash<5000, 'risk_of_ruin_estimate':None,
            'curve':curve}


def evaluate_day(program_text: str, result_text: str, day: date) -> tuple[dict, dict]:
    programs, results = parse_program(program_text,day), parse_results(result_text,day)
    audit = {'date':day.isoformat(),'program_races':len(programs),'result_races':len(results),
             'program_only':sorted(set(programs)-set(results)),
             'result_only':sorted(set(results)-set(programs)),
             'identity_mismatches':[], 'incomplete_results':[], 'pre_data_skips':[]}
    rows = {policy:[] for policy in POLICIES}
    for rid,p in programs.items():
        r = results.get(rid)
        if r is not None and not r['cancelled']:
            mismatch = any(lane not in p['entries'] or e['racer_id'] != p['entries'][lane]['racer_id']
                           for lane,e in r['entries'].items())
            if mismatch:
                audit['identity_mismatches'].append(rid)
                r = None
            elif set(r['entries']) != set(range(1,7)):
                audit['incomplete_results'].append(rid)
                r = None
        for policy in POLICIES:
            prediction = select(p,policy)
            if prediction is None:
                if rid not in audit['pre_data_skips']:
                    audit['pre_data_skips'].append(rid)
                continue
            ticket,combo = prediction
            payout, settlement_kind = settlement(r,ticket,combo)
            rows[policy].append({'race_id':rid,'date':p['date'],'close':p['close'],
                                  'venue':p['venue'],'ticket':ticket,'combo':list(combo),
                                  'payout_yen':payout,'settlement_kind':settlement_kind})
    return rows,audit
