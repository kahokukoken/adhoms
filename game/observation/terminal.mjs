import { selectTerminalPanel, summarizeCoverage } from '../core/sampling.mjs';

const clamp01 = value => Math.max(0, Math.min(1, value));

export { selectTerminalPanel, summarizeCoverage };

function activeSources(panel, event) {
  const active = panel.members.filter(member => member.active);
  const local = event.districtId
    ? active.filter(member => member.districtId === event.districtId)
    : active;
  return (local.length ? local : active).slice(0, 4);
}

function confidenceFor(source, event) {
  const localBonus = source.districtId === event.districtId ? 0.18 : 0;
  return clamp01(0.35 + source.digitalCapability * 0.2 + source.institutionalTrust * 0.15 + localBonus);
}

function distortionFor(source) {
  return clamp01(0.55 - source.institutionalTrust * 0.25 - source.digitalCapability * 0.1);
}

function textKeyFor(source, event) {
  const local = source.districtId === event.districtId ? 'local' : 'indirect';
  return `terminal.${event.type.toLowerCase()}.${local}`;
}

export function observeMonth(state, events) {
  const panel = selectTerminalPanel(state);
  const items = events.flatMap((sourceEvent, eventIndex) => {
    const event = {
      id: sourceEvent.id ?? `${state.tick}:external:${eventIndex}`,
      domain: sourceEvent.domain ?? 'community',
      ...sourceEvent
    };
    return activeSources(panel, event).map(source => Object.freeze({
      id: `${state.tick}:${event.id}:${source.id}`,
      observedTick: state.tick,
      sourceId: source.id,
      sourceType: 'resident-terminal',
      districtId: source.districtId,
      domain: event.domain,
      confidence: confidenceFor(source, event),
      distortion: distortionFor(source),
      scope: source.districtId === event.districtId ? 'local' : 'indirect',
      evidenceRefs: Object.freeze([event.id]),
      textKey: textKeyFor(source, event)
    }));
  });
  return Object.freeze({
    items: Object.freeze(items),
    summary: Object.freeze(summarizeCoverage(panel, items))
  });
}
