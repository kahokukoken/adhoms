# X Approval Queue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Make the approved first-stage ChatGPT/manual-X workflow resumable, with validated public records and no posting capability.

**Architecture:** ChatGPT reads connected sources and proposes at most three drafts privately. A dependency-free Node module and local CLI validate explicit approval receipts, persist approved text, record manual publication, and separately advance a GitHub reading cursor. The code cannot authenticate a chat speaker: the trusted operator must verify actual approval in the current conversation before calling it.

**Tech Stack:** Node.js 22+ built-ins, node:test, JSON; no new runtime dependencies.

**Spec:** docs/superpowers/specs/2026-09-18-x-publishing-design.md

## Global Constraints

- 初期版はユーザーからの「X投稿案を作って」を契機に動く。
- 定期監視や自動投稿は初期版に含めず、既存スケジュールを変更しない。
- 未承認案はChatGPT会話内に限る。
- 文章生成はこのChatGPTセッションが担当する。
- 既存ゲーム本体、研究コード、既存Actionsは変更しない。
- この第一段階でX投稿用ワークフローや有効な認証情報は追加しない。
- Public JSON rejects unknown keys; no private source bodies, Notion IDs, credentials, or raw approval quotes.
- A strict field schema cannot discover secrets concealed in approved text. Human content/privacy review is mandatory and must not be advertised as fully automated.

### Task 1: Validated manual-publication store and operator guide

**Files:**
- Create scripts/social-queue.mjs (pure validation/state operations and CLI entry)
- Create tests/social-queue.test.mjs (unit tests and subprocess/temp-directory persistence tests)
- Create social/README.md (Japanese operator procedure, commands, limitations)
- Create social/state.json (initial cursor, pinned to base d1aebb2a4f18295c8560278da911d4d4df40f8e2)
- Create social/approved/.gitkeep and social/history/.gitkeep (empty queues; no invented approvals)

**Interfaces:**
- `hashText(text)` returns lowercase SHA-256 over exact UTF-8 text, without normalization.
- `approveRecord(candidate, receipt, existing)` returns a fresh public record; candidate keys exactly id, revision, account, text. receipt keys exactly id, revision, account, text_sha256, approved_at, public_storage_approved. existing is an array of valid approved records. Require all bindings to match, account `kahokuadhoms`, storage consent literally true, nonempty trimmed text, safe filename ID, positive integer revision, canonical UTC timestamp. Output includes schema_version 1, candidate fields, text_sha256, approved_at, status `awaiting_manual_post`. Never accept caller-supplied status. Duplicate ID or text hash is rejected even after publication.
- `recordPublication(approved, report, history)` returns a fresh public history record; report keys exactly url, recorded_at, verification, observed_text. verification is `user_reported_unverified` (observed_text null) or `text_compared` (observed_text exactly matches approved text). Store no observed_text. Require canonical HTTPS x.com/kahokuadhoms/status/<digits> without query, fragment, credentials or port. History binds id, revision, account, text_sha256, URL, timestamp, verification, status `posted`. No automatic verification claim; text_compared is operator-supplied evidence. Reject duplicate ID, hash or URL. Keep original approval immutable.
- `advanceCheckpoint(current, input)` returns a fresh state; current exactly schema_version 1 and github_checked_commit (40 lowercase hex). input exactly expected_commit, next_commit, complete. Require complete literally true and expected_commit equal to current cursor. Reject unknown/private fields and invalid SHA. No timestamps or source URLs in cursor.
- `validateStore(root)` reads and validates state and every approved/history JSON, cross-checks each history with immutable approval, rejects duplicates/tampering/unknown fields, and returns counts without echoing text. Empty approval/history directories are valid; corrupt data fails closed.
- CLI: `node scripts/social-queue.mjs <validate|approve|record|checkpoint> --root <social-directory>`. Mutation commands read a single JSON object from stdin; approve payload exactly candidate and receipt, record payload exactly id and report, checkpoint payload is checkpoint input. Print only concise result IDs/counts. Generic validation errors must not print secret input. No network and no source ingestion.
- Mutations validate the entire store first; serialize using a local exclusive lock and refuse when busy; reject symlinked storage paths. No overwrite of approved/history files. State replaces atomically with a same-directory temporary file. Validate all data before any public JSON write. On failure leave cursor unchanged. Root must already contain valid state and directory skeleton; do not auto-create a public store from arbitrary drafts.

