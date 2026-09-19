const { test, expect } = require('@playwright/test');
const { spawnSync } = require('node:child_process');

test('validator completes 100 diverse seeded runs', () => {
  test.setTimeout(300_000);
  const result = spawnSync(process.execPath, ['scripts/validate-ver1.mjs', '--runs', '100'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: 285_000
  });
  expect(result.status, result.stderr).toBe(0);
  const summary = JSON.parse(result.stdout);
  expect(summary.completed).toBe(100);
  expect(summary.failures).toBe(0);
  expect(summary.deterministicReplayFailures).toBe(0);
  expect([...summary.grades].sort()).toEqual(['A', 'B', 'C', 'D']);
});
