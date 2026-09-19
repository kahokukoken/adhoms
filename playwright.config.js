const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  workers: 1,
  use: { browserName: 'chromium' },
  webServer: {
    command: 'node scripts/test-server.mjs',
    url: 'http://127.0.0.1:8000/ver1/',
    reuseExistingServer: true,
    timeout: 15_000
  }
});
