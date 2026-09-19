import { createInitialState } from './state.mjs';
import { applyCommand } from './commands.mjs';
import { advanceMonth } from './advance.mjs';

export function replayGame(initialSetup, actionLog) {
  let state = createInitialState(initialSetup);
  for (const recorded of actionLog) {
    if (recorded.type === 'ADVANCE_MONTH') {
      const result = advanceMonth(state, structuredClone(recorded.scenarioInput));
      if (!result.ok) throw new Error(`replay advance failed at tick ${state.tick}`);
      state = result.state;
      continue;
    }
    const command = structuredClone(recorded);
    delete command.tick;
    delete command.command;
    const result = applyCommand(state, command);
    if (!result.ok) throw new Error(`replay command failed at tick ${state.tick}: ${result.errors.join('; ')}`);
    state = result.state;
  }
  return state;
}
