import { createHash, randomUUID } from 'node:crypto';
import { open, readFile, readdir, lstat, realpath, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ACCOUNT = 'kahokuadhoms';
const SHA = /^[0-9a-f]{40}$/;
const HASH = /^[0-9a-f]{64}$/;
const ID = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const APPROVAL_KEYS = ['schema_version', 'id', 'revision', 'account', 'text', 'text_sha256', 'approved_at', 'status'];
const HISTORY_KEYS = ['schema_version', 'id', 'revision', 'account', 'text_sha256', 'url', 'recorded_at', 'verification', 'status'];

function fail(message = 'Invalid data') { throw new Error(message); }
function plainObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function exactKeys(value, keys) {
  if (!plainObject(value)) fail();
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) fail();
}
function canonicalTime(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)) fail();
  const date = new Date(value);
  if (Number.isNaN(date.valueOf()) || date.toISOString() !== value) fail();
}
function validId(value) { if (typeof value !== 'string' || !ID.test(value)) fail(); }
function validRevision(value) { if (!Number.isSafeInteger(value) || value < 1) fail(); }
function validSha(value) { if (typeof value !== 'string' || !SHA.test(value)) fail(); }
function validHash(value) { if (typeof value !== 'string' || !HASH.test(value)) fail(); }

function validateApproval(record) {
  exactKeys(record, APPROVAL_KEYS);
  if (record.schema_version !== 1 || record.account !== ACCOUNT || record.status !== 'awaiting_manual_post') fail();
  validId(record.id);
  validRevision(record.revision);
  if (typeof record.text !== 'string' || record.text.trim() === '') fail();
  validHash(record.text_sha256);
  if (record.text_sha256 !== hashText(record.text)) fail();
  canonicalTime(record.approved_at);
  return record;
}
function validateUrl(value) {
  if (typeof value !== 'string') fail();
  let url;
  try { url = new URL(value); } catch { fail(); }
  if (url.protocol !== 'https:' || url.hostname !== 'x.com' || url.port || url.username || url.password || url.search || url.hash) fail();
  if (!new RegExp(`^/${ACCOUNT}/status/[0-9]+$`).test(url.pathname) || url.href !== value) fail();
}
function validateHistory(record) {
  exactKeys(record, HISTORY_KEYS);
  if (record.schema_version !== 1 || record.account !== ACCOUNT || record.status !== 'posted') fail();
  validId(record.id);
  validRevision(record.revision);
  validHash(record.text_sha256);
  validateUrl(record.url);
  canonicalTime(record.recorded_at);
  if (!['user_reported_unverified', 'text_compared'].includes(record.verification)) fail();
  return record;
}
function ensureUnique(records, fields) {
  for (const field of fields) {
    const seen = new Set();
    for (const record of records) {
      if (seen.has(record[field])) fail();
      seen.add(record[field]);
    }
  }
}

