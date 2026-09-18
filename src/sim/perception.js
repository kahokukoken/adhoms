const { deepClone } = require('./model');

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function observe(world, { sourceId, subjectId, confidence = 1, visibility = 0.1 } = {}) {
  const subject = world.entities.find(entity => entity.id === subjectId);
  if (!subject) throw new Error(`unknown observation subject: ${subjectId}`);
  return {
    source: sourceId,
    subject: subjectId,
    tick: world.tick,
    confidence: clamp01(confidence),
    visibility: clamp01(visibility),
    distortion: 0,
    groundSnapshot: deepClone(subject.state),
  };
}

module.exports = { observe };
