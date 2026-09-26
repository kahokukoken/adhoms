# ADHOMS Ver1 Decision Locks

This file is a **change barrier**, not a design summary.

A decision marked `locked` is presumed binding in every implementation task. It is not superseded by:
- an older branch or prototype;
- a framework/default UI convention;
- an existing test that encodes old behavior;
- an assistant inference such as “X-like means newest-first”;
- implementation convenience;
- a later document that merely omits the decision.

A lock changes only when the user explicitly changes that decision. When that happens:
1. mark the old lock `superseded`;
2. name the replacement lock;
3. update Notion first;
4. update the machine-readable registry and affected tests in the same implementation unit.

Machine-readable source: [decision-locks.json](decision-locks.json).

## Mandatory pre-change check

Before editing behavior, narrative, UI, data shape, or copy:
1. Read `docs/ver1/decision-locks.json`.
2. List the lock IDs touched by the proposed change.
3. If the proposed change conflicts with a lock, **stop implementation**. Do not reinterpret the lock. Resolve it only from a new explicit user decision.
4. If an old test conflicts with a lock, the test is stale and must be updated; the lock does not bend to the test.
5. Add or update a regression check for any lock that can be machine-tested.

## Current locks

| ID | Area | Binding decision |
| --- | --- | --- |
| DL-001 | FEED reading order | Downward chronological reading; new weekly observations append below already-read content. Startup and saved-week restoration must not trigger the new-week scroll. |
| DL-002 | FEED post length | Variable by speaker/content; no uniform two-line/short-post constraint. |
| DL-003 | UI direction | Portrait smartphone, one-column FEED remains the primary direction. |
| DL-004 | Follow | No Follow mechanic in current Ver1. |
| DL-005 | +/- | Internal observation weight, not popularity/approval. |
| DL-006 | Monthly flow | No mandatory monthly sliders. |
| DL-007 | Scope | Story/characters/causality first, lightweight simulation. |
| DL-008 | Ending order | Admin review → private TOWA/Kiso → Directive 4 → epilogue. |
| DL-009 | T-0WA reveal | Full naming/voice origin remains hidden in Ver1. |
| DL-010 | BRINE names | Unresolved; never silently choose individual names. |
| DL-011 | Staff FEED onboarding | First April begins with T-0WA's user-specified greeting and ADHOMS explanation, then staff introductions, terminal checks and conversational instruction before residents. The opening scene-setting remains separate; no permanent “ADHOMSとは” panel after the first monthly report. Practice does not queue town research or block progress; no repeat in later months/years. |

DL-011 saved-entry clarification (2026-09-26, hub section 20): later-month saves offer an explicit read-only transcript of the first-day conversation without resetting progress or inserting it into the live monthly FEED. The redundant permanent SOCIAL FEED title/weight instructions and recurring ADHOMS year-context-only cards are removed.

## Why this exists

The project already suffered a regression where “X-like one-column FEED” was incorrectly generalized into “newest-first FEED” and where authored posts were compressed into a uniformly short style, despite earlier decisions to read downward and allow long posts. This registry exists so omissions and familiar UI conventions cannot silently erase a decided premise.
