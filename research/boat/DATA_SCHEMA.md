# Boat Race Research Data Schema

Status: draft schema for parser and backtest implementation.

## Identifiers

Every table must include:

```text
race_id = hd + '-' + jcd + '-' + rno
hd      = YYYYMMDD
jcd     = venue code
rno     = race number 1..12
```

Entrant-level rows also include:

```text
lane = 1..6
racer_id = official racer registration number
```

Bet-level rows include:

```text
bet_type
selection
snapshot_time_type
```

## `races`

One row per race.

Fields:

- race_id
- hd
- jcd
- venue_name
- event_name
- event_day_label
- rno
- cutoff_scheduled_time
- race_title
- distance_m
- is_morning
- is_summer_time
- is_nighter
- is_midnight
- source_url_racelist
- source_url_beforeinfo
- source_url_result

## `entrants`

One row per boat/racer in a race, parsed from `racelist`.

Fields:

- race_id
- lane
- racer_id
- racer_name
- racer_grade
- branch
- birthplace
- age
- weight_kg
- f_count
- l_count
- avg_start_timing
- national_win_rate
- national_2_rate
- national_3_rate
- local_win_rate
- local_2_rate
- local_3_rate
- motor_no
- motor_2_rate
- motor_3_rate
- boat_no
- boat_2_rate
- boat_3_rate
- early_race_ref
- same_series_history_json

## `before_info`

One row per entrant per race, parsed from `beforeinfo`.

Fields:

- race_id
- lane
- weight_kg_before
- adjustment_weight_kg
- exhibition_time
- tilt
- propeller_status
- parts_exchange_json
- previous_race_info_json
- start_exhibition_course
- start_exhibition_st
- weather_observed_time
- temperature_c
- weather_text
- wind_speed_mps
- wind_direction_text
- water_temperature_c
- wave_height_cm

## `odds_snapshots`

One row per selection per race per bet type per snapshot.

Historical official pages may only provide closing odds. Live collection must add pre-close snapshots.

Fields:

- race_id
- bet_type
- selection
- decimal_odds
- odds_available
- snapshot_time_type: `closing`, `t_minus_5m`, `t_minus_3m`, `t_minus_1m`, `manual_unknown`
- odds_update_time_text
- collected_at_utc
- source_url

Bet types:

- win
- place
- quinella_place
- exacta_2
- quinella_2
- trifecta_3
- trio_3

## `results`

One row per finisher per race, parsed from `raceresult`.

Fields:

- race_id
- finish_position
- lane
- racer_id
- racer_name
- race_time_text
- start_course
- start_timing
- winning_method
- result_temperature_c
- result_weather_text
- result_wind_speed_mps
- result_water_temperature_c
- result_wave_height_cm
- returned_lanes_json
- notes_text

## `payouts`

One row per winning payout selection per race.

Fields:

- race_id
- bet_type
- winning_selection
- payout_yen_per_100
- popularity_rank
- is_returned_or_special

## `model_predictions`

One row per candidate selection before betting.

Fields:

- model_run_id
- race_id
- bet_type
- selection
- p_model
- p_model_lower_bound
- market_probability
- decimal_odds_used
- expected_return
- edge
- eligible_flag
- rejection_reason

## `bet_signals`

One row per simulated/paper/live bet.

Fields:

- model_run_id
- race_id
- bet_type
- selection
- odds_snapshot_time_type
- odds_used
- stake_yen
- bankroll_before_yen
- bankroll_after_yen
- result_flag
- payout_yen
- profit_yen
- edge_at_bet_time
- edge_at_closing

## `bankroll_runs`

One row per full simulation.

Fields:

- model_run_id
- training_window
- validation_window
- test_window
- bankroll_start_yen
- bankroll_end_yen
- total_stake_yen
- total_return_yen
- roi
- hit_rate
- bet_count
- race_count
- max_drawdown_yen
- max_drawdown_pct
- longest_losing_streak
- ruin_flag
- bootstrap_ruin_probability
- notes

## Data quality flags

Every parser should emit flags instead of silently dropping rows:

- `parse_ok`
- `missing_odds`
- `zero_odds`
- `returned_boat`
- `weather_missing`
- `beforeinfo_missing`
- `name_mismatch`
- `racer_id_missing`
- `race_cancelled_or_abnormal`

Rows with flags may be excluded later, but the exclusions must be reported.
