#!/usr/bin/env python3
"""
ADHOMS BOATRACE parser smoke test.

Purpose
-------
Fetch one BOATRACE venue-day and normalize the minimum pages needed for
profitability research:

- racelist
- beforeinfo
- odds3t
- odds2tf
- raceresult

This script is intentionally conservative. It is a data-ingestion smoke test,
not a profit model. Historical odds fetched from official pages must be treated
as closing odds / upper-bound research inputs, not proof of executable prices.

Example
-------
python research/boat/parser_smoke_test.py --hd 20260918 --jcd 23 --out research/boat/out/karatsu_20260918

Outputs
-------
- races.jsonl
- entrants.jsonl
- before_info.jsonl
- odds_snapshots.jsonl
- results.jsonl
- payouts.jsonl
- smoke_summary.json
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from typing import Iterable, Iterator
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE_URL = "https://www.boatrace.jp/owpc/pc/race/{page}?{query}"
USER_AGENT = "ADHOMS-BoatResearch/0.1 (+public-data-smoke-test)"

PAGE_TYPES = ("racelist", "beforeinfo", "odds3t", "odds2tf", "raceresult")

VENUE_CODES = {
    "01": "桐生", "02": "戸田", "03": "江戸川", "04": "平和島", "05": "多摩川", "06": "浜名湖",
    "07": "蒲郡", "08": "常滑", "09": "津", "10": "三国", "11": "びわこ", "12": "住之江",
    "13": "尼崎", "14": "鳴門", "15": "丸亀", "16": "児島", "17": "宮島", "18": "徳山",
    "19": "下関", "20": "若松", "21": "芦屋", "22": "福岡", "23": "唐津", "24": "大村",
}

BET_TYPE_MAP = {
    "3連単": "trifecta_3",
    "3連複": "trio_3",
    "2連単": "exacta_2",
    "2連複": "quinella_2",
    "単勝": "win",
    "複勝": "place",
    "拡連複": "quinella_place",
}

SPACE_RE = re.compile(r"[\s\u3000]+")
TAG_RE = re.compile(r"<[^>]+>")
SCRIPT_STYLE_RE = re.compile(r"<(script|style)[\s\S]*?</\1>", re.I)
ROW_RE = re.compile(r"<tr[\s\S]*?</tr>", re.I)
CELL_RE = re.compile(r"<t[dh][^>]*>([\s\S]*?)</t[dh]>", re.I)


@dataclass(frozen=True)
class FetchResult:
    page: str
    rno: int
    url: str
    status: int
    content: str
    sha256: str
    fetched_at_utc: str


def clean_text(value: str) -> str:
    value = SCRIPT_STYLE_RE.sub(" ", value)
    value = re.sub(r"<br\s*/?>", " ", value, flags=re.I)
    value = TAG_RE.sub(" ", value)
    value = unescape(value)
    value = SPACE_RE.sub(" ", value).strip()
    return value


def parse_number(value: str) -> float | None:
    value = value.replace(",", "")
    match = re.search(r"-?\d+(?:\.\d+)?", value)
    if not match:
        return None
    try:
        return float(match.group(0))
    except ValueError:
        return None


def parse_int(value: str) -> int | None:
    number = parse_number(value)
    if number is None:
        return None
    return int(number)


def canonical_selection(parts: Iterable[str], separator: str = "-") -> str:
    lanes = []
    for part in parts:
        found = re.findall(r"[1-6]", str(part))
        lanes.extend(found)
    return separator.join(lanes)


def row_cells(html: str) -> Iterator[list[str]]:
    for row in ROW_RE.findall(html):
        cells = [clean_text(cell) for cell in CELL_RE.findall(row)]
        if any(cells):
            yield cells


def build_url(page: str, hd: str, jcd: str, rno: int | None = None) -> str:
    params: dict[str, str | int] = {"hd": hd, "jcd": jcd}
    if rno is not None:
        params["rno"] = rno
    return BASE_URL.format(page=page, query=urlencode(params))


def fetch_page(page: str, hd: str, jcd: str, rno: int, delay: float = 0.25) -> FetchResult:
    url = build_url(page, hd, jcd, rno)
    req = Request(url, headers={"User-Agent": USER_AGENT})
    fetched_at = datetime.now(timezone.utc).isoformat()
    try:
        with urlopen(req, timeout=20) as response:
            raw = response.read()
            status = getattr(response, "status", 200)
    except (HTTPError, URLError) as exc:
        raise RuntimeError(f"fetch failed: {page} rno={rno} url={url} error={exc}") from exc
    finally:
        if delay:
            time.sleep(delay)
    # Official BOATRACE pages are Japanese HTML; apparent encoding is usually Shift_JIS/CP932.
    content = raw.decode("cp932", errors="replace")
    return FetchResult(
        page=page,
        rno=rno,
        url=url,
        status=status,
        content=content,
        sha256=hashlib.sha256(raw).hexdigest(),
        fetched_at_utc=fetched_at,
    )


def parse_race_meta(html: str, hd: str, jcd: str, rno: int, source_url: str) -> dict:
    text = clean_text(html)
    cutoff = None
    cutoff_match = re.search(r"締切予定\s*(\d{1,2}:\d{2})", text)
    if cutoff_match:
        cutoff = cutoff_match.group(1)
    title = None
    title_match = re.search(r"(第?\s*\d+R|\d+R)\s*([^\s]+)", text)
    if title_match:
        title = title_match.group(0)
    distance = None
    distance_match = re.search(r"(\d{4})m", text)
    if distance_match:
        distance = int(distance_match.group(1))
    return {
        "race_id": f"{hd}-{jcd}-{rno}",
        "hd": hd,
        "jcd": jcd,
        "venue_name": VENUE_CODES.get(jcd),
        "rno": rno,
        "cutoff_scheduled_time": cutoff,
        "race_title": title,
        "distance_m": distance,
        "source_url_racelist": source_url,
    }


def parse_entrants(html: str, hd: str, jcd: str, rno: int) -> list[dict]:
    """Parse racer rows from racelist.

    BOATRACE HTML changes class names frequently, so this parser combines two
    strategies:
    1. table-row extraction for stable numeric/text fields;
    2. conservative lane/racer-id detection from row text.

    The smoke gate checks for exactly six lanes; failing that is a parser signal,
    not a betting signal.
    """
    race_id = f"{hd}-{jcd}-{rno}"
    entrants: list[dict] = []
    seen: set[tuple[int, str]] = set()
    for cells in row_cells(html):
        joined = " ".join(cells)
        lane_match = re.search(r"(?:^|\s)([1-6])(?:\s|$)", joined)
        racer_match = re.search(r"(?:登録番号|登番)?\s*(\d{4})(?:\s|$)", joined)
        if not lane_match or not racer_match:
            continue
        lane = int(lane_match.group(1))
        racer_id = racer_match.group(1)
        key = (lane, racer_id)
        if key in seen:
            continue
        seen.add(key)
        numbers = [parse_number(c) for c in cells]
        numbers = [n for n in numbers if n is not None]
        name = None
        for cell in cells:
            if re.search(r"[一-龥ぁ-んァ-ンー]{2,}", cell) and not re.search(r"級|支部|出身|勝率", cell):
                name = cell
                break
        entrants.append({
            "race_id": race_id,
            "lane": lane,
            "racer_id": racer_id,
            "racer_name_raw": name,
            "racer_grade": next((c for c in cells if re.fullmatch(r"[AB][12]", c)), None),
            "raw_cells": cells,
            "numeric_values": numbers,
        })
    entrants.sort(key=lambda row: row["lane"])
    return entrants


def parse_before_info(html: str, hd: str, jcd: str, rno: int) -> list[dict]:
    race_id = f"{hd}-{jcd}-{rno}"
    text = clean_text(html)
    weather = {
        "temperature_c": None,
        "weather_text": None,
        "wind_speed_mps": None,
        "wind_direction_text": None,
        "water_temperature_c": None,
        "wave_height_cm": None,
    }
    temp = re.search(r"気温\s*(-?\d+(?:\.\d+)?)", text)
    wind = re.search(r"風速\s*(\d+(?:\.\d+)?)", text)
    water = re.search(r"水温\s*(-?\d+(?:\.\d+)?)", text)
    wave = re.search(r"波高\s*(\d+(?:\.\d+)?)", text)
    if temp: weather["temperature_c"] = float(temp.group(1))
    if wind: weather["wind_speed_mps"] = float(wind.group(1))
    if water: weather["water_temperature_c"] = float(water.group(1))
    if wave: weather["wave_height_cm"] = float(wave.group(1))

    rows: list[dict] = []
    for cells in row_cells(html):
        joined = " ".join(cells)
        lane_match = re.search(r"(?:^|\s)([1-6])(?:\s|$)", joined)
        if not lane_match:
            continue
        lane = int(lane_match.group(1))
        exhibition_time = None
        for cell in cells:
            val = parse_number(cell)
            if val is not None and 6.0 <= val <= 8.5:
                exhibition_time = val
                break
        rows.append({
            "race_id": race_id,
            "lane": lane,
            "exhibition_time": exhibition_time,
            "raw_cells": cells,
            **weather,
        })
    # Deduplicate by lane, preferring rows that contain an exhibition time.
    best: dict[int, dict] = {}
    for row in rows:
        lane = row["lane"]
        if lane not in best or (best[lane].get("exhibition_time") is None and row.get("exhibition_time") is not None):
            best[lane] = row
    return [best[lane] for lane in sorted(best)]


def parse_odds_table(html: str, hd: str, jcd: str, rno: int, page: str, source_url: str, fetched_at_utc: str) -> list[dict]:
    race_id = f"{hd}-{jcd}-{rno}"
    odds: list[dict] = []
    if page == "odds3t":
        bet_type = "trifecta_3"
        # Common text patterns look like: 1-2-3 12.3. Keep this as a robust fallback.
        for a, b, c, odd in re.findall(r"([1-6])\s*-\s*([1-6])\s*-\s*([1-6])\s+([0-9]+(?:\.[0-9]+)?)", clean_text(html)):
            odds.append(_odds_row(race_id, bet_type, f"{a}-{b}-{c}", odd, source_url, fetched_at_utc))
    elif page == "odds2tf":
        text = clean_text(html)
        # Two-pool page. Without relying on page-section parsing, record canonical exacta-like pairs.
        for a, b, odd in re.findall(r"([1-6])\s*-\s*([1-6])\s+([0-9]+(?:\.[0-9]+)?)", text):
            odds.append(_odds_row(race_id, "exacta_2", f"{a}-{b}", odd, source_url, fetched_at_utc))
        for a, b, odd in re.findall(r"([1-6])\s*=\s*([1-6])\s+([0-9]+(?:\.[0-9]+)?)", text):
            odds.append(_odds_row(race_id, "quinella_2", f"{a}={b}", odd, source_url, fetched_at_utc))
    return odds


def _odds_row(race_id: str, bet_type: str, selection: str, odd_text: str, source_url: str, fetched_at_utc: str) -> dict:
    decimal_odds = parse_number(odd_text)
    return {
        "race_id": race_id,
        "bet_type": bet_type,
        "selection": selection,
        "decimal_odds": decimal_odds,
        "odds_available": decimal_odds is not None and decimal_odds > 0,
        "snapshot_time_type": "closing",
        "collected_at_utc": fetched_at_utc,
        "source_url": source_url,
    }


def parse_results_and_payouts(html: str, hd: str, jcd: str, rno: int) -> tuple[list[dict], list[dict]]:
    race_id = f"{hd}-{jcd}-{rno}"
    text = clean_text(html)
    results: list[dict] = []
    payouts: list[dict] = []

    # Conservative result extraction: finish position + lane from compact result rows.
    for cells in row_cells(html):
        joined = " ".join(cells)
        finish = None
        lane = None
        if re.search(r"(?:^|\s)1(?:着|\s)", joined):
            finish = 1
        elif re.search(r"(?:^|\s)2(?:着|\s)", joined):
            finish = 2
        elif re.search(r"(?:^|\s)3(?:着|\s)", joined):
            finish = 3
        if finish is not None:
            lane_match = re.search(r"(?:艇番|枠)?\s*([1-6])", joined)
            if lane_match:
                lane = int(lane_match.group(1))
                results.append({
                    "race_id": race_id,
                    "finish_position": finish,
                    "lane": lane,
                    "raw_cells": cells,
                })

        for jp_type, canonical in BET_TYPE_MAP.items():
            if jp_type not in joined:
                continue
            # Look for selection + yen payout. Keep row raw for manual parser hardening.
            payout_match = re.search(r"([1-6](?:[-=][1-6]){0,2}).*?([\d,]+)円", joined)
            if payout_match:
                payouts.append({
                    "race_id": race_id,
                    "bet_type": canonical,
                    "winning_selection": payout_match.group(1),
                    "payout_yen_per_100": int(payout_match.group(2).replace(",", "")),
                    "raw_cells": cells,
                })

    # Fallback: parse payouts from page text when row parser misses them.
    for jp_type, canonical in BET_TYPE_MAP.items():
        pattern = rf"{re.escape(jp_type)}\s*([1-6](?:[-=][1-6]){{0,2}})\s*([\d,]+)円"
        for selection, yen in re.findall(pattern, text):
            if not any(p["bet_type"] == canonical and p["winning_selection"] == selection for p in payouts):
                payouts.append({
                    "race_id": race_id,
                    "bet_type": canonical,
                    "winning_selection": selection,
                    "payout_yen_per_100": int(yen.replace(",", "")),
                    "raw_cells": None,
                })
    return results, payouts


def write_jsonl(path: Path, rows: Iterable[dict]) -> int:
    count = 0
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
            count += 1
    return count


def write_csv(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    keys = sorted({key for row in rows for key in row.keys()})
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=keys, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def run_smoke(hd: str, jcd: str, out_dir: Path, rnos: Iterable[int], delay: float) -> dict:
    races: list[dict] = []
    entrants: list[dict] = []
    before_info: list[dict] = []
    odds: list[dict] = []
    results: list[dict] = []
    payouts: list[dict] = []
    fetch_log: list[dict] = []
    errors: list[dict] = []

    for rno in rnos:
        pages: dict[str, FetchResult] = {}
        for page in PAGE_TYPES:
            try:
                result = fetch_page(page, hd, jcd, rno, delay=delay)
                pages[page] = result
                fetch_log.append({
                    "race_id": f"{hd}-{jcd}-{rno}",
                    "page": page,
                    "url": result.url,
                    "status": result.status,
                    "sha256": result.sha256,
                    "fetched_at_utc": result.fetched_at_utc,
                })
                raw_path = out_dir / "raw" / hd / jcd / f"{rno:02d}_{page}.html"
                raw_path.parent.mkdir(parents=True, exist_ok=True)
                raw_path.write_text(result.content, encoding="utf-8")
            except Exception as exc:  # noqa: BLE001 - smoke test should collect all page failures
                errors.append({"race_id": f"{hd}-{jcd}-{rno}", "page": page, "error": str(exc)})

        if "racelist" in pages:
            races.append(parse_race_meta(pages["racelist"].content, hd, jcd, rno, pages["racelist"].url))
            entrants.extend(parse_entrants(pages["racelist"].content, hd, jcd, rno))
        if "beforeinfo" in pages:
            before_info.extend(parse_before_info(pages["beforeinfo"].content, hd, jcd, rno))
        for page in ("odds3t", "odds2tf"):
            if page in pages:
                odds.extend(parse_odds_table(pages[page].content, hd, jcd, rno, page, pages[page].url, pages[page].fetched_at_utc))
        if "raceresult" in pages:
            result_rows, payout_rows = parse_results_and_payouts(pages["raceresult"].content, hd, jcd, rno)
            results.extend(result_rows)
            payouts.extend(payout_rows)

    counts = {
        "races": write_jsonl(out_dir / "races.jsonl", races),
        "entrants": write_jsonl(out_dir / "entrants.jsonl", entrants),
        "before_info": write_jsonl(out_dir / "before_info.jsonl", before_info),
        "odds_snapshots": write_jsonl(out_dir / "odds_snapshots.jsonl", odds),
        "results": write_jsonl(out_dir / "results.jsonl", results),
        "payouts": write_jsonl(out_dir / "payouts.jsonl", payouts),
        "fetch_log": write_jsonl(out_dir / "fetch_log.jsonl", fetch_log),
        "errors": write_jsonl(out_dir / "errors.jsonl", errors),
    }
    write_csv(out_dir / "odds_snapshots.csv", odds)
    write_csv(out_dir / "payouts.csv", payouts)

    expected_races = len(list(rnos))
    entrant_counts = {race_id: 0 for race_id in [f"{hd}-{jcd}-{r}" for r in range(1, expected_races + 1)]}
    for row in entrants:
        entrant_counts[row["race_id"]] = entrant_counts.get(row["race_id"], 0) + 1

    summary = {
        "status": "pass" if not errors and counts["races"] == expected_races else "needs_review",
        "hd": hd,
        "jcd": jcd,
        "venue_name": VENUE_CODES.get(jcd),
        "expected_races": expected_races,
        "counts": counts,
        "entrant_counts_by_race": entrant_counts,
        "error_count": len(errors),
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "interpretation_warning": "Historical official odds are closing odds / upper-bound inputs, not executable pre-close prices.",
    }
    (out_dir / "smoke_summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    return summary


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="ADHOMS BOATRACE parser smoke test")
    parser.add_argument("--hd", default="20260918", help="Race date YYYYMMDD")
    parser.add_argument("--jcd", default="23", help="BOATRACE venue code, e.g. 23 for Karatsu")
    parser.add_argument("--rno-start", type=int, default=1)
    parser.add_argument("--rno-end", type=int, default=12)
    parser.add_argument("--out", default="research/boat/out/smoke")
    parser.add_argument("--delay", type=float, default=0.25, help="Delay between HTTP requests")
    args = parser.parse_args(argv)

    rnos = list(range(args.rno_start, args.rno_end + 1))
    summary = run_smoke(args.hd, args.jcd.zfill(2), Path(args.out), rnos, args.delay)
    print(json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True))
    return 0 if summary["status"] == "pass" else 2


if __name__ == "__main__":
    raise SystemExit(main())
