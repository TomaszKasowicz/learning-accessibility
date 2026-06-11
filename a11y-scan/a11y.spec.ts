import { test, expect } from '@playwright/test';
import { AxeService } from './axe.service';

test('home page has no axe violations', async ({ page }) => {
  await page.goto('http://localhost:4300/pointer-size');

  const axe = new AxeService(page);
  const results = await axe.analyze();

  // Print a readable summary before asserting
  for (const v of results.violations) {
    console.log(`[${v.impact}] ${v.id} — ${v.nodes.length} node(s)`);
    console.log('  fix: ' + v.helpUrl);
  }

  expect(results.violations).toEqual([]);
});

