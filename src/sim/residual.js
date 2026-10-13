const { cloneWorld } = require('./world');

function captureResidual(world, { subject, predicted, observed, classification = 'unclassified', metadata = {} }) {
  const next = cloneWorld(world);
  const predictedValue = Number(predicted);
  const observedValue = Number(observed);
  if (!Number.isFinite(predictedValue) || !Number.isFinite(observedValue)) {
    throw new Error('predicted and observed must be finite numbers');
  }

  next.residuals.push({
    tick: next.tick,
    subject,
    predicted: predictedValue,
    observed: observedValue,
    value: Number((observedValue - predictedValue).toFixed(12)),
    classification,
    metadata: JSON.parse(JSON.stringify(metadata)),
  });

  return next;
}

module.exports = { captureResidual };
