#!/usr/bin/env python3
"""
ADHOMS BOATRACE baseline backtest.

Consumes parser_smoke_test.py outputs and runs non-ADHOMS baselines first.
This is deliberately simple: if a future ADHOMS model cannot beat these
baselines out of sample, it has no wagering value.

Input directory must contain:
- odds_snapshots.jsonl
- payouts.jsonl

Example
-------
python research/boat/baseline_backtest.py --input research/boat/out/karatsu_20260918 --out research/boat/out/karatsu_20260918/baseline_summary.json
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from statistics import median
from typing import Iterable

STARTING_BANKROLL = 50_000
MIN_STAKE = 100

INNER_COURSE_SELECTIONS = {
    "exacta_2": ["1-2", "1-3", "1-4"],
    "quinella_2": ["1=2", "1=3", "1=4"],
    "trifecta_3": ["1-2-3", "1-3-2", "1-2-4", "1-4-2", "1-3-4", "1-4-3"],
    "trio_3": ["1=2=3", "1=2=4", "1=3=4"],
}


@dataclass(frozen=True)
class OddsRow:
    race_id: str
    bet_type: str
    selection: str
    decimal_odds: float
    snapshot_time_type: str


@dataclass(frozen=True)
class PayoutRow:
    race_id: str
    bet_type: str
    winning_selection: str
    payout_yen_per_100: int


def load_jsonl(path: Path) -> list[dict]:
    rows: list[dict] = []
    if not path.exists():
        return rows
    with path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def normalize_quinella(selection: str) -> str:
    if "=" not in selection:
        return selection
    parts = sorted(selection.split("="))
    return "=".join(parts)


def normalize_selection(bet_type: str, selection: str) -> str:
    if bet_type in {"quinella_2", "trio_3", "quinella_place"}:
        return normalize_quinella(selection)
    return selection


def parse_inputs(input_dir: Path) -> tuple[list[OddsRow], list[PayoutRow]]:
    odds_rows = []
    for row in load_jsonl(input_dir / "odds_snapshots.jsonl"):
        if not row.get("odds_available"):
            continue
        decimal_odds = row.get("decimal_odds")
        if decimal_odds is None or decimal_odds <= 1.0:
            continue
        bet_type = row["bet_type"]
        odds_rows.append(OddsRow(
            race_id=row["race_id"],
            bet_type=bet_type,
            selection=normalize_selection(bet_type, row["selection"]),
            decimal_odds=float(decimal_odds),
            snapshot_time_type=row.get("snapshot_time_type", "unknown"),
        ))

    payout_rows = []
    for row in load_jsonl(input_dir / "payouts.jsonl"):
        bet_type = row["bet_type"]
        payout_rows.append(PayoutRow(
            race_id=row["race_id"],
            bet_type=bet_type,
            winning_selection=normalize_selection(bet_type, row["winning_selection"]),
            payout_yen_per_100=int(row["payout_yen_per_100"]),
        ))
    return odds_rows, payout_rows


def market_favorite_bets(odds_rows: Iterable[OddsRow]) -> list[OddsRow]:
    """Lowest decimal odds per race/bet-type."""
    best: dict[tuple[str, str], OddsRow] = {}
    for row in odds_rows:
        key = (row.race_id, row.bet_type)
        if key not in best or row.decimal_odds < best[key].decimal_odds:
            best[key] = row
    return list(best.values())


def inner_course_bets(odds_rows: Iterable[OddsRow]) -> list[OddsRow]:
    allowed = {
        bet_type: {normalize_selection(bet_type, s) for s in selections}
        for bet_type, selections in INNER_COURSE_SELECTIONS.items()
    }
    return [
        row for row in odds_rows
        if row.selection in allowed.get(row.bet_type, set())
    ]


def settle_bets(bets: Iterable[OddsRow], payouts: Iterable[PayoutRow], stake_yen: int = MIN_STAKE) -> dict:
    payout_index = {
        (p.race_id, p.bet_type, p.winning_selection): p.payout_yen_per_100
        for p in payouts
    }
    bankroll = STARTING_BANKROLL
    peak = bankroll
    max_drawdown = 0
    longest_losing_streak = 0
    current_losing_streak = 0
    profits: list[int] = []
    odds_used: list[float] = []
    settled = []

    for bet in sorted(bets, key=lambda b: (b.race_id, b.bet_type, b.selection)):
        if bankroll < stake_yen:
            break
        key = (bet.race_id, bet.bet_type, bet.selection)
        payout = payout_index.get(key, 0)
        profit = payout - stake_yen if payout else -stake_yen
        bankroll += profit
        peak = max(peak, bankroll)
        max_drawdown = max(max_drawdown, peak - bankroll)
        if profit < 0:
            current_losing_streak += 1
            longest_losing_streak = max(longest_losing_streak, current_losing_streak)
        else:
            current_losing_streak = 0
        profits.append(profit)
        odds_used.append(bet.decimal_odds)
        settled.append({
            "race_id": bet.race_id,
            "bet_type": bet.bet_type,
            "selection": bet.selection,
            "stake_yen": stake_yen,
            "payout_yen": payout,
            "profit_yen": profit,
            "decimal_odds_used": bet.decimal_odds,
        })

    total_staked = stake_yen * len(profits)
    total_return = total_staked + sum(profits)
    hit_count = sum(1 for p in profits if p > 0)
    return {
        "starting_bankroll_yen": STARTING_BANKROLL,
        "ending_bankroll_yen": bankroll,
        "number_of_bets": len(profits),
        "stake_yen_per_bet": stake_yen,
        "total_staked_yen": total_staked,
        "total_return_yen": total_return,
        "profit_yen": sum(profits),
        "roi": (total_return / total_staked - 1) if total_staked else None,
        "hit_rate": (hit_count / len(profits)) if profits else None,
        "average_odds": (sum(odds_used) / len(odds_used)) if odds_used else None,
        "median_odds": median(odds_used) if odds_used else None,
        "max_drawdown_yen": max_drawdown,
        "longest_losing_streak": longest_losing_streak,
        "ruin_flag": bankroll < stake_yen,
        "settled_bets_preview": settled[:20],
    }


def contribution_by_bet_type(bets: Iterable[OddsRow], payouts: Iterable[PayoutRow]) -> dict[str, dict]:
    grouped: dict[str, list[OddsRow]] = defaultdict(list)
    for bet in bets:
        grouped[bet.bet_type].append(bet)
    return {bet_type: settle_bets(rows, payouts) for bet_type, rows in sorted(grouped.items())}


def run(input_dir: Path) -> dict:
    odds_rows, payouts = parse_inputs(input_dir)
    market_bets = market_favorite_bets(odds_rows)
    inner_bets = inner_course_bets(odds_rows)
    return {
        "input_dir": str(input_dir),
        "odds_rows": len(odds_rows),
        "payout_rows": len(payouts),
        "warning": "Closing odds baselines are research upper bounds, not executable proof.",
        "strategies": {
            "market_favorite_all_pools": settle_bets(market_bets, payouts),
            "market_favorite_by_bet_type": contribution_by_bet_type(market_bets, payouts),
            "inner_course_all_candidates": settle_bets(inner_bets, payouts),
            "inner_course_by_bet_type": contribution_by_bet_type(inner_bets, payouts),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Run BOATRACE non-ADHOMS baseline backtests")
    parser.add_argument("--input", required=True, help="Parser output directory")
    parser.add_argument("--out", default=None, help="Output JSON path")
    args = parser.parse_args()

    summary = run(Path(args.input))
    output = json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True)
    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(output, encoding="utf-8")
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