export function hashText(text) {
  if (typeof text !== 'string') fail();
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function approveRecord(candidate, receipt, existing) {
  exactKeys(candidate, ['id', 'revision', 'account', 'text']);
  exactKeys(receipt, ['id', 'revision', 'account', 'text_sha256', 'approved_at', 'public_storage_approved']);
  if (!Array.isArray(existing)) fail();
  existing.forEach(validateApproval);
  ensureUnique(existing, ['id', 'text_sha256']);
  validId(candidate.id);
  validRevision(candidate.revision);
  if (candidate.account !== ACCOUNT || typeof candidate.text !== 'string' || candidate.text.trim() === '') fail();
  canonicalTime(receipt.approved_at);
  const textHash = hashText(candidate.text);
  if (receipt.public_storage_approved !== true || receipt.id !== candidate.id || receipt.revision !== candidate.revision ||
      receipt.account !== candidate.account || receipt.text_sha256 !== textHash) fail();
  if (existing.some((record) => record.id === candidate.id || record.text_sha256 === textHash)) fail();
  return { schema_version: 1, id: candidate.id, revision: candidate.revision, account: candidate.account,
    text: candidate.text, text_sha256: textHash, approved_at: receipt.approved_at, status: 'awaiting_manual_post' };
}

export function recordPublication(approved, report, history) {
  validateApproval(approved);
  exactKeys(report, ['url', 'recorded_at', 'verification', 'observed_text']);
  if (!Array.isArray(history)) fail();
  history.forEach(validateHistory);
  ensureUnique(history, ['id', 'text_sha256', 'url']);
  validateUrl(report.url);
  canonicalTime(report.recorded_at);
  if (report.verification === 'user_reported_unverified') {
    if (report.observed_text !== null) fail();
  } else if (report.verification === 'text_compared') {
    if (report.observed_text !== approved.text) fail();
  } else fail();
  if (history.some((item) => item.id === approved.id || item.text_sha256 === approved.text_sha256 || item.url === report.url)) fail();
  return { schema_version: 1, id: approved.id, revision: approved.revision, account: approved.account,
    text_sha256: approved.text_sha256, url: report.url, recorded_at: report.recorded_at,
    verification: report.verification, status: 'posted' };
}

export function advanceCheckpoint(current, input) {
  exactKeys(current, ['schema_version', 'github_checked_commit']);
  exactKeys(input, ['expected_commit', 'next_commit', 'complete']);
  if (current.schema_version !== 1) fail();
  validSha(current.github_checked_commit);
  validSha(input.expected_commit);
  validSha(input.next_commit);
  if (input.complete !== true || input.expected_commit !== current.github_checked_commit) fail();
  return { schema_version: 1, github_checked_commit: input.next_commit };
}

async function assertRealPath(target, kind) {
  const stat = await lstat(target);
  if (stat.isSymbolicLink() || (kind === 'directory' ? !stat.isDirectory() : !stat.isFile())) fail();
}
async function assertCanonicalRoot(root) {
  const resolved = path.resolve(root);
  if (await realpath(resolved) !== resolved) fail();
  await assertRealPath(resolved, 'directory');
}
async function readJson(file) {
  await assertRealPath(file, 'file');
  return JSON.parse(await readFile(file, 'utf8'));
}
async function readRecords(directory, validator) {
  await assertRealPath(directory, 'directory');
  const records = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.gitkeep' && entry.isFile()) continue;
    if (!entry.isFile() || entry.isSymbolicLink() || !entry.name.endsWith('.json')) fail();
    const record = await readJson(path.join(directory, entry.name));
    validator(record);
    if (entry.name !== `${record.id}.json`) fail();
    records.push(record);
  }
  return records;
}
async function loadStore(root) {
  await assertCanonicalRoot(root);
  const state = await readJson(path.join(root, 'state.json'));
  exactKeys(state, ['schema_version', 'github_checked_commit']);
  if (state.schema_version !== 1) fail();
  validSha(state.github_checked_commit);
  const approved = await readRecords(path.join(root, 'approved'), validateApproval);
  const history = await readRecords(path.join(root, 'history'), validateHistory);
  ensureUnique(approved, ['id', 'text_sha256']);
  ensureUnique(history, ['id', 'text_sha256', 'url']);
  const approvals = new Map(approved.map((item) => [item.id, item]));
  for (const item of history) {
    const approval = approvals.get(item.id);
    if (!approval || approval.revision !== item.revision || approval.account !== item.account || approval.text_sha256 !== item.text_sha256) fail();
  }
  return { state, approved, history };
}
export async function validateStore(root) {
  const store = await loadStore(path.resolve(root));
  return { approved: store.approved.length, history: store.history.length };
}

async function writeNewJson(file, value) {
  const handle = await open(file, 'wx', 0o600);
  try { await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8'); }
  finally { await handle.close(); }
}
async function replaceState(root, value) {
  const temporary = path.join(root, `.state-${randomUUID()}.tmp`);
  try {
    await writeNewJson(temporary, value);
    await rename(temporary, path.join(root, 'state.json'));
  } catch (error) {
    await unlink(temporary).catch(() => {});
    throw error;
  }
}
async function readStdin() {
  let input = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) input += chunk;
  return JSON.parse(input);
}
async function mutate(root, action) {
  await assertCanonicalRoot(root);
  const lock = path.join(root, '.social-queue.lock');
  const handle = await open(lock, 'wx', 0o600);
  try { return await action(await loadStore(root)); }
  finally { await handle.close(); await unlink(lock).catch(() => {}); }
}
async function main() {
  const [command, flag, rootArgument, ...extra] = process.argv.slice(2);
  if (!['validate', 'approve', 'record', 'checkpoint'].includes(command) || flag !== '--root' || !rootArgument || extra.length) fail();
  const root = path.resolve(rootArgument);
  if (command === 'validate') {
    const counts = await validateStore(root);
    process.stdout.write(`valid approved=${counts.approved} history=${counts.history}\n`);
    return;
  }
  const payload = await readStdin();
  await mutate(root, async (store) => {
    if (command === 'approve') {
      exactKeys(payload, ['candidate', 'receipt']);
      const record = approveRecord(payload.candidate, payload.receipt, store.approved);
      await writeNewJson(path.join(root, 'approved', `${record.id}.json`), record);
      process.stdout.write(`approved ${record.id}\n`);
    } else if (command === 'record') {
      exactKeys(payload, ['id', 'report']);
      validId(payload.id);
      const approved = store.approved.find((item) => item.id === payload.id);
      if (!approved) fail();
      const record = recordPublication(approved, payload.report, store.history);
      await writeNewJson(path.join(root, 'history', `${record.id}.json`), record);
      process.stdout.write(`recorded ${record.id}\n`);
    } else {
      const state = advanceCheckpoint(store.state, payload);
      await replaceState(root, state);
      process.stdout.write(`checkpoint ${state.github_checked_commit}\n`);
    }
  });
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? '')) {
  main().catch(() => { process.stderr.write('error: validation failed\n'); process.exitCode = 1; });
}
