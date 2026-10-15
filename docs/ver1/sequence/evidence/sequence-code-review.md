# Independent Code Review — Sequence Continuity

Base: e18f9f6381dd68f799a32aeb4306bdb208bcfb98
Head: 2815a80ad3c549ff3b799daf24fe99f8d472cc26
Reviewer scope: read-only implementation review. Checkout/index/HEAD unchanged. Temporary baseline extraction and probes only under /tmp. No reader packets or reader findings were inspected; no subagents dispatched.

Read: AGENTS.md; seven-field preflight; decision-locks.json/md; current-spec; supplied protocol, spine, bible and relevant individual-source snapshots (especially Minato, Ren, Akari, Chihiro). The supplied snapshots have individual fetched timestamps; this review does not assert a fresh Notion retrieval. Reviewed integration diff, resolver, state/event/propagation/final/save consumers, packet structure and selected cross-year/month text. This is not an independent first-reader review of all 1,152 posts.

### Strengths

- Authored year packets and a read-only resolver separate prose from simulation. Choice fallback matches real event Memory IDs, avoiding reapplying numerical deltas.
- Independently exercised all 13 flood/wildlife/snow branches: removing flags while retaining real generated Memory produced the same resolved ordinary prose.
- Independently exercised 324 later-year rows marked 町の日常 through the real observation action; none queued seasonal research.
- Recovery reads the persisted final result, differentiates critical/danger from safe, preserves livelihood/relation loss and unknown-result language. Post-rain packets avoid bringing Chihiro/Gaku back as unconditional active labor.
- Fiscal-year age progression and current-role treatment are centralized. Month-entry week is retained and relevant catch-up remains chronological.

### Issues

#### Critical (Must Fix)

None found.

#### Important (Should Fix)

1. **Legacy observation IDs now point to different people and observations, so an old saved weight silently moves to a different statement.**

   - File: `scripted-scenario.js:360-369`, `scripted-scenario.js:394-403` (positional packet replacement followed by reuse/upsert of the old ID). Related consumer: `scripted-scenario.js:527-532` (research source IDs/author retained in saves).
   - Reproduction, using the actual base and head pages in Chromium:
     1. On BASE, enter fiscal Y3 April / calendar 2031-04, week 1. Mark `scenario-24-2` with ＋, then save.
     2. This ID is クリカ: 「田中さんの8時5分のバス、園が8時に開くなら『早起きして』は無理では。端末持ってない人にも同じことある？ 配信で聞いてみます。」
     3. Load that exact persisted light/daily/session state on HEAD.
     4. Same calendar and week return, but `scenario-24-2` is now 山本 大輔: 「うちも、早く返事ができる妻に連絡が集まってた。予定表では交代になってるのに、変更の電話を受けるのはいつも同じ人だったんです。」 Its ＋ remains active.
     5. The research object still has `sourceWho: "クリカ"`, `sourceIds: ["scenario-24-2"]`, and the old bus/nursery result. The visible source card now belongs to another person and topic instance.
   - Why it matters: the user did not weight Daisuke's observation. Preserving the string ID alone does not preserve the saved observation's meaning; bookmarks/minus use the same IDs and are exposed to the same reassignment. Research provenance contradicts the newly rendered source. This directly violates preflight's preservation of saved observation weights and research-source references, even though same-version save/reload tests pass.
   - Suggested fix: add explicit content-version provenance for legacy saves and preserve the original weighted/bookmarked/research-source observation snapshot as historical content, with stable identity. New authored observations need a distinct identity, or a deliberate migration mapping only where speaker and observation still correspond. Do not silently transfer an old weight merely because a new row occupies the same array position, and do not rewrite already-issued research to make it appear to have come from the new speaker.
   - Add a BASE-to-HEAD save fixture test, including changed-speaker observations and research provenance; the new test at current lines 67–77 only saves/reloads HEAD and cannot detect this upgrade defect.
   - Repro scripts: `/tmp/sequence-review-migrate.cjs` and `/tmp/sequence-review-probe.cjs`. Baseline copy: `/tmp/sequence-review-base`.

#### Minor (Nice to Have)

None promoted to findings.

### Recommendations

Resolve the saved-observation migration before delivery. Keep legacy identity/provenance verification separate from ID-count equality and same-version round-trip verification. No broad refactor is needed for the narrative resolver.

### Declined to judge

- Full prose enjoyment, 45–60-minute first-play pacing and Human Acceptance: belong to actual experience review, which this code review cannot certify.
- Complete monthly-route narrative sufficiency across all 48 months: inspected the selection algorithm and specific Y3 April/Y3 November/Y5 April/July examples, but did not perform a full isolated read. Missing week-2/3 slots alone were not called a bug because meetings/week-4 summaries can legitimately preserve their essential causal content.
- Q-01 BRINE surname/instrument, Q-03 final scoring thresholds, election outcomes and specific graduate jobs: explicitly unresolved decisions, not implementation choices for this reviewer.
- Optional first-choice Memory without flags: current Memory ID/tags do not uniquely encode that first choice; the resolver's cautious “confirm the record” wording was not treated as a lost branch bug. It correctly avoids guessing from a generic Memory ID.
- Year-3 numerical side-effect recomputation and future simulation design: unchanged calculation scope. This review checked consumers and display behavior, not a redesign of propagation.
- UI layout on all devices, standalone artifact digest and the full 112-case suite: reported prior evidence was not independently re-run here. This review used actual Chromium pages for targeted behavior only.
- Uncommitted dist/test/evidence work visible while the parent continued working: outside the fixed HEAD range, and not included in the verdict.

### Assessment

**Ready to merge? With fixes.**

The resolver and new authored data provide a substantial continuity improvement, with real Memory fallback and daily-research checks passing targeted independent probes. A reproducible legacy-save semantic migration defect remains: old user weights and research source IDs can silently attach to another person's new observation. Fix that before presenting save compatibility as PASS.

Status for this review: targeted Logic PASS; targeted legacy Save/Resume FAIL; UI full review not performed; Sequence full first-read judgment deferred to the separately assigned readers; Human Acceptance 未実施.
