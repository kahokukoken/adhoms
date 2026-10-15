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

Pending verification. No completion or publication claimed yet.
