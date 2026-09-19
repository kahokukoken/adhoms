# Chat-approved X publication

Target: @kahokuadhoms. Text-only, explicit user requests only. No schedule.
The assistant must obtain approval of the exact text and public GitHub storage.
Reuse scripts/social-queue.mjs to validate and create an immutable approval.
After that approval exists on main, create exactly one new file in a separate
single-file commit: social/requests/<approval-id>.json, containing only id and
text_sha256. This commit triggers .github/workflows/x-publish.yml.

The workflow validates the store, checks approval/hash and existing history,
verifies X account identity, and creates an exclusive durable attempt file in
social/attempts/<text-hash>.json through GitHub's create-only contents API.
Only a confirmed 201 permits one POST to X. Existing attempt files always block
another send, including on rerun, timeout, rejected response or interrupted job.
Do not delete an attempt to blindly retry. Inspect X first and resolve manually.

On success the URL is logged before saving social/history/<id>.json, so a
history-write failure can be recovered without reposting. Verification records
whether X's creation response matched the approved text; it is not an independent
timeline read. Secret values and full HTTP error bodies are never logged.

Character validation is deliberately conservative: at most 140 Unicode code
points. This accepts plain Japanese posts but may reject valid longer ASCII or
URL posts. Split posts, media, DMs, replies and automatic retries are unsupported.

Repository writers are trusted operators. A SHA-256 digest binds text; it does
not authenticate chat approval. Editing workflow code or deleting attempt files
can bypass these controls and requires human review. API charges remain governed
by the owner's X account; the workflow cannot buy credits or enable auto-recharge.

From another conversation, read this file and social/history first. Do not infer
the precise text or approval from memory. Report successful publication only
after the workflow returns an X status URL. The initial introduction is already
posted and must not be reposted.
