import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The compliance bar for fix-wcag. Adapt TARGET_URL / INCLUDE for your case.
const TARGET_URL = process.env.A11Y_URL ?? 'http://localhost:4200';
const INCLUDE = process.env.A11Y_INCLUDE; // e.g. '[data-test="my-component"]'

const BAR = {
  // tag = SELECT which rules to consider
  runOnly: {
    type: 'tag' as const,
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
  },
  // The wcag22aa tag above already runs target-size (SC 2.5.8): selecting a rule
  // by tag in runOnly overrides its enabled:false default. This explicit enable is
  // a redundant-but-harmless safety net so the rule still runs if someone drops the
  // wcag22aa tag from the list above. Verified on axe-core 4.11.4 and 4.12.0.
  rules: { 'target-size': { enabled: true } },
};

test('axe: no WCAG A/AA + best-practice violations (incl. WCAG 2.2)', async ({ page }) => {
  await page.goto(TARGET_URL);

  // If the target is revealed by interaction (modal/menu), drive the UI here first,
  // then await it visible before analyze() — axe only sees the current DOM.

  let builder = new AxeBuilder({ page }).options(BAR);
  if (INCLUDE) builder = builder.include(INCLUDE);

  const results = await builder.analyze();

  for (const v of results.violations) {
    console.log(`[${v.impact}] ${v.id} — ${v.nodes.length} node(s)`);
    console.log(`  fix: ${v.helpUrl}`);
    for (const n of v.nodes) console.log(`  at: ${n.target.join(' ')}`);
  }

  // Items axe could not decide — hand these to the manual arm (MANUAL-CHECKLIST.md).
  if (results.incomplete.length) {
    console.log(`\n${results.incomplete.length} incomplete check(s) need manual review:`);
    for (const i of results.incomplete) console.log(`  - ${i.id}: ${i.help}`);
  }

  expect(results.violations).toEqual([]);
});

// Stateful components: axe only sees the current DOM, so a collapsed/closed
// component must be DRIVEN OPEN before analyze(). Angular Material / CDK overlays
// (menu, select, dialog, tooltip, autocomplete) render in `.cdk-overlay-container`
// at <body> level — an .include() scoped to the trigger MISSES the panel. Include
// the overlay container too, or scan the whole page once open. Adapt selectors.
test.skip('axe: opened overlay/menu state (adapt selectors, then unskip)', async ({ page }) => {
  await page.goto(TARGET_URL);

  await page.getByRole('button', { name: /menu|open/i }).click();
  await expect(page.getByRole('menu')).toBeVisible(); // or 'dialog' / 'listbox'

  const results = await new AxeBuilder({ page })
    // body-level overlay is why we add .cdk-overlay-container (or drop .include to scan all)
    .include('.cdk-overlay-container')
    .options(BAR)
    .analyze();

  for (const v of results.violations) {
    console.log(`[${v.impact}] ${v.id} — ${v.nodes.length} node(s)`);
    console.log(`  fix: ${v.helpUrl}`);
  }

  expect(results.violations).toEqual([]);
});
