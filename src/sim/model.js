function deepClone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function createEntity({ id, type, state = {}, capabilities = {}, perception = {}, actions = [], memory = [] }) {
  if (!id) throw new Error('entity id is required');
  if (!type) throw new Error('entity type is required');
  return {
    id,
    type,
    state: deepClone(state),
    capabilities: deepClone(capabilities),
    perception: deepClone(perception),
    actions: deepClone(actions),
    memory: deepClone(memory),
  };
}

function createRelation({ id, from, to, type, strength = 1, state = {} }) {
  if (!id) throw new Error('relation id is required');
  if (!from || !to) throw new Error('relation endpoints are required');
  if (!type) throw new Error('relation type is required');
  return {
    id,
    from,
    to,
    type,
    strength,
    state: deepClone(state),
  };
}

module.exports = { createEntity, createRelation, deepClone };
