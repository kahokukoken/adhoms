import { advanceMonth } from '../core/advance.mjs';
import { applyCommand } from '../core/commands.mjs';
import { evaluateRun } from '../core/evaluation.mjs';
import { clearSave, loadGame, saveGame } from '../core/persistence.mjs';
import { createInitialState, getCalendar } from '../core/state.mjs';
import { observeMonth } from '../observation/terminal.mjs';
import { resolveInvestigations } from '../observation/investigations.mjs';
import { JA_COPY } from '../scenario/copy.ja.mjs';
import { getScenarioInput } from '../scenario/events.mjs';
import { openAnnualDialog, openCrisisDialog, openQuarterlyDialog, openSourceDialog } from './render-dialogs.mjs';
import { renderFeed } from './render-feed.mjs';

const DEFAULT_SETUP = Object.freeze({
  seed: 164,
  priorities: Object.freeze({ welfare: 60, market: 60, future: 60, technology: 60, environment: 60 }),
  terminalPolicy: Object.freeze({ coverage: 0.2, balance: 0.7, compensation: 40, dataScope: 0.5, anonymity: 0.8, surveyFrequency: 1 })
});

const DIMENSION_LABELS = Object.freeze({
  adaptability: '適応力', fiscalSustainability: '財政持続性', legitimacy: '正統性',
  observationQuality: '観測品質', resilience: '回復力', socialStability: '社会安定'
});
const RATIO_POLICIES = new Set(['coverage', 'balance', 'dataScope', 'anonymity']);

const setupView = document.querySelector('#setup-view');
const gameView = document.querySelector('#game-view');
const actionBar = document.querySelector('#action-bar');
const feedList = document.querySelector('#feed-list');
const diagnostic = document.querySelector('#diagnostic');
const evaluationView = document.querySelector('#evaluation-view');
const nextButton = document.querySelector('#next-month-button');
const quarterlyDialog = document.querySelector('#quarterly-dialog');
const annualDialog = document.querySelector('#annual-dialog');
const crisisDialog = document.querySelector('#crisis-dialog');
const sourceDialog = document.querySelector('#source-dialog');
const filterSelect = document.querySelector('#feed-filter');

for (const dialog of [quarterlyDialog, annualDialog, crisisDialog]) {
  dialog.addEventListener('cancel', event => event.preventDefault());
}

let gameState = null;
let resumeNotice = null;
let visibleLimit = 40;

const calendarText = calendar => `${calendar.year}年${calendar.month}月`;
const approximate = value => `≈${Math.round(value / 5) * 5}`;

function initialObservation() {
  return {
    id: 'opening:terminal-observation', observedTick: 0, sourceId: 'resident-0042',
    sourceType: 'resident-terminal', sourceLabel: '抽選端末 / 河合谷地区', districtId: 'mountain',
    confidence: 0.62, distortion: 0.28, scope: 'local', meta: 'INITIAL OBSERVATION',
    text: '通院日に家族の送迎が難しい世帯から、病院そのものより移動手段が途切れることへの不安が届いています。'
  };
}

function resumeObservation(state) {
  return {
    id: `resume:${state.tick}`, observedTick: state.tick, sourceType: 'system', sourceLabel: 'ADHOMS / 保存記録',
    confidence: 1, distortion: 0, scope: 'system', system: true, meta: 'SESSION RESTORED',
    text: `${state.tick}か月目終了時点と未処理の制度手続を含む保存データから再開しました。`
  };
}

