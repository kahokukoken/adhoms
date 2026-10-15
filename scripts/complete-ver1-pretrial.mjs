// DL-021: walk the required opening in the actual player UI before testing
// or exporting any of the 60 post-approval main-game months. No test-only
// bypass or fabricated approval state is written to the live game.
export async function completeVer1Pretrial(page){
  const trial=page.locator('#adhomsPretrialOverlay');
  if(!await trial.isVisible())throw new Error('Mandatory pretrial not visible on empty storage.');
  const mail=page.locator('[data-pretrial-opening="sip-governor-mail"]');
  const opening=await mail.innerText();
  if(!opening.includes('石川県知事')||!opening.includes('最終確認テスト'))
    throw new Error('SIP and prefectural joint commissioning mail missing.');
  if(!await page.evaluate(()=>document.querySelector('.phone')?.inert))
    throw new Error('Five-year controls must be inert until pretrial approval.');
  const visible=[opening];
  await page.locator('#adhomsIntroNext').click();
  visible.push(await trial.innerText());
  await page.locator('#adhomsStaffNext').click();
  for(let week=1;week<=4;week++){
    const stage=await page.evaluate(()=>ADHOMS_VER1_PRETRIAL.getState());
    if(stage.stage!=='feed'||stage.week!==week)throw new Error('Pretrial week '+week+' missing.');
    visible.push(await trial.innerText());
    await trial.locator('.adhomsTrialWeights button[data-weight="high"]').first().click();
    await trial.locator('#adhomsRunAnalysis').click();
    visible.push(await trial.innerText());
    await trial.locator('.adhomsTrialChoice input').first().check();
    await trial.locator('#adhomsConfirmProposal').click();
  }
  if(!await trial.locator('#adhomsSubmitReport').count())throw new Error('Missing final report submission.');
  visible.push(await trial.innerText());
  await trial.locator('#adhomsSubmitReport').click();
  if(!await trial.locator('#adhomsStartMain').count())throw new Error('No conditional approval after report.');
  visible.push(await trial.innerText());
  await trial.locator('#adhomsStartMain').click();
  if(await trial.count()||await page.evaluate(()=>document.querySelector('.phone')?.inert))
    throw new Error('Main calendar still blocked after conditional approval.');
  if((await page.locator('#bottomYm').innerText()).trim()!=='2029 / 04')
    throw new Error('First approved main month must be April 2029.');
  return visible;
}
