export function resolveInvestigations(state) {
  return state.player.investigations
    .filter(item => item.status === 'registered' && item.dueTick <= state.tick)
    .map(item => Object.freeze({
      id: `investigation:${item.observationId}:${item.dueTick}`,
      observedTick: state.tick,
      sourceId: 'kahoku-koken-investigation',
      sourceType: 'staff-investigation',
      districtId: null,
      domain: 'investigation',
      confidence: 0.78,
      distortion: 0.12,
      scope: 'declared-evidence-only',
      evidenceRefs: Object.freeze([item.observationId]),
      textKey: 'investigation.completed'
    }));
}
