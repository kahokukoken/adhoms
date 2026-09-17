function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function createEntity({ id, type, state = {}, capabilities = {}, perception = {}, actions = [], memory = [] }) {
  if (!id) throw new Error('entity id is required');
  if (!type) throw new Error('entity type is required');
  return {
    id,
    type,
    state: clone(state),
    capabilities: clone(capabilities),
    perception: clone(perception),
    actions: clone(actions),
    memory: clone(memory),
  };
}

function createRelation({ id, from, to, type, strength = 1, state = {} }) {
  if (!id) throw new Error('relation id is required');
  if (!from || !to) throw new Error('relation endpoints are required');
  if (!type) throw new Error('relation type is required');
  return { id, from, to, type, strength, state: clone(state) };
}

module.exports = { createEntity, createRelation };
