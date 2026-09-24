# Ver1 Decision Lock verification — 2026-09-25

Scope: DL-001 FEED reading order and DL-002 FEED post length.

Verified revision: `32b58f614541b9e7a55fdbf1df93c92162a842a8`
PR: #17
GitHub Actions: Ver1 QA #155 (run 36065474704)

## Changes

- FEED now renders observations in chronological week order within the month.
- Newly arrived weekly observations append below previously read observations.
- When a week is advanced, the viewport moves to the first observation of the newly arrived week.
- FEED cards now carry `data-week` so reading-position behavior is testable.
- Post copy is no longer authored to a uniform short length.
- Residents/influencers may remain terse; officials, experts, and people with more context can post substantially longer explanations.
- No line-clamp/truncation is introduced.

## Regression locks

Decision Lock tests now enforce:
- DL-001: newest-first sorting cannot return silently.
- DL-002: authored FEED must retain both short and long post lengths.
- Browser flow verifies that newly appended week content remains below existing observations and becomes visible after advancing.
- Browser flow verifies long posts are not visually line-clamped.

## Result

Ver1 QA #155: **success**.
Standalone review artifact: `adhoms-ver1-review` (artifact 10836266517)
QA evidence: `adhoms-ver1-qa-evidence` (artifact 10836301540)

This is a functional/regression verification, not V1-14 human-experience acceptance.
