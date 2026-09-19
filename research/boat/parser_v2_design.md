# Parser v2 Design Notes

The first parser smoke-test file is intentionally broad and conservative. v2 should tighten parsing using fixture-driven rules.

## Digit normalization

Before parsing visible text, normalize:

```python
FULLWIDTH_DIGIT_TRANS = str.maketrans('０１２３４５６７８９', '0123456789')
```

Apply to cleaned text and cell text. This keeps Japanese terms readable while making numeric regexes stable.

## Result rows

Official result text for the checked race appears like:

```text
着 | 枠 | ボートレーサー | レースタイム
１ | 1 | 4193 郷原 章平 | 1'49"4
２ | 3 | 3784 中島 友和 | 1'50"2
```

The parser should handle:

```text
finish_position = first numeric cell under 着
lane = second numeric cell under 枠
racer_id = 4-digit value in racer cell
```

## Payout rows

Official payout text for the checked race appears like:

```text
3連単 | 1-3-2 | ¥460 | 1
3連複 | 1=2=3 | ¥270 | 1
2連単 | 1-3 | ¥190 | 1
2連複 | 1=3 | ¥200 | 1
拡連複 | 1=3 | ¥100 | 1
1=2 | ¥170 | 4
2=3 | ¥160 | 2
単勝 | 1 | ¥110 |
複勝 | 1 | ¥100 |
3 | ¥150 |
```

Continuation rows inherit the previous bet type only for multi-row payout types.

## Odds rows

Columnar 3-ren-tan odds need a fixture before claims. Until then, odds parser output should be considered diagnostic.
