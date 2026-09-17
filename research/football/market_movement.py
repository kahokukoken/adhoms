#!/usr/bin/env python3
from __future__ import annotations

import io
import json
import math
from collections import defaultdict, deque
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from sklearn.linear_model import Ridge
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

SEASONS = ["1920", "2021", "2122", "2223", "2324", "2425"]
BASE_URL = "https://www.football-data.co.uk/mmz4281/{season}/E0.csv"
OUT = Path("research/football/output")

FEATURES = [
    "home_goal_rate", "away_goal_rate", "home_concede_rate", "away_concede_rate",
    "home_shot_share", "away_shot_share", "home_sot_rate", "away_sot_rate",
    "home_shape_vol", "away_shape_vol", "home_form", "away_form",
    "rest_diff", "style_attack_interaction", "suppression_interaction",
]


def fetch(code: str) -> pd.DataFrame:
    r = requests.get(
        BASE_URL.format(season=code), timeout=60,
        headers={"User-Agent": "Mozilla/5.0 ADHOMS-Football-Research/1.4"},
    )
    r.raise_for_status()
    df = pd.read_csv(io.StringIO(r.content.decode("utf-8-sig", errors="replace")), on_bad_lines="skip")
    need = [
        "Date", "HomeTeam", "AwayTeam", "FTHG", "FTAG", "FTR", "HS", "AS", "HST", "AST",
        "AvgH", "AvgD", "AvgA", "AvgCH", "AvgCD", "AvgCA",
        "Avg>2.5", "Avg<2.5", "AvgC>2.5", "AvgC<2.5",
    ]
    missing = [c for c in need if c not in df.columns]
    if missing:
        raise RuntimeError(f"{code}: missing columns {missing}")
    df = df.dropna(subset=need).copy()
    df["Date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")
    df["season_code"] = code
    return df.dropna(subset=["Date"]).sort_values("Date")


def norm(vals):
    q = 1.0 / np.asarray(vals, dtype=float)
    return q / q.sum()


def safe_log_ratio(a, b):
    return math.log(max(float(a), 1e-12) / max(float(b), 1e-12))


class RollingTeamState:
    def __init__(self, window=12):
        self.window = window
        self.gf = defaultdict(lambda: deque(maxlen=window))
        self.ga = defaultdict(lambda: deque(maxlen=window))
        self.shot_share = defaultdict(lambda: deque(maxlen=window))
        self.sot_rate = defaultdict(lambda: deque(maxlen=window))
        self.points = defaultdict(lambda: deque(maxlen=window))
        self.last_date = {}

    @staticmethod
    def avg(xs, fallback):
        return sum(xs) / len(xs) if xs else fallback

    @staticmethod
    def sd(xs, fallback=0.10):
        return float(np.std(xs)) if len(xs) >= 3 else fallback

    def profile(self, team):
        return {
            "goal_rate": self.avg(self.gf[team], 1.35),
            "concede_rate": self.avg(self.ga[team], 1.35),
            "shot_share": self.avg(self.shot_share[team], 0.50),
            "sot_rate": self.avg(self.sot_rate[team], 0.33),
            "shape_vol": self.sd(self.shot_share[team]),
            "form": self.avg(self.points[team], 1.35) / 3.0,
        }

    def rest_days(self, team, date):
        last = self.last_date.get(team)
        if last is None:
            return 7.0
        return float(np.clip((date - last).days, 2, 14))

    def update(self, r):
        h, a = r.HomeTeam, r.AwayTeam
        hg, ag = float(r.FTHG), float(r.FTAG)
        hs, a_s = float(r.HS), float(r.AS)
        hst, ast = float(r.HST), float(r.AST)
        total = max(hs + a_s, 1.0)
        self.gf[h].append(hg); self.ga[h].append(ag)
        self.gf[a].append(ag); self.ga[a].append(hg)
        self.shot_share[h].append(hs / total); self.shot_share[a].append(a_s / total)
        self.sot_rate[h].append(hst / max(hs, 1.0)); self.sot_rate[a].append(ast / max(a_s, 1.0))
        self.points[h].append(3 if hg > ag else 1 if hg == ag else 0)
        self.points[a].append(3 if ag > hg else 1 if hg == ag else 0)
        self.last_date[h] = r.Date; self.last_date[a] = r.Date


