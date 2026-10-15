# Causal Integrity Refactor Preflight — 2026-09-30

## 1. Purpose
Resolve the causal-integrity FAIL without expanding authored prose. Keep DL-007 lightweight simulation. Make active Ver1 use one causal world-state authority, give major-character history a minimal canonical home through existing Memory/Relation concepts, and add regression checks that distinguish authored scene skeleton from state-dependent facts.

## 2. Reproduction
- Legacy `S` mutates `pop/life/fisc/trust/resilience` through `drift()` on week/month progress while Year-2 choices, propagation, capabilities and final disaster use `ADHOMS_LIGHT_STATE`.
- Years 2–5 continuity is selected by fiscal year/month packets; major-character continuity is primarily authored prose. Light state has no character-addressable history structure.
- Research can change visible investigation reports but does not by itself alter the canonical world state or major event availability.

## 3. Canonical sources
- Notion current hub.
- Work protocol §11 causal-integrity gate.
- Implementation Blueprint: lightweight scenario-controlled simulation; town six fields; major characters have separate Relation / Memory; FEED/research read state; no full resident simulation.
- DL-007 and DL-014.
- 2026-09-30 causal-integrity audit.

## 4. Current implementation
- `index.html`: legacy `S` UI/calendar/old metrics and `drift()`.
- `ver1/ver1-state.js`: canonical lightweight town/district/relation/memory/flags/disaster.
- `ver1/ver1-events.js`, `ver1/ver1-propagation.js`, `ver1/ver1-disaster.js`, `ver1/ver1-final-event.js`: canonical event→state→capability→final path.
- `ver1/ver1-continuity*.js`: authored scene packets with limited state resolvers.

## 5. Impact surface
Week/month progression, header summary, save/resume, major event choices, later-year continuity, optional events, final disaster, sequence tests, standalone build.

## 6. Invariants
Do not change FEED order/density, T-0WA opening, meeting anchoring, optional BRINE/soba two-stage choices, existing event choice effects, final-event ordering, unresolved Q-01/Q-03/Q-05, or Human Acceptance status. Do not invent population/fiscal formulas or detailed resident simulation.

## 7. Verification
- Single State Authority: legacy summary metrics must not mutate independently with time progression or influence canonical decision/final calculations.
- Character History Authority: canonical Memory supports entity references and preserves them through save/resume.
- Narrative Provenance: state-dependent resolvers only assert selected/recorded history; unknown remains unknown.
- Existing browser QA/sequence/save tests remain required.
