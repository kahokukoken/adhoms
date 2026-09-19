import { validatePriorities, validateState, validateTerminalPolicy } from './invariants.mjs';
import { cloneForCommand } from './clone.mjs';

const PROPOSALS = Object.freeze({
  'distributed-volunteer': Object.freeze({
    cost: 8,
    authority: 35,
    capacity: 6,
    effects: [{ kind: 'relation-support', remainingMonths: 2, magnitude: 0.04 }]
  }),
  'drainage-maintenance': Object.freeze({
    cost: 14,
    authority: 40,
    capacity: 8,
    effects: [{ kind: 'facility-maintenance', facilityId: 'lakeside-drainage', remainingMonths: 3, magnitude: 0.12 }]
  }),
  'multi-site-shelter': Object.freeze({
    cost: 12,
    authority: 45,
    capacity: 8,
    effects: [{ kind: 'distributed-capacity', remainingMonths: 4, magnitude: 0.08 }]
  })
});

const cloneCommand = command => structuredClone(command);
const failure = (state, ...errors) => ({ ok: false, state, errors });

function record(candidate, command) {
  candidate.actions.push({
    ...cloneCommand(command),
    tick: candidate.tick,
    command: true
  });
}

function requireQuarterly(state, { allowLowLegitimacy = false } = {}) {
  if (state.complete) return ['institutional decisions are closed after completion'];
  if (state.phase !== 'quarterly-decision') return ['command requires a quarterly decision phase'];
  if (state.metrics.legitimacy < 25 && !allowLowLegitimacy) return ['legitimacy is insufficient'];
  return [];
}

function consumePhase(candidate, phase) {
  if (candidate.pendingPhases[0] !== phase) return false;
  candidate.pendingPhases.shift();
  candidate.phase = candidate.pendingPhases[0] ?? (candidate.complete ? 'evaluation' : 'observation');
  return true;
}

