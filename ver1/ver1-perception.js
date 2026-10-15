(() => {
  // Perception is intentionally separate from canonical world state.
  // It records what the player/research team has actually investigated, not
  // what is objectively true in the town.
  const EVENT_TOPICS = {
    y2_flood: '梅雨入りと排水',
    y2_wildlife: '山際の変化と野生動物',
    y2_snow: '冬季交通と孤立',
  };

  function completedResearch(topic) {
    if (!topic) return [];
    return (S.research || []).filter(item =>
      item && item.topic === topic && (item.done || Number.isFinite(item.completedMonth))
    );
  }

  function decisionContext(eventId) {
    const topic = EVENT_TOPICS[eventId];
    if (!topic) return { eventId, topic: null, status: 'not_applicable', reports: [] };
    const reports = completedResearch(topic);
    return {
      eventId,
      topic,
      status: reports.length ? 'observed' : 'uncertain',
      reports,
      latest: reports.at(-1) || null,
    };
  }

  window.ADHOMS_VER1_PERCEPTION = {
    EVENT_TOPICS,
    completedResearch,
    decisionContext,
  };
})();
