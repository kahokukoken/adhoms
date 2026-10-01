const {test,expect}=require('@playwright/test');
const fs=require('node:fs');const path=require('node:path');
const URL=process.env.ADHOMS_TEST_URL||'http://127.0.0.1:8000/';
test('DL-018: canonical fixed names replace old active names without renaming save identifiers',async({page})=>{
 const scripted=fs.readFileSync(path.join(process.cwd(),'scripted-scenario.js'),'utf8');
 expect(scripted).toContain("kiso:{name:'木曽 周弥'");expect(scripted).toContain("kaito:{name:'登森 廻斗'");
 const files=['index.html','scripted-scenario.js','ver1/ver1-observation-scenes.js','ver1/ver1-optional-creation-events.js','ver1/ver1-continuity-year4.js','ver1/ver1-continuity-year5.js'];
 for(const file of files){const source=fs.readFileSync(path.join(process.cwd(),file),'utf8').replaceAll('八朔','');expect(source,file).not.toContain('朔');expect(source,file).not.toContain('海斗');expect(source,file).not.toContain('藤村');}
 await page.goto(URL);await expect(page.locator('header .director')).toContainText('木曽周弥');
 await expect(page.locator('#feedList [data-onboarding]').first()).toContainText('おはようございます、木曽所長。');
 await expect(page.locator('#feedList [data-onboarding]').first()).not.toContainText('木曽周弥');
});
test('DL-018: current names reach early friend calls and later junior dialogue through resume',async({page})=>{
 await page.goto(URL);await page.getByRole('button',{name:'1週進む →',exact:true}).click();await page.getByRole('button',{name:'1週進む →',exact:true}).click();
 await expect(page.locator('#feedList')).toContainText('周弥');
 await page.evaluate(()=>{const state=ADHOMS_LIGHT_STATE;state.year=4;state.month=4;ADHOMS_VER1_SESSION.write('adhoms.ver1.lightstate',state);});
 await page.reload();await page.getByRole('button',{name:'1週進む →',exact:true}).click();await page.getByRole('button',{name:'1週進む →',exact:true}).click();await page.getByRole('button',{name:'1週進む →',exact:true}).click();
 await expect(page.locator('#feedList')).toContainText('登森 廻斗');await expect(page.locator('#feedList')).not.toContainText('藤村');
 await page.reload();await expect(page.locator('header .director')).toContainText('木曽周弥');await expect(page.locator('#feedList')).toContainText('登森 廻斗');
});