export function applyCommand(state, command) {
  if (!command || typeof command.type !== 'string') return failure(state, 'command type is required');
  const candidate = cloneForCommand(state);

  switch (command.type) {
    case 'SET_PRIORITIES': {
      const errors = validatePriorities(command.priorities);
      if (errors.length) return failure(state, ...errors);
      const changeLoad = Object.keys(command.priorities).reduce(
        (sum, key) => sum + Math.abs(command.priorities[key] - state.player.priorities[key]),
        0
      );
      const gateErrors = requireQuarterly(state, { allowLowLegitimacy: changeLoad === 0 });
      if (gateErrors.length) return failure(state, ...gateErrors);
      candidate.player.priorities = structuredClone(command.priorities);
      const capacityCost = changeLoad === 0 ? 0 : Math.max(1, Math.ceil(changeLoad / 25));
      if (state.gates.administrativeCapacity < capacityCost) return failure(state, 'administrative capacity is insufficient');
      candidate.gates.administrativeCapacity -= capacityCost;
      candidate.pendingEffects.push({
        id: `priority:${state.tick}:${state.actions.length}`,
        kind: 'priority-allocation',
        remainingMonths: 2,
        priorities: structuredClone(command.priorities)
      });
      consumePhase(candidate, 'quarterly-decision');
      break;
    }
    case 'SET_TERMINAL_POLICY': {
      const gateErrors = requireQuarterly(state);
      if (gateErrors.length) return failure(state, ...gateErrors);
      const errors = validateTerminalPolicy(command.terminalPolicy);
      if (errors.length) return failure(state, ...errors);
      if (state.gates.administrativeCapacity < 3) return failure(state, 'administrative capacity is insufficient');
      if (state.gates.budget < 2) return failure(state, 'budget is insufficient');
      candidate.player.terminalPolicy = structuredClone(command.terminalPolicy);
      candidate.gates.administrativeCapacity -= 3;
      candidate.gates.budget -= 2;
      candidate.pendingEffects.push({
        id: `terminal-policy:${state.tick}:${state.actions.length}`,
        kind: 'terminal-policy',
        remainingMonths: 1,
        policy: structuredClone(command.terminalPolicy)
      });
      break;
    }
    case 'APPROVE_PROPOSAL': {
      const gateErrors = requireQuarterly(state);
      if (gateErrors.length) return failure(state, ...gateErrors);
      const proposal = PROPOSALS[command.proposalId];
      if (!proposal) return failure(state, 'proposal is unknown');
      if (state.actions.some(action => action.proposalId === command.proposalId && ['APPROVE_PROPOSAL', 'REJECT_PROPOSAL'].includes(action.type))) {
        return failure(state, 'proposal is already decided');
      }
      if (candidate.gates.budget < proposal.cost) return failure(state, 'budget is insufficient');
      if (candidate.gates.authority < proposal.authority) return failure(state, 'authority is insufficient');
      if (candidate.gates.administrativeCapacity < proposal.capacity) return failure(state, 'administrative capacity is insufficient');
      candidate.gates.budget -= proposal.cost;
      candidate.gates.administrativeCapacity -= proposal.capacity;
      for (const effect of proposal.effects) {
        candidate.pendingEffects.push({
          id: `${command.proposalId}:${state.tick}:${candidate.pendingEffects.length}`,
          sourceProposalId: command.proposalId,
          ...structuredClone(effect)
        });
      }
      break;
    }
    case 'REJECT_PROPOSAL': {
      const gateErrors = requireQuarterly(state);
      if (gateErrors.length) return failure(state, ...gateErrors);
      if (!PROPOSALS[command.proposalId]) return failure(state, 'proposal is unknown');
      if (state.actions.some(action => action.proposalId === command.proposalId && ['APPROVE_PROPOSAL', 'REJECT_PROPOSAL'].includes(action.type))) {
        return failure(state, 'proposal is already decided');
      }
      break;
    }
    case 'REGISTER_INVESTIGATION': {
      if (state.complete) return failure(state, 'investigations are closed after completion');
      if (!command.observationId) return failure(state, 'observationId is required');
      if (candidate.player.investigations.some(item => item.observationId === command.observationId)) {
        return failure(state, 'investigation already registered');
      }
      if (candidate.gates.administrativeCapacity < 1) return failure(state, 'administrative capacity is insufficient');
      candidate.player.investigations.push({
        observationId: command.observationId,
        registeredTick: state.tick,
        dueTick: state.tick + 2,
        status: 'registered'
      });
      candidate.gates.administrativeCapacity = Math.max(0, candidate.gates.administrativeCapacity - 1);
      break;
    }
    case 'TOGGLE_BOOKMARK': {
      if (!command.observationId) return failure(state, 'observationId is required');
      const index = candidate.player.bookmarks.indexOf(command.observationId);
      if (index === -1) candidate.player.bookmarks.push(command.observationId);
      else candidate.player.bookmarks.splice(index, 1);
      break;
    }
    case 'SET_ASSESSMENT': {
      if (!command.observationId) return failure(state, 'observationId is required');
      if (![ -1, 0, 1 ].includes(command.value)) return failure(state, 'assessment must be -1, 0, or 1');
      if (command.value === 0) delete candidate.player.assessments[command.observationId];
      else candidate.player.assessments[command.observationId] = command.value;
      break;
    }
    case 'RECORD_OBSERVATIONS': {
      if (!Array.isArray(command.items)) return failure(state, 'observation items are required');
      if (!command.summary || !Number.isFinite(command.summary.coverage) || !Number.isFinite(command.summary.districtBalance) || !Number.isFinite(command.summary.uncertainty)) {
        return failure(state, 'observation summary is required');
      }
      const safeItems = command.items.filter(item => item && typeof item.id === 'string').map(item => structuredClone(item));
      const merged = [...safeItems, ...state.observations.filter(item => !safeItems.some(next => next.id === item.id))];
      const pinnedIds = new Set(merged.filter(item => candidate.player.bookmarks.includes(item.id)).map(item => item.id));
      const recentIds = new Set(merged
        .filter(item => !pinnedIds.has(item.id))
        .slice(0, 300)
        .map(item => item.id));
      candidate.observations = merged.filter(item => pinnedIds.has(item.id) || recentIds.has(item.id));
      break;
    }
    case 'ACKNOWLEDGE_PHASE': {
      if (command.phase !== 'annual-review' || !consumePhase(candidate, command.phase)) {
        return failure(state, 'annual review is not pending');
      }
      break;
    }
    case 'RESPOND_TO_CRISIS': {
      if (state.phase !== 'crisis-decision') return failure(state, 'crisis decision is not pending');
      if (!['distributed-response', 'preserve-reserve'].includes(command.choice)) return failure(state, 'crisis response is unknown');
      if (command.choice === 'distributed-response') {
        if (state.gates.budget < 8) return failure(state, 'budget is insufficient');
        if (state.gates.administrativeCapacity < 5) return failure(state, 'administrative capacity is insufficient');
        candidate.gates.budget -= 8;
        candidate.gates.administrativeCapacity -= 5;
        candidate.pendingEffects.push({
          id: `crisis-response:${state.tick}`,
          kind: 'crisis-recovery',
          remainingMonths: 1,
          magnitude: 0.12
        });
      } else {
        candidate.gates.authority = Math.max(0, candidate.gates.authority - 3);
        candidate.residuals.push({
          id: `residual:${state.tick}:preserved-reserve`,
          tick: state.tick,
          classification: 'ACCEPTED_CRISIS_TRADEOFF',
          resolved: false,
          critical: false
        });
      }
      consumePhase(candidate, 'crisis-decision');
      break;
    }
    default:
      return failure(state, `unsupported command: ${command.type}`);
  }

  record(candidate, command);
  const validation = validateState(candidate);
  return validation.ok
    ? { ok: true, state: candidate, errors: [] }
    : failure(state, ...validation.errors);
}

export { PROPOSALS };
