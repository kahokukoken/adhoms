export function cloneForCommand(state) {
  return {
    ...state,
    player: {
      ...state.player,
      priorities: { ...state.player.priorities },
      terminalPolicy: { ...state.player.terminalPolicy },
      bookmarks: [...state.player.bookmarks],
      investigations: state.player.investigations.map(item => ({ ...item })),
      assessments: { ...state.player.assessments }
    },
    gates: { ...state.gates },
    metrics: { ...state.metrics },
    observations: [...state.observations],
    history: [...state.history],
    residuals: [...state.residuals],
    pendingEffects: state.pendingEffects.map(effect => structuredClone(effect)),
    pendingPhases: [...state.pendingPhases],
    actions: [...state.actions]
  };
}

export function cloneForAdvance(state) {
  return {
    ...state,
    rng: { ...state.rng },
    entities: {
      ...state.entities,
      facilities: Object.fromEntries(
        Object.entries(state.entities.facilities).map(([id, facility]) => [id, { ...facility }])
      )
    },
    relations: { ...state.relations },
    memories: [...state.memories],
    actions: [...state.actions],
    residuals: [...state.residuals],
    observations: [...state.observations],
    history: [...state.history],
    metrics: { ...state.metrics },
    gates: { ...state.gates },
    institutionalCapacity: { ...state.institutionalCapacity },
    pendingEffects: state.pendingEffects.map(effect => structuredClone(effect)),
    pendingPhases: [...state.pendingPhases]
  };
}
