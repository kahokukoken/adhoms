const clamp01 = value => Math.max(0, Math.min(1, value));

function stableFraction(seed, id, salt) {
  let hash = (Number(seed) >>> 0) ^ 0x9e3779b9;
  const text = `${id}:${salt}`;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash / 0x100000000;
}

function selectionThreshold(resident, policy) {
  const ageBalance = resident.age < 25 || resident.age >= 70
    ? 0.65 + policy.balance * 0.35
    : 1;
  return clamp01(policy.coverage * ageBalance);
}

function acceptanceProbability(resident, policy) {
  const privacyComfort = policy.anonymity * 0.24 + (1 - policy.dataScope) * 0.12;
  const compensationSupport = Math.min(0.22, policy.compensation / 250);
  const digitalFriction = (1 - resident.capabilities.digital) * 0.16;
  return clamp01(0.48 + privacyComfort + compensationSupport - digitalFriction);
}

function dropoutProbability(policy) {
  const burden = Math.max(0, policy.surveyFrequency - 1) * 0.05;
  const privacy = (1 - policy.anonymity) * policy.dataScope * 0.12;
  const compensation = Math.max(0, 30 - policy.compensation) / 300;
  return clamp01(burden + privacy + compensation);
}

export function selectTerminalPanel(state) {
  const policy = state.player.terminalPolicy;
  const members = [];
  const residents = Object.values(state.entities.residents);
  const populationByDistrict = {};
  const populationByAge = { youth: 0, adult: 0, older: 0 };
  const ageBand = age => age < 25 ? 'youth' : age >= 70 ? 'older' : 'adult';
  for (const resident of residents) {
    populationByDistrict[resident.districtId] = (populationByDistrict[resident.districtId] ?? 0) + 1;
    populationByAge[ageBand(resident.age)] += 1;
    if (stableFraction(state.seed, resident.id, 'lottery') >= selectionThreshold(resident, policy)) continue;
    const accepted = stableFraction(state.seed, resident.id, 'acceptance') < acceptanceProbability(resident, policy);
    const droppedOut = accepted && stableFraction(state.seed, resident.id, `dropout:${state.tick}`) < dropoutProbability(policy);
    const usageProbability = clamp01(0.35 + resident.capabilities.digital * 0.45 - policy.surveyFrequency * 0.015);
    const active = accepted && !droppedOut && stableFraction(state.seed, resident.id, `usage:${state.tick}`) < usageProbability;
    members.push({
      id: resident.id,
      districtId: resident.districtId,
      age: resident.age,
      accepted,
      droppedOut,
      active,
      digitalCapability: resident.capabilities.digital,
      institutionalTrust: resident.perceptions.institutionalTrust
    });
  }
  return {
    selectedAtTick: state.tick,
    populationAgents: residents.length,
    populationByDistrict,
    populationByAge,
    members
  };
}

function distributionBalance(targetCounts, observedCounts, observedTotal) {
  if (observedTotal === 0) return 0;
  const targetTotal = Object.values(targetCounts).reduce((sum, count) => sum + count, 0);
  const keys = new Set([...Object.keys(targetCounts), ...Object.keys(observedCounts)]);
  const distance = [...keys].reduce((sum, key) => sum + Math.abs(
    (observedCounts[key] ?? 0) / observedTotal - (targetCounts[key] ?? 0) / targetTotal
  ), 0) / 2;
  return clamp01(1 - distance);
}

export function summarizeCoverage(panel, items = []) {
  const active = panel.members.filter(member => member.active);
  const coverage = active.length / panel.populationAgents;
  const activeByDistrict = {};
  const activeByAge = { youth: 0, adult: 0, older: 0 };
  for (const member of active) {
    activeByDistrict[member.districtId] = (activeByDistrict[member.districtId] ?? 0) + 1;
    const band = member.age < 25 ? 'youth' : member.age >= 70 ? 'older' : 'adult';
    activeByAge[band] += 1;
  }
  const districtBalance = distributionBalance(panel.populationByDistrict, activeByDistrict, active.length);
  const ageBalance = distributionBalance(panel.populationByAge, activeByAge, active.length);
  return {
    selected: panel.members.length,
    active: active.length,
    coverage,
    districtBalance,
    ageBalance,
    uncertainty: clamp01(1 - coverage * 2.5 - districtBalance * 0.1 - ageBalance * 0.05),
    itemCount: items.length
  };
}

export function observationQualityFromSummary(summary, expectedCoverage) {
  const participation = Math.max(0, Math.min(1, summary.coverage / Math.max(0.05, expectedCoverage)));
  return Math.max(0, Math.min(100,
    participation * 50 +
    Math.max(0, Math.min(1, summary.districtBalance)) * 15 +
    Math.max(0, Math.min(1, summary.ageBalance)) * 15 +
    (1 - Math.max(0, Math.min(1, summary.uncertainty))) * 20
  ));
}
