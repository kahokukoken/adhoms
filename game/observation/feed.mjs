export const FEED_ACTIONS = Object.freeze([
  'plus',
  'minus',
  'bookmark',
  'investigate',
  'source-profile'
]);

function cloneFeedItem(item, index, tick) {
  return {
    id: item.id ?? `feed:${tick}:${index}`,
    observedTick: item.observedTick ?? tick,
    sourceId: item.sourceId ?? 'unknown-source',
    sourceType: item.sourceType ?? 'unclassified',
    districtId: item.districtId ?? null,
    domain: item.domain ?? 'unclassified',
    confidence: Number.isFinite(item.confidence) ? item.confidence : 0,
    distortion: Number.isFinite(item.distortion) ? item.distortion : 1,
    scope: item.scope ?? 'unknown',
    evidenceRefs: [...(item.evidenceRefs ?? [])],
    textKey: item.textKey ?? null,
    text: item.text ?? null
  };
}

export function buildFeed(state, observations) {
  const sourceItems = Array.isArray(observations)
    ? observations
    : observations?.items ?? [];
  return {
    tick: state.tick,
    chronological: true,
    actions: [...FEED_ACTIONS],
    items: sourceItems.map((item, index) => cloneFeedItem(item, index, state.tick)),
    summary: observations?.summary ? structuredClone(observations.summary) : null
  };
}
