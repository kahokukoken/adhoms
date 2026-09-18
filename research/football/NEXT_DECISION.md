# Next decision gate

After the current workflow finishes:

- If opening→closing prediction fails the information-edge rule, stop expanding coarse public-stat proxies.
- If it passes, test the signal out of sample on a fresh league/season before any staking model.
- Independently report edge erosion from the market-feedback experiment at 0%, 10%, 25%, 50%, 75%, 100% adoption.
- Do not move to real-money recommendations unless prediction edge, information edge, and execution edge all survive their gates.


## Event-engine calibration lock (2026-09-18)

The state-transition engine is now calibrated on observable aggregate volume, not raw event-log transition counts.

Locked baseline:
- Effective possessions per match: 138
- EPL 2017/18 Wyscout observed shots/match: 22.2395
- Neutral engine shots/match at 138 possessions: 22.2806
- EPL 2017/18 observed goals/match: 2.67895
- Neutral engine goals/match at 138 possessions: 2.6772

Calibration rules:
1. Do not map provider event rows one-to-one onto latent ADHOMS states.
2. Do not retune effective possessions to improve score-tail fit; 138 is the volume anchor.
3. Use observable distribution residuals (0 goals, 1 goal, O2.5, 4+, 5+, both-score, team 3+) to evaluate cascade/tail mechanics.
4. Adaptation, State Jump, and Cascade must remain separately ablatable.
5. Any parameter change must improve the intended residual without materially breaking the locked shot/goal volume anchor.
6. Market performance remains an external validation target, not a calibration target.

The failed direct-transition calibration that collapsed mean scoring to ~0.76 goals/match is retained as a negative result: provider logging granularity is not equivalent to simulation-state granularity.
