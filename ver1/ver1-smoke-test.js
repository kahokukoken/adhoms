(() => {
  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function run() {
    const S = window.ADHOMS_VER1_STATE;
    const E = window.ADHOMS_VER1_EVENTS;
    const P = window.ADHOMS_VER1_PROPAGATION;
    const F = window.ADHOMS_VER1_FINAL;

    let state = S.createInitialState();
    state.year = 2;
    state = E.resolveChoice(state, 'y2_snow', 'welfare_first');
    state = E.resolveChoice(state, 'y2_flood', 'guided_watch');
    state = E.resolveChoice(state, 'y2_wildlife', 'survey');

    state.year = 3;
    const propagated = P.applySideEffects(state);
    state = propagated.state;
    assert(propagated.applied.length >= 3, 'Year 3 side effects did not resolve.');

    state.year = 4;
    const y4 = P.resolveYear4Strategy(state, 'deepen');
    state = y4.state;
    assert(state.town.distributedCapacity >= 2, 'Year 4 did not increase distributed capacity.');

    state.year = 5;
    let session = F.createSession(state);
    session = F.applyDecision(session, 'sumo_schedule', 'advance');
    session = F.applyDecision(session, 'towa_schedule', 'advance');
    session = F.applyDecision(session, 'portable_shelter', 'full');
    session = F.applyDecision(session, 'mobile_command', 'deploy_highground');

    while (session.phaseIndex < F.PHASES.length - 1) {
      session = F.nextPhase(session);
    }

    session = F.finalize(session);
    assert(session.result, 'Final result missing.');
    assert(Number.isFinite(session.result.humanSafety), 'Human safety score invalid.');

    return {
      appliedSideEffects: propagated.applied.map((x) => x.id),
      offers: y4.offers.map((x) => x.id),
      resistance: y4.resistance.map((x) => x.id),
      result: session.result,
    };
  }

  window.ADHOMS_VER1_TEST = { run };
})();