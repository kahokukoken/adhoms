import { VERSIONS } from './constants.mjs';
import { validateState } from './invariants.mjs';
import { replayGame } from './replay.mjs';

const VALID_KEY = 'adhoms.ver1.valid';
const CANDIDATE_KEY = 'adhoms.ver1.candidate';

function checksum(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function contentFor(record) {
  return JSON.stringify({
    format: record.format,
    versions: record.versions,
    savedAtTick: record.savedAtTick,
    state: record.state
  });
}

function makeSaveRecord(state) {
  const record = {
    format: 'adhoms-ver1-save',
    versions: structuredClone(state.versions),
    savedAtTick: state.tick,
    state: structuredClone(state)
  };
  return { ...record, checksum: checksum(contentFor(record)) };
}

function replayContentFor(record) {
  return JSON.stringify({
    format: record.format,
    versions: record.versions,
    savedAtTick: record.savedAtTick,
    setup: record.setup,
    actions: record.actions
  });
}

function makeReplayRecord(state) {
  const record = {
    format: 'adhoms-ver1-replay-backup',
    versions: structuredClone(state.versions),
    savedAtTick: state.tick,
    setup: structuredClone(state.initialSetup),
    actions: structuredClone(state.actions)
  };
  return { ...record, checksum: checksum(replayContentFor(record)) };
}

function diagnostic(classification, errors) {
  return { classification, errors: [...errors] };
}

function incompatibleVersions(versions) {
  return !versions ||
    versions.schema !== VERSIONS.schema ||
    versions.rules !== VERSIONS.rules ||
    versions.scenario !== VERSIONS.scenario;
}

function parseSaveRecord(raw) {
  if (raw === null) return { ok: false, missing: true, diagnostics: [] };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, diagnostics: [diagnostic('CORRUPT_SAVE', ['save is not valid JSON'])] };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, diagnostics: [diagnostic('CORRUPT_SAVE', ['save must be an object'])] };
  }

  if (parsed.format !== 'adhoms-ver1-save') {
    const versions = parsed.versions ?? parsed.state?.versions;
    const classification = incompatibleVersions(versions) ? 'INCOMPATIBLE_SAVE' : 'CORRUPT_SAVE';
    return { ok: false, diagnostics: [diagnostic(classification, ['save record format is invalid'])] };
  }
  if (incompatibleVersions(parsed.versions)) {
    return { ok: false, diagnostics: [diagnostic('INCOMPATIBLE_SAVE', ['save versions do not match runtime'])] };
  }
  if (checksum(contentFor(parsed)) !== parsed.checksum) {
    return { ok: false, diagnostics: [diagnostic('CORRUPT_SAVE', ['save checksum does not match'])] };
  }
  const validation = validateState(parsed.state);
  if (!validation.ok) {
    return { ok: false, diagnostics: [diagnostic('INVALID_SAVE_STATE', validation.errors)] };
  }
  return { ok: true, state: parsed.state };
}

function parseRecoveryRecord(raw) {
  if (raw === null) return { ok: false, missing: true, diagnostics: [] };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, diagnostics: [diagnostic('CORRUPT_SAVE', ['save is not valid JSON'])] };
  }
  if (parsed?.format !== 'adhoms-ver1-replay-backup') return parseSaveRecord(raw);
  if (incompatibleVersions(parsed.versions)) {
    return { ok: false, diagnostics: [diagnostic('INCOMPATIBLE_SAVE', ['save versions do not match runtime'])] };
  }
  if (checksum(replayContentFor(parsed)) !== parsed.checksum) {
    return { ok: false, diagnostics: [diagnostic('CORRUPT_SAVE', ['save checksum does not match'])] };
  }
  if (!parsed.setup || !Array.isArray(parsed.actions) || !Number.isInteger(parsed.savedAtTick)) {
    return { ok: false, diagnostics: [diagnostic('CORRUPT_SAVE', ['replay backup shape is invalid'])] };
  }
  try {
    const state = replayGame(parsed.setup, parsed.actions);
    const validation = validateState(state);
    if (!validation.ok || state.tick !== parsed.savedAtTick) {
      return { ok: false, diagnostics: [diagnostic('INVALID_SAVE_STATE', validation.ok ? ['replay backup tick does not match'] : validation.errors)] };
    }
    return { ok: true, state };
  } catch (error) {
    return { ok: false, diagnostics: [diagnostic('CORRUPT_SAVE', [`replay backup failed: ${error.message}`])] };
  }
}

export function saveGame(storage, state) {
  const validation = validateState(state);
  if (!validation.ok) return { ok: false, errors: validation.errors };
  const record = makeSaveRecord(state);
  try {
    const previous = parseSaveRecord(storage.getItem(VALID_KEY));
    if (previous.ok) {
      storage.setItem(CANDIDATE_KEY, JSON.stringify(makeReplayRecord(previous.state)));
    }
    // Replacing one localStorage key is atomic. The previous state remains as
    // a compact replay backup, avoiding two full multi-megabyte snapshots.
    storage.setItem(VALID_KEY, JSON.stringify(record));
    const checked = parseSaveRecord(storage.getItem(VALID_KEY));
    if (!checked.ok) return checked;
    return { ok: true };
  } catch (error) {
    return { ok: false, errors: [`storage write failed: ${error.message}`] };
  }
}

export function loadGame(storage) {
  let candidate;
  let valid;
  try {
    candidate = parseRecoveryRecord(storage.getItem(CANDIDATE_KEY));
    valid = parseSaveRecord(storage.getItem(VALID_KEY));
  } catch (error) {
    return { ok: false, diagnostics: [diagnostic('STORAGE_UNAVAILABLE', [error.message])] };
  }
  if (candidate.ok && valid.ok) {
    return candidate.state.tick > valid.state.tick
      ? { ok: true, state: candidate.state }
      : { ok: true, state: valid.state };
  }
  if (valid.ok) {
    return candidate.missing
      ? { ok: true, state: valid.state }
      : { ok: true, state: valid.state, diagnostics: candidate.diagnostics };
  }
  if (candidate.ok) return { ok: true, state: candidate.state, diagnostics: valid.diagnostics };
  if (!valid.ok) {
    return {
      ok: false,
      diagnostics: [...candidate.diagnostics, ...valid.diagnostics]
    };
  }
}

export function clearSave(storage) {
  storage.removeItem(CANDIDATE_KEY);
  storage.removeItem(VALID_KEY);
}

export { CANDIDATE_KEY, VALID_KEY };