function monthlyFeedItems(state, events, observation, completedCalendar) {
  const observed = events.filter(event => event.type !== 'MAYORAL_ELECTION' && !event.type.startsWith('CLIMAX_')).map(event => {
    const item = observation.items.find(candidate => candidate.evidenceRefs.includes(event.id));
    return item ? { ...item, eventType: event.type, meta: `${calendarText(completedCalendar)} / 端末観測` } : null;
  }).filter(Boolean).slice(0, 4);
  const investigations = resolveInvestigations(state)
    .filter(item => !state.observations.some(existing => existing.id === item.id))
    .map(item => ({ ...item, meta: `${calendarText(completedCalendar)} / 調査完了`, text: `観測 ${item.evidenceRefs[0]} を行政記録と照合し、確認できる範囲を確度${Math.round(item.confidence * 100)}%で整理しました。` }));
  const milestones = events
    .filter(event => event.type === 'MAYORAL_ELECTION' || event.type.startsWith('CLIMAX_'))
    .map(event => ({
      id: `milestone:${event.id}`, observedTick: state.tick, sourceType: 'institutional-record',
      sourceLabel: event.type === 'MAYORAL_ELECTION' ? '倶利伽羅町 選挙記録' : 'ADHOMS / 複合圧力観測',
      confidence: 0.95, distortion: 0.05, scope: 'institutional', eventType: event.type,
      meta: `${calendarText(completedCalendar)} / SPECIAL EVENT`
    }));
  const summary = {
    id: `summary:${state.tick}`, observedTick: state.tick, sourceType: 'institutional-record', sourceLabel: '河北恒研 / 月次観測要約',
    confidence: 1 - observation.summary.uncertainty, distortion: observation.summary.uncertainty,
    scope: 'sampling-summary', system: true, meta: `${calendarText(completedCalendar)} / MONTHLY SUMMARY`,
    text: `抽選 ${observation.summary.selected}人相当のうち稼働 ${observation.summary.active}。地区均衡 ${Math.round(observation.summary.districtBalance * 100)}%、年齢均衡 ${Math.round(observation.summary.ageBalance * 100)}%、観測不確実性 ${Math.round(observation.summary.uncertainty * 100)}%。`
  };
  return [...milestones, ...investigations, summary, ...observed];
}

function setDiagnostic(message = '') { diagnostic.textContent = message; }

function persist() {
  const result = saveGame(localStorage, gameState);
  if (!result.ok) {
    setDiagnostic(`保存に失敗しました。状態は画面内に保持されています。${(result.errors ?? []).join(' / ')}`);
    return false;
  }
  return true;
}

function updateStatus() {
  if (!gameState) return;
  document.querySelector('#metric-stability').textContent = approximate(gameState.metrics.socialStability);
  document.querySelector('#metric-legitimacy').textContent = approximate(gameState.metrics.legitimacy);
  document.querySelector('#metric-fiscal').textContent = approximate(gameState.metrics.fiscalSustainability);
  document.querySelector('#metric-resilience').textContent = approximate(gameState.metrics.resilience);
  const shownCalendar = gameState.complete ? getCalendar(59) : gameState.calendar;
  document.querySelector('#calendar-label').textContent = calendarText(shownCalendar);
  document.querySelector('#progress-label').textContent = `${gameState.tick} / 60か月`;
  document.querySelector('#footer-calendar').textContent = `${shownCalendar.year} / ${String(shownCalendar.month).padStart(2, '0')}`;
  document.querySelector('#footer-phase').textContent = gameState.phase === 'observation'
    ? `YEAR ${Math.min(5, Math.floor(gameState.tick / 12) + 1)}`
    : gameState.phase;
}

function command(command, successMessage = '') {
  const result = applyCommand(gameState, command);
  if (!result.ok) return { ok: false, error: result.errors.join(' / ') };
  gameState = result.state;
  persist();
  if (successMessage) setDiagnostic(successMessage);
  return { ok: true };
}

function handleFeedAction(action, item) {
  setDiagnostic();
  if (action === 'source-profile') return openSourceDialog(sourceDialog, item);
  let result;
  if (action === 'investigate') {
    result = command({ type: 'REGISTER_INVESTIGATION', observationId: item.id }, '調査を登録しました。結果は後続月の制度記録に反映されます。');
  } else if (action === 'bookmark') {
    result = command({ type: 'TOGGLE_BOOKMARK', observationId: item.id });
  } else {
    const requested = action === 'plus' ? 1 : -1;
    const value = gameState.player.assessments[item.id] === requested ? 0 : requested;
    result = command({ type: 'SET_ASSESSMENT', observationId: item.id, value });
  }
  if (!result.ok) setDiagnostic(result.error);
  renderCurrent();
}

function filteredItems() {
  const all = [...(resumeNotice ? [resumeNotice] : []), ...gameState.observations];
  const filter = filterSelect.value;
  if (filter === 'all') return all;
  if (filter === 'bookmarked') return all.filter(item => gameState.player.bookmarks.includes(item.id));
  return all.filter(item => item.sourceType === filter);
}

