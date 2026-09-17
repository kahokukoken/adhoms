#!/usr/bin/env python3
from __future__ import annotations

import csv
import io
import json
import math
from collections import defaultdict, deque
from pathlib import Path

import numpy as np
import pandas as pd
import requests

SEASONS = ["1920", "2021", "2122", "2223", "2324", "2425"]
BASE_URL = "https://www.football-data.co.uk/mmz4281/{season}/E0.csv"
OUT = Path("research/football/output")


def fetch_season(code: str) -> pd.DataFrame:
    r = requests.get(BASE_URL.format(season=code), timeout=60,
                     headers={"User-Agent": "Mozilla/5.0 ADHOMS-Football-Research/0.7"})
    r.raise_for_status()
    text = r.content.decode("utf-8-sig", errors="replace")
    df = pd.read_csv(io.StringIO(text), on_bad_lines="skip")
    required = ["Date", "HomeTeam", "AwayTeam", "FTHG", "FTAG", "FTR"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise RuntimeError(f"{code}: missing columns {missing}")
    df = df.dropna(subset=required).copy()
    df["season_code"] = code
    df["Date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")
    return df.dropna(subset=["Date"]).sort_values("Date")


def normalize_odds(vals):
    q = 1.0 / np.asarray(vals, dtype=float)
    return q / q.sum()


def brier(p, y):
    t = np.zeros(3); t[y] = 1.0
    return float(np.sum((np.asarray(p) - t) ** 2))


def logloss(p, y):
    return -math.log(max(1e-12, float(p[y])))


def max_drawdown(equity):
    peak = equity[0]
    worst = 0.0
    for x in equity:
        peak = max(peak, x)
        worst = max(worst, (peak - x) / peak if peak else 0.0)
    return worst


class RollingPoisson:
    def __init__(self, window=20):
        self.window = window
        self.gf = defaultdict(lambda: deque(maxlen=window))
        self.ga = defaultdict(lambda: deque(maxlen=window))
        self.pts = defaultdict(lambda: deque(maxlen=window))
        self.league_goals = deque(maxlen=760)

    @staticmethod
    def _avg(xs, fallback):
        return sum(xs) / len(xs) if xs else fallback

    def predict(self, home, away):
        g = self._avg(self.league_goals, 1.35)
        ha = self._avg(self.gf[home], g)
        hd = self._avg(self.ga[home], g)
        aa = self._avg(self.gf[away], g)
        ad = self._avg(self.ga[away], g)
        hf = self._avg(self.pts[home], 1.35) / 3.0
        af = self._avg(self.pts[away], 1.35) / 3.0

        lh = max(0.12, math.sqrt(ha * ad) * 1.12 * math.exp(0.12 * (hf - af)))
        la = max(0.12, math.sqrt(aa * hd) / math.sqrt(1.12) * math.exp(0.12 * (af - hf)))

        maxg = 9
        ph = [math.exp(-lh) * lh**k / math.factorial(k) for k in range(maxg + 1)]
        pa = [math.exp(-la) * la**k / math.factorial(k) for k in range(maxg + 1)]
        H = D = A = 0.0
        for i, p1 in enumerate(ph):
            for j, p2 in enumerate(pa):
                q = p1 * p2
                if i > j: H += q
                elif i == j: D += q
                else: A += q
        D *= 1.07
        p = np.array([H, D, A])
        return p / p.sum()

    def update(self, home, away, hg, ag):
        self.gf[home].append(hg); self.ga[home].append(ag)
        self.gf[away].append(ag); self.ga[away].append(hg)
        self.pts[home].append(3 if hg > ag else 1 if hg == ag else 0)
        self.pts[away].append(3 if ag > hg else 1 if hg == ag else 0)
        self.league_goals.extend([hg, ag])


def main():
    frames = [fetch_season(s) for s in SEASONS]
    all_df = pd.concat(frames, ignore_index=True).sort_values("Date").reset_index(drop=True)
    model = RollingPoisson()

    bankroll = 100000.0
    equity = [bankroll]
    rows = []
    clv = []
    bets = 0
    total_staked = 0.0

    for _, r in all_df.iterrows():
        p = model.predict(r.HomeTeam, r.AwayTeam)
        y = {"H": 0, "D": 1, "A": 2}[r.FTR]
        evaluate = r.season_code != "1920"

        open_cols = ["AvgH", "AvgD", "AvgA"]
        close_cols = ["AvgCH", "AvgCD", "AvgCA"]
        b365_open = ["B365H", "B365D", "B365A"]
        b365_close = ["B365CH", "B365CD", "B365CA"]
        market_ok = all(c in all_df.columns and pd.notna(r.get(c)) for c in open_cols + close_cols)
        book_ok = all(c in all_df.columns and pd.notna(r.get(c)) for c in b365_open + b365_close)

        if evaluate and market_ok:
            mo = normalize_odds([float(r[c]) for c in open_cols])
            mc = normalize_odds([float(r[c]) for c in close_cols])
            rec = {
                "date": str(r.Date.date()), "season": r.season_code,
                "home": r.HomeTeam, "away": r.AwayTeam, "result": r.FTR,
                "pH": p[0], "pD": p[1], "pA": p[2],
                "openH": mo[0], "openD": mo[1], "openA": mo[2],
                "closeH": mc[0], "closeD": mc[1], "closeA": mc[2],
                "brier_model": brier(p, y), "brier_open": brier(mo, y), "brier_close": brier(mc, y),
                "log_model": logloss(p, y), "log_open": logloss(mo, y), "log_close": logloss(mc, y),
                "bet": False, "profit": 0.0,
            }

            # Bet only if model exceeds vig-free market-average opening probability by >= 5pp.
            edge = p - mo
            k = int(np.argmax(edge))
            if book_ok and edge[k] >= 0.05:
                oo = [float(r[c]) for c in b365_open]
                co = [float(r[c]) for c in b365_close]
                if min(oo + co) > 1.0:
                    stake = bankroll * 0.005
                    profit = stake * (oo[k] - 1.0) if y == k else -stake
                    bankroll += profit
                    total_staked += stake
                    bets += 1
                    equity.append(bankroll)
                    clv.append(math.log(oo[k] / co[k]))
                    rec["bet"] = True
                    rec["profit"] = profit
                    rec["bet_side"] = ["H", "D", "A"][k]
                    rec["bet_odds"] = oo[k]
                    rec["close_odds"] = co[k]
            rows.append(rec)

        # Strict anti-leakage ordering: update after prediction/evaluation only.
        model.update(r.HomeTeam, r.AwayTeam, int(r.FTHG), int(r.FTAG))

    out = pd.DataFrame(rows)
    if out.empty:
        raise RuntimeError("no evaluation rows")

    summary = {
        "train_season": "2019-20",
        "evaluation_seasons": ["2020-21", "2021-22", "2022-23", "2023-24", "2024-25"],
        "matches": int(len(out)),
        "bets": int(bets),
        "model_brier": float(out.brier_model.mean()),
        "open_market_brier": float(out.brier_open.mean()),
        "close_market_brier": float(out.brier_close.mean()),
        "model_logloss": float(out.log_model.mean()),
        "open_market_logloss": float(out.log_open.mean()),
        "close_market_logloss": float(out.log_close.mean()),
        "initial_bankroll": 100000.0,
        "final_bankroll": float(bankroll),
        "return_pct": float((bankroll / 100000.0 - 1.0) * 100.0),
        "roi_on_staked_pct": float((out.profit.sum() / total_staked) * 100.0) if total_staked else None,
        "max_drawdown_pct": float(max_drawdown(equity) * 100.0),
        "mean_log_clv": float(np.mean(clv)) if clv else None,
        "bet_rule": "model probability - normalized market-average opening probability >= 0.05; stake 0.5% current bankroll at Bet365 opening",
        "note": "Baseline only. No ADHOMS Structure/Access feature is credited until pre-match historical feature coverage exists."
    }

    OUT.mkdir(parents=True, exist_ok=True)
    out.to_csv(OUT / "epl_predictions.csv", index=False)
    (OUT / "epl_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
