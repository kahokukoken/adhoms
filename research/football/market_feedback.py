#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
import pandas as pd

OUT = Path("research/football/output")
PREDICTIONS = OUT / "epl_predictions.csv"
ADOPTION_LEVELS = [0.0, 0.10, 0.25, 0.50, 0.75, 1.0]


def normalize(p):
    p = np.asarray(p, dtype=float)
    p = np.clip(p, 1e-12, None)
    return p / p.sum()


def geometric_blend(open_p, target_p, absorbed_fraction):
    """Move the market from opening toward later consensus in log-probability space."""
    a = float(np.clip(absorbed_fraction, 0.0, 1.0))
    o = normalize(open_p)
    t = normalize(target_p)
    q = np.exp((1.0 - a) * np.log(o) + a * np.log(t))
    return normalize(q)


def kl(p, q):
    p, q = normalize(p), normalize(q)
    return float(np.sum(p * np.log(p / q)))


def js(p, q):
    p, q = normalize(p), normalize(q)
    m = 0.5 * (p + q)
    return 0.5 * kl(p, m) + 0.5 * kl(q, m)


def best_remaining_clv(current_p, close_p):
    """
    Research proxy: choose the outcome whose fair probability still has the
    largest positive move left before close. Fair-odds log CLV is log(c/q).
    This intentionally ignores bookmaker margin and execution friction.
    """
    q, c = normalize(current_p), normalize(close_p)
    vals = np.log(c / q)
    return float(np.max(vals))


def main():
    if not PREDICTIONS.exists():
        raise RuntimeError(f"missing {PREDICTIONS}; run backtest_epl.py first")

    df = pd.read_csv(PREDICTIONS)
    need = ["openH", "openD", "openA", "closeH", "closeD", "closeA"]
    missing = [c for c in need if c not in df.columns]
    if missing:
        raise RuntimeError(f"missing columns: {missing}")

    rows = []
    base_js = []
    for _, r in df.iterrows():
        o = normalize([r.openH, r.openD, r.openA])
        c = normalize([r.closeH, r.closeD, r.closeA])
        base_js.append(js(o, c))

    for adoption in ADOPTION_LEVELS:
        residual_js = []
        residual_l1 = []
        best_clv = []
        material = 0
        for _, r in df.iterrows():
            o = normalize([r.openH, r.openD, r.openA])
            c = normalize([r.closeH, r.closeD, r.closeA])
            q = geometric_blend(o, c, adoption)
            residual_js.append(js(q, c))
            residual_l1.append(float(np.sum(np.abs(q - c))))
            b = best_remaining_clv(q, c)
            best_clv.append(b)
            if b >= 0.015:
                material += 1

        rows.append({
            "effective_adoption": adoption,
            "matches": int(len(df)),
            "mean_residual_js": float(np.mean(residual_js)),
            "mean_residual_l1_probability": float(np.mean(residual_l1)),
            "mean_best_remaining_log_clv_proxy": float(np.mean(best_clv)),
            "matches_with_>=1.5pct_log_clv_proxy": int(material),
            "fraction_material": float(material / len(df)) if len(df) else 0.0,
            "edge_remaining_pct_vs_zero_adoption": None,
        })

    initial = rows[0]["mean_best_remaining_log_clv_proxy"]
    for row in rows:
        row["edge_remaining_pct_vs_zero_adoption"] = (
            float(row["mean_best_remaining_log_clv_proxy"] / initial * 100.0)
            if initial > 0 else 0.0
        )

    summary = {
        "question": "How quickly does an informational betting edge self-erode as the same information is adopted by the market?",
        "interpretation": "Closing probabilities are used as a proxy for later market consensus. Effective adoption moves opening probabilities toward that consensus in log-probability space.",
        "matches": int(len(df)),
        "mean_open_to_close_js": float(np.mean(base_js)),
        "adoption_curve": rows,
        "core_result": "By construction, if all participants absorb the same correct information before execution, the residual informational edge tends to zero.",
        "warning": "This is a market-impact thought experiment calibrated on observed opening/closing probability movement. It is not a profit forecast and does not model bookmaker margin, limits, latency, or heterogeneous beliefs.",
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "market_feedback_summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
