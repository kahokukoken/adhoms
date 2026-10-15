# PR #17 remaining failures and same-Site update — 2026-10-15

## Preflight (before implementation)

- Locks: DL-001/003/013/014/018/020/021; requirements V1-12/13/15–19.
- Purpose: fix the remaining PR #17 checks and publish its checked game to the existing private Site, retaining its origin, installed-app identity and stored progress. New players must complete the commissioning mail, four weekly drills, report submission and approval before April 2029.
- Reproduction: head `4ab897373f10d76d7c830d5d2878fae7ae9ea688`, [QA #335](https://github.com/kahokukoken/adhoms/actions/runs/38569126449): 11 file-URL main-game tests click through the mandatory pretrial and time out; the short-review capture reports nonempty initial storage. Sequence rejects the obsolete source-bound review.
- Canonical sources retrieved 2026-10-15: [current hub](https://app.notion.com/p/3e4fbe78bd3b81f599defb498432cfef), [Work protocol](https://app.notion.com/p/3e9fbe78bd3b81ae97e3f02510788629), [pretrial contract](https://app.notion.com/p/3f7fbe78bd3b8148bb8acb8ff04d41dc), especially mandatory startup, approval order, and existing-save protection. DL-021 explicitly supersedes only the old fresh-April start.
- Current implementation: `playwright.config.js` seeds a main-game save only for the HTTP origin. File-URL scenarios do not receive it. `captureShortReview` inherits the runner's default storage state when given its browser. The reading exporter must include the new `.adhomsDecision` content as well as the existing monthly conversation.
- Impact surface: test setup, authentic reader exports and review provenance; Site build input and entry. No initial gate removal or production save-key change is authorized by a test failure.
- Invariants: new-game mail first; four distinct decisions and submission before approval; old main-game resumes; session isolation and stored weights/choices; same Site/project/URL, custom audience and PWA `/adhoms` identity; no deletion of localStorage or IndexedDB; retain existing rebuilt save reader and its assets.
- Verification: preserve failing CI evidence; run complete browser, Node, standalone and sequence gates in GitHub CI; independently review real displayed sequences with no design notes; inspect deployed bytes/access and actual published UI. Browser infrastructure absent locally is a limitation, not a pass. Human Acceptance and physical-iPhone timing remain unperformed.
- Unresolved conflicts: none for the bounded test fixes. The Site currently uses an independent IndexedDB save format; preserve its existing `rebuild.html` continuation instead of fabricating conversion into PR #17's localStorage format.

## Root causes

1. Test state is scoped by origin, so the HTTP-only fixture does not establish the intended post-approval main-game precondition for file URLs.
2. Playwright's supplied test browser carries context defaults: a reader context must explicitly request empty storage.
3. The old independent review is bound to an earlier source digest. A new review is required; changing the digest without reading the actual output is not a repair.

## Results

- Fix source: `481ddf309e8258175cb487feaeff5fcef99d8d65`; [QA #336](https://github.com/kahokukoken/adhoms/actions/runs/38704400496). Browser: **290 passed, 0 failed** (3.4m). Node: **66 passed, 0 failed**. Standalone digest/build check passed. Sequence exact-repeat check: **1,152 distinct / 1,152 displayed**, no repeated groups. Its source-bound reader gate was intentionally UNREVIEWED until the reviews below were complete.
- **Logic**: existing all-branch regressions passed. No game runtime or save schema changed to satisfy the failing tests.
- **UI**: web and standalone browser suite passed; fresh pretrial regressions still use empty storage and do not import the post-pretrial fixture. Short-review capture explicitly starts empty.
- **Sequence**: five isolated readers completed every year of both actual-control routes, with previous March boundaries, and returned bounded PASS. The new `.adhomsDecision` text is included in the packets. Source digest `0a94e527b723777ec034d789f27688d44a37846032d330d6c99e0b548999f2ae`; standalone SHA256 `a8c6234a6180e15a02e823c30b1b811a84c13a8a2359c384f780750de11b82b2`. See `sequence/internal-review.json` and its five 2026-10-15 reports for coverage and minor outstanding editorial observations. Final same-head Sequence rerun is pending.
- **Save/Resume**: existing PR browser regressions passed. Site wrapper's four DOM tests passed, including selected pretrial choice reload, May main-game reload and a real legacy IndexedDB checkpoint reopened with byte-equivalent stored state through the retained reader. Published browser and access/asset verification are pending.
- **Human Acceptance**: 未実施. Selected-route AI reading and automated tests do not establish enjoyment, 45–60-minute duration, physical-iPhone behavior, or all-choice narrative acceptance.
- Publication: pending. PR remains draft; no merge is included.

## Final-rerun save failure investigation

QA #337 on `18d793d` passed Sequence but failed one of290 browser cases: standalone creative follow-up after reload returned to April. QA #336 had passed the same test. Do not classify this as fixed or ignore it: capture primary/daily storage and assert saved calendar before and after reload; repeat the concrete standalone scenario10 times in CI. Runtime/reader text is unchanged while the failure is isolated.

QA #339 (`324b6e2`) passed the290 browser checks,10 repeated standalone creative-save scenarios,66 Node contracts and Sequence. Direct primary-state equality before/after reload and a separate15-run DOM reproduction did not reproduce the April fallback. The fixture is now explicitly one-shot per tab: it cannot reseed a missing primary save on reload and conceal a loss. Runtime save logic is unchanged; the transient #337 failure is disclosed rather than claimed as a proven production defect. Keep the10-run gate and snapshot assertions for this concrete risk. Its output directory is isolated so a second Playwright invocation cannot remove the main suite's short-review artifacts.
