import { KURIKARA_SCENARIO } from '../scenario/kurikara.mjs';
import { renderForecast } from './forecast.mjs';

const PRIORITY_LABELS = Object.freeze({
  welfare: '暮らし',
  market: '地域経済',
  future: '将来投資',
  technology: '技術',
  environment: '環境'
});

const LEADER_ADVICE = Object.freeze({
  miyashita: '観測の欠測を成果と取り違えないよう、幅と確度を分けて確認しましょう。',
  fujii: '現場が実行できる手順と人員まで落としてから、制度案を採択しましょう。',
  mizuno: '一つの指標の改善が、別の関係や担い手へ負担を移していないか見ましょう。',
  saeki: '予測値は確定未来ではありません。モデル外の残差を次の観測へ戻しましょう。'
});

const PROPOSALS = Object.freeze({
  'distributed-volunteer': ['分散型ボランティア支援', '予算8・行政能力6。地域の関係資源へ遅れて作用します。'],
  'drainage-maintenance': ['沿岸排水施設の維持', '予算14・行政能力8。排水施設へ3か月後に作用します。'],
  'multi-site-shelter': ['複数拠点避難支援', '予算12・行政能力8。最終複合圧力の集中を緩和します。']
});

const POLICY_LABELS = Object.freeze({
  coverage: '配布率', balance: '抽出均衡', compensation: '謝礼',
  dataScope: '収集範囲', anonymity: '匿名性', surveyFrequency: '月間照会'
});

const escape = value => String(value).replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

function causalEvidence(state) {
  const metricChange = memory => {
    const outcomeTick = memory.tick + 1;
    const previous = state.history.find(entry => entry.tick === outcomeTick - 1)?.metricSnapshot;
    const current = state.history.find(entry => entry.tick === outcomeTick)?.metricSnapshot;
    return previous && current
      ? `同月の回復力 ${Math.round(previous.resilience)}→${Math.round(current.resilience)}、正統性 ${Math.round(previous.legitimacy)}→${Math.round(current.legitimacy)}`
      : '制度実装を確認（結果指標との対応は観測継続中）';
  };
  const explanations = [];
  for (const memory of state.memories.slice(-40).reverse()) {
    if (memory.kind === 'institutional-capacity-change') {
      explanations.push(`${memory.tick}か月目：重点配分の遅延効果 → 制度能力を更新 → ${metricChange(memory)}`);
    } else if (memory.kind === 'terminal-policy-experience') {
      explanations.push(`${memory.tick}か月目：観測端末ポリシー → 観測倫理 ${Math.round(memory.ethics * 100)} → ${metricChange(memory)}`);
    } else if (memory.kind === 'crisis-physical-recovery') {
      explanations.push(`${memory.tick}か月目：分散型危機対応 → 施設の復旧 → ${metricChange(memory)}`);
    }
    if (explanations.length === 3) break;
  }
  return explanations.length ? explanations : ['行動と結果を結ぶ十分な証拠は、まだ蓄積されていません。'];
}

export function openQuarterlyDialog(dialog, state, handlers) {
  const priorities = state.player.priorities;
  const policy = state.player.terminalPolicy;
  const decided = new Set(state.actions.filter(action => action.proposalId).map(action => action.proposalId));
  dialog.innerHTML = `
    <p class="eyebrow">QUARTERLY DECISION / MONTH ${state.tick}</p>
    <h2>四半期判断</h2>
    <p>合計300点の重点配分を確認します。変更には行政能力が必要で、住民の状態を直接書き換えることはできません。</p>
    <p><strong>利用可能：</strong>予算 ${Math.round(state.gates.budget)} / 権限 ${Math.round(state.gates.authority)} / 行政能力 ${Math.round(state.gates.administrativeCapacity)}</p>
    <p>重点合計 <output data-total>300 / 300</output></p>
    <div class="priority-list">
      ${Object.entries(PRIORITY_LABELS).map(([key, label]) => `<label>${label}<input type="range" min="0" max="100" value="${priorities[key]}" data-priority="${key}"><output>${priorities[key]}</output></label>`).join('')}
    </div>
    <h3>観測端末ポリシー</h3>
    <div class="priority-list">
      ${Object.entries(POLICY_LABELS).map(([key, label]) => {
        const ratio = ['coverage', 'balance', 'dataScope', 'anonymity'].includes(key);
        const value = ratio ? Math.round(policy[key] * 100) : policy[key];
        return `<label>${label}<input type="range" min="${key === 'surveyFrequency' ? 1 : 0}" max="${key === 'surveyFrequency' ? 12 : 100}" value="${value}" data-policy="${key}"><output>${value}${ratio ? '%' : ''}</output></label>`;
      }).join('')}
    </div>
    <h3>制度提案</h3>
    ${Object.entries(PROPOSALS).map(([id, [name, description]]) => `<div class="proposal"><strong>${name}</strong><p>${description}</p>${decided.has(id) ? '<span>判断済み</span>' : `<button type="button" class="quiet-button" data-proposal="${id}" data-decision="APPROVE_PROPOSAL">採択</button><button type="button" class="quiet-button" data-proposal="${id}" data-decision="REJECT_PROPOSAL">見送る</button>`}</div>`).join('')}
    <p data-dialog-error class="form-error" role="alert"></p>
    <div class="dialog-actions"><button type="button" class="primary-button" data-confirm>判断を確定</button></div>`;
  const error = dialog.querySelector('[data-dialog-error]');
  const updatePriorityTotal = () => {
    const total = [...dialog.querySelectorAll('[data-priority]')].reduce((sum, input) => sum + Number(input.value), 0);
    dialog.querySelector('[data-total]').textContent = `${total} / 300`;
  };
  dialog.querySelectorAll('[data-priority]').forEach(input => {
    input.addEventListener('input', () => { input.nextElementSibling.value = input.value; updatePriorityTotal(); error.textContent = ''; });
  });
  dialog.querySelectorAll('[data-policy]').forEach(input => {
    input.addEventListener('input', () => {
      input.nextElementSibling.value = `${input.value}${['coverage', 'balance', 'dataScope', 'anonymity'].includes(input.dataset.policy) ? '%' : ''}`;
      error.textContent = '';
    });
  });
  dialog.querySelectorAll('[data-proposal]').forEach(button => button.addEventListener('click', event => {
    const result = handlers.proposal(event.currentTarget.dataset.decision, event.currentTarget.dataset.proposal);
    if (!result.ok) error.textContent = result.error;
    else {
      const proposal = event.currentTarget.parentElement;
      proposal.querySelectorAll('button').forEach(item => item.remove());
      proposal.insertAdjacentHTML('beforeend', '<span>判断済み</span>');
      error.textContent = '';
    }
  }));
  dialog.querySelector('[data-confirm]').addEventListener('click', () => {
    const requested = Object.fromEntries([...dialog.querySelectorAll('[data-priority]')].map(input => [input.dataset.priority, Number(input.value)]));
    const terminalPolicy = Object.fromEntries([...dialog.querySelectorAll('[data-policy]')].map(input => {
      const key = input.dataset.policy;
      return [key, ['coverage', 'balance', 'dataScope', 'anonymity'].includes(key) ? Number(input.value) / 100 : Number(input.value)];
    }));
    const result = handlers.confirm(requested, terminalPolicy);
    if (!result.ok) error.textContent = result.error;
  });
  dialog.showModal();
}

