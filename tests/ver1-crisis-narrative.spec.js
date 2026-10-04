const {test,expect}=require('@playwright/test');
const URL=process.env.ADHOMS_TEST_URL||'http://127.0.0.1:8000/';
async function personalCrisis(page){
 await page.goto(URL);await page.evaluate(()=>showEnding());
 await page.locator('#v1next').click();
 await page.locator('[data-k="forest_evacuation"][data-v="wait"]').click();
 await page.locator('#v1next').click();
 await page.locator('[data-k="vehicle_allocation"][data-v="festival"]').click();
 for(let i=0;i<3;i++)await page.locator('#v1next').click();
}
test('personal crisis names the actual competing needs, earlier allocation and resulting redistribution',async({page})=>{
 await personalCrisis(page);const overlay=page.locator('#ver1Choice');
 // DL-017: the retained evening allocation is historical after a manual override.
 await expect(overlay).toContainText('夕方に決めた車両配分');await expect(overlay).toContainText('相撲会場へ重点配分');
 await expect(overlay).toContainText('味噌店');await expect(overlay).toContainText('森林公園');
 await expect(overlay).toContainText('他の二地点');
 await overlay.locator('[data-k="priority_override"][data-v="manual_override"]').click();
 await expect(overlay.locator('[data-k="personal_vehicle_allocation"]')).toHaveCount(4);
 await expect(overlay.locator('#v1next')).toBeDisabled();
 await overlay.locator('[data-k="personal_vehicle_allocation"][data-v="forest"]').click();
 await expect(overlay).toContainText('相撲会場へ重点配分 → 森林公園へ重点配分');
 await expect(overlay.locator('#v1next')).toBeEnabled();
 await page.reload();await expect(overlay).toContainText('相撲会場へ重点配分 → 森林公園へ重点配分');
});
test('TOWA confirmed outcome and recorded evacuation delay appear in recovery and September',async({page})=>{
 await personalCrisis(page);await page.locator('#v1next').click();await page.locator('#v1fin').click();
 const overlay=page.locator('#ver1Choice');await expect(overlay).toContainText('TOWA：生存。重傷なし');
 await expect(overlay).toContainText('森林公園の避難開始を待機');
 await page.locator('#v1recover').click();await expect(page.locator('#feedList')).toContainText('TOWAさんも生存し、重傷はありません');
 await expect(page.locator('#feedList')).not.toContainText('TOWAさんの状態は当日の結果に応じて確認を続けます');
 await page.reload();await expect(page.locator('#feedList')).toContainText('TOWAさんも生存し、重傷はありません');
});
test('legacy final results gain the approved TOWA outcome without inventing an evacuation choice',async({page})=>{
 await page.goto(URL);await page.evaluate(()=>{const st=ADHOMS_LIGHT_STATE;st.year=5;st.month=9;ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate',st);const session=ADHOMS_VER1_FINAL.finalize(ADHOMS_VER1_FINAL.createSession(st));delete session.result.personalOutcomes.towa;delete session.result.decisions;session.decisions={};ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession',{sessionId:ADHOMS_VER1_SESSION.id,stage:'recovery',session});});
 await page.reload();const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('adhoms.ver1.finalsession')));
 expect(record.session.result.personalOutcomes.towa).toMatchObject({survived:true,seriousInjury:false,evacuationStart:'unrecorded'});
 await expect(page.locator('#feedList')).toContainText('TOWAさんも生存し、重傷はありません');
 await expect(page.locator('#feedList')).toContainText('避難開始の判断はこの保存に記録がありません');
});
test('legacy manual priority without a recorded target is not reported as maintained allocation',async({page})=>{
 await page.goto(URL);await page.evaluate(()=>{const st=ADHOMS_LIGHT_STATE;st.year=5;st.month=8;ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate',st);const session=ADHOMS_VER1_FINAL.createSession(st);session.phaseIndex=6;session.decisions.priority_override='manual_override';ADHOMS_VER1_SESSION.write('adhoms.ver1.finalsession',{sessionId:ADHOMS_VER1_SESSION.id,stage:'active',session});});
 await page.reload();await page.locator('#v1fin').click();
 await expect(page.locator('#ver1Choice')).toContainText('再配分先は記録されていません');
 await expect(page.locator('#ver1Choice')).not.toContainText('配分記録なしを維持');
});
