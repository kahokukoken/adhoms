# Phase 2 Transport Baseline Validation

Date: 2026-09-18
Branch: `phase2-simulation-core`
Issue: #13
Draft PR: #14

## Scope

First real ADHOMS simulation vertical slice for Kurikara transport access.

The slice currently includes:

- canonical Entity / State / Relation / Perception / Action / Memory-ready world contracts
- deterministic seeded monthly tick
- bus access derived from relation properties rather than resident-type outcome branches
- weather friction applied to relation effectiveness
- service capacity pressure
- information propagation with different reach / verification / novelty bias
- path-dependent avoidance memory after repeated travel failures
- residual capture without auto-fitting
- simulation-to-FEED adapter
- 100-seed validation harness

## Invariants checked across 100 seeds

1. Relation strength remains in the 0–1 range.
2. Population/count-like state never becomes negative.
3. Fixed seed replay is deterministic.
4. Information actors do not directly mutate physical incident state.

All four invariants passed in the current baseline.

## Intended causal behavior observed

- The same bus-service change affects residents differently because their distance, schedule fit, alternative mobility and relation strength differ.
- Rain and snow reduce relation effectiveness; they do not directly assign success/failure.
- Stressed services can cross overload thresholds under weather friction while resilient services remain below them.
- Repeated travel failure increases avoidance memory and lowers later effective access.
- Successful experience partially decays avoidance memory without erasing history.
- クリカ and グレート・ノト can amplify the same observation differently without altering ground truth.
- FEED items can differ within the same calendar month when underlying simulation state differs.

## Residual policy

Residuals are stored as `observed - predicted` with classification metadata. Capturing a residual does not modify rules, relation strengths or model parameters.

Before changing theory, mismatches are classified as one of:

- input
- relation
- local-rule
- delay
- observation
- implementation
- unclassified

## Current limitation

This is still a deliberately narrow vertical slice. It does not yet model the full town, institutions, economy, demographics, infrastructure aging, political legitimacy, or multi-year policy feedback. The purpose is to validate the causal architecture before adding breadth.
