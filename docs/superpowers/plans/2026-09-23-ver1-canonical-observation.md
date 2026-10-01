# Ver1 canonical observation flow

**Scope:** First development unit after source reconciliation: V1-01–05, V1-12–13. Preserve existing lightweight events and later story; do not call this complete Ver1.

## Sources read before implementation

2026-09-23: current hub, Blueprint (lightweight policy, FEED density, year 1), Story Spine (opening, directives), Character Bible, operating rules, revision history. Individual pages read: Kurika `3e0fbe78bd3b8197a972c72c23230ce9`, Saya `3e0fbe78bd3b815998aef5b89724009e`, Fujii `3e0fbe78bd3b810391d7fbe947367a49`, Mizuno `3e0fbe78bd3b81e3a4dbf386314ae8f2`, Saeki `3e0fbe78bd3b81c1ba0cf88d3ab965e3`. URLs use `https://app.notion.com/p/` plus ID. Kurika's identity remains unrevealed. Pending BRINE/ending questions are outside this change.

## Steps and acceptance

1. **Information first:** create the Notion hub; link original pages; reconcile stale follow and year-theme statements; record Rev.0.14; add root `AGENTS.md` and `docs/ver1/current-spec.md`. Done before game changes.
2. **Observe current failures:** add behavioral browser checks for weekly new post IDs, reload continuity and monthly/quarterly cadence. Run red against baseline. Existing tests requiring TGS title and fixed personality slogans must be updated with source rationale.
3. **Opening / V1-01–02:** remove TGS/public prototype labels; explain lottery, observation limits, internal weighting and role; introduce Type-0 Work Assistant without exposing its origin.
4. **FEED / V1-03–04:** edit active `scripted-scenario.js`, not an overridden earlier renderer. Add authored weekly follow-ups/background observations, informal Kurika text and topic-specific responsive meeting exchanges. Keep initial major observations readable; monthly summaries must include later-week observations.
5. **Cadence / V1-05:** monthly observation conversation; quarterly review may retain priorities without editing; March annual summary. Remove ordinary monthly sliders. Do not invent new consequential simulation rules for cosmetic review controls.
6. **Persistence / V1-13:** save validated daily UI state separately from authoritative light state; restore only matching calendar; preserve reactions, week, pending meeting and priorities. Handle stale/corrupt saves and final-event reloads without calendar rollback.
7. **Readability / V1-12:** body text at least 16px and supporting labels 13px in player flow; mobile width and scroll controls verified. Preserve FIELD TERMINAL layout.
8. **Verification:** run affected tests then full browser suite, including actual five-year calendar and standalone file. Read opening→weeks→monthly summary→quarterly review in mobile UI. Record evidence and remaining limits in matrix/hub. Publish this bounded update to existing PR #17, already authorized; no merge/release claim.

## Risks and boundaries

- Legacy renderers are layered; modify the final active owner and verify optional-event/prelude wrappers still work.
- January uses calendar year in legacy UI and trial year in light state; monthly post IDs must agree with `monthIndex()`.
- Existing routine numeric drift is not a complete lightweight model; do not imply quarterly priorities control later scripted event outcomes.
- Authored year-1 full cast, years 2–5 daily consequences, ending-order repair and first-play duration remain separately tracked work.

## Execution result

Notion hub and source reconciliation completed before game changes. Six new observation/persistence/mobile tests now accompany the implementation (including the reviewer-found July→August boundary). Final browser suite: 35 passed. See `docs/ver1/verification-2026-09-23.md` for evidence and remaining narrative scope.