function renderCurrent() {
  updateStatus();
  renderFeed(feedList, filteredItems().slice(0, visibleLimit), handleFeedAction, gameState.player);
  actionBar.hidden = gameState.phase === 'evaluation';
  nextButton.disabled = gameState.phase !== 'observation' || gameState.complete;
}

function enterGame(state, resumed = false) {
  gameState = state;
  resumeNotice = resumed ? resumeObservation(state) : null;
  setupView.hidden = true;
  gameView.hidden = false;
  renderCurrent();
  if (state.phase === 'evaluation') renderEvaluation(evaluateRun(state));
  else queueMicrotask(openCurrentPhase);
}

function openCurrentPhase() {
  if (!gameState || gameState.phase === 'observation' || gameState.phase === 'evaluation') {
    if (gameState?.phase === 'evaluation') renderEvaluation(evaluateRun(gameState));
    return;
  }
  if (gameState.phase === 'quarterly-decision' && !quarterlyDialog.open) {
    openQuarterlyDialog(quarterlyDialog, gameState, {
      proposal(type, proposalId) {
        const result = command({ type, proposalId });
        if (result.ok) updateStatus();
        return result;
      },
      confirm(priorities, terminalPolicy) {
        const total = Object.values(priorities).reduce((sum, value) => sum + value, 0);
        if (total !== 300) return { ok: false, error: `重点配分は300点必要です（現在${total}点）。` };
        const policyChanged = JSON.stringify(terminalPolicy) !== JSON.stringify(gameState.player.terminalPolicy);
        const changeLoad = Object.keys(priorities).reduce((sum, key) => sum + Math.abs(priorities[key] - gameState.player.priorities[key]), 0);
        const neededCapacity = (changeLoad === 0 ? 0 : Math.max(1, Math.ceil(changeLoad / 25))) + (policyChanged ? 3 : 0);
        if (gameState.gates.administrativeCapacity < neededCapacity) return { ok: false, error: `行政能力が不足しています（必要${neededCapacity}）。` };
        if (policyChanged) {
          const policyResult = command({ type: 'SET_TERMINAL_POLICY', terminalPolicy });
          if (!policyResult.ok) return policyResult;
        }
        const result = command({ type: 'SET_PRIORITIES', priorities });
        if (!result.ok) return result;
        quarterlyDialog.close();
        renderCurrent();
        queueMicrotask(openCurrentPhase);
        return { ok: true };
      }
    });
    return;
  }
  if (gameState.phase === 'annual-review' && !annualDialog.open) {
    openAnnualDialog(annualDialog, gameState, () => {
      const result = command({ type: 'ACKNOWLEDGE_PHASE', phase: 'annual-review' });
      if (!result.ok) return setDiagnostic(result.error);
      annualDialog.close();
      renderCurrent();
      queueMicrotask(openCurrentPhase);
    });
    return;
  }
  if (gameState.phase === 'crisis-decision' && !crisisDialog.open) {
    openCrisisDialog(crisisDialog, gameState, choice => {
      const result = command({ type: 'RESPOND_TO_CRISIS', choice });
      if (result.ok) {
        crisisDialog.close();
        renderCurrent();
        queueMicrotask(openCurrentPhase);
      }
      return result;
    });
  }
}

