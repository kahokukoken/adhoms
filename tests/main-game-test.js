// DL-021: these regressions begin from an established main-game save.
// Playwright storageState is HTTP-origin scoped and cannot initialize file:
// standalone pages. Seed that same precondition only in the opted-in tests,
// before first load; reloads retain the game's actual saved state.
const base = require('@playwright/test');
const fs = require('node:fs');
const vm = require('node:vm');
const context = {window:{}, structuredClone};
vm.runInNewContext(fs.readFileSync('ver1/ver1-state.js','utf8'), context);
const main = context.window.ADHOMS_VER1_STATE.createInitialState();
main.sessionId = 'qa-main-game-after-pretrial';
const test = base.test.extend({
  page: async ({page}, use) => {
    await page.addInitScript(saved => {
      if (location.protocol === 'file:' && location.pathname.endsWith('/ADHOMS-Ver1.html') &&
          !localStorage.getItem('adhoms.ver1.lightstate')) {
        localStorage.setItem('adhoms.ver1.lightstate', saved);
      }
    }, JSON.stringify(main));
    await use(page);
  }
});
module.exports = {...base, test};
