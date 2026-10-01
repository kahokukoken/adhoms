(() => {
  if (!window.ADHOMS_VER1_STATE || !window.ADHOMS_LIGHT_STATE || !window.ADHOMS_VER1_SESSION) return;
  const KEY='adhoms.ver1.lightstate';

  function enrich(id, metadata){
    const result=window.ADHOMS_VER1_STATE.enrichMemory(window.ADHOMS_LIGHT_STATE,id,metadata);
    if(result.changed) window.ADHOMS_LIGHT_STATE=result.state;
    return result.changed;
  }

  function selected(prefix){
    return Object.keys(window.ADHOMS_LIGHT_STATE.flags||{}).find(key=>key.startsWith(prefix)&&window.ADHOMS_LIGHT_STATE.flags[key]);
  }

  let changed=false;
  const field=[
    ['y2_flood','flood_'],
    ['y2_wildlife','wildlife_'],
    ['y2_snow','snow_']
  ];
  for(const [event,prefix] of field){
    const flag=selected(event+':');
    if(!flag) continue;
    const choice=flag.slice(event.length+1);
    changed=enrich(prefix+choice,{source:{type:'choice',id:flag}})||changed;
  }

  for(const memory of window.ADHOMS_LIGHT_STATE.memories||[]){
    if(/^y3_(?:flood|wildlife|snow)_/.test(memory.id)){
      changed=enrich(memory.id,{source:{type:'propagation',id:memory.id}})||changed;
    }
  }

  const strategy=selected('y4_strategy:');
  if(strategy){
    const choice=strategy.slice('y4_strategy:'.length);
    changed=enrich('y4_strategy_'+choice,{source:{type:'strategy',id:strategy}})||changed;
  }

  const optional=[
    {id:'brine',memory:'optional_brine_genkan',entities:['kiso','toru']},
    {id:'miso',memory:'optional_miso_soba',entities:['kiso','chihiro','murata']}
  ];
  for(const item of optional){
    const flags=window.ADHOMS_LIGHT_STATE.flags||{};
    const choices=Object.keys(window.ADHOMS_VER1_OPTIONAL?.events?.[item.id]?.choices||{})
      .filter(id=>flags[`optional:${item.id}:${id}`]);
    // `seen`, `world` and follow-up flags are not first-stage choices. An
    // ambiguous historical choice stays unknown instead of picking by order.
    const source=choices.length===1
      ? {type:'optional-choice',id:item.id+':'+choices[0]}
      : choices.length===0&&flags[`optional:${item.id}:world`]
        ? {type:'world-progress',id:item.id}
        : null;
    const memory=window.ADHOMS_LIGHT_STATE.memories.find(m=>m.id===item.memory);
    if(source&&memory?.source?.type==='optional-choice'&&
      [item.id+':seen',item.id+':world'].includes(memory.source.id)){
      // Repair only the known faulty migration, and only when saved flags
      // provide an unambiguous source. Preserve all other historical sources.
      window.ADHOMS_LIGHT_STATE=structuredClone(window.ADHOMS_LIGHT_STATE);
      window.ADHOMS_LIGHT_STATE.memories.find(m=>m.id===item.memory).source=null;
      changed=true;
    }
    changed=enrich(item.memory,{entities:item.entities,...(source?{source}:{})})||changed;

    const follow=selected('optional:'+item.id+':followup:');
    if(follow){
      changed=enrich(item.memory+'_followup',{
        entities:item.entities,
        source:{type:'optional-choice',id:follow.replace('optional:','')}
      })||changed;
    }else{
      changed=enrich(item.memory+'_followup',{entities:item.entities})||changed;
    }
  }

  if(changed) window.ADHOMS_VER1_SESSION.write(KEY,window.ADHOMS_LIGHT_STATE);
  window.ADHOMS_VER1_HISTORY_MIGRATION={changed};
})();