function renderEvaluation(report) {
  evaluationView.hidden = false;
  actionBar.hidden = true;
  evaluationView.innerHTML = `
    <p class="eyebrow">5 YEAR FIELD TRIAL COMPLETE</p><h2 id="evaluation-title">倶利伽羅町 実証評価 ${report.grade}</h2>
    <div class="grade">${report.grade}</div><p><strong>${report.success ? 'A・B：実証成功' : 'C・D：実証失敗'}</strong></p>
    <div class="dimension-list">${Object.entries(report.dimensions).map(([key, value]) => `<span>${DIMENSION_LABELS[key]}</span><strong>${Math.round(value)}</strong>`).join('')}</div>
    <h3>評価根拠</h3><ul>${report.evidence.map(item => `<li>${DIMENSION_LABELS[item.dimension]}：${item.basis}（${item.qualifier}）</li>`).join('')}</ul>
    <h3>トレードオフ</h3><ul>${report.tradeoffs.map(item => `<li>${item.explanation}</li>`).join('')}</ul>
    <h3>不確実性</h3><p>${report.uncertainty.explanation} 推定 ${Math.round(report.uncertainty.level * 100)}%</p>
    <h3>未解決残差</h3><p>${report.unresolvedResiduals.length ? `${report.unresolvedResiduals.length}件` : '重大な未解決残差なし'}</p>
    <p class="fiction">${JA_COPY.credits.fiction}</p>`;
  evaluationView.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function onNextMonth() {
  setDiagnostic();
  if (!gameState || gameState.phase !== 'observation' || gameState.complete) return;
  nextButton.disabled = true;
  const scenarioInput = getScenarioInput(gameState);
  const result = advanceMonth(gameState, scenarioInput);
  if (!result.ok) {
    nextButton.disabled = false;
    setDiagnostic(result.residuals.at(-1)?.errors?.join(' / ') ?? '月次処理を完了できませんでした。');
    return;
  }
  const observation = observeMonth(result.state, result.events);
  const items = monthlyFeedItems(result.state, result.events, observation, scenarioInput.calendar);
  const recorded = applyCommand(result.state, { type: 'RECORD_OBSERVATIONS', items, summary: observation.summary });
  if (!recorded.ok) {
    gameState = result.state;
    nextButton.disabled = false;
    setDiagnostic(recorded.errors.join(' / '));
    return;
  }
  gameState = recorded.state;
  persist();
  renderCurrent();
  openCurrentPhase();
}

function readSetup() {
  const priorities = Object.fromEntries([...document.querySelectorAll('#setup-priorities [data-priority]')]
    .map(input => [input.dataset.priority, Number(input.value)]));
  const terminalPolicy = Object.fromEntries([...document.querySelectorAll('#setup-terminal-policy [data-policy]')]
    .map(input => [input.dataset.policy, RATIO_POLICIES.has(input.dataset.policy) ? Number(input.value) / 100 : Number(input.value)]));
  return { seed: DEFAULT_SETUP.seed, leaderId: document.querySelector('#leader-select').value, priorities, terminalPolicy };
}

document.querySelectorAll('#setup-view input[type="range"]').forEach(input => input.addEventListener('input', () => {
  const suffix = RATIO_POLICIES.has(input.dataset.policy) ? '%' : input.dataset.policy === 'surveyFrequency' ? '回' : '';
  input.nextElementSibling.value = `${input.value}${suffix}`;
  const total = [...document.querySelectorAll('#setup-priorities [data-priority]')].reduce((sum, item) => sum + Number(item.value), 0);
  document.querySelector('#setup-priority-total').value = `${total} / 300`;
}));

document.querySelector('#start-button').addEventListener('click', () => {
  const config = readSetup();
  const total = Object.values(config.priorities).reduce((sum, value) => sum + value, 0);
  if (total !== 300) return document.querySelector('#setup-error').textContent = `重点配分は300点必要です（現在${total}点）。`;
  let state;
  try { state = createInitialState(config); }
  catch (error) { document.querySelector('#setup-error').textContent = error.message; return; }
  const panel = observeMonth(state, []);
  const recorded = applyCommand(state, { type: 'RECORD_OBSERVATIONS', items: [initialObservation()], summary: panel.summary });
  enterGame(recorded.state);
});

nextButton.addEventListener('click', onNextMonth);
document.querySelector('#load-more-button').addEventListener('click', () => { visibleLimit += 30; renderCurrent(); });
filterSelect.addEventListener('change', renderCurrent);
document.querySelector('#new-game-button').addEventListener('click', () => {
  if (!window.confirm('現在の保存を消して新しい実証を始めますか？')) return;
  clearSave(localStorage);
  window.location.reload();
});

const loaded = loadGame(localStorage);
if (loaded.ok) {
  enterGame(loaded.state, true);
  if (loaded.diagnostics?.length) {
    setDiagnostic(`保存データ警告: ${loaded.diagnostics.flatMap(item => item.errors).join(' / ')}`);
  }
} else if (loaded.diagnostics?.length) {
  document.querySelector('#setup-error').textContent = `保存データを読み込めません: ${loaded.diagnostics.flatMap(item => item.errors).join(' / ')}`;
}
