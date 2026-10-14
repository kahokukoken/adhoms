// DL-021: Existing scenario regressions exercise the five-year main game after
// the mandatory preliminary month. Seed a valid already-started main-game save
// only for those tests. The pretrial spec overrides this fixture with empty
// storage and must prove that a truly new player cannot bypass the prologue.
const {defineConfig}=require('@playwright/test');
const fs=require('node:fs');
const vm=require('node:vm');

const context={window:{},structuredClone};
vm.runInNewContext(fs.readFileSync('ver1/ver1-state.js','utf8'),context,{filename:'ver1-state.js'});
const main=context.window.ADHOMS_VER1_STATE.createInitialState();
main.sessionId='qa-main-game-after-pretrial';
const mainReadyState={
  cookies:[],
  origins:[{
    origin:'http://127.0.0.1:8000',
    localStorage:[{name:'adhoms.ver1.lightstate',value:JSON.stringify(main)}]
  }]
};
module.exports=defineConfig({
  testDir:'./tests',
  use:{storageState:mainReadyState}
});