def build_rows(df):
    state = RollingTeamState()
    rows = []
    for _, r in df.sort_values("Date").iterrows():
        hp, ap = state.profile(r.HomeTeam), state.profile(r.AwayTeam)
        ro, rc = state.rest_days(r.HomeTeam, r.Date), state.rest_days(r.AwayTeam, r.Date)

        o1 = norm([r.AvgH, r.AvgD, r.AvgA])
        c1 = norm([r.AvgCH, r.AvgCD, r.AvgCA])
        ou_o = norm([r["Avg>2.5"], r["Avg<2.5"]])
        ou_c = norm([r["AvgC>2.5"], r["AvgC<2.5"]])

        # Interaction-only ideas from ADHOMS primitives. No current-match performance is used.
        style_attack_interaction = (hp["goal_rate"] * ap["concede_rate"]) - (ap["goal_rate"] * hp["concede_rate"])
        suppression_interaction = (ap["shot_share"] - 0.5) * (0.33 - hp["sot_rate"]) - (hp["shot_share"] - 0.5) * (0.33 - ap["sot_rate"])

        rows.append({
            "date": r.Date, "season": r.season_code, "home": r.HomeTeam, "away": r.AwayTeam,
            "home_goal_rate": hp["goal_rate"], "away_goal_rate": ap["goal_rate"],
            "home_concede_rate": hp["concede_rate"], "away_concede_rate": ap["concede_rate"],
            "home_shot_share": hp["shot_share"], "away_shot_share": ap["shot_share"],
            "home_sot_rate": hp["sot_rate"], "away_sot_rate": ap["sot_rate"],
            "home_shape_vol": hp["shape_vol"], "away_shape_vol": ap["shape_vol"],
            "home_form": hp["form"], "away_form": ap["form"], "rest_diff": ro - rc,
            "style_attack_interaction": style_attack_interaction,
            "suppression_interaction": suppression_interaction,
            # Targets are normalized-probability market movement, not match outcome.
            "move_H": safe_log_ratio(c1[0], o1[0]),
            "move_D": safe_log_ratio(c1[1], o1[1]),
            "move_A": safe_log_ratio(c1[2], o1[2]),
            "move_O25": safe_log_ratio(ou_c[0], ou_o[0]),
            "openH_odds": float(r.AvgH), "openD_odds": float(r.AvgD), "openA_odds": float(r.AvgA),
            "closeH_odds": float(r.AvgCH), "closeD_odds": float(r.AvgCD), "closeA_odds": float(r.AvgCA),
            "openO25_odds": float(r["Avg>2.5"]), "closeO25_odds": float(r["AvgC>2.5"]),
        })
        # Strict anti-leakage: update only after feature/target row is built.
        state.update(r)
    return pd.DataFrame(rows)


def corr(a, b):
    a, b = np.asarray(a), np.asarray(b)
    if len(a) < 3 or np.std(a) < 1e-12 or np.std(b) < 1e-12:
        return 0.0
    return float(np.corrcoef(a, b)[0, 1])


def direction_accuracy(pred, actual, material=0.01):
    pred, actual = np.asarray(pred), np.asarray(actual)
    mask = np.abs(actual) >= material
    if not mask.any():
        return None, 0
    return float(np.mean(np.sign(pred[mask]) == np.sign(actual[mask]))), int(mask.sum())


def signal_clv(pred, open_odds, close_odds, threshold=0.015):
    pred = np.asarray(pred); oo = np.asarray(open_odds); co = np.asarray(close_odds)
    mask = pred >= threshold
    if not mask.any():
        return {"signals": 0, "mean_log_clv": None, "positive_clv_rate": None}
    realized = np.log(oo[mask] / co[mask])
    return {
        "signals": int(mask.sum()),
        "mean_log_clv": float(np.mean(realized)),
        "positive_clv_rate": float(np.mean(realized > 0)),
    }


