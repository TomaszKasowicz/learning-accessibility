import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home page has no axe violations', async ({ page }) => {
  await page.goto('http://localhost:4300/pointer-size');

  const results = await new AxeBuilder({ page })
    // .options({
    //   // Two independent switches turn a rule on:
    //   //  1. naming its tag here in runOnly (overrides the rule's enabled:false default)
    //   //  2. rules:{ id:{ enabled:true } } below (works even without the tag)
    //   // wcag22aa already runs target-size; the rules entry is a redundant safety net.
    //   runOnly: { type: 'tag', values: [
    //     'wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice'
    //   ]},
    //   rules: { 'target-size': { enabled: true } }
    // })
    .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice'])
    .analyze();

  // Print a readable summary before asserting
  for (const v of results.violations) {
    console.log(`[${v.impact}] ${v.id} — ${v.nodes.length} node(s)`);
    console.log('  fix: ' + v.helpUrl);
  }

  expect(results.violations).toEqual([]);
});

