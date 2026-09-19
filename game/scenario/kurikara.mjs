const freezeRecords = records => Object.freeze(
  Object.fromEntries(records.map(record => [record.id, Object.freeze(record)]))
);

export const KURIKARA_SCENARIO = Object.freeze({
  id: 'kurikara',
  name: '倶利伽羅町',
  population: 8012,
  residentAgents: 1500,
  districts: freezeRecords([
    { id: 'central', name: '中央地区', terrain: 'plain', populationShare: 0.2 },
    { id: 'east', name: '東部地区', terrain: 'foothill', populationShare: 0.14 },
    { id: 'west', name: '西部地区', terrain: 'plain', populationShare: 0.18 },
    { id: 'lakeside', name: '河北潟沿岸地区', terrain: 'reclaimed', populationShare: 0.12 },
    { id: 'mountain', name: '河合谷地区', terrain: 'mountain', populationShare: 0.1 },
    { id: 'newtown', name: '新興住宅地区', terrain: 'terrace', populationShare: 0.26 }
  ]),
  staff: freezeRecords([
    { id: 'miyashita', name: '宮下 沙耶', role: 'データ解析', adviceStyle: 'precise' },
    { id: 'fujii', name: '藤井 真', role: '実証運営', adviceStyle: 'field' },
    { id: 'mizuno', name: '水野 悠', role: '社会システム', adviceStyle: 'relational' },
    { id: 'saeki', name: '佐伯 直人', role: 'ADHOMSシステム', adviceStyle: 'technical' }
  ]),
  facilities: freezeRecords([
    { id: 'kurikara-station', name: '倶利伽羅駅', kind: 'rail', districtId: 'east', condition: 0.72 },
    { id: 'central-clinic', name: '中央診療所', kind: 'clinic', districtId: 'central', condition: 0.67 },
    { id: 'east-school', name: '東部小中学校', kind: 'school', districtId: 'east', condition: 0.58 },
    { id: 'west-care', name: '西部ケアセンター', kind: 'care', districtId: 'west', condition: 0.63 },
    { id: 'lakeside-drainage', name: '河北潟沿岸排水施設', kind: 'drainage', districtId: 'lakeside', condition: 0.55 },
    { id: 'forest-park', name: '倶利伽羅森林公園', kind: 'park', districtId: 'mountain', condition: 0.7 },
    { id: 'hassaku-ground', name: '八朔広場', kind: 'cultural-ground', districtId: 'central', condition: 0.66 }
  ]),
  institutions: freezeRecords([
    { id: 'town-hall', name: '倶利伽羅町役場', kind: 'municipality' },
    { id: 'town-council', name: '倶利伽羅町議会', kind: 'council' },
    { id: 'transport-office', name: '地域交通室', kind: 'service' },
    { id: 'welfare-office', name: '生活福祉室', kind: 'service' },
    { id: 'hassaku-association', name: '倶利伽羅八朔相撲運営会', kind: 'cultural-association' },
    { id: 'forest-live-committee', name: '森林公園ライブ実行会', kind: 'event-committee' }
  ]),
  actors: freezeRecords([
    { id: 'mayor', name: '倶利伽羅町長', kind: 'mayor' },
    { id: 'conservative-faction', name: '保守会派', kind: 'faction' },
    { id: 'progressive-faction', name: '進歩会派', kind: 'faction' },
    { id: 'local-media', name: '河北地域ニュース', kind: 'media' },
    { id: 'kurika', name: 'クリカ', kind: 'influencer' },
    { id: 'great-noto', name: 'グレート・ノト', kind: 'influencer' }
  ])
});

const OCCUPATIONS = Object.freeze([
  'student', 'caregiver', 'office-worker', 'retail', 'farmer',
  'manufacturer', 'medical', 'public-service', 'self-employed', 'retired'
]);
const MOBILITY = Object.freeze(['walk', 'bicycle', 'car', 'bus', 'rail']);

export function createKurikaraEntities(rng) {
  const districtIds = Object.keys(KURIKARA_SCENARIO.districts);
  const households = {};
  for (let i = 0; i < 600; i += 1) {
    const id = `household-${String(i + 1).padStart(4, '0')}`;
    households[id] = {
      id,
      districtId: districtIds[i % districtIds.length],
      memberIds: [],
      incomeCondition: 0.25 + rng.next() * 0.7,
      transportAccess: 0.2 + rng.next() * 0.8
    };
  }

  const householdIds = Object.keys(households);
  const residents = {};
  const relations = {};
  const representativeWeight = KURIKARA_SCENARIO.population / KURIKARA_SCENARIO.residentAgents;

  for (let i = 0; i < KURIKARA_SCENARIO.residentAgents; i += 1) {
    const id = `resident-${String(i + 1).padStart(4, '0')}`;
    const householdId = householdIds[i % householdIds.length];
    const districtId = households[householdId].districtId;
    const age = rng.int(0, 97);
    const occupation = age < 18 ? 'student' : age >= 70 ? 'retired' : rng.pick(OCCUPATIONS.slice(1, -1));
    residents[id] = {
      id,
      synthetic: true,
      weight: representativeWeight,
      age,
      householdId,
      districtId,
      occupation,
      incomeCondition: 0.2 + rng.next() * 0.75,
      health: 0.35 + rng.next() * 0.65,
      mobility: rng.pick(MOBILITY),
      capabilities: {
        physical: 0.2 + rng.next() * 0.8,
        digital: 0.1 + rng.next() * 0.9,
        social: 0.15 + rng.next() * 0.85
      },
      perceptions: { institutionalTrust: 0.25 + rng.next() * 0.65 },
      actions: [],
      memories: []
    };
    households[householdId].memberIds.push(id);
    relations[`resident-household:${id}`] = {
      id: `resident-household:${id}`,
      fromId: id,
      toId: householdId,
      kind: 'membership',
      strength: 1
    };
    relations[`resident-district:${id}`] = {
      id: `resident-district:${id}`,
      fromId: id,
      toId: districtId,
      kind: 'place-attachment',
      strength: 0.3 + rng.next() * 0.6
    };
  }

  return {
    entities: {
      residents,
      households,
      districts: structuredClone(KURIKARA_SCENARIO.districts),
      institutions: structuredClone(KURIKARA_SCENARIO.institutions),
      facilities: structuredClone(KURIKARA_SCENARIO.facilities),
      staff: structuredClone(KURIKARA_SCENARIO.staff),
      actors: structuredClone(KURIKARA_SCENARIO.actors)
    },
    relations
  };
}