def main():
    raw = pd.concat([fetch(s) for s in SEASONS], ignore_index=True).sort_values("Date")
    rows = build_rows(raw)
    reports = []

    for i, season in enumerate(SEASONS[1:], start=1):
        train = rows[rows.season.isin(SEASONS[:i])]
        test = rows[rows.season == season]
        Xtr, Xte = train[FEATURES], test[FEATURES]

        # 1X2 movement model.
        ytr = train[["move_H", "move_D", "move_A"]].to_numpy(float)
        yte = test[["move_H", "move_D", "move_A"]].to_numpy(float)
        m1 = make_pipeline(StandardScaler(), MultiOutputRegressor(Ridge(alpha=10.0)))
        m1.fit(Xtr, ytr); p1 = m1.predict(Xte)
        mse_model = float(np.mean((p1 - yte) ** 2))
        mse_zero = float(np.mean(yte ** 2))

        side_names = ["H", "D", "A"]
        side_details = {}
        for j, side in enumerate(side_names):
            acc, nmat = direction_accuracy(p1[:, j], yte[:, j])
            clv = signal_clv(
                p1[:, j],
                test[f"open{side}_odds"].to_numpy(float),
                test[f"close{side}_odds"].to_numpy(float),
            )
            side_details[side] = {
                "corr": corr(p1[:, j], yte[:, j]),
                "direction_accuracy_material": acc,
                "material_moves": nmat,
                **clv,
            }

        # O/U 2.5 movement model: predict Over movement only (Under is nearly complementary after normalization).
        ytr_o = train["move_O25"].to_numpy(float)
        yte_o = test["move_O25"].to_numpy(float)
        mo = make_pipeline(StandardScaler(), Ridge(alpha=10.0))
        mo.fit(Xtr, ytr_o); po = mo.predict(Xte)
        oacc, onmat = direction_accuracy(po, yte_o)
        oclv = signal_clv(po, test["openO25_odds"].to_numpy(float), test["closeO25_odds"].to_numpy(float))

        reports.append({
            "season": season,
            "n": int(len(test)),
            "1x2": {
                "mse_zero_change": mse_zero,
                "mse_model": mse_model,
                "mse_improvement_pct": float((mse_zero - mse_model) / mse_zero * 100.0) if mse_zero else 0.0,
                "sides": side_details,
            },
            "over25": {
                "mse_zero_change": float(np.mean(yte_o ** 2)),
                "mse_model": float(np.mean((po - yte_o) ** 2)),
                "corr": corr(po, yte_o),
                "direction_accuracy_material": oacc,
                "material_moves": onmat,
                **oclv,
            },
        })

    # Hard acceptance: positive mean MSE improvement and positive average realized CLV in >=3/5 windows.
    mse_improvements = [r["1x2"]["mse_improvement_pct"] for r in reports]
    h_clvs = [r["1x2"]["sides"]["H"]["mean_log_clv"] for r in reports]
    a_clvs = [r["1x2"]["sides"]["A"]["mean_log_clv"] for r in reports]
    o_clvs = [r["over25"]["mean_log_clv"] for r in reports]

    def positive_windows(xs):
        return sum(x is not None and x > 0 for x in xs)

    summary = {
        "question": "Can pre-match historical ADHOMS-style interaction features anticipate opening-to-closing market correction?",
        "features": FEATURES,
        "train_eval": "expanding-season walk-forward; 2019-20 initial train, 2020-21..2024-25 evaluation",
        "signal_rule": "enter at average opening price when predicted normalized log-probability movement >= 0.015",
        "seasons": reports,
        "aggregate": {
            "mean_1x2_mse_improvement_pct": float(np.mean(mse_improvements)),
            "home_positive_clv_windows": positive_windows(h_clvs),
            "away_positive_clv_windows": positive_windows(a_clvs),
            "over25_positive_clv_windows": positive_windows(o_clvs),
            "accepted": bool(
                np.mean(mse_improvements) > 0
                and max(positive_windows(h_clvs), positive_windows(a_clvs), positive_windows(o_clvs)) >= 3
            ),
        },
        "warning": "Average market odds are used as a research price proxy; positive CLV is necessary but not proof of executable profit.",
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "market_movement_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
