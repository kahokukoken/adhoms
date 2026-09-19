import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, realpath, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import {
  hashText,
  approveRecord,
  recordPublication,
  advanceCheckpoint,
  validateStore,
} from '../scripts/social-queue.mjs';

const BASE_COMMIT = 'd1aebb2a4f18295c8560278da911d4d4df40f8e2';
const SCRIPT = new URL('../scripts/social-queue.mjs', import.meta.url);

const candidate = Object.freeze({
  id: 'release-1',
  revision: 1,
  account: 'kahokuadhoms',
  text: 'abc',
});

const receipt = Object.freeze({
  id: 'release-1',
  revision: 1,
  account: 'kahokuadhoms',
  text_sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  approved_at: '2026-09-18T12:34:56.000Z',
  public_storage_approved: true,
});

const expectedApproval = Object.freeze({
  schema_version: 1,
  id: 'release-1',
  revision: 1,
  account: 'kahokuadhoms',
  text: 'abc',
  text_sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  approved_at: '2026-09-18T12:34:56.000Z',
  status: 'awaiting_manual_post',
});

async function makeStore() {
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), 'social-queue-')));
  const root = path.join(parent, 'social');
  await mkdir(path.join(root, 'approved'), { recursive: true });
  await mkdir(path.join(root, 'history'));
  await writeJson(path.join(root, 'state.json'), {
    schema_version: 1,
    github_checked_commit: BASE_COMMIT,
  });
  return { parent, root };
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function runCli(command, root, payload) {
  return spawnSync(process.execPath, [SCRIPT.pathname, command, '--root', root], {
    encoding: 'utf8',
    input: payload === undefined ? undefined : JSON.stringify(payload),
  });
}

async function runCliSplitInput(command, root, payload, splitAt) {
  const child = spawn(process.execPath, [SCRIPT.pathname, command, '--root', root]);
  const stdout = [];
  const stderr = [];
  child.stdout.on('data', (chunk) => stdout.push(chunk));
  child.stderr.on('data', (chunk) => stderr.push(chunk));
  const input = Buffer.from(JSON.stringify(payload), 'utf8');
  await new Promise((resolve) => setTimeout(resolve, 100));
  child.stdin.write(input.subarray(0, splitAt));
  await new Promise((resolve) => setTimeout(resolve, 100));
  child.stdin.end(input.subarray(splitAt));
  const [result] = await once(child, 'close');
  return {
    status: result,
    stdout: Buffer.concat(stdout).toString('utf8'),
    stderr: Buffer.concat(stderr).toString('utf8'),
  };
}

