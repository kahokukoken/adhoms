export const DIMENSIONS = Object.freeze([
  'adaptability',
  'fiscalSustainability',
  'legitimacy',
  'observationQuality',
  'resilience',
  'socialStability'
]);

const clamp = value => Math.max(0, Math.min(100, Number(value) || 0));

const DIMENSION_CEILINGS = Object.freeze({
  adaptability: 65,
  fiscalSustainability: 60,
  legitimacy: 65,
  observationQuality: 80,
  resilience: 35,
  socialStability: 55
});

const normalizeDimension = (dimension, value) => clamp(
  clamp(value) / DIMENSION_CEILINGS[dimension] * 100
);

function dimensionFromHistory(state, dimension) {
  const endpoint = normalizeDimension(dimension, state.metrics[dimension]);
  const values = state.history
    .map(entry => entry.metricSnapshot?.[dimension])
    .filter(Number.isFinite)
    .map(value => normalizeDimension(dimension, value));
  if (!values.length) return { score: endpoint * 0.7, start: null, end: null, minimum: null, recovery: 0 };
  const start = values[0];
  const end = values.at(-1);
  const minimum = Math.min(...values);
  const recovery = end - minimum;
  const pathScore = clamp(50 + (end - start) * 0.7 + recovery * 0.3);
  return {
    score: clamp(endpoint * 0.75 + pathScore * 0.25),
    start,
    end,
    minimum,
    recovery
  };
}

function gradeFor(score) {
  if (score >= 78) return 'A';
  if (score >= 64) return 'B';
  if (score >= 48) return 'C';
  return 'D';
}

function isCritical(residual) {
  return residual.resolved !== true && (
    residual.classification === 'STATE_INVARIANT' ||
    residual.severity === 'critical' ||
    residual.critical === true
  );
}

function evidenceFor(state, dimensions, paths, uncertaintyLevel) {
  const qualifier = uncertaintyLevel >= 0.5 ? 'low-confidence' : 'observed';
  return DIMENSIONS.map(dimension => Object.freeze({
    id: `evaluation:${dimension}`,
    dimension,
    value: dimensions[dimension],
    qualifier: dimension === 'observationQuality' ? qualifier : 'derived',
    basis: paths[dimension].start === null
      ? '有効な月次履歴がなく、終点値のみを低信頼で評価'
      : `${state.history.length}か月の推移 ${Math.round(paths[dimension].start)}→${Math.round(paths[dimension].end)}、最低点から${Math.round(paths[dimension].recovery)}回復`
  }));
}

function deriveTradeoffs(state) {
  const priorities = state.player.priorities;
  const ordered = Object.entries(priorities).sort((left, right) => right[1] - left[1]);
  const tradeoffs = [{
    id: 'tradeoff:priority-allocation',
    accepted: ordered[0][0],
    constrained: ordered.at(-1)[0],
    explanation: '配分の重点化は、他領域へ同時投入できる行政資源を制約した。'
  }];
  const policyChanges = state.actions.filter(action => action.type === 'SET_PRIORITIES').length;
  const investigations = state.actions.filter(action => action.type === 'REGISTER_INVESTIGATION').length;
  const firstBudget = state.history[0]?.gateSnapshot?.budget;
  const finalBudget = state.history.at(-1)?.gateSnapshot?.budget;
  tradeoffs.push({
    id: 'tradeoff:administrative-path',
    accepted: `${policyChanges}回の重点配分と${investigations}件の調査`,
    constrained: '予算・行政能力',
    explanation: Number.isFinite(firstBudget) && Number.isFinite(finalBudget)
      ? `制度運用と観測の結果、予算余力は${Math.round(firstBudget)}から${Math.round(finalBudget)}へ変化した。`
      : '制度変更と調査は、利用できる予算・行政能力を消費した。'
  });
  if (state.player.terminalPolicy.coverage < 0.5) {
    tradeoffs.push({
      id: 'tradeoff:terminal-coverage',
      accepted: '運用負荷の抑制',
      constrained: '観測母集団の広さ',
      explanation: '端末配布率を抑えたため、把握できない住民経験が残った。'
    });
  }
  return tradeoffs.map(Object.freeze);
}

export function evaluateRun(state) {
  if (!state || state.tick !== 60 || state.complete !== true) {
    throw new RangeError('evaluation requires a completed 60 months run');
  }

  const paths = Object.fromEntries(DIMENSIONS.map(dimension => [dimension, dimensionFromHistory(state, dimension)]));
  const dimensions = Object.freeze(Object.fromEntries(
    DIMENSIONS.map(dimension => [dimension, paths[dimension].score])
  ));
  const unresolvedResiduals = (state.residuals ?? [])
    .filter(residual => residual.resolved !== true)
    .map(residual => Object.freeze(structuredClone(residual)));
  const uncertaintyLevel = Math.max(
    (100 - dimensions.observationQuality) / 100,
    unresolvedResiduals.length ? Math.min(1, 0.15 + unresolvedResiduals.length * 0.1) : 0
  );
  const uncertainty = Object.freeze({
    level: uncertaintyLevel,
    observationQuality: dimensions.observationQuality,
    explanation: uncertaintyLevel >= 0.5
      ? '観測範囲の偏りが大きく、評価には高い不確実性がある。'
      : '観測範囲の偏りを含むため、評価は推定値として扱う。'
  });
  const average = DIMENSIONS.reduce((sum, dimension) => sum + dimensions[dimension], 0) / DIMENSIONS.length;
  let grade = gradeFor(average - uncertaintyLevel * 12);
  if (dimensions.observationQuality < 25 && dimensions.resilience < 70) grade = 'D';
  if ((grade === 'A' || grade === 'B') && unresolvedResiduals.some(isCritical)) grade = 'C';

  return Object.freeze({
    grade,
    success: grade === 'A' || grade === 'B',
    dimensions,
    evidence: Object.freeze(evidenceFor(state, dimensions, paths, uncertaintyLevel)),
    uncertainty,
    tradeoffs: Object.freeze(deriveTradeoffs(state)),
    unresolvedResiduals: Object.freeze(unresolvedResiduals)
  });
}
