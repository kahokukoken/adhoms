(() => {
  const clamp = (n, min = 0, max = 4) => Math.max(min, Math.min(max, n));
  const LEVELS = ['very_low', 'low', 'mid', 'high', 'very_high'];

  const createInitialState = () => ({
    year: 1,
    month: 4,
    town: {
      trust: 2,
      legitimacy: 2,
      responseReadiness: 2,
      networkResilience: 2,
      distributedCapacity: 1,
      environmentalBuffer: 2,
    },
    districts: {
      station_lowland: { localTrust: 2, burdenMemory: 0, tags: ['flood_prone'] },
      old_road: { localTrust: 2, burdenMemory: 0, tags: ['elderly', 'festival'] },
      hillside_hub: { localTrust: 2, burdenMemory: 0, tags: ['high_ground', 'industry'] },
      forest_park: { localTrust: 2, burdenMemory: 0, tags: ['tourism', 'forest'] },
    },
    relations: {
      gas_station: 0,
      warehouse: 0,
      technical_lab: 1,
      school: 0,
      childcare: 0,
      factory_logistics: 0,
      brine: 0,
      miso_shop: 0,
    },
    memories: [],
    flags: {},
    disaster: {
      evacuationDelayMin: null,
      routeLifetimeMin: {},
      shelterCapacity: {},
      logisticsHours: null,
    },
  });

  function applyDelta(state, delta = {}) {
    const next = structuredClone(state);
    if (delta.town) {
      for (const [k, v] of Object.entries(delta.town)) {
        next.town[k] = clamp((next.town[k] ?? 2) + v);
      }
    }
    if (delta.districts) {
      for (const [id, d] of Object.entries(delta.districts)) {
        next.districts[id] ??= { localTrust: 2, burdenMemory: 0, tags: [] };
        if (typeof d.localTrust === 'number') {
          next.districts[id].localTrust = clamp(next.districts[id].localTrust + d.localTrust);
        }
        if (typeof d.burdenMemory === 'number') {
          next.districts[id].burdenMemory = clamp(next.districts[id].burdenMemory + d.burdenMemory);
        }
      }
    }
    if (delta.relations) {
      for (const [k, v] of Object.entries(delta.relations)) {
        next.relations[k] = clamp((next.relations[k] ?? 0) + v);
      }
    }
    if (delta.flags) Object.assign(next.flags, delta.flags);
    return next;
  }

  function addMemory(state, memory) {
    const next = structuredClone(state);
    next.memories.push({
      id: memory.id,
      year: state.year,
      month: state.month,
      valence: memory.valence ?? 0,
      scope: memory.scope ?? 'town',
      tags: memory.tags ?? [],
      note: memory.note ?? '',
    });
    return next;
  }

  function level(value) {
    return LEVELS[clamp(value)];
  }

  window.ADHOMS_VER1_STATE = {
    LEVELS,
    createInitialState,
    applyDelta,
    addMemory,
    level,
  };
})();