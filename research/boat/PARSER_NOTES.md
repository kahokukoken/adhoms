# BOATRACE Parser Notes

Status: parser smoke-test implementation notes.

## Confirmed public-page structure

Smoke target checked manually against official BOATRACE pages:

```text
hd=20260918
jcd=23
rno=1
venue=唐津
```

Useful observed fields:

- `racelist`: venue, event name, race navigation, scheduled cutoff times, race title/distance, entrant lanes, registration numbers, grades, names, branch/birthplace, age/weight, F/L, average ST, national/local rates, motor/boat rates.
- `beforeinfo`: entrant weight, exhibition time, tilt, start exhibition order/ST, temperature, weather, wind speed, water temperature, wave height.
- `odds3t`: page explicitly labels the values as `締切時オッズ`.
- `raceresult`: finish order, start information, winning method, payout table, result-time weather/water data.

## Parser hardening requirements found during first source check

The official text extraction uses Japanese full-width numerals in several result/table positions, for example `１`, `２`, `３`. Parser logic must normalize full-width digits before regex matching.

Payout rows can have continuation rows, especially for `拡連複` and `複勝`; parsers must not assume every payout row repeats the bet type.

3-ren-tan odds are arranged in dense repeated columns. A simple `1-2-3` text regex is not enough for the rendered table form because many rows display grouped numbers as `2 | 3 | 5.7` under a fixed first-lane header. The first parser version is therefore a smoke-test scaffold; odds extraction must be verified against raw HTML and tightened before historical backtesting.

## Current claim boundary

Allowed:

> The public pages expose enough official fields to build a machine-ingestion smoke test.

Not allowed:

> The parser is fully validated.

Not allowed:

> Any ROI produced from the first parser run is reliable.