- [ ] **Step 1: Write failing behavioral tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { hashText, approveRecord, advanceCheckpoint } from '../scripts/social-queue.mjs';
test('hashes exact bytes', () => {
  assert.equal(hashText('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
test('partial reads never advance the cursor', () => {
  const current = { schema_version: 1, github_checked_commit: 'a'.repeat(40) };
  assert.throws(() => advanceCheckpoint(current, {
    expected_commit: 'a'.repeat(40), next_commit: 'b'.repeat(40), complete: false
  }));
  assert.equal(current.github_checked_commit, 'a'.repeat(40));
});
```

Add literal fixtures for approved `abc`, valid binding/consent, empty queue, body/account/revision/hash mismatch, unknown private fields, duplicate ID/hash, wrong-account URL, URL credentials/query/fragment, invalid transition, unverified vs compared publication, incorrect observed text, tampered approval/history, stale cursor, invalid JSON, lock busy, symlink paths and persisted round trip. Use real filesystem and subprocesses, not mocks. Every test names a real break it catches.

- [ ] **Step 2: Run RED**

Run `node --test tests/social-queue.test.mjs`; save expected missing-feature failure evidence in report. If module absence prevents behavioral assertions, add empty exported stubs and rerun to see actual failing assertions before implementing.

- [ ] **Step 3: Implement strict pure operations and storage adapter**

Use built-ins: node:crypto createHash, node:fs promises, node:path, node:url. Implement exact-key validators shared across input/readback paths; derive and validate immutable output rather than trusting caller status. Keep all writes behind successful validation and a try/finally exclusive lock. Use `open(path, 'wx')` for new immutable records and lock, same-directory temp+rename for state. Reject unexpected persisted fields rather than stripping them silently. Example invariant:

```js
if (receipt.public_storage_approved !== true ||
    receipt.text_sha256 !== hashText(candidate.text) ||
    receipt.account !== candidate.account ||
    receipt.id !== candidate.id || receipt.revision !== candidate.revision) {
  throw new Error('Approval binding is invalid');
}
```

No signature/cryptographic-authentication claim for a plain hash or caller-supplied receipt. CLI no-argument/import must never write or post.

- [ ] **Step 4: Write guide and initial state**

Document exact candidate/receipt/report JSON examples using harmless fixture text only; examples are not live approvals. Explain resume: read this guide/state/history, capture current GitHub head, completely retrieve compare pages and relevant public files (not just commit titles), omit social-only/plan-only changes, check exact matches against history, then propose 0–3 candidates in chat. On first run baseline only; no mass historical announcement. If compare diverges or truncates, stop without checkpoint. Source permission/partial read errors do not advance state. After complete reading and successful candidate delivery, persist checkpoint with compare-and-swap; retain unapproved drafts only in conversation. Lost drafts require re-presentation, not fabricated approvals. Notion requires individual public-release confirmation and is not included in public cursor. Explain branch availability and connector-only environments: operator must run validator in a checkout before saving exact validated outputs through connector; raw connector writes bypass local checks. Do not claim these checks are repository branch protection.

Document manual status as derived: approval without history is waiting, with valid history is posted (and verification label). Explain text length is finally checked by X manual composer; no posting API in phase one. Credentials must never be requested in chat.

- [ ] **Step 5: Run GREEN and inspect scope**

```sh
node --test tests/social-queue.test.mjs
node scripts/social-queue.mjs validate --root social
git diff --check
git status --short
```

Expected: focused tests pass, store counts zero, no mutation of game/research/workflow files, no test fixture queued. Existing Playwright suite needs browser dependencies and local server; if not available report unrun rather than claiming full-game regression success.

- [ ] **Step 6: Commit and report**

```sh
git add scripts/social-queue.mjs tests/social-queue.test.mjs social
git commit -m "feat: add approval-gated manual X publication records"
```

Report red/green evidence, changed files, remaining limits, and commit. Independent task and final review follow. No network publish/merge/push by implementer.