export function openAnnualDialog(dialog, state, close) {
  const leader = KURIKARA_SCENARIO.staff[state.player.leaderId];
  const yearHistory = state.history.slice(-12);
  const first = yearHistory[0]?.metricSnapshot ?? state.metrics;
  const trendRows = ['socialStability', 'legitimacy', 'fiscalSustainability', 'resilience']
    .map(key => `<li>${key}: ${Math.round(first[key])} → ${Math.round(state.metrics[key])}</li>`).join('');
  const causalRows = causalEvidence(state).map(item => `<li>${escape(item)}</li>`).join('');
  dialog.innerHTML = `
    <p class="eyebrow">ANNUAL REPORT / YEAR ${Math.ceil(state.tick / 12)}</p>
    <h2>年次報告</h2>
    <p><strong>${leader.name}（${leader.role}）</strong><br>${LEADER_ADVICE[leader.id]}</p>
    <h3>今年の状態推移</h3><ul>${trendRows}</ul>
    <h3>確認された因果鎖</h3><ul>${causalRows}</ul>
    <h3>政策が生んだリスク</h3><p>観測不確実性 ${Math.round(100 - state.metrics.observationQuality)}% / 未解決残差 ${state.residuals.filter(item => !item.resolved).length}件 / 予算余力 ${Math.round(state.gates.budget)}</p>
    ${renderForecast(state)}
    <p>帯の幅は観測品質に由来する不確実性です。線は未来の確定値ではありません。</p>
    <div class="dialog-actions"><button type="button" class="primary-button" data-close>報告を閉じる</button></div>`;
  dialog.querySelector('[data-close]').addEventListener('click', close);
  dialog.showModal();
}

export function openCrisisDialog(dialog, state, decide) {
  dialog.innerHTML = `
    <p class="eyebrow">COMPOUND PRESSURE / MONTH ${state.tick}</p><h2>危機対応</h2>
    <p>倶利伽羅八朔相撲、森林公園ライブ、大雨が共有資源を同時に圧迫しています。結果を直接選ぶことはできません。制度資源の使い方を決めます。</p>
    <p>予算 ${Math.round(state.gates.budget)} / 行政能力 ${Math.round(state.gates.administrativeCapacity)}</p>
    <p data-dialog-error class="form-error" role="alert"></p>
    <div class="dialog-actions"><button type="button" class="primary-button" data-choice="distributed-response">8予算で分散対応</button><button type="button" class="quiet-button" data-choice="preserve-reserve">予備費を温存</button></div>`;
  const error = dialog.querySelector('[data-dialog-error]');
  dialog.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
    const result = decide(button.dataset.choice);
    if (!result.ok) error.textContent = result.error;
  }));
  dialog.showModal();
}

export function openSourceDialog(dialog, item) {
  dialog.innerHTML = `
    <p class="eyebrow">SOURCE PROFILE</p><h2>情報源プロファイル</h2>
    <p>種別：${escape(item.sourceType ?? 'resident-terminal')}<br>地区：${escape(item.districtId ?? '非公開')}<br>観測範囲：${escape(item.scope ?? '限定')}<br>歪み推定：${Math.round((item.distortion ?? 0.4) * 100)}%</p>
    <p>抽選端末の報告は、本人の経験と同意範囲に限られます。町全体の事実としては扱いません。</p>
    <div class="dialog-actions"><button type="button" class="primary-button" data-close>閉じる</button></div>`;
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.showModal();
}