test('hashText hashes exact UTF-8 bytes without normalization', () => {
  assert.equal(hashText('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.notEqual(hashText('\u00e9'), hashText('e\u0301'));
});

test('approveRecord derives a fresh awaiting record from an exact approval binding', () => {
  const actual = approveRecord(candidate, receipt, []);
  assert.deepEqual(actual, expectedApproval);
  assert.notEqual(actual, candidate);
  assert.deepEqual(candidate, { id: 'release-1', revision: 1, account: 'kahokuadhoms', text: 'abc' });
});

test('approveRecord rejects unknown fields on candidate, receipt, and persisted records', () => {
  assert.throws(() => approveRecord({ ...candidate, notion_page_id: 'private' }, receipt, []));
  assert.throws(() => approveRecord(candidate, { ...receipt, approval_quote: 'secret' }, []));
  assert.throws(() => approveRecord(candidate, receipt, [{ ...expectedApproval, private_source: 'secret' }]));
});

test('approveRecord rejects mismatched approval bindings and caller-supplied status', () => {
  for (const changed of [
    { ...receipt, id: 'release-2' },
    { ...receipt, revision: 2 },
    { ...receipt, account: 'someoneelse' },
    { ...receipt, text_sha256: '0'.repeat(64) },
    { ...receipt, public_storage_approved: false },
  ]) {
    assert.throws(() => approveRecord(candidate, changed, []));
  }
  assert.throws(() => approveRecord({ ...candidate, status: 'posted' }, receipt, []));
});

test('approveRecord rejects invalid account, text, ID, revision, and timestamp', () => {
  assert.throws(() => approveRecord({ ...candidate, account: 'other' }, { ...receipt, account: 'other' }, []));
  assert.throws(() => approveRecord({ ...candidate, text: '   ' }, receipt, []));
  assert.throws(() => approveRecord({ ...candidate, id: '../escape' }, { ...receipt, id: '../escape' }, []));
  assert.throws(() => approveRecord({ ...candidate, revision: 0 }, { ...receipt, revision: 0 }, []));
  assert.throws(() => approveRecord(candidate, { ...receipt, approved_at: '2026-09-18T12:34:56Z' }, []));
});

test('approveRecord rejects duplicate IDs and exact-text hashes', () => {
  assert.throws(() => approveRecord(candidate, receipt, [expectedApproval]));
  const other = { ...candidate, id: 'release-2' };
  const otherReceipt = { ...receipt, id: 'release-2' };
  assert.throws(() => approveRecord(other, otherReceipt, [expectedApproval]));
});

test('recordPublication records user-reported publication without observed text', () => {
  const actual = recordPublication(expectedApproval, {
    url: 'https://x.com/kahokuadhoms/status/1234567890',
    recorded_at: '2026-09-18T13:00:00.000Z',
    verification: 'user_reported_unverified',
    observed_text: null,
  }, []);
  assert.deepEqual(actual, {
    schema_version: 1,
    id: 'release-1',
    revision: 1,
    account: 'kahokuadhoms',
    text_sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    url: 'https://x.com/kahokuadhoms/status/1234567890',
    recorded_at: '2026-09-18T13:00:00.000Z',
    verification: 'user_reported_unverified',
    status: 'posted',
  });
  assert.equal(expectedApproval.status, 'awaiting_manual_post');
});

test('recordPublication accepts compared evidence only when observed text exactly matches', () => {
  const report = {
    url: 'https://x.com/kahokuadhoms/status/1234567890',
    recorded_at: '2026-09-18T13:00:00.000Z',
    verification: 'text_compared',
    observed_text: 'abc',
  };
  assert.equal(recordPublication(expectedApproval, report, []).verification, 'text_compared');
  assert.throws(() => recordPublication(expectedApproval, { ...report, observed_text: 'abc ' }, []));
  assert.throws(() => recordPublication(expectedApproval, { ...report, observed_text: null }, []));
  assert.throws(() => recordPublication(expectedApproval, {
    ...report,
    verification: 'user_reported_unverified',
  }, []));
});

test('recordPublication rejects unsafe URLs, report fields, and invalid approval transitions', () => {
  const base = {
    url: 'https://x.com/kahokuadhoms/status/1234567890',
    recorded_at: '2026-09-18T13:00:00.000Z',
    verification: 'user_reported_unverified',
    observed_text: null,
  };
  for (const url of [
    'http://x.com/kahokuadhoms/status/1234567890',
    'https://x.com/other/status/1234567890',
    'https://user:pass@x.com/kahokuadhoms/status/1234567890',
    'https://x.com:444/kahokuadhoms/status/1234567890',
    'https://x.com/kahokuadhoms/status/1234567890?secret=1',
    'https://x.com/kahokuadhoms/status/1234567890#fragment',
  ]) {
    assert.throws(() => recordPublication(expectedApproval, { ...base, url }, []));
  }
  assert.throws(() => recordPublication(expectedApproval, { ...base, private_note: 'secret' }, []));
  assert.throws(() => recordPublication({ ...expectedApproval, status: 'posted' }, base, []));
});

test('recordPublication rejects duplicate IDs, text hashes, and URLs', () => {
  const report = {
    url: 'https://x.com/kahokuadhoms/status/1234567890',
    recorded_at: '2026-09-18T13:00:00.000Z',
    verification: 'user_reported_unverified',
    observed_text: null,
  };
  const history = [recordPublication(expectedApproval, report, [])];
  assert.throws(() => recordPublication(expectedApproval, { ...report, url: 'https://x.com/kahokuadhoms/status/2' }, history));
  const changedApproval = { ...expectedApproval, id: 'release-2' };
  assert.throws(() => recordPublication(changedApproval, { ...report, url: 'https://x.com/kahokuadhoms/status/2' }, history));
  const other = { ...expectedApproval, id: 'release-2', text: 'def', text_sha256: hashText('def') };
  assert.throws(() => recordPublication(other, report, history));
});

test('advanceCheckpoint requires a complete compare-and-swap and leaves input unchanged', () => {
  const current = { schema_version: 1, github_checked_commit: 'a'.repeat(40) };
  assert.throws(() => advanceCheckpoint(current, {
    expected_commit: 'a'.repeat(40), next_commit: 'b'.repeat(40), complete: false,
  }));
  assert.throws(() => advanceCheckpoint(current, {
    expected_commit: 'c'.repeat(40), next_commit: 'b'.repeat(40), complete: true,
  }));
  assert.throws(() => advanceCheckpoint(current, {
    expected_commit: 'a'.repeat(40), next_commit: 'B'.repeat(40), complete: true,
  }));
  assert.throws(() => advanceCheckpoint(current, {
    expected_commit: 'a'.repeat(40), next_commit: ['b'.repeat(40)], complete: true,
  }));
  assert.throws(() => advanceCheckpoint(current, {
    expected_commit: 'a'.repeat(40), next_commit: 'b'.repeat(40), complete: true, source_url: 'private',
  }));
  assert.deepEqual(current, { schema_version: 1, github_checked_commit: 'a'.repeat(40) });
  assert.deepEqual(advanceCheckpoint(current, {
    expected_commit: 'a'.repeat(40), next_commit: 'b'.repeat(40), complete: true,
  }), { schema_version: 1, github_checked_commit: 'b'.repeat(40) });
});

test('validateStore accepts an empty initialized store without echoing text', async () => {
  const { root } = await makeStore();
  assert.deepEqual(await validateStore(root), { approved: 0, history: 0 });
});

test('validateStore rejects invalid JSON, unknown fields, and tampered approval data', async (t) => {
  await t.test('invalid JSON', async () => {
    const { root } = await makeStore();
    await writeFile(path.join(root, 'state.json'), '{nope', 'utf8');
    await assert.rejects(validateStore(root));
  });
  await t.test('unknown state field', async () => {
    const { root } = await makeStore();
    await writeJson(path.join(root, 'state.json'), {
      schema_version: 1, github_checked_commit: BASE_COMMIT, source_url: 'private',
    });
    await assert.rejects(validateStore(root));
  });
  await t.test('tampered approval hash', async () => {
    const { root } = await makeStore();
    await writeJson(path.join(root, 'approved', 'release-1.json'), { ...expectedApproval, text_sha256: '0'.repeat(64) });
    await assert.rejects(validateStore(root));
  });
  await t.test('non-string state commit', async () => {
    const { root } = await makeStore();
    await writeJson(path.join(root, 'state.json'), {
      schema_version: 1, github_checked_commit: [BASE_COMMIT],
    });
    await assert.rejects(validateStore(root));
  });
});

test('validateStore cross-checks history against immutable approval and detects duplicates', async (t) => {
  const report = {
    url: 'https://x.com/kahokuadhoms/status/1234567890',
    recorded_at: '2026-09-18T13:00:00.000Z',
    verification: 'user_reported_unverified',
    observed_text: null,
  };
  const history = recordPublication(expectedApproval, report, []);

  await t.test('valid linked pair', async () => {
    const { root } = await makeStore();
    await writeJson(path.join(root, 'approved', 'release-1.json'), expectedApproval);
    await writeJson(path.join(root, 'history', 'release-1.json'), history);
    assert.deepEqual(await validateStore(root), { approved: 1, history: 1 });
  });
  await t.test('tampered history binding', async () => {
    const { root } = await makeStore();
    await writeJson(path.join(root, 'approved', 'release-1.json'), expectedApproval);
    await writeJson(path.join(root, 'history', 'release-1.json'), { ...history, revision: 2 });
    await assert.rejects(validateStore(root));
  });
  await t.test('non-string history hash', async () => {
    const { root } = await makeStore();
    await writeJson(path.join(root, 'approved', 'release-1.json'), expectedApproval);
    await writeJson(path.join(root, 'history', 'release-1.json'), {
      ...history, text_sha256: [history.text_sha256],
    });
    await assert.rejects(validateStore(root));
  });
  await t.test('duplicate approval hash', async () => {
    const { root } = await makeStore();
    await writeJson(path.join(root, 'approved', 'release-1.json'), expectedApproval);
    await writeJson(path.join(root, 'approved', 'release-2.json'), { ...expectedApproval, id: 'release-2' });
    await assert.rejects(validateStore(root));
  });
});

test('CLI persists an approval, publication, and checkpoint round trip', async () => {
  const { root } = await makeStore();
  const approved = runCli('approve', root, { candidate, receipt });
  assert.equal(approved.status, 0, approved.stderr);
  assert.equal(approved.stdout, 'approved release-1\n');

  const recorded = runCli('record', root, {
    id: 'release-1',
    report: {
      url: 'https://x.com/kahokuadhoms/status/1234567890',
      recorded_at: '2026-09-18T13:00:00.000Z',
      verification: 'text_compared',
      observed_text: 'abc',
    },
  });
  assert.equal(recorded.status, 0, recorded.stderr);
  assert.equal(recorded.stdout, 'recorded release-1\n');

  const checkpoint = runCli('checkpoint', root, {
    expected_commit: BASE_COMMIT,
    next_commit: 'b'.repeat(40),
    complete: true,
  });
  assert.equal(checkpoint.status, 0, checkpoint.stderr);
  assert.equal(checkpoint.stdout, `checkpoint ${'b'.repeat(40)}\n`);

  const validated = runCli('validate', root);
  assert.equal(validated.status, 0, validated.stderr);
  assert.equal(validated.stdout, 'valid approved=1 history=1\n');
  assert.deepEqual(JSON.parse(await readFile(path.join(root, 'approved', 'release-1.json'), 'utf8')), expectedApproval);
  assert.equal(JSON.parse(await readFile(path.join(root, 'state.json'), 'utf8')).github_checked_commit, 'b'.repeat(40));
});

test('CLI preserves Japanese text when UTF-8 input splits across chunks', async () => {
  const { root } = await makeStore();
  const text = '承認済みの日本語投稿';
  const japaneseBytes = Buffer.from(text, 'utf8');
  const candidate = { id: 'release-jp', revision: 1, account: 'kahokuadhoms', text };
  const receipt = {
    id: candidate.id,
    revision: candidate.revision,
    account: candidate.account,
    text_sha256: hashText(text),
    approved_at: '2026-09-18T12:34:56.000Z',
    public_storage_approved: true,
  };
  const payload = { candidate, receipt };
  const json = Buffer.from(JSON.stringify(payload), 'utf8');
  const splitAt = json.indexOf(japaneseBytes) + 1;
  const result = await runCliSplitInput('approve', root, payload, splitAt);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'approved release-jp\n');
  assert.equal(JSON.parse(await readFile(path.join(root, 'approved', 'release-jp.json'), 'utf8')).text, text);
});

test('CLI validates the whole store before mutation and leaves cursor unchanged on failure', async () => {
  const { root } = await makeStore();
  await writeFile(path.join(root, 'approved', 'broken.json'), '{bad', 'utf8');
  const result = runCli('checkpoint', root, {
    expected_commit: BASE_COMMIT,
    next_commit: 'b'.repeat(40),
    complete: true,
  });
  assert.notEqual(result.status, 0);
  assert.equal(JSON.parse(await readFile(path.join(root, 'state.json'), 'utf8')).github_checked_commit, BASE_COMMIT);
});

test('CLI refuses mutation while the exclusive lock is busy', async () => {
  const { root } = await makeStore();
  await writeFile(path.join(root, '.social-queue.lock'), 'busy\n', 'utf8');
  const result = runCli('approve', root, { candidate, receipt });
  assert.notEqual(result.status, 0);
  assert.deepEqual(await readdir(path.join(root, 'approved')), []);
});

test('CLI rejects symlinked storage paths', async () => {
  const { parent, root } = await makeStore();
  const actual = path.join(parent, 'actual-approved');
  await mkdir(actual);
  await symlink(actual, path.join(root, 'approved-link'));
  const linkedRoot = path.join(parent, 'linked-social');
  await symlink(root, linkedRoot);
  const rootResult = runCli('validate', linkedRoot);
  assert.notEqual(rootResult.status, 0);

  const originalApproved = path.join(root, 'approved');
  const movedApproved = path.join(parent, 'moved-approved');
  const { rename } = await import('node:fs/promises');
  await rename(originalApproved, movedApproved);
  await symlink(movedApproved, originalApproved);
  const directoryResult = runCli('validate', root);
  assert.notEqual(directoryResult.status, 0);
});

test('CLI rejects a symlinked ancestor without writing through it', async () => {
  const { parent, root } = await makeStore();
  const aliasContainer = await mkdtemp(path.join(tmpdir(), 'social-queue-alias-'));
  const linkedParent = path.join(aliasContainer, 'linked-parent');
  await symlink(parent, linkedParent, 'dir');
  const nestedRoot = path.join(linkedParent, 'social');

  const validateResult = runCli('validate', nestedRoot);
  assert.notEqual(validateResult.status, 0);
  const mutationResult = runCli('approve', nestedRoot, { candidate, receipt });
  assert.notEqual(mutationResult.status, 0);
  assert.deepEqual(await readdir(path.join(root, 'approved')), []);
  assert.equal((await readdir(root)).includes('.social-queue.lock'), false);
});

test('CLI validation errors do not echo rejected secret input', async () => {
  const { root } = await makeStore();
  const secret = 'DO-NOT-ECHO-THIS-TEXT';
  const result = runCli('approve', root, {
    candidate: { ...candidate, text: secret, private_token: secret },
    receipt,
  });
  assert.notEqual(result.status, 0);
  assert.equal(result.stdout.includes(secret), false);
  assert.equal(result.stderr.includes(secret), false);
});
