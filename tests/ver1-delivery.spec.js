const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

// Regression: rebuilding used to rm -rf dist, erasing frozen reader versions.
test('Delivery Contract / build preserves frozen versions and identifies the actual source',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'adhoms-delivery-'));
  try{
    fs.mkdirSync(path.join(dir,'dist'));
    fs.writeFileSync(path.join(dir,'dist/ADHOMS-Ver1-Frozen.html'),'frozen reviewed bytes');
    fs.writeFileSync(path.join(dir,'index.html'),'<html><head></head><body><script src="game.js"></script></body></html>');
    fs.writeFileSync(path.join(dir,'game.js'),'window.game=1;');
    const script=path.join(process.cwd(),'scripts/build-standalone.mjs');
    execFileSync(process.execPath,[script],{cwd:dir,env:{...process.env,ADHOMS_SOURCE_REVISION:'fixture-revision'}});
    expect(fs.existsSync(path.join(dir,'dist/ADHOMS-Ver1-Frozen.html'))).toBe(true);
    expect(fs.readFileSync(path.join(dir,'dist/ADHOMS-Ver1-Frozen.html'),'utf8')).toBe('frozen reviewed bytes');
    const manifest=JSON.parse(fs.readFileSync(path.join(dir,'dist/manifest.json')));
    expect(manifest.sourceRevision).toBe('fixture-revision');
    execFileSync(process.execPath,[script,'--check'],{cwd:dir});
    const before=manifest.sourceDigest;
    fs.writeFileSync(path.join(dir,'game.js'),'window.game=2;');
    expect(()=>execFileSync(process.execPath,[script,'--check'],{cwd:dir,stdio:'pipe'})).toThrow();
    execFileSync(process.execPath,[script],{cwd:dir,env:{...process.env,ADHOMS_SOURCE_REVISION:'fixture-revision'}});
    expect(JSON.parse(fs.readFileSync(path.join(dir,'dist/manifest.json'))).sourceDigest).not.toBe(before);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('Delivery Contract / shipped HTML matches the currently tested sources',()=>{
  execFileSync(process.execPath,['scripts/build-standalone.mjs','--check']);
});
