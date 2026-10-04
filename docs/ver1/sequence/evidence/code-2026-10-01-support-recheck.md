# ADHOMS support-loop independent code recheck

Date: 2026-10-01 14:35 UTC
Source digest independently recomputed: `98ff2ece403bf0e46273976b7c8231531732d225ae5a94bdebe5ef1c0d4cfede`
Scope: read-only source review and focused Chromium probes; no repository source edits. Full suite/standalone/Sequence publication gates remain integration-owned.

## Result

**PASS for the requested recheck; no remaining blocker found in this scope.** All three previously reported defects are resolved.

1. **Year3 source-specific replies — resolved.** `replyRevisit` now maps all 11 actual propagation rules to separate burden/cooperation replies. Independently exercised all 22 combinations. Each reply retains the correct source rule, has distinct content, and leaves town/district/relation values unchanged. Welfare-first names the factory/logistics burden; schedule-shift names fixed-work constraints; warning-fatigue no longer invents staffed road guidance. Read each mapping against the underlying choice/summary.
2. **Legacy final assent — resolved.** A restored legacy session containing `forest_evacuation=start_now` without `actionResponses` displays that the decision exists but the actor reply is absent. No acceptance record is created during reload; the former organizer-accepted assertion is absent.
3. **Superseded personal allocation — resolved.** `manual_override → forest → system_priority` marks personal allocation assent `superseded`, restores baseline risk effects, retains the original target as history, and suppresses its active response in the UI. Confirmed the same behavior after save/reload.

## Additional requested guards

- **No-op equipment replies: PASS.** `portable_shelter=none`, `mobile_command=standby`, and unprepared `portable_redeploy=hold` do not claim secured/deployed equipment and leave derived effects unchanged.
- **New-run mobile capability: PASS.** Tested no suppliers, lab only, factory only, lab+factory, school only, and warehouse only. Mobile deployment becomes available only with both accepted lab and factory responses, alongside the existing capacity gate.
- **Portable supplier unresolved: correctly bounded.** School-ground/warehouse assent does not create portable equipment. Current new-run command availability omits portable shelter deployment. This is an explicit unavailable capability, not a claimed implemented supplier. Legacy recorded capability remains available without manufacturing agreement history.
- **Rendering: PASS.** Repeated FEED rendering preserves canonical light state byte-for-byte in the checked final-session context.

## Evidence and limits

Focused probes used the current source served on isolated localhost port 8021 with the prescribed font/cache/browser environment. Structured evidence is saved at `/workspace/shared/adhoms-support-code-recheck-evidence.json`. An initial probe lost its own run identity while replacing synthetic states; it was corrected to preserve `sessionId`, then all assertions passed. That harness issue was not treated as a product defect.

Existing regression references: `tests/ver1-support-loop.spec.js` covers welfare reply provenance, legacy fallback, reversed allocation status, and no-op replies; `tests/ver1-proposal-model.spec.js` covers provenance/resource gates. The independent probes additionally covered all 22 source-rule replies and reversal reload/UI behavior.

Logic: PASS within scope
UI: PASS for the verified fallback/active-response displays
Sequence: only the affected causal reply semantics were checked here; broader reader gate is integration-owned
Save/Resume: PASS for legacy fallback and reversed allocation
Human Acceptance: 未実施
