// A count-only density PASS cannot certify narrative continuity.
// User 2026-09-28 / hub §29: repeating a person's identical seasonal episode
// across years is a regression. Deliberately exits nonzero while it remains.
import {chromium} from '@playwright/test';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const browser=await chromium.launch();
try{
  const page=await browser.newPage();
  await page.goto(pathToFileURL(path.resolve('dist/ADHOMS-Ver1.html')).href);
  const rows=await page.evaluate(()=>{
    const rows=[];
    for(let index=12;index<60;index++){
      S.year=Math.floor((index+3)/12)+1;S.month=(index+3)%12+1;S.week=4;S.filter='ALL';renderFeed();
      document.querySelectorAll('#feedList .card:not([data-story-beat]):not([data-history-beat]):not([data-research-beat]):not([data-onboarding])').forEach(card=>{
        rows.push({index,id:card.dataset.id,who:card.querySelector('.who').firstChild.textContent.trim(),text:card.querySelector('.post').textContent.trim()});
      });
    }
    return rows;
  });
  const groups=new Map();
  for(const row of rows){const key=JSON.stringify([row.who,row.text]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);}
  const repeated=[...groups.values()].filter(group=>new Set(group.map(r=>Math.floor(r.index/12))).size>1);
  const manifest=JSON.parse(fs.readFileSync('dist/manifest.json','utf8'));
  const reviewPath='docs/ver1/sequence/internal-review.json';
  const review=fs.existsSync(reviewPath)?JSON.parse(fs.readFileSync(reviewPath,'utf8')):null;
  const reviewCurrent=review?.reviewedSourceDigest===manifest.sourceDigest;
  const internalReviewStatus=reviewCurrent?review.status:'UNREVIEWED';
  const status=!repeated.length&&internalReviewStatus==='PASS'?'PASS':'FAIL';
  const report={status,exactRepeatStatus:repeated.length?'FAIL':'PASS',internalReviewStatus,reviewCurrent,
    scope:'Years 2–5: exact-repeat check AND source-bound independent narrative review; not Human Acceptance',
    displayed:rows.length,distinct:groups.size,repeatedGroups:repeated.length,examples:repeated.slice(0,8),
    remaining:reviewCurrent?review.remaining:['This build has no current independent narrative review.']};
  fs.mkdirSync('test-results',{recursive:true});
  fs.writeFileSync('test-results/sequence-audit.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({...report,examples:undefined}));
  if(status==='FAIL')process.exitCode=1;
}finally{await browser.close();}
