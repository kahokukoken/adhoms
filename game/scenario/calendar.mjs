export function getRequiredPhases({ tick }) {
  const phases = [];
  if ((tick + 1) % 3 === 0) phases.push('quarterly-decision');
  if ((tick + 1) % 12 === 0) phases.push('annual-review');
  if (tick === 42) phases.push('mayoral-election');
  if (tick === 53) phases.push('final-climax');
  return phases;
}
